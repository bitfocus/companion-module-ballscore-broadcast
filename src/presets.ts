import { CompanionPresetDefinitions } from '@companion-module/base'
import type { BallScoreBroadcastModuleInstance } from './main.js'
import { Control } from './api-service.js'

export function UpdatePresetDefinitions(self: BallScoreBroadcastModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}
	const white: number = '#fff' as unknown as number
	const black: number = '#000' as unknown as number
	const red: number = '#f00' as unknown as number
	const green: number = '#0f0' as unknown as number
	const blue: number = '#00f' as unknown as number
	//const yellow: number = '#ff0' as unknown as number
	const orange: number = '#ff8000' as unknown as number

	//component presets
	self.data?.controls.forEach((control: Control) => {
		//dont add following components to presets
		if (control.component === 'poweredBy') return
		const label: string = control.component.replace(/([A-Z])/g, ' $1').toUpperCase()
		presets[`toggle_${control.component}`] = {
			type: 'button',
			category: 'Components',
			name: `${label}`,
			style: {
				text: `${label.toUpperCase()}`,
				size: '14',
				show_topbar: false,
				color: white,
				bgcolor: blue,
			},
			feedbacks: [
				{
					feedbackId: 'componentState',
					options: {
						component: control.component,
					},
					style: {
						bgcolor: red,
						color: white,
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'toggle_component',
							options: {
								component: control.component,
							},
						},
					],
					up: [],
				},
			],
		}
	})

	// Presets for selecting players from the away lineup
	fillPresetsWithLineup(true)
	fillPresetsWithLineup(false)

	function fillPresetsWithLineup(away: boolean): void {
		const team: string = away ? 'away' : 'home'
		for (let i = 1; i <= 9; i++) {
			presets[`select_${team}_player_${i}`] = {
				type: 'button',
				category: 'Lineup Selection',
				name: `Batter ${i}`,
				style: {
					text: `$(ballscore-broadcast:${team}LineupLabel${i})`,
					size: '18',
					alignment: 'left:top',
					show_topbar: false,
					color: away ? white : black,
					bgcolor: away ? black : white,
				},
				feedbacks: [
					{
						feedbackId: 'playerSelectionState',
						options: {
							team: team,
							lineupSpot: i,
						},
						style: {
							bgcolor: orange,
						},
					},
					{
						feedbackId: 'batterState',
						options: {
							team: team,
							lineupSpot: i,
						},
						style: {
							color: green,
						},
					},
					{
						feedbackId: 'playerOnAirState',
						options: {
							team: team,
							lineupSpot: i,
						},
						style: {
							bgcolor: red,
						},
					},
				],
				steps: [
					{
						down: [
							{
								actionId: 'select_from_lineup',
								options: {
									team: team,
									num: i,
								},
							},
						],
						up: [],
					},
				],
			}
		}
	}

	// Presets for selecting pitchers
	fillPresetsWithPitchers(true)
	fillPresetsWithPitchers(false)

	function fillPresetsWithPitchers(away: boolean): void {
		const team: string = away ? 'away' : 'home'
		presets[`select_${team}_pitcher`] = {
			type: 'button',
			category: 'Pitcher Selection',
			name: `Select ${team} pitcher`,
			style: {
				text: `$(ballscore-broadcast:${team}PitcherLabel)`,
				size: '18',
				alignment: 'left:top',
				show_topbar: false,
				color: away ? white : black,
				bgcolor: away ? black : white,
			},
			feedbacks: [
				{
					feedbackId: 'playerSelectionState',
					options: {
						team: team,
						lineupSpot: 10,
					},
					style: {
						bgcolor: orange,
					},
				},
				{
					feedbackId: 'playerOnAirState',
					options: {
						team: team,
						lineupSpot: 10,
					},
					style: {
						bgcolor: red,
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'select_pitcher',
							options: {
								team: team,
							},
						},
					],
					up: [],
				},
			],
		}
	}

	self.setPresetDefinitions(presets)
}
