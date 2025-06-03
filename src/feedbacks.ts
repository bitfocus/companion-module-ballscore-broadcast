import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({
		componentState: {
			name: 'State of component',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
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
			callback: async (feedback) => {
				try {
					const result = await self.apiService.getComponent(feedback.options.component?.toString())
					return result.action === 'on'
				} catch (_error) {
					return false
				}
			},
		},
		batterState: {
			name: 'Is batter up',
			type: 'boolean',
			defaultStyle: {
				//bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 255, 0),
			},
			options: [
				{
					id: 'team',
					type: 'dropdown',
					label: 'Select team',
					choices: [
						{ id: 'awayLineup', label: 'Away Lineup' },
						{ id: 'homeLineup', label: 'Home Lineup' },
					],
					default: 'awayLineup',
				},
				{
					id: 'lineupSpot',
					type: 'number',
					label: 'Lineup spot',
					default: 1,
					min: 1,
					max: 9,
				},
			],
			callback: async (feedback) => {
				try {
					const index: number = feedback.options.lineupSpot ? Number(feedback.options.lineupSpot) - 1 : 0
					if (feedback.options.team === 'awayLineup') {
						return self.data.awayLineup[index].isUp
					} else {
						return self.data.homeLineup[index].isUp
					}
				} catch (error: any) {
					self.log('error', `Error getting batter state: ${error.message}`)
					return false
				}
			},
		},
		playerState: {
			name: 'Is player selected',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				//color: combineRgb(0, 255, 0),
			},
			options: [
				{
					id: 'team',
					type: 'dropdown',
					label: 'Select team',
					choices: [
						{ id: 'awayLineup', label: 'Away Lineup' },
						{ id: 'homeLineup', label: 'Home Lineup' },
					],
					default: 'awayLineup',
				},
				{
					id: 'lineupSpot',
					type: 'number',
					label: 'Lineup spot',
					default: 1,
					min: 1,
					max: 9,
				},
			],
			callback: async (feedback) => {
				try {
					const index: number = feedback.options.lineupSpot ? Number(feedback.options.lineupSpot) - 1 : 0
					if (feedback.options.team === 'awayLineup') {
						return self.data.awayLineup[index].guid === self.data.lowerThird?.guid
					} else {
						return self.data.homeLineup[index].guid === self.data.lowerThird?.guid
					}
				} catch (error: any) {
					self.log('error', `Error getting player state: ${error?.message}`)
					return false
				}
			},
		},
	})
}
