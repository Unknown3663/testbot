# TestBot

Discord.js v14 bot written in TypeScript and run with Bun. The project includes guild-scoped slash command registration, MongoDB-backed economy and leveling data, moderation tools, warning records, auto-role setup, and several credit-based games.

## Tech Stack

- Bun runtime and package manager
- TypeScript 6
- Discord.js 14
- MongoDB with Mongoose 9
- Canvacord for rank card generation

## Features

- Slash commands auto-register against the configured test server on startup.
- Economy profiles store per-guild balances and daily claim timestamps.
- Games use credits: rock-paper-scissors, dice, number guessing, and Russian roulette.
- Leveling grants 5-15 XP per message with a 30 second per-user cooldown.
- Rank cards render with Canvacord using `images/CardBackGround.png`.
- Moderation commands cover ban, kick, timeout, slowmode, bulk clear, warn, and clear warnings.
- Auto-role assigns a configured role when a member joins, with permission and role hierarchy checks.

## Requirements

- Bun installed locally
- MongoDB connection string
- Discord application and bot token
- A Discord test server ID for command registration
- Bot gateway intents enabled in Discord Developer Portal:
  - Server Members Intent
  - Message Content Intent
  - Presence Intent, used for rank card status display

## Setup

Install dependencies:

```bash
bun install
```

Create `.env`:

```env
TOKEN=your_discord_bot_token
MONGODB_URI=your_mongodb_connection_string
```

Update `config.json`:

```json
{
  "testServer": "your_test_server_id",
  "clientid": "your_bot_client_id",
  "devs": ["your_discord_user_id"]
}
```

`testServer` controls where slash commands are registered. Commands are synced on the `clientReady` event, so changes in `src/commands` are registered after restart.

## Scripts

```bash
bun run dev      # run src/index.ts with Bun hot reload
bun run build    # compile TypeScript into dist/
bun run start    # run dist/index.js
bun run clean    # remove dist/
```

`bun run test` is still a placeholder and exits with an error.

## Commands

| Command | Purpose |
| --- | --- |
| `/ping` | Shows interaction latency and websocket ping. |
| `/daily` | Claims 1,001-1,999 credits once per calendar day. |
| `/balance [user]` | Shows your balance or another user's balance. |
| `/level [target-user]` | Generates a rank card for you or another member. |
| `/rps <bet>` | Rock-paper-scissors with buttons. Bets must be 10-200 credits. |
| `/dice <bet> <prediction>` | Rolls two dice. High/low pays even profit; middle pays 5x profit. Bets must be 10-200 credits. |
| `/guess <bet>` | Guess a number from 1-100 in 5 attempts within 2 minutes. Win pays 3x the bet. Bets must be 10-200 credits. |
| `/roulette <bet>` | Button-based risk game with cash out. Safe pulls add 30% of the original bet. Bets must be 10-200 credits. |
| `/warnings <user>` | Shows warning records for a user. |
| `/warn <user> [reason]` | Adds a warning and attempts to DM the warned user. Requires Kick Members. |
| `/clearwarn <user>` | Removes all warning records for a user. Requires Kick Members. |
| `/clear <amount>` | Bulk-deletes 1-100 recent messages, skipping messages older than 14 days. Requires Manage Messages. |
| `/kick <target-user> [reason]` | Kicks a server member with role hierarchy checks. Requires Kick Members. |
| `/ban <target-user> [reason]` | Bans by mention or Discord user ID, including users not currently in the server. Requires Ban Members. |
| `/timeout <target-user> <duration> [reason]` | Times out or updates timeout. Supports `s`, `m`, `h`, and `d`; Discord limit is 5 seconds to 28 days. Requires Moderate Members. |
| `/slowmode <duration>` | Sets channel slowmode from `0s` to `6h`. Requires Manage Channels. |
| `/autorole-configure <role>` | Stores the role assigned to new members. Requires Manage Roles and bot Manage Roles. |
| `/autorole-disable` | Removes the stored auto-role for the server. Requires Manage Roles. |

## Project Layout

```text
src/
  commands/
    admin/        # auto-role configuration
    community/    # warnings lookup
    economy/      # balance, daily, level, credit games
    misc/         # ping
    moderation/   # ban, kick, timeout, slowmode, clear, warnings
  events/
    clientReady/        # slash command sync
    guildMemberAdd/     # auto-role assignment
    interactionCreate/  # command dispatch
    messageCreate/      # XP and message counting
  handlers/       # event loader
  models/         # Mongoose models
  utils/          # file loading, command diffing, XP math
images/           # rank card assets
config.json       # guild/app/developer IDs
```

## Data Models

- `User`: `userId`, `guildId`, `balance`, `LastDaily`
- `Level`: `userId`, `guildId`, `xp`, `level`
- `AutoRole`: `guildId`, `roleId`
- `warnSchema`: `GuildID`, `UserID`, `UserTag`, `Content`

`User` and `Level` use compound indexes on `userId` and `guildId` to keep profiles scoped per server.

## Operational Notes

- Moderation permission checks are implemented inside each command callback.
- Guild command sync compares local command definitions with Discord commands and edits changed descriptions/options.
- `messageCreate/countMessages.ts` increments an in-memory counter, but the interval function is not currently invoked.
- Generated build output lives in `dist/` and is ignored by Git.

## License

ISC
