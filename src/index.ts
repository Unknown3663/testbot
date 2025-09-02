import "dotenv/config";
import { Client, IntentsBitField, ActivityType } from "discord.js";
import mongoose from "mongoose";
import eventHandler from "./handlers/eventHandler";
import { BotClient } from "./types";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildPresences,
  ],
}) as BotClient;

// Register the ready event handler before login
client.on("clientReady", (c) => {
  console.log(`✅ ${client.user?.tag} is online`);

  // setting the bot activity
  client.user?.setActivity({
    name: "Ezzat at your service",
    // type: ActivityType.Watching,
  });
});

(async (): Promise<void> => {
  try {
    // connecting to the mongo database
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to DB.🍃");

    eventHandler(client);

    // logging in to the bot token
    await client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();
