import type { ModuleInstance } from './main.js'
import type { CompanionVariableValues } from '@companion-module/base'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const variables = []
	for (let i = 1; i <= 9; i++) {
		variables.push({ variableId: `awayLineupNumber${i}`, name: `Away Lineup Number ${i}` })
		variables.push({ variableId: `awayLineupName${i}`, name: `Away Lineup Name ${i}` })
		variables.push({ variableId: `awayLineupLabel${i}`, name: `Away Lineup Button Label ${i}` })
	}
	for (let i = 1; i <= 9; i++) {
		variables.push({ variableId: `homeLineupNumber${i}`, name: `Home Lineup Number ${i}` })
		variables.push({ variableId: `homeLineupName${i}`, name: `Home Lineup Name ${i}` })
		variables.push({ variableId: `homeLineupLabel${i}`, name: `Away Lineup Button Label ${i}` })
	}
	variables.push({ variableId: 'awayPitcherNumber', name: 'Away pitcher number' })
	variables.push({ variableId: 'awayPitcherName', name: 'Away pitcher name' })
	variables.push({ variableId: 'awayPitcherLabel', name: 'Away pitcher Button Label' })
	variables.push({ variableId: 'homePitcherNumber', name: 'Home pitcher number' })
	variables.push({ variableId: 'homePitcherName', name: 'Home pitcher name' })
	variables.push({ variableId: 'homePitcherLabel', name: 'Home pitcher Button Label' })
	self.setVariableDefinitions(variables)
}

export function updateLineupAndPitchersVariables(self: ModuleInstance): void {
	const updates: CompanionVariableValues = {}
	//clear values
	for (let i = 1; i <= 9; i++) {
		updates[`awayLineupNumber${i}`] = ''
		updates[`awayLineupName${i}`] = ''
		updates[`awayLineupLabel${i}`] = `${i}.\nunknown`
		updates[`homeLineupNumber${i}`] = ''
		updates[`homeLineupName${i}`] = ''
		updates[`homeLineupLabel${i}`] = `${i}.\nunknown`
	}
	self.data.awayLineup.forEach((player, index) => {
		updates[`awayLineupNumber${index + 1}`] = player.number
		updates[`awayLineupName${index + 1}`] = player.name
		//const lastname: string = player.name.split(' ')[0].toUpperCase()
		if (player.number) {
			updates[`awayLineupLabel${index + 1}`] = `${index + 1}.    #${player.number}\n${player.name.toUpperCase()}`
		} else {
			updates[`awayLineupLabel${index + 1}`] = `${index + 1}.\n${player.name.toUpperCase()}`
		}
	})
	self.data.homeLineup.forEach((player, index) => {
		updates[`homeLineupNumber${index + 1}`] = player.number
		updates[`homeLineupName${index + 1}`] = player.name
		//const lastname: string = player.name.split(' ')[0].toUpperCase()
		if (player.number) {
			updates[`homeLineupLabel${index + 1}`] = `${index + 1}.    #${player.number}\n${player.name.toUpperCase()}`
		} else {
			updates[`homeLineupLabel${index + 1}`] = `${index + 1}.\n${player.name.toUpperCase()}`
		}
	})

	updates['awayPitcherNumber'] = self.data.awayPitcher?.number
	updates['awayPitcherName'] = self.data.awayPitcher?.name
	updates['awayPitcherLabel'] = 'P:\nunknown'
	if (self.data.awayPitcher?.name) {
		updates['awayPitcherLabel'] = `P:\n${self.data.awayPitcher?.name.toUpperCase()}`
	}
	if (self.data.awayPitcher?.number) {
		updates['awayPitcherLabel'] =
			`P:    #${self.data.awayPitcher?.number}\n${self.data.awayPitcher?.name.toUpperCase()}`
	}
	updates['homePitcherNumber'] = self.data.homePitcher?.number
	updates['homePitcherName'] = self.data.homePitcher?.name
	updates['homePitcherLabel'] = 'P:\nunknown'
	if (self.data.homePitcher?.name) {
		updates['homePitcherLabel'] = `P:\n${self.data.homePitcher?.name.toUpperCase()}`
	}
	if (self.data.homePitcher?.number) {
		updates['homePitcherLabel'] =
			`P:    #${self.data.homePitcher?.number}\n${self.data.homePitcher?.name.toUpperCase()}`
	}

	self.setVariableValues(updates)
}
