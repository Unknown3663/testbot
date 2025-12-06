import { Message } from "discord.js";
import Level from "../../models/Level";
import calculateLevelXp from "../../utils/calculateLevelXp";
import { BotClient } from "../../types";

const cooldowns = new Set<string>();

function getRandomXp(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async function giveUserXp(
  client: BotClient,
  message: Message
): Promise<void> {
  if (
    !message.inGuild() ||
    message.author.bot ||
    cooldowns.has(message.author.id)
  )
    return;

  const xpToGive = getRandomXp(5, 15);

  const query = {
    userId: message.author.id,
    guildId: message.guild?.id || "",
  };

  try {
    const userLevel = await Level.findOne(query);

    if (userLevel) {
      userLevel.xp += xpToGive;

      if (userLevel.xp >= calculateLevelXp(userLevel.level)) {
        const previousLevel = userLevel.level; // Store the previous level
        userLevel.xp = 0;
        userLevel.level += 1;

        // Enhanced level-up message with emojis and congratulations
        await message.channel.send(
          `🎉 **Congratulations** ${message.member}! 🎉\n✨ You've leveled up from **Level ${previousLevel}** to **Level ${userLevel.level}**! ✨\n🚀 Keep up the great work! 🌟`
        );
      }

      await userLevel.save().catch((e) => {
        console.log(`error saving updated level ${e}`);
        return;
      });
    } else {
      // Create new level with proper structure
      const newLevel = new Level({
        ...query,
        xp: xpToGive,
        level: 0,
      });

      await newLevel.save();
    }

    cooldowns.add(message.author.id);
    setTimeout(() => {
      cooldowns.delete(message.author.id);
    }, 30000);
  } catch (error) {
    console.log(`Error giving xp: ${error}`);
  }
}
