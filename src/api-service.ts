import { ModuleConfig } from './config.js'
import axios from 'axios'
import * as console from 'node:console'

export class ApiService {
	private readonly secretKey: string
	private readonly baseUrl: string | undefined

	private get httpHeader() {
		return {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			'x-secret-key': this.secretKey,
		}
	}

	constructor(config: ModuleConfig) {
		console.log('initalizing ApiService with config', config)
		this.secretKey = config.secretKey
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
		const response = await axios.get<Control[]>(url, { headers: this.httpHeader })
		return response.data
	}

	async getComponent(component?: string): Promise<Control> {
		if (!component) throw new Error('No component provided')
		const url = `${this.baseUrl}/controls/${component}`
		const response = await axios.get<Control>(url, { headers: this.httpHeader })
		return response.data
	}

	async toggleComponent(component?: string): Promise<void> {
		if (!component) throw new Error('No component provided')
		const url = `${this.baseUrl}/controls/${component}/toggle`
		await axios.put<void>(url, {}, { headers: this.httpHeader })
	}

	async selectLowerThird(playerGuid?: string): Promise<void> {
		if (!playerGuid) throw new Error('No playerGuid provided')
		const url = `${this.baseUrl}/lower-third/${playerGuid}`
		await axios.put<void>(url, {}, { headers: this.httpHeader })
	}

	async getCompanionData(): Promise<BroadcastCompanionData> {
		const url = `${this.baseUrl}/companion`
		console.log('gettingCompanionData', url, this.httpHeader)
		const response = await axios.get<BroadcastCompanionData>(url, { headers: this.httpHeader })
		return response.data
	}
}

export interface BroadcastCompanionData {
	gameId?: string
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
