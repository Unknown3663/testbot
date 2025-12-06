import {
  ChatInputCommandInteraction,
  MessageFlags,
  ApplicationCommandOptionType,
} from "discord.js";
import User from "../../models/User";
import { BotClient } from "../../types";

export default {
  name: "dice",
  description:
    "Roll dice and bet credits! Guess if the total will be high (8-12) or low (2-6)",
  options: [
    {
      name: "bet",
      description: "Amount of credits to bet",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      minValue: 10,
      maxValue: 200,
    },
    {
      name: "prediction",
      description: "Will the dice roll be high or low?",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "⬆️ High (8-12)", value: "high" },
        { name: "⬇️ Low (2-6)", value: "low" },
        { name: "➡️ Middle (7)", value: "middle" },
      ],
    },
  ],
  callback: async (
    client: BotClient,
    interaction: ChatInputCommandInteraction
  ): Promise<void> => {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "You can only run this command inside a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const betAmount = interaction.options.getInteger("bet") as number;
      const prediction = interaction.options.getString("prediction") as string;

      const userId = interaction.member?.user.id;
      const guildId = interaction.guild?.id;

      if (!userId || !guildId) return;

      const query = { userId, guildId };

      let user = await User.findOne(query);

      if (!user) {
        user = new User({ ...query, balance: 0 });
        await user.save();
      }

      if (user.balance < betAmount) {
        await interaction.editReply(
          `❌ You don't have enough credits! Your balance: ${user.balance}`
        );
        return;
      }

      // Deduct bet amount first
      user.balance -= betAmount;

      // Roll two dice
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;

      const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

      let actualResult: string;
      if (total >= 8 && total <= 12) {
        actualResult = "high";
      } else if (total >= 2 && total <= 6) {
        actualResult = "low";
      } else {
        actualResult = "middle";
      }

      let winnings = 0;

      if (prediction === actualResult) {
        // Won: return bet + profit
        const multiplier = prediction === "middle" ? 5 : 1;
        winnings = betAmount + betAmount * multiplier; // Return bet + winnings
      }
      // If lost, winnings stays 0 (bet already deducted)

      user.balance += winnings;
      await user.save();

      const profit = winnings - betAmount;
      const resultMessage =
        winnings > 0
          ? `🎉 You won! The total was ${total} (${actualResult})`
          : `😢 You lost! The total was ${total} (${actualResult})`;

      await interaction.editReply(
        `🎲 **Dice Roll**\n\n${diceEmojis[dice1 - 1]} + ${
          diceEmojis[dice2 - 1]
        } = **${total}**\n\n${resultMessage}\n${
          profit >= 0 ? `+${profit}` : profit
        } credits\n💰 New balance: ${user.balance}`
      );
    } catch (error) {
      console.log(`Error with /dice: ${error}`);
      await interaction.editReply(
        "An error occurred while processing your game."
      );
    }
  },
};
