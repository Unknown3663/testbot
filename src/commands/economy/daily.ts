import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import User from "../../models/User";
import { BotClient } from "../../types";

// Function to generate random amount between 1001 and 1999 (excluding 1000 and 2000)
const getRandomDailyAmount = (): number => {
  return Math.floor(Math.random() * 999) + 1001; // Random number from 1001 to 1999
};

export default {
  name: "daily",
  description: "Collect your dailies!", // a command to collect daily coins
  callback: async (
    client: BotClient,
    interaction: ChatInputCommandInteraction
  ): Promise<void> => {
    if (!interaction.inGuild()) {
      // checking if the user running the command inside a guild or not
      await interaction.reply({
        content: "You can only run this command inside a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const userId = interaction.member?.user.id;
      const guildId = interaction.guild?.id;

      if (!userId || !guildId) return;

      const query = { userId, guildId };

      let user = await User.findOne(query);
      const dailyAmount = getRandomDailyAmount();

      if (user) {
        const lastDailyDate = user.LastDaily
          ? user.LastDaily.toDateString()
          : null;
        const currentDate = new Date().toDateString();

        if (lastDailyDate === currentDate) {
          // checking the last time the user ran the command
          await interaction.editReply(
            "You have already collected your dailies today. Come back tomorrow!"
          );
          return;
        }

        // Update existing user
        user.LastDaily = new Date();
        user.balance += dailyAmount;
        await user.save();
      } else {
        // Create new user with daily amount
        user = new User({
          ...query,
          balance: dailyAmount,
          LastDaily: new Date(),
        });
        await user.save();
      }

      await interaction.editReply(
        `🎁 ${dailyAmount} credits were added to your balance! Your new balance is ${user.balance}`
      );
    } catch (error) {
      console.log(`Error with /daily: ${error}`);
    }
  },
};
