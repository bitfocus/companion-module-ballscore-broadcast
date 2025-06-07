import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type BallScoreBroadcastModuleConfig } from './config.js'
import { updateLineupAndPitchersVariables, UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresetDefinitions } from './presets.js'
import { ApiService, BroadcastCompanionData } from './api-service.js'

export class BallScoreBroadcastModuleInstance extends InstanceBase<BallScoreBroadcastModuleConfig> {
	config!: BallScoreBroadcastModuleConfig // Setup in init()
	apiService!: ApiService
	data!: BroadcastCompanionData
	broadcastTimer!: NodeJS.Timeout | null

	constructor(internal: unknown) {
		super(internal)
	}

	private subscribeToBroadcast(): NodeJS.Timeout {
		// Clear any existing timer
		if (this.broadcastTimer) {
			clearInterval(this.broadcastTimer)
		}

		// Set up a new timer that calls getCompanionData every 5 seconds
		this.broadcastTimer = setInterval(() => {
			this.apiService
				.getCompanionData()
				.then((data: BroadcastCompanionData) => {
					this.data = data
					this.checkFeedbacks('batterState', 'playerSelectionState', 'playerOnAirState', 'componentState')
					updateLineupAndPitchersVariables(this)
				})
				.catch((error: any) => {
					this.log('error', `Error getting companion data: ${error?.message}`)
					this.updateStatus(InstanceStatus.Disconnected, error.message)
				})
		}, 5000)

		// Return the timer so it can be canceled if needed
		return this.broadcastTimer
	}

	private async connectToBroadcast(config: BallScoreBroadcastModuleConfig): Promise<void> {
		this.log('debug', 'connectingToBroadcast')
		this.updateStatus(InstanceStatus.Connecting)
		try {
			this.apiService = new ApiService(config)
			const data: BroadcastCompanionData = await this.apiService.getCompanionData()
			this.data = data
			this.updateStatus(InstanceStatus.Ok)
			this.subscribeToBroadcast()
		} catch (error: any) {
			this.log('error', `Error connecting to broadcast: ${error?.message}`)
			this.updateStatus(InstanceStatus.UnknownError, error.message)
			throw error
		}
	}

	async init(config: BallScoreBroadcastModuleConfig): Promise<void> {
		this.config = config

		await this.connectToBroadcast(config)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		UpdatePresetDefinitions(this) // export preset definitions
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		// Clean up the timer when the module is destroyed
		if (this.broadcastTimer) {
			clearInterval(this.broadcastTimer)
			this.broadcastTimer = null
		}
	}

	async configUpdated(config: BallScoreBroadcastModuleConfig): Promise<void> {
		const isReconnectionNeeded: boolean =
			config.environment != this.config.environment || config.secretKey != this.config.secretKey
		//if environment or secretKey has changed, reconnect to broadcast
		if (isReconnectionNeeded) {
			// Clear any existing timer when config is updated
			if (this.broadcastTimer) {
				clearInterval(this.broadcastTimer)
				this.broadcastTimer = null
			}
			await this.connectToBroadcast(config)

			// Refresh presets when config is updated
			UpdatePresetDefinitions(this)
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
