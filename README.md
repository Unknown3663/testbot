# 🤖 TestBot - Discord.js Learning Project

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.19.3-blue.svg)](https://discord.js.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

> A feature-rich Discord bot built with Discord.js v14 for learning and experimentation purposes. This bot includes moderation tools, economy system, leveling, and administrative features.

## ✨ Features

### 🛡️ Moderation Commands

- **Ban/Kick** - Remove problematic users from your server
- **Timeout** - Temporarily restrict user permissions
- **Warn/Clear Warnings** - Track and manage user warnings
- **Slowmode** - Control message frequency in channels
- **Clear Messages** - Bulk delete messages

### 💰 Economy System

- **Daily Rewards** - Collect daily coins (1000 per day)
- **Balance Tracking** - View user balances across servers
- **MongoDB Integration** - Persistent data storage

### 📊 Leveling System

- **XP Tracking** - Users gain XP by chatting (5-15 XP per message)
- **Level Cards** - Beautiful rank cards with user stats
- **Leaderboards** - Server-wide ranking system
- **Custom Card Backgrounds** - Personalized level displays

### ⚙️ Administrative Tools

- **Auto-Role** - Automatically assign roles to new members
- **Permission Checks** - Role-based command restrictions
- **Server Configuration** - Guild-specific settings

### 🎯 Utility Commands

- **Ping** - Check bot latency and response time
- **User Warnings** - View warning history for any user

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/) account
- Discord Bot Token

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/testbot.git
   cd testbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   TOKEN=your_discord_bot_token
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Configure the bot**
   Update [`config.json`](config.json) with your settings:

   ```json
   {
     "testServer": "your_test_server_id",
     "clientid": "your_bot_client_id",
     "devs": ["your_discord_user_id"]
   }
   ```

5. **Start the bot**
   ```bash
   node src/index.js
   ```

## 📁 Project Structure

```
testbot/
├── src/
│   ├── commands/          # Slash commands organized by category
│   │   ├── admin/         # Administrative commands
│   │   ├── community/     # Community features
│   │   ├── economy/       # Economy system commands
│   │   ├── misc/          # Utility commands
│   │   └── moderation/    # Moderation tools
│   ├── events/            # Discord event handlers
│   │   ├── guildMemberAdd/
│   │   ├── interactionCreate/
│   │   ├── messageCreate/
│   │   └── ready/
│   ├── handlers/          # Event and command handlers
│   ├── models/            # MongoDB schemas
│   ├── utils/             # Utility functions
│   └── index.js           # Main bot file
├── images/                # Bot assets and backgrounds
├── config.json            # Bot configuration
└── package.json           # Dependencies and scripts
```

## 🔧 Available Commands

| Category       | Command               | Description                 |
| -------------- | --------------------- | --------------------------- |
| **Moderation** | `/ban`                | Ban a user from the server  |
|                | `/kick`               | Kick a user from the server |
|                | `/timeout`            | Timeout a user temporarily  |
|                | `/warn`               | Warn a user                 |
|                | `/clearwarn`          | Clear user warnings         |
|                | `/slowmode`           | Set channel slowmode        |
|                | `/clear`              | Bulk delete messages        |
| **Economy**    | `/daily`              | Collect daily rewards       |
|                | `/balance`            | Check user balance          |
|                | `/level`              | View level information      |
| **Admin**      | `/autorole-configure` | Set up auto-role            |
|                | `/autorole-disable`   | Disable auto-role           |
| **Community**  | `/warnings`           | View user warnings          |
| **Misc**       | `/ping`               | Check bot latency           |

## 🛠️ Technologies Used

- **[Discord.js v14](https://discord.js.org/)** - Discord API wrapper
- **[MongoDB](https://www.mongodb.com/)** - Database for persistent storage
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
- **[Canvacord](https://canvacord.js.org/)** - Canvas-based image generation
- **[Node.js](https://nodejs.org/)** - JavaScript runtime

## 📈 Database Models

The bot uses MongoDB with the following schemas:

- **[`User`](src/models/User.js)** - Economy and user data
- **[`Level`](src/models/Level.js)** - XP and leveling system
- **[`AutoRole`](src/models/AutoRole.js)** - Server auto-role configurations
- **[`warnSchema`](src/models/warnSchema.js)** - User warning tracking

## 🤝 Contributing

This is a learning project, but contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is licensed under the ISC License.

## ⚠️ Disclaimer

This bot is created for educational and testing purposes. It's not intended for production use without proper security audits and optimizations.

---

<div align="center">
  <strong>Built with ❤️ for learning Discord.js</strong>
</div>
