import { CompanionPresetDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { combineRgb } from '@companion-module/base'
import { Control } from './api-service.js'

export function UpdatePresetDefinitions(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}

	//component presets
	self.data.controls.forEach((control: Control) => {
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
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 255),
			},
			feedbacks: [
				{
					feedbackId: 'componentState',
					options: {
						component: control.component,
					},
					style: {
						bgcolor: combineRgb(255, 0, 0),
						color: combineRgb(255, 255, 255),
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
					color: away ? combineRgb(255, 255, 255) : combineRgb(0, 0, 0),
					bgcolor: away ? combineRgb(0, 0, 0) : combineRgb(255, 255, 255),
				},
				feedbacks: [
					{
						feedbackId: 'playerSelectionState',
						options: {
							team: team,
							lineupSpot: i,
						},
						style: {
							bgcolor: combineRgb(255, 128, 0),
						},
					},
					{
						feedbackId: 'batterState',
						options: {
							team: team,
							lineupSpot: i,
						},
						style: {
							color: combineRgb(0, 255, 0),
						},
					},
					{
						feedbackId: 'playerOnAirState',
						options: {
							team: team,
							lineupSpot: i,
						},
						style: {
							bgcolor: combineRgb(255, 0, 0),
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
				color: away ? combineRgb(255, 255, 255) : combineRgb(0, 0, 0),
				bgcolor: away ? combineRgb(0, 0, 0) : combineRgb(255, 255, 255),
			},
			feedbacks: [
				{
					feedbackId: 'playerSelectionState',
					options: {
						team: team,
						lineupSpot: 10,
					},
					style: {
						bgcolor: combineRgb(255, 128, 0),
					},
				},
				{
					feedbackId: 'playerOnAirState',
					options: {
						team: team,
						lineupSpot: 10,
					},
					style: {
						bgcolor: combineRgb(255, 0, 0),
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
