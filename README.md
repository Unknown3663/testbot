# 🤖 TestBot — Discord.js Playground

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Discord.js-14.25.1-5865F2?logo=discord&logoColor=white" alt="Discord.js" />
  <img src="https://img.shields.io/badge/Mongoose-9.0.1-880000?logo=mongoose&logoColor=white" alt="Mongoose" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-ISC-yellow" alt="License" />
</p>

> A feature-rich Discord bot for learning and experimentation. Includes moderation, economy games, leveling, and admin tooling — now updated to the latest deps and interactive UIs.

---

## ✨ Highlights

- 🛡️ **Moderation**: ban, kick, timeout, warn/clear warnings, slowmode, bulk clear
- 💰 **Economy**: daily credits (1,001–1,999), balances, interactive mini-games
- 🎮 **Games**: Rock-Paper-Scissors with buttons, Russian Roulette (dramatic delay), Dice (high/low/middle), Number Guess (5 attempts with hints)
- 📊 **Leveling**: XP per message (5–15), level-ups with announcements, leaderboards
- ⚙️ **Admin**: auto-role configure/disable with safety checks
- 🛠️ **Utility**: ping, warnings view

## 🔥 Game Details

- **/daily**: Random credits from 1,001 to 1,999; one claim per day
- **/rps**: Bet + choose via buttons; win/lose/tie updates balance
- **/roulette**: Russian roulette with 6 chambers, bullet chance, 2s suspense, cash-out option, 30% gain per safe pull
- **/dice**: Predict high/low/middle; middle pays 5:1
- **/guess**: 5 chat attempts; hints higher/lower; 3x payout on success; bet deducted up front

## 🚀 Quick Start

1. **Install**

```bash
git clone https://github.com/yourusername/testbot.git
cd testbot
npm install
```

2. **Env** — create `.env`

```env
TOKEN=your_discord_bot_token
MONGODB_URI=your_mongodb_connection_string
```

3. **Config** — edit [`config.json`](config.json)

```json
{
  "testServer": "your_test_server_id",
  "clientid": "your_bot_client_id",
  "devs": ["your_discord_user_id"]
}
```

4. **Run**

```bash
npm run build
npm run start   # or npm run dev for nodemon
```

## 📁 Structure

```
testbot/
├── src/
│   ├── commands/          # Slash commands (admin, community, economy, misc, moderation)
│   ├── events/            # Discord event handlers
│   ├── handlers/          # Event/command wiring
│   ├── models/            # Mongoose schemas (User, Level, AutoRole, Warn)
│   ├── utils/             # Helpers (commands loader, diffing, etc.)
│   └── index.js           # Entry point (built to dist/)
├── images/                # Assets/backgrounds
├── config.json            # Bot config
└── package.json           # Scripts & deps
```

## 🛠️ Tech Stack

- Discord.js 14 • Node 18+ • TypeScript 5.9
- MongoDB + Mongoose 9.0.1
- Canvacord 6.0.4 for rank cards
- Nodemon for dev, rimraf/tsc for builds

## 📈 Data Models

- `User` — balances, last daily
- `Level` — xp, level per guild
- `AutoRole` — auto-role per guild
- `warnSchema` — user warnings

## 🤝 Contributing

PRs and ideas welcome — this is a learning sandbox. Open an issue or submit a PR to improve commands, games, or docs.

## 📝 License

ISC License.

---

<p align="center"><strong>Built with ❤️ for learning Discord.js</strong></p>
