#!/usr/bin/env node

import fs from "fs";
import path from "path";

const baseDir = path.join(__dirname, "..");

// Basic conversion patterns
const conversionPatterns = [
  // CommonJS to ES modules
  { from: /require\("(.+?)"\)/g, to: 'import * from "$1"' },
  {
    from: /const\s+(.+?)\s*=\s*require\(["'](.+?)["']\)/g,
    to: 'import $1 from "$2"',
  },
  { from: /module\.exports\s*=\s*{/g, to: "export default {" },
  { from: /module\.exports\s*=\s*/g, to: "export default " },

  // Add type annotations
  {
    from: /callback:\s*async\s*\(client,\s*interaction\)\s*=>/g,
    to: "callback: async (client: BotClient, interaction: ChatInputCommandInteraction): Promise<void> =>",
  },
  {
    from: /module\.exports\s*=\s*async\s*\(client,\s*(.+?)\)\s*=>/g,
    to: "export default async function(client: BotClient, $1: any): Promise<void> =>",
  },
];

function convertFile(filePath: string): string {
  let content = fs.readFileSync(filePath, "utf8");

  // Apply conversion patterns
  for (const pattern of conversionPatterns) {
    content = content.replace(pattern.from, pattern.to);
  }

  // Add necessary imports at the top
  const imports = [
    "import { BotClient } from '../types';",
    "import { ChatInputCommandInteraction } from 'discord.js';",
  ];

  // Check if it's a command file and add command-specific imports
  if (filePath.includes("commands")) {
    content = imports.join("\n") + "\n\n" + content;
  }

  return content;
}

// This is a helper script - not meant to be run automatically
console.log("Conversion helper script ready");
