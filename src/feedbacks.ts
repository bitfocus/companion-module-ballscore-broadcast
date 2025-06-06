import { combineRgb } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import type { CompanionOptionValues } from '@companion-module/base'

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
					return (
						self.data.controls.find((control: any) => control.component === feedback.options.component)?.action === 'on'
					)
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
						{ id: 'away', label: 'Away' },
						{ id: 'home', label: 'Home' },
					],
					default: 'away',
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
					if (feedback.options.team === 'away') {
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
		playerSelectionState: {
			name: 'Is player selected',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 128, 0),
				//color: combineRgb(0, 255, 0),
			},
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
					id: 'lineupSpot',
					type: 'number',
					label: 'Lineup spot (10 for pitcher)',
					default: 1,
					min: 1,
					max: 10,
				},
			],
			callback: async (feedback) => {
				return isPlayerSelected(feedback.options)
			},
		},
		playerOnAirState: {
			name: 'Is player on air',
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
						{ id: 'away', label: 'Away' },
						{ id: 'home', label: 'Home' },
					],
					default: 'away',
				},
				{
					id: 'lineupSpot',
					type: 'number',
					label: 'Lineup spot (10 for pitcher)',
					default: 1,
					min: 1,
					max: 10,
				},
			],
			callback: async (feedback) => {
				try {
					return (
						isPlayerSelected(feedback.options) &&
						self.data.controls.find((control: any) => control.component === 'lowerThird')?.action === 'on'
					)
				} catch (error: any) {
					self.log('error', `Error getting player on air state: ${error?.message}`)
					return false
				}
			},
		},
	})

	function isPlayerSelected(feedBackOptions: CompanionOptionValues): boolean {
		try {
			if (feedBackOptions.lineupSpot === 10) {
				if (feedBackOptions.team === 'away') {
					return !!self.data.awayPitcher?.guid && self.data.awayPitcher?.guid === self.data.lowerThird?.guid
				} else {
					return !!self.data.homePitcher?.guid && self.data.homePitcher?.guid === self.data.lowerThird?.guid
				}
			}
			const index: number = feedBackOptions.lineupSpot ? Number(feedBackOptions.lineupSpot) - 1 : 0
			if (feedBackOptions.team === 'away') {
				return self.data.awayLineup[index].guid === self.data.lowerThird?.guid
			} else {
				return self.data.homeLineup[index].guid === self.data.lowerThird?.guid
			}
		} catch (error: any) {
			self.log('error', `Error getting player state: ${error?.message}`)
			return false
		}
	}
}
