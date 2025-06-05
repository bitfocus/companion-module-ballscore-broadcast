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
	self.setVariableDefinitions(variables)
}

export function updateLineupVariables(self: ModuleInstance): void {
	const updates: CompanionVariableValues = {}
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
	self.setVariableValues(updates)
}
