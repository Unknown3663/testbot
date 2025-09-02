import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import User from "../../models/User";
import { BotClient } from "../../types";

const dailyAmount = 1000;

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

      const query = {
        userId: interaction.member?.user.id || "",
        guildId: interaction.guild?.id || "",
      };

      let user = await User.findOne(query);

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
      } else {
        user = new User({
          ...query,
          LastDaily: new Date(), // setting the new date after the user ran the command
        });
      }

      // Update the LastDaily field to the current date
      user.LastDaily = new Date();
      user.balance += dailyAmount;
      await user.save();

      await interaction.editReply(
        `${dailyAmount} was added to your balance. Your new balance is ${user.balance}`
      );
    } catch (error) {
      console.log(`Error with /daily: ${error}`);
    }
  },
};
