require("dotenv").config();
const { Client, IntentsBitField, ActivityType } = require("discord.js");
const mongoose = require("mongoose");
const eventHandler = require("./handlers/eventHandler");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildPresences,
  ],
});

// Register the ready event handler before login
client.on("ready", (c) => {
  console.log(`✅ ${client.user.tag} is online`);

  // setting the bot activity
  client.user.setActivity({
    name: "Ezzat at your service",
    // type: ActivityType.Watching,
  });
});

(async () => {
  try {
    // connecting to the mongo database
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB.🍃");

    eventHandler(client);

    // logging in to the bot token
    await client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();
