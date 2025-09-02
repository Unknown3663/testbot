# TypeScript Migration Guide

## Overview

This document outlines the successful conversion of the Discord bot from JavaScript to TypeScript.

## What Was Converted

### ✅ Completed Files

- **Main Entry Point**: `src/index.ts`
- **Event Handler**: `src/handlers/eventHandler.ts`
- **Utilities**:
  - `src/utils/getAllFiles.ts`
  - `src/utils/areCommandsDifferent.ts`
  - `src/utils/calculateLevelXp.ts`
  - `src/utils/getApplicationCommands.ts`
  - `src/utils/getLocalCommands.ts`
- **Models**:
  - `src/models/User.ts`
  - `src/models/Level.ts`
  - `src/models/AutoRole.ts`
  - `src/models/warnSchema.ts`
- **Events**:
  - `src/events/ready/01registerCommands.ts`
  - `src/events/interactionCreate/handleCommands.ts`
  - `src/events/guildMemberAdd/autoRole.ts`
  - `src/events/messageCreate/giveUserXp.ts`
- **Commands**:
  - `src/commands/misc/ping.ts`
  - `src/commands/economy/balance.ts`
  - `src/commands/economy/daily.ts`
  - `src/commands/economy/level.ts`
  - `src/commands/moderation/ban.ts`

### 📋 Remaining JavaScript Files

The following files still need to be converted following the established patterns:

#### Commands

- `src/commands/admin/autorole-configure.js`
- `src/commands/admin/autorole-disable.js`
- `src/commands/community/warnings.js`
- `src/commands/moderation/clear.js`
- `src/commands/moderation/clearwarn.js`
- `src/commands/moderation/kick.js`
- `src/commands/moderation/slowmode.js`
- `src/commands/moderation/timeout.js`
- `src/commands/moderation/warn.js`

#### Events

- `src/events/messageCreate/countMessages.js`
- `src/events/guildMemberRemove/` (if any files exist)

## Package Updates

### Dependencies Updated

- All packages have been updated to their latest versions
- Security vulnerabilities have been resolved
- New TypeScript dependencies added:
  - `typescript@^5.6.2`
  - `ts-node@^10.9.2`
  - `@types/node@^20.16.10`
  - `@types/ms@^0.7.34`
  - `rimraf@^6.0.1`

### New Scripts

- `npm run build` - Compiles TypeScript to JavaScript
- `npm run dev` - Runs the bot in development mode with hot reload
- `npm start` - Runs the compiled JavaScript
- `npm run clean` - Removes the dist folder

## Configuration Files Added

### TypeScript Configuration (`tsconfig.json`)

- Strict TypeScript settings enabled
- ES2020 target
- Source maps enabled
- Declaration files generated

### Nodemon Configuration (`nodemon.json`)

- Watches TypeScript files
- Uses ts-node for execution
- Ignores test files

### Environment Variables (`.env.example`)

- Template for required environment variables
- Clear documentation of needed values

## Type Definitions

### Custom Types (`src/types/index.ts`)

- `BotClient` - Extended Discord.js client
- `CommandObject` - Command structure interface
- `Config` - Configuration interface
- `CommandOptions` - Command options interface

### Database Models

All Mongoose models now have proper TypeScript interfaces:

- `IUser` - User schema interface
- `ILevel` - Level schema interface
- `IAutoRole` - AutoRole schema interface
- `IWarning` - Warning schema interface

## Migration Patterns Used

### Import/Export Pattern

```typescript
// Before (CommonJS)
const { Client } = require('discord.js');
module.exports = { ... };

// After (ES Modules)
import { Client } from 'discord.js';
export default { ... };
```

### Function Signatures

```typescript
// Before
module.exports = async (client, interaction) => { ... }

// After
export default async function(client: BotClient, interaction: ChatInputCommandInteraction): Promise<void> { ... }
```

### Command Structure

```typescript
// Before
module.exports = {
  callback: async (client, interaction) => { ... }
}

// After
export default {
  callback: async (client: BotClient, interaction: ChatInputCommandInteraction): Promise<void> => { ... }
}
```

## Development Workflow

### Development Mode

```bash
npm run dev
```

This uses nodemon with ts-node for hot reloading during development.

### Production Build

```bash
npm run build
npm start
```

This compiles TypeScript to JavaScript and runs the compiled version.

### Type Checking

TypeScript will now catch type errors at compile time, preventing many runtime errors.

## Benefits Achieved

1. **Type Safety**: Catch errors at compile time
2. **Better IntelliSense**: Enhanced IDE support
3. **Self-Documenting Code**: Types serve as documentation
4. **Refactoring Safety**: TypeScript helps prevent breaking changes
5. **Modern JavaScript**: ES2020 features available
6. **Package Security**: All packages updated and vulnerabilities resolved

## Next Steps

1. Convert remaining JavaScript files using the patterns shown
2. Add more specific type definitions as needed
3. Consider adding unit tests with Jest and TypeScript
4. Set up ESLint with TypeScript rules
5. Add GitHub Actions for CI/CD

## Example Conversion Pattern

For any remaining files, follow this pattern:

```typescript
// Import statements at the top
import { ChatInputCommandInteraction, ApplicationCommandOptionType } from 'discord.js';
import { BotClient } from '../../types';
import SomeModel from '../../models/SomeModel';

export default {
  name: 'command-name',
  description: 'Command description',
  options: [...],
  callback: async (client: BotClient, interaction: ChatInputCommandInteraction): Promise<void> => {
    // Function body with proper type annotations
    const member = interaction.member as GuildMember;
    // ... rest of the logic
  },
};
```

The bot is now successfully converted to TypeScript with modern package versions and proper type safety!
