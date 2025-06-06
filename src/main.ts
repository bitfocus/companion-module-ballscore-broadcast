import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { updateLineupAndPitchersVariables, UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdatePresetDefinitions } from './presets.js'
import { ApiService, BroadcastCompanionData } from './api-service.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
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

		// Set up a new timer that calls getCompanionData every second
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

	private async connectToBroadcast(config: ModuleConfig): Promise<void> {
		this.log('debug', 'connectingToBroadcast')
		this.updateStatus(InstanceStatus.Connecting)
		this.apiService = new ApiService(config)
		return this.apiService
			.getCompanionData()
			.then((data) => {
				this.data = data
				this.updateStatus(InstanceStatus.Ok)
				this.subscribeToBroadcast()
			})
			.catch((error) => {
				this.updateStatus(InstanceStatus.UnknownError, error.message)
			})
	}

	async init(config: ModuleConfig): Promise<void> {
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

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		// Clear any existing timer when config is updated
		if (this.broadcastTimer) {
			clearInterval(this.broadcastTimer)
			this.broadcastTimer = null
		}
		await this.connectToBroadcast(config)

		// Refresh presets when config is updated
		UpdatePresetDefinitions(this)
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

runEntrypoint(ModuleInstance, UpgradeScripts)
