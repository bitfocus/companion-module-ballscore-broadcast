import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { ApiService, BroadcastCompanionData } from './api-service.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	apiService!: ApiService
	data!: BroadcastCompanionData

	constructor(internal: unknown) {
		super(internal)
	}

	private connectToBroadcast(config: ModuleConfig): void {
		this.updateStatus(InstanceStatus.Connecting)
		this.apiService = new ApiService(config)
		this.apiService
			.getCompanionData()
			.then((data) => {
				this.data = data
				this.updateStatus(InstanceStatus.Ok)
			})
			.catch((error) => {
				this.updateStatus(InstanceStatus.UnknownError, error.message)
			})

		this.updateStatus(InstanceStatus.Ok)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.connectToBroadcast(config)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.connectToBroadcast(config)
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
