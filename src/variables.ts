import type { ModuleInstance } from './main.js'
import { BroadcastCompanionData } from './api-service.js'
import type { CompanionVariableValues } from '@companion-module/base/dist/module-api/variable.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	self.setVariableDefinitions([
		//away lineup
		{ variableId: 'awayLineupNumber1', name: 'Away Lineup Number 1' },
		{ variableId: 'awayLineupName1', name: 'Away Lineup Name 1' },
		{ variableId: 'awayLineupNumber2', name: 'Away Lineup Number 2' },
		{ variableId: 'awayLineupName2', name: 'Away Lineup Name 2' },
		{ variableId: 'awayLineupNumber3', name: 'Away Lineup Number 3' },
		{ variableId: 'awayLineupName3', name: 'Away Lineup Name 3' },
		{ variableId: 'awayLineupNumber4', name: 'Away Lineup Number 4' },
		{ variableId: 'awayLineupName4', name: 'Away Lineup Name 4' },
		{ variableId: 'awayLineupNumber5', name: 'Away Lineup Number 5' },
		{ variableId: 'awayLineupName5', name: 'Away Lineup Name 5' },
		{ variableId: 'awayLineupNumber6', name: 'Away Lineup Number 6' },
		{ variableId: 'awayLineupName6', name: 'Away Lineup Name 6' },
		{ variableId: 'awayLineupNumber7', name: 'Away Lineup Number 7' },
		{ variableId: 'awayLineupName7', name: 'Away Lineup Name 7' },
		{ variableId: 'awayLineupNumber8', name: 'Away Lineup Number 8' },
		{ variableId: 'awayLineupName8', name: 'Away Lineup Name 8' },
		{ variableId: 'awayLineupNumber9', name: 'Away Lineup Number 9' },
		{ variableId: 'awayLineupName9', name: 'Away Lineup Name 9' },

		//home lineup
		{ variableId: 'homeLineupNumber1', name: 'Home Lineup Number 1' },
		{ variableId: 'homeLineupName1', name: 'Home Lineup Name 1' },
		{ variableId: 'homeLineupNumber2', name: 'Home Lineup Number 2' },
		{ variableId: 'homeLineupName2', name: 'Home Lineup Name 2' },
		{ variableId: 'homeLineupNumber3', name: 'Home Lineup Number 3' },
		{ variableId: 'homeLineupName3', name: 'Home Lineup Name 3' },
		{ variableId: 'homeLineupNumber4', name: 'Home Lineup Number 4' },
		{ variableId: 'homeLineupName4', name: 'Home Lineup Name 4' },
		{ variableId: 'homeLineupNumber5', name: 'Home Lineup Number 5' },
		{ variableId: 'homeLineupName5', name: 'Home Lineup Name 5' },
		{ variableId: 'homeLineupNumber6', name: 'Home Lineup Number 6' },
		{ variableId: 'homeLineupName6', name: 'Home Lineup Name 6' },
		{ variableId: 'homeLineupNumber7', name: 'Home Lineup Number 7' },
		{ variableId: 'homeLineupName7', name: 'Home Lineup Name 7' },
		{ variableId: 'homeLineupNumber8', name: 'Home Lineup Number 8' },
		{ variableId: 'homeLineupName8', name: 'Home Lineup Name 8' },
		{ variableId: 'homeLineupNumber9', name: 'Home Lineup Number 9' },
		{ variableId: 'homeLineupName9', name: 'Home Lineup Name 9' },
	])
}

export function updateLineupVariables(self: ModuleInstance, data: BroadcastCompanionData): void {
	const updates: CompanionVariableValues = {}
	data.awayLineup.forEach((player, index) => {
		updates[`awayLineupNumber${index + 1}`] = player.number
		updates[`awayLineupName${index + 1}`] = player.name
	})
	data.homeLineup.forEach((player, index) => {
		updates[`homeLineupNumber${index + 1}`] = player.number
		updates[`homeLineupName${index + 1}`] = player.name
	})
	self.setVariableValues(updates)
}
