import {
  Client,
  ChatInputCommandInteraction,
  ApplicationCommandOptionData,
} from "discord.js";

export interface BotClient extends Client {
  // Add any custom properties to the client here
}

export interface Config {
  testServer: string;
  clientid: string;
  devs: string[];
}

export interface CommandOptions {
  name: string;
  description: string;
  type: number;
  required?: boolean;
  choices?: Array<{ name: string; value: string | number }>;
}

export interface CommandObject {
  name: string;
  description: string;
  options?: CommandOptions[];
  callback: (
    client: BotClient,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
  devOnly?: boolean;
  testOnly?: boolean;
  deleted?: boolean;
  permissionsRequired?: string[];
  botPermissions?: string[];
}

export interface EventHandler {
  (client: BotClient, ...args: any[]): Promise<void> | void;
}
