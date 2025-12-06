import {
  ChatInputCommandInteraction,
  MessageFlags,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import User from "../../models/User";
import { BotClient } from "../../types";

export default {
  name: "guess",
  description: "Guess a number between 1 and 100! You have 5 attempts.",
  options: [
    {
      name: "bet",
      description: "Amount of credits to bet",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      minValue: 10,
      maxValue: 200,
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
      const betAmount = interaction.options.getInteger("bet") as number;

      const query = {
        userId: interaction.member?.user.id || "",
        guildId: interaction.guild?.id || "",
      };

      let user = await User.findOne(query);

      if (!user) {
        user = new User({ ...query, balance: 0 });
        await user.save();
      }

      if (user.balance < betAmount) {
        await interaction.reply({
          content: `❌ You don't have enough credits! Your balance: ${user.balance}`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      // Deduct bet amount first
      user.balance -= betAmount;
      await user.save();

      const correctNumber = Math.floor(Math.random() * 100) + 1;
      const maxAttempts = 5;
      let attemptsLeft = maxAttempts;

      await interaction.reply(
        `🎲 I'm thinking of a number between 1 and 100!\n**${maxAttempts} attempts left**`
      );

      const filter = (m: Message) => m.author.id === interaction.user.id;
      const collector = interaction.channel?.createMessageCollector({
        filter,
        time: 120000, // 2 minutes
      });

      collector?.on("collect", async (message) => {
        const guess = parseInt(message.content);

        // Ignore non-numeric messages
        if (isNaN(guess) || guess < 1 || guess > 100) {
          return;
        }

        attemptsLeft--;

        if (guess === correctNumber) {
          // Won!
          const winnings = betAmount * 3; // 3x bet on win
          const latestUser = await User.findOne(query);
          if (latestUser) {
            latestUser.balance += winnings;
            await latestUser.save();
          }

          await message.reply(
            `🎯 **Correct!** The number was **${correctNumber}**! You won **${
              winnings - betAmount
            }** credits! 💰`
          );
          collector.stop();
          return;
        }

        // Wrong guess
        if (attemptsLeft === 0) {
          // Lost all attempts
          await message.reply(
            `😢 You did not find the number and lost **${betAmount}** ♡! The number was **${correctNumber}** 😭`
          );
          collector.stop();
          return;
        }

        // Give hint
        const hint = guess < correctNumber ? "higher" : "lower";
        const hintEmoji = guess < correctNumber ? "⬆️" : "⬇️";

        await message.reply(
          `${hintEmoji} ${
            interaction.user
          }, the number you are looking for is **${hint} than ${guess}**\n**${attemptsLeft} attempt${
            attemptsLeft !== 1 ? "s" : ""
          } left**`
        );
      });

      collector?.on("end", async (collected, reason) => {
        if (reason === "time" && attemptsLeft > 0) {
          await interaction.followUp(
            `⏱️ Time's up! The number was **${correctNumber}**. Your bet of **${betAmount}** credits has been lost.`
          );
        }
      });
    } catch (error) {
      console.log(`Error with /guess: ${error}`);
      await interaction
        .reply({
          content: "An error occurred while processing your game.",
          flags: MessageFlags.Ephemeral,
        })
        .catch(() => {});
    }
  },
};
