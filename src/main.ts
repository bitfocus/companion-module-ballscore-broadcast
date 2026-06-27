import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type BallScoreBroadcastModuleConfig } from './config.js'
import { updateLineupAndPitchersVariables, UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresetDefinitions } from './presets.js'
import { ApiService, BroadcastCompanionData } from './api-service.js'

// Poll cadence: fast while a game is live, slow standby once it has finished
// (auto-resumes to the fast rate as soon as an active game reappears).
const ACTIVE_POLL_MS = 5000
const STANDBY_POLL_MS = 60000
// Tolerate the odd dropped request before flagging the connection as down.
const MAX_CONSECUTIVE_FAILURES = 2

export class BallScoreBroadcastModuleInstance extends InstanceBase<BallScoreBroadcastModuleConfig> {
	config!: BallScoreBroadcastModuleConfig // Setup in init()
	apiService!: ApiService
	data!: BroadcastCompanionData
	private broadcastTimer: NodeJS.Timeout | null = null
	private stopped = true
	private consecutiveFailures = 0
	private lastControlsKey = ''

	constructor(internal: unknown) {
		super(internal)
	}

	private startPolling(): void {
		this.stopPolling()
		this.stopped = false
		this.consecutiveFailures = 0
		this.lastControlsKey = ''
		// Kick off immediately; each tick schedules the next one itself.
		void this.pollOnce()
	}

	private stopPolling(): void {
		this.stopped = true
		if (this.broadcastTimer) {
			clearTimeout(this.broadcastTimer)
			this.broadcastTimer = null
		}
	}

	private scheduleNextPoll(delayMs: number): void {
		if (this.stopped) return
		if (this.broadcastTimer) clearTimeout(this.broadcastTimer)
		this.broadcastTimer = setTimeout(() => {
			void this.pollOnce()
		}, delayMs)
	}

	// A single poll. A recursive setTimeout (scheduled in `finally`) guarantees
	// requests never overlap, and keeps the connection self-healing.
	private async pollOnce(): Promise<void> {
		let nextDelay = ACTIVE_POLL_MS
		try {
			const data = await this.apiService.getCompanionData()
			this.data = data
			this.consecutiveFailures = 0

			const finished = data.finished === true
			nextDelay = finished ? STANDBY_POLL_MS : ACTIVE_POLL_MS
			this.updateStatus(InstanceStatus.Ok, finished ? 'Broadcast finished — standby' : undefined)

			// Rebuild presets only when the set of controls changes (cheap dedup).
			const controlsKey = data.controls
				.map((c) => c.component)
				.sort()
				.join(',')
			if (controlsKey !== this.lastControlsKey) {
				this.lastControlsKey = controlsKey
				UpdatePresetDefinitions(this)
			}

			this.checkFeedbacks('batterState', 'playerSelectionState', 'playerOnAirState', 'componentState')
			updateLineupAndPitchersVariables(this)
		} catch (error: any) {
			this.consecutiveFailures++
			this.log('error', `Error getting companion data: ${error?.message}`)
			// Auth problems are user-fixable via config: surface immediately but keep
			// retrying so it recovers once the key/permissions are corrected.
			if (error.response?.status === 401 || error.response?.status === 403) {
				this.updateStatus(InstanceStatus.AuthenticationFailure, error?.message)
			} else if (this.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
				this.updateStatus(InstanceStatus.Disconnected, error?.message)
			}
			// Keep the previous `this.data` so feedbacks keep showing last-known state.
			nextDelay = ACTIVE_POLL_MS
		} finally {
			this.scheduleNextPoll(nextDelay)
		}
	}

	private connectToBallScore(config: BallScoreBroadcastModuleConfig): void {
		this.log('debug', 'connectingToBallScore')
		this.updateStatus(InstanceStatus.Connecting)
		this.apiService = new ApiService(config)
		// Always start the loop, even before the first successful fetch, so a
		// startup blip (API briefly down) self-heals without a manual reconnect.
		this.startPolling()
	}

	async init(config: BallScoreBroadcastModuleConfig): Promise<void> {
		this.config = config

		// Definitions don't depend on live data — expose them regardless of state.
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		UpdatePresetDefinitions(this)

		if (!config.secretKey || config.secretKey === '') {
			this.updateStatus(InstanceStatus.BadConfig, 'Make sure to set the Secret Key config property.')
			return
		}

		this.connectToBallScore(config)
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		this.stopPolling()
	}

	async configUpdated(config: BallScoreBroadcastModuleConfig): Promise<void> {
		if (!config.secretKey || config.secretKey === '') {
			this.stopPolling()
			this.config = config
			return this.updateStatus(InstanceStatus.BadConfig, 'Make sure to set the Secret Key config property.')
		}

		const isReconnectionNeeded: boolean =
			config.environment != this.config.environment ||
			config.secretKey != this.config.secretKey ||
			config.timeout != this.config.timeout
		this.config = config
		// Reconnect when the connection parameters change (new ApiService + restart loop).
		if (isReconnectionNeeded) {
			this.connectToBallScore(config)
		}
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(BallScoreBroadcastModuleInstance, UpgradeScripts)
