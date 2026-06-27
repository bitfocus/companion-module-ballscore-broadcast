# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`ballscore-broadcast` is a **Bitfocus Companion module** — a plugin loaded into [Companion](https://bitfocus.io/companion) so an operator can drive Ball Score's on-air graphics from a Stream Deck (or Companion's web buttons). It is the remote control surface for the broadcast; it does not render graphics itself. It talks to `page-ui`'s REST API over HTTP — see the workspace-root `../CLAUDE.md` for how the three projects fit together.

This repo is published to Bitfocus's module registry (`github.com/bitfocus/companion-module-ballscore-broadcast`); it follows their module conventions and is not free to restructure like an in-house app.

## Commands

Package manager is **Yarn 4** (`packageManager: yarn@4.9.1`, `.yarnrc.yml`); Node `^22.14`. The module is **ESM** (`"type": "module"`) — TS imports must use `.js` extensions (e.g. `import { GetConfigFields } from './config.js'`) even though the source is `.ts`.

- `yarn build` — `rimraf dist && tsc -p tsconfig.build.json`. Output goes to `dist/` (the manifest entrypoint is `../dist/main.js`). Companion loads `dist/`, so build before testing in Companion.
- `yarn dev` — `tsc --watch`; the dev loop.
- `yarn lint` / `yarn lint:raw --fix` — eslint (flat config, `eslint.config.mjs`).
- `yarn format` — prettier (config inherited from `@companion-module/tools`).
- `yarn package` — `build` then `companion-module-build`, producing the `*.tgz` distributable.

`husky` + `lint-staged` run prettier/eslint on commit (`postinstall` installs the hooks).

Note: `pkg/` and the `*.tgz` files are built/packaged artifacts, not source — don't hand-edit them. `companion/manifest.json` `version` is `0.0.0` in source and stamped at package time; the real version lives in `package.json`.

## Architecture

The Companion SDK (`@companion-module/base`) drives everything. `runEntrypoint(BallScoreBroadcastModuleInstance, UpgradeScripts)` in `src/main.ts` is the entry point. The instance class wires together five concern-specific modules, each a single exported `Update*` function that registers definitions with the SDK:

- `config.ts` — web-config fields: `secretKey` (text), `environment` (dropdown: prod/test/dev/local), and `timeout` (number, ms; default 4000).
- `api-service.ts` — `ApiService`, the only HTTP layer (axios). Maps `environment` → base URL and holds the request config.
- `actions.ts` — button actions (`toggle_component`, `select_from_lineup`, `select_pitcher`).
- `feedbacks.ts` — boolean button-style feedbacks (`componentState`, `batterState`, `playerSelectionState`, `playerOnAirState`).
- `variables.ts` — Companion variables for lineup/pitcher numbers, names, and pre-formatted button labels.
- `presets.ts` — ready-made button presets combining the above.
- `upgrades.ts` — `UpgradeScripts` for migrating saved configs across versions (currently empty).

**Config & connection lifecycle.** `init()` registers all definitions (actions/feedbacks/variables/presets) unconditionally, then bails to `InstanceStatus.BadConfig` if `secretKey` is empty; otherwise `connectToBallScore()` constructs the `ApiService` and starts the poll loop. The loop is started **without** awaiting a first fetch, so a startup blip (API briefly down) self-heals instead of leaving the connection dead. `configUpdated()` reconnects only when `environment`, `secretKey`, or `timeout` changed.

**Polling model (self-healing).** There is no push from the server. `pollOnce()` is a single in-flight request that schedules the _next_ tick in a `finally` (recursive `setTimeout`, never `setInterval`), so requests can't overlap. Cadence is derived from the payload: `ACTIVE_POLL_MS` (5s) normally, dropping to `STANDBY_POLL_MS` (60s) when `data.finished === true`, and auto-resuming to fast polling when an active game reappears. On success it sets `InstanceStatus.Ok` (with a "Broadcast finished — standby" message when finished) and resets the failure counter; a single failed poll is tolerated and only flips to `Disconnected` after `MAX_CONSECUTIVE_FAILURES` (2), keeping the previous `self.data` so feedbacks still show last-known state. 401/403 surfaces `AuthenticationFailure` immediately but keeps retrying (auth is user-fixable). The `broadcastTimer` handle is cleared on `destroy()` and on reconnect via `stopPolling()`. The axios `timeout` defaults to 4000ms (configurable, kept below the active poll period).

**`self.data` is the single source of truth.** `BroadcastCompanionData` (lineups, pitchers, current `lowerThird`, and `controls[]`) is fetched once per tick and every feedback/variable reads from it synchronously. Actions optimistically mutate `self.data` locally after a successful API call (e.g. `toggle_component` flips the local `action`) and immediately `checkFeedbacks` so buttons respond without waiting for the next poll.

## API contract with `page-ui`

`ApiService` calls these endpoints under `<env-base>/api/v1` (`www`/`test`/`dev`.ballscore.app, or `http://localhost:4200` for `local`):

- `GET /companion` — the aggregate poll payload (`BroadcastCompanionData`, incl. `finished?: boolean`). Empty `controls` is treated as valid (not-yet-configured broadcast); only a missing/malformed payload throws.
- `PUT /controls/:component/toggle` — toggle one on-air component.
- `PUT /lower-third/:playerGuid` — select a player for the lower-third graphic.
- `GET /broadcasts/:secretKey/controls`, `GET /controls/:component` — read helpers.

**Auth is the `x-secret-key` header**, set to the configured `secretKey`. Subtle: the same `secretKey` is also used as the broadcast id in the `/broadcasts/:secretKey/controls` path — it is both credential and resource key. The server side of this contract lives in `../ball-score-2-b-page/server/api/` (`companion.js`, `broadcasts-controls.js`, `lower-third.js`); see `../ball-score-2-b-page/CLAUDE.md` → "Express server".

**Keep the component list in sync.** The component ids in `actions.ts` and `feedbacks.ts` dropdowns (`status`, `batter`, `pitcher`, `lowerThird`, `boxScore`, `intro`, `awayLineup`, `homeLineup`, `awayDefence`, `homeDefence`, `customTable`) must match the `ControlComponent` union in `page-ui` (`../ball-score-2-b-page/src/app/model/broadcast/control.ts`). Both dropdowns use `allowCustom: true`, so a new component can be controlled by typing its id without releasing a new module version — but the curated list should still be kept aligned.
