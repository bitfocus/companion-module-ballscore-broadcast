## Ball Score Broadcast

This module allows you to control the Ball Score broadcast system from Companion. It provides actions to toggle components on/off, select batters from the lineup, select pitchers, and select any player or coach from the full team roster. It also provides feedbacks to show the state of components, batters, and players.

### Configuration

The module requires the following configuration:

- **Secret Key**: A 20-character alphanumeric key that is required for authentication with the Ball Score broadcast system.
- **Environment**: Select the environment to connect to:
  - Production: www.ballscore.app
  - Test: test.ballscore.app
  - Development: dev.ballscore.app (early unstable releases)
  - Local: localhost:4200 (local development)
- **API timeout (ms)**: How long to wait for a response from the Ball Score API before the request is
  aborted (500-30000 ms, default 4000). Keep it below the 5 s polling interval. Existing connections
  created before this option was added are automatically migrated to the default on upgrade.

### Available Actions

#### Toggle Component

Toggles a component on/off.

- **Component**: Select the component to toggle:
  - Status
  - Batter
  - Lower Third
  - Box Score
  - Intro
  - Away Lineup
  - Home Lineup
  - Away Defence
  - Home Defence
  - Custom Table

#### Select Batter from Lineup

Selects a batter from the lineup for display in the lower third.

- **Team**: Select the team (Away/Home)
- **Number**: Select the lineup position (1-9)

#### Select Pitcher

Selects a pitcher for display in the lower third.

- **Team**: Select the team (Away/Home)

#### Select Player from Roster

Selects any player or coach from the full team roster for display in the lower third. Unlike
"Select Batter from Lineup", this is not limited to the nine active batting spots.

- **Team**: Select the team (Away/Home)
- **Roster index**: Position in the roster (1-40)

### Available Feedbacks

#### Component State

Shows the state of a component (on/off).

- **Component**: Select the component to monitor

#### Batter State

Shows if a batter is up.

- **Team**: Select the team (Away/Home)
- **Lineup Spot**: Select the lineup position (1-9)

#### Player Selection State

Shows if a player is selected for the lower third.

- **Team**: Select the team (Away/Home)
- **Lineup Spot**: Select the lineup position (1-10, where 10 is for pitcher)

#### Player On Air State

Shows if a player is on air (selected and lower third is on).

- **Team**: Select the team (Away/Home)
- **Lineup Spot**: Select the lineup position (1-10, where 10 is for pitcher)

#### Is Roster Player Selected

Shows if a roster player is selected for the lower third.

- **Team**: Select the team (Away/Home)
- **Roster index**: Position in the roster (1-40)

#### Is Roster Player On Air

Shows if a roster player is on air (selected and lower third is on).

- **Team**: Select the team (Away/Home)
- **Roster index**: Position in the roster (1-40)

#### Has Roster Player Entered the Game

Shows if a roster player has already appeared in the game (used to dim their button).

- **Team**: Select the team (Away/Home)
- **Roster index**: Position in the roster (1-40)

### Available Variables

#### Away Team Variables

For each lineup position (1-9):

- **awayLineupNumber{1-9}**: Player's number
- **awayLineupName{1-9}**: Player's name
- **awayLineupLabel{1-9}**: Formatted button label with position, number, and name

For the pitcher:

- **awayPitcherNumber**: Pitcher's number
- **awayPitcherName**: Pitcher's name
- **awayPitcherLabel**: Formatted button label for the pitcher

For each roster slot (1-40):

- **awayRosterNumber{1-40}**: Player's number
- **awayRosterName{1-40}**: Player's name
- **awayRosterLabel{1-40}**: Formatted button label with number and name

#### Home Team Variables

For each lineup position (1-9):

- **homeLineupNumber{1-9}**: Player's number
- **homeLineupName{1-9}**: Player's name
- **homeLineupLabel{1-9}**: Formatted button label with position, number, and name

For the pitcher:

- **homePitcherNumber**: Pitcher's number
- **homePitcherName**: Pitcher's name
- **homePitcherLabel**: Formatted button label for the pitcher

For each roster slot (1-40):

- **homeRosterNumber{1-40}**: Player's number
- **homeRosterName{1-40}**: Player's name
- **homeRosterLabel{1-40}**: Formatted button label with number and name

Roster slots beyond the current squad size are left empty.

### Presets

The module provides several presets:

1. **Component Presets**: For each component, a preset is created to toggle that component on/off.
2. **Lineup Selection Presets**: For each position (1-9) in both away and home teams, presets are created to select batters from the lineup.
3. **Pitcher Selection Presets**: For both away and home teams, presets are created to select pitchers.
4. **Roster Selection Presets**: For each roster slot (1-40) in both away and home teams, presets are
   created to select that player or coach. Players who have already entered the game are dimmed.

### Usage Examples

1. **Toggle a Component**:

   - Add a button with the "Toggle Component" action
   - Select the component you want to toggle
   - Add the "Component State" feedback to show the current state

2. **Select a Batter**:

   - Add a button with the "Select Batter from Lineup" action
   - Select the team and lineup position
   - Add the "Player Selection State" and "Player On Air State" feedbacks to show the current state

3. **Select a Pitcher**:

   - Add a button with the "Select Pitcher" action
   - Select the team
   - Add the "Player Selection State" and "Player On Air State" feedbacks to show the current state

4. **Select Anyone from the Roster**:
   - Add a button with the "Select Player from Roster" action
   - Select the team and roster index
   - Add the "Is Roster Player Selected" and "Is Roster Player On Air" feedbacks to show the current state
