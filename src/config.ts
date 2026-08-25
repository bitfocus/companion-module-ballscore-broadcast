import { type SomeCompanionConfigField } from '@companion-module/base'

// Kept below the active poll period (see ACTIVE_POLL_MS in main.ts) so a stalled
// request can never overlap the next tick.
export const DEFAULT_TIMEOUT_MS = 4000

export interface BallScoreBroadcastModuleConfig {
	secretKey: string
	environment: string
	// Always present: new instances get the field default, existing ones are
	// backfilled by the upgrade script in upgrades.ts.
	timeout: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			id: 'secretKey',
			type: 'textinput',
			label: 'Secret Key',
			width: 8,
			required: true,
			default: '',
		},
		{
			id: 'environment',
			type: 'dropdown',
			label: 'Environment',
			width: 8,
			choices: [
				{ id: 'prod', label: 'Production' },
				{ id: 'test', label: 'Test' },
				{ id: 'dev', label: 'Development' },
				{ id: 'local', label: 'Local' },
			],
			default: 'prod',
		},
		{
			id: 'timeout',
			type: 'number',
			label: 'API timeout (ms)',
			width: 8,
			min: 500,
			max: 30000,
			default: DEFAULT_TIMEOUT_MS,
		},
	]
}
