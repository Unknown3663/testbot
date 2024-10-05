require('dotenv').config();
const { Client, IntentsBitField, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildPresences,
  ],
});



(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.🍃');

    eventHandler(client);

    client.login(process.env.TOKEN);

    client.on('ready', (c) => {
      console.log(`✅ ${client.user.tag} is online`);
  
      client.user.setActivity({
          name: 'Ezzat at your service',
        });
  })
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();