import { type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	secretKey: string
	environment: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			id: 'secretKey',
			type: 'textinput',
			label: 'Secret Key',
			width: 8,
			regex: '^[\\w]{20}$',
			required: true,
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
	]
}
