import type {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
} from '@companion-module/base'
import { DEFAULT_TIMEOUT_MS, type BallScoreBroadcastModuleConfig } from './config.js'

// Shape of a config saved by an older module version, where fields added later
// may still be missing.
type LegacyConfig = Partial<BallScoreBroadcastModuleConfig>

// v1.1.1: the `timeout` config field was introduced after v1.0.1, so configs
// saved by an older version have it undefined. Backfill the field default.
function addTimeoutConfigField(
	_context: CompanionUpgradeContext<BallScoreBroadcastModuleConfig>,
	props: CompanionStaticUpgradeProps<BallScoreBroadcastModuleConfig>,
): CompanionStaticUpgradeResult<BallScoreBroadcastModuleConfig> {
	const noChanges: CompanionStaticUpgradeResult<BallScoreBroadcastModuleConfig> = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	const config = props.config as LegacyConfig | null
	if (!config || typeof config.timeout === 'number') {
		return noChanges
	}

	config.timeout = DEFAULT_TIMEOUT_MS

	return {
		...noChanges,
		updatedConfig: config as BallScoreBroadcastModuleConfig,
	}
}

export const UpgradeScripts: CompanionStaticUpgradeScript<BallScoreBroadcastModuleConfig>[] = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	addTimeoutConfigField,
]
