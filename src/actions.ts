import type { ModuleInstance } from './main.js'
import { CompanionActionEvent } from '@companion-module/base'

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		toggle_component: {
			name: 'Toggle component',
			options: [
				{
					id: 'component',
					type: 'dropdown',
					label: 'Select component',
					choices: [
						{ id: 'status', label: 'Status' },
						{ id: 'batter', label: 'Batter' },
						{ id: 'lowerThird', label: 'Lower Third' },
						{ id: 'boxScore', label: 'Box Score' },
						{ id: 'intro', label: 'Intro' },
						{ id: 'awayLineup', label: 'Away Lineup' },
						{ id: 'homeLineup', label: 'Home Lineup' },
						{ id: 'awayDefence', label: 'Away Defence' },
						{ id: 'homeDefence', label: 'Home Defence' },
						{ id: 'customTable', label: 'Custom Table' },
					],
					default: 'status',
				},
			],
			callback: async (event: CompanionActionEvent): Promise<void> => {
				try {
					const component: string = event.options.component ? event.options.component.toString() : 'status'
					await self.apiService.toggleComponent(component)
					const localComponent = self.data.controls.find((c) => c.component === component)
					if (localComponent) {
						localComponent.action = localComponent.action === 'on' ? 'off' : 'on'
					}
					self.checkFeedbacks('componentState')
					if (event.options.component?.toString() === 'lowerThird') {
						self.checkFeedbacks('playerOnAirState')
					}
				} catch (error: any) {
					self.log('error', `Error toggling component: ${error?.message}`)
				}
			},
		},
		select_from_lineup: {
			name: 'Select batter from lineup',
			options: [
				{
					id: 'team',
					type: 'dropdown',
					label: 'Select team',
					choices: [
						{ id: 'away', label: 'Away' },
						{ id: 'home', label: 'Home' },
					],
					default: 'away',
				},
				{
					id: 'num',
					type: 'number',
					label: 'Test',
					default: 1,
					min: 1,
					max: 9,
				},
			],
			callback: async (event: CompanionActionEvent): Promise<void> => {
				try {
					const team: string = event.options.team ? event.options.team.toString() : 'away'
					const num: number = event.options.num ? Number(event.options.num) : 1
					let guid: string | undefined
					if (team === 'away') {
						guid = self.data.awayLineup[num - 1].guid
					} else {
						guid = self.data.homeLineup[num - 1].guid
					}
					await self.apiService.selectLowerThird(guid)
					self.data = await self.apiService.getCompanionData()
					self.checkFeedbacks('playerSelectionState')
					self.checkFeedbacks('playerOnAirState')
				} catch (error: any) {
					self.log('error', `Error selecting from lineup: ${error?.message}`)
				}
			},
		},
		select_pitcher: {
			name: 'Select pitcher',
			options: [
				{
					id: 'team',
					type: 'dropdown',
					label: 'Select team',
					choices: [
						{ id: 'away', label: 'Away' },
						{ id: 'home', label: 'Home' },
					],
					default: 'away',
				},
			],
			callback: async (event: CompanionActionEvent): Promise<void> => {
				try {
					const team: string = event.options.team ? event.options.team.toString() : 'away'
					let guid: string | undefined
					if (team === 'away') {
						guid = self.data.awayPitcher?.guid
					} else {
						guid = self.data.homePitcher?.guid
					}
					if (guid) {
						await self.apiService.selectLowerThird(guid)
						self.data = await self.apiService.getCompanionData()
						self.checkFeedbacks('playerSelectionState')
						self.checkFeedbacks('playerOnAirState')
					}
				} catch (error: any) {
					self.log('error', `Error selecting pitcher: ${error?.message}`)
				}
			},
		},
	})
}
