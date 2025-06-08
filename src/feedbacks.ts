import type { BallScoreBroadcastModuleInstance } from './main.js'
import type { CompanionOptionValues } from '@companion-module/base'

export function UpdateFeedbacks(self: BallScoreBroadcastModuleInstance): void {
	//const white: number = '#fff' as unknown as number
	const black: number = '#000' as unknown as number
	const red: number = '#f00' as unknown as number
	const green: number = '#0f0' as unknown as number
	//const blue: number = '#00f' as unknown as number
	//const yellow: number = '#ff0' as unknown as number
	const orange: number = '#ff8000' as unknown as number

	self.setFeedbackDefinitions({
		componentState: {
			name: 'State of component',
			type: 'boolean',
			defaultStyle: {
				bgcolor: red,
				color: black,
			},
			options: [
				{
					id: 'component',
					type: 'dropdown',
					label: 'Select component',
					choices: [
						{ id: 'status', label: 'Status' },
						{ id: 'batter', label: 'Current Batter' },
						{ id: 'pitcher', label: 'Current Pitcher' },
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
					allowCustom: true,
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
				color: green,
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
				bgcolor: orange,
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
				bgcolor: red,
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
