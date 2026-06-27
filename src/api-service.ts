import { BallScoreBroadcastModuleConfig } from './config.js'
import axios from 'axios'

export const DEFAULT_TIMEOUT_MS = 4000

export class ApiService {
	private readonly secretKey: string
	private readonly baseUrl: string | undefined
	private readonly timeout: number

	private get requestConfig() {
		return {
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'x-secret-key': this.secretKey,
			},
			timeout: this.timeout,
		}
	}

	constructor(config: BallScoreBroadcastModuleConfig) {
		this.secretKey = config.secretKey
		this.timeout = config.timeout && config.timeout > 0 ? config.timeout : DEFAULT_TIMEOUT_MS
		switch (config.environment) {
			case 'prod':
				this.baseUrl = 'https://www.ballscore.app/api/v1'
				break
			case 'test':
				this.baseUrl = 'https://test.ballscore.app/api/v1'
				break
			case 'dev':
				this.baseUrl = 'https://dev.ballscore.app/api/v1'
				break
			case 'local':
				this.baseUrl = 'http://localhost:4200/api/v1'
		}
	}

	async getComponents(): Promise<Control[]> {
		const url = `${this.baseUrl}/broadcasts/${this.secretKey}/controls`
		const response = await axios.get<Control[]>(url, this.requestConfig)
		return response.data
	}

	async getComponent(component?: string): Promise<Control> {
		if (!component) throw new Error('No component provided')
		const url = `${this.baseUrl}/controls/${component}`
		const response = await axios.get<Control>(url, this.requestConfig)
		return response.data
	}

	async toggleComponent(component?: string): Promise<void> {
		if (!component) throw new Error('No component provided')
		const url = `${this.baseUrl}/controls/${component}/toggle`
		await axios.put<void>(url, {}, this.requestConfig)
	}

	async selectLowerThird(playerGuid?: string): Promise<void> {
		if (!playerGuid) throw new Error('No playerGuid provided')
		const url = `${this.baseUrl}/lower-third/${playerGuid}`
		await axios.put<void>(url, {}, this.requestConfig)
	}

	async getCompanionData(): Promise<BroadcastCompanionData> {
		const url = `${this.baseUrl}/companion`
		const response = await axios.get<BroadcastCompanionData>(url, this.requestConfig)
		// An empty controls array is valid (broadcast not configured yet); only a
		// missing/malformed payload is an error.
		if (!response?.data || !Array.isArray(response.data.controls)) {
			throw new Error('Malformed companion data from API!')
		}
		return response.data
	}
}

export interface BroadcastCompanionData {
	gameId?: string
	finished?: boolean
	awayLineup: Player[]
	homeLineup: Player[]
	awayPitcher?: Player
	homePitcher?: Player
	lowerThird?: Player
	controls: Control[]
}

export interface Player {
	name: string
	guid?: string
	number?: number
	isUp: boolean
}

export interface Control {
	component: string
	action: ControlAction
}

export declare type ControlAction = 'on' | 'off'
