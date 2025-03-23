const { Client, Message } = require('discord.js');
const Level = require('../../models/Level');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const { set } = require('mongoose');
const cooldowns = new Set();

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 */
module.exports = async (client, message) => {
    if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

    const xpToGive = getRandomXp(5, 15);

    const query = {
        userId: message.author.id,
        guildId: message.guild.id,
    };

    try {
        const userLevel = await Level.findOne(query);

        if(userLevel) {
            userLevel.xp += xpToGive;

            if(userLevel.xp >= calculateLevelXp(userLevel.level)) {
                userLevel.xp = 0;
                userLevel.level += 1;
            
                message.channel.send(`${message.member} you have leveled up to **level ${userLevel.level}**.`);
            }
            
            await userLevel.save().catch((e) => {
                console.log(`error saving updated level ${e}`);
                return;
            });
            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 30000);
        }

        // if (!level)
        else {
            //create new level
            const newLevel = new Level({
                userId: message.author.id,
                guildId: message.guild.id,
                xp: xpToGive,
            });

            await newLevel.save();
            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 30000);
        }
    } catch (error) {
        console.log(`Error giving xp: ${error}`);
    }
};