import {
  ChatInputCommandInteraction,
  MessageFlags,
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import User from "../../models/User";
import { BotClient } from "../../types";

export default {
  name: "roulette",
  description:
    "Play Russian Roulette! Pull the trigger and risk it all for bigger rewards!",
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

      // Russian Roulette setup: 6 chambers, 0-1 bullets
      const hasBullet = Math.random() > 0.15; // 85% chance of having a bullet
      const bulletChamber = hasBullet ? Math.floor(Math.random() * 6) : -1; // -1 means no bullet

      let currentChamber = 0;
      let currentWinnings = betAmount;
      let gameOver = false;

      const updateButtons = (disabled: boolean) => {
        const pullButton = new ButtonBuilder()
          .setCustomId("pull")
          .setLabel("🔫 Pull Trigger")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(disabled);

        const cashoutButton = new ButtonBuilder()
          .setCustomId("cashout")
          .setLabel("💰 Cash Out")
          .setStyle(ButtonStyle.Success)
          .setDisabled(disabled || currentChamber === 0);

        return new ActionRowBuilder<ButtonBuilder>().addComponents(
          pullButton,
          cashoutButton
        );
      };

      const getMessage = () => {
        const chambers = Array(6).fill("⚪");
        for (let i = 0; i < currentChamber; i++) {
          chambers[i] = "✅";
        }

        return `🔫 **Russian Roulette**\n\nChambers: ${chambers.join(
          " "
        )}\nRounds survived: **${currentChamber}/6**\nCurrent winnings: **${currentWinnings}** credits\nOriginal bet: **${betAmount}** credits\n\n${
          currentChamber === 0
            ? "Pull the trigger to start!"
            : "Pull again for more... or cash out now?"
        }`;
      };

      await interaction.reply({
        content: getMessage(),
        components: [updateButtons(false)],
      });

      const collector = interaction.channel?.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector?.on("collect", async (buttonInteraction) => {
        if (gameOver) return;

        await buttonInteraction.deferUpdate();

        if (buttonInteraction.customId === "pull") {
          currentChamber++;

          // Show dramatic "pulling trigger" message
          await buttonInteraction.editReply({
            content: `🔫 **Pulling the trigger...**\n\n*Click...*`,
            components: [updateButtons(true)],
          });

          // Dramatic delay (2 seconds)
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Check if player hit the bullet
          if (currentChamber === bulletChamber + 1) {
            gameOver = true;
            // Refetch user to get latest balance
            const latestUser = await User.findOne(query);
            if (latestUser) {
              latestUser.balance -= betAmount;
              await latestUser.save();

              await buttonInteraction.editReply({
                content: `💥 **BANG!** 💀\n\nYou hit the bullet on chamber ${currentChamber}!\n\n**Lost:** ${betAmount} credits\n💰 New balance: ${latestUser.balance}`,
                components: [updateButtons(true)],
              });
            }
            collector.stop();
            return;
          }

          // Survived this round
          const winIncrease = Math.floor(betAmount * 0.3); // 30% increase per round
          currentWinnings += winIncrease;

          // Check if all 6 chambers survived
          if (currentChamber === 6) {
            gameOver = true;
            // Refetch user to get latest balance
            const latestUser = await User.findOne(query);
            if (latestUser) {
              if (bulletChamber === -1) {
                // No bullet was loaded - massive bonus!
                currentWinnings = Math.floor(currentWinnings * 1.5);
                const profit = currentWinnings - betAmount;
                latestUser.balance += profit;
                await latestUser.save();

                await buttonInteraction.editReply({
                  content: `🎉 **JACKPOT!** 🍀\n\nThere was NO BULLET! You survived all 6 chambers!\n\n**Won:** +${profit} credits (Bonus: No bullet!)\n💰 New balance: ${latestUser.balance}`,
                  components: [updateButtons(true)],
                });
              } else {
                const profit = currentWinnings - betAmount;
                latestUser.balance += profit;
                await latestUser.save();

                await buttonInteraction.editReply({
                  content: `🎉 **INCREDIBLE!** You survived all 6 chambers!\n\n**Won:** +${profit} credits\n💰 New balance: ${latestUser.balance}`,
                  components: [updateButtons(true)],
                });
              }
            }
            collector.stop();
            return;
          }

          await buttonInteraction.editReply({
            content: getMessage(),
            components: [updateButtons(false)],
          });
        } else if (buttonInteraction.customId === "cashout") {
          gameOver = true;
          // Refetch user to get latest balance
          const latestUser = await User.findOne(query);
          if (latestUser) {
            // Current winnings already includes bet, just subtract bet to get profit
            const profit = currentWinnings - betAmount;
            latestUser.balance += profit;
            await latestUser.save();

            await buttonInteraction.editReply({
              content: `💰 **Cashed Out!**\n\nYou survived ${currentChamber} round${
                currentChamber > 1 ? "s" : ""
              }!\n\n**Profit:** +${profit} credits\n💰 New balance: ${
                latestUser.balance
              }`,
              components: [updateButtons(true)],
            });
          }
          collector.stop();
        }
      });

      collector?.on("end", async () => {
        if (!gameOver) {
          await interaction.editReply({
            content: "⏱️ Game timed out! Your bet has been returned.",
            components: [updateButtons(true)],
          });
        }
      });
    } catch (error) {
      console.log(`Error with /roulette: ${error}`);
      await interaction
        .reply({
          content: "An error occurred while processing your game.",
          flags: MessageFlags.Ephemeral,
        })
        .catch(() => {});
    }
  },
};
