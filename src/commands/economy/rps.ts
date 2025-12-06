import {
  ChatInputCommandInteraction,
  MessageFlags,
  ApplicationCommandOptionType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import User from "../../models/User";
import { BotClient } from "../../types";

const choices = ["rock", "paper", "scissors"];
const emojis = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

export default {
  name: "rps",
  description: "Play Rock Paper Scissors and bet credits!",
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

      const embed = new EmbedBuilder()
        .setColor("#FF6B6B")
        .setTitle("🎮 Rock Paper Scissors")
        .setDescription(
          `**Bet Amount:** ${betAmount} credits\n**Your Balance:** ${user.balance} credits\n\nMake your choice!`
        )
        .setFooter({ text: "You have 30 seconds to choose" })
        .setTimestamp();

      const rockButton = new ButtonBuilder()
        .setCustomId("rock")
        .setLabel("Rock")
        .setEmoji("🪨")
        .setStyle(ButtonStyle.Primary);

      const paperButton = new ButtonBuilder()
        .setCustomId("paper")
        .setLabel("Paper")
        .setEmoji("📄")
        .setStyle(ButtonStyle.Primary);

      const scissorsButton = new ButtonBuilder()
        .setCustomId("scissors")
        .setLabel("Scissors")
        .setEmoji("✂️")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        rockButton,
        paperButton,
        scissorsButton
      );

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });

      const collector = interaction.channel?.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        componentType: ComponentType.Button,
        time: 30000,
        max: 1,
      });

      collector?.on("collect", async (buttonInteraction) => {
        await buttonInteraction.deferUpdate();

        const userChoice = buttonInteraction.customId;
        const botChoice = choices[
          Math.floor(Math.random() * choices.length)
        ] as "rock" | "paper" | "scissors";

        // Refetch user to get latest balance
        const latestUser = await User.findOne(query);
        if (!latestUser) return;

        // Deduct bet amount first
        latestUser.balance -= betAmount;

        let result: string;
        let resultColor: number;
        let winnings = 0;

        if (userChoice === botChoice) {
          result = "🤝 It's a tie!";
          resultColor = 0xffeb3b;
          winnings = betAmount; // Return bet
        } else if (
          (userChoice === "rock" && botChoice === "scissors") ||
          (userChoice === "paper" && botChoice === "rock") ||
          (userChoice === "scissors" && botChoice === "paper")
        ) {
          result = "🎉 You won!";
          resultColor = 0x4caf50;
          winnings = betAmount * 2; // Return bet + winnings
        } else {
          result = "😢 You lost!";
          resultColor = 0xf44336;
          winnings = 0; // Lost bet
        }

        latestUser.balance += winnings;
        await latestUser.save();

        const resultEmbed = new EmbedBuilder()
          .setColor(resultColor)
          .setTitle("🎮 Rock Paper Scissors - Result")
          .addFields(
            {
              name: "Your Choice",
              value: `${emojis[userChoice as keyof typeof emojis]} ${
                userChoice.charAt(0).toUpperCase() + userChoice.slice(1)
              }`,
              inline: true,
            },
            {
              name: "Bot's Choice",
              value: `${emojis[botChoice as keyof typeof emojis]} ${
                botChoice.charAt(0).toUpperCase() + botChoice.slice(1)
              }`,
              inline: true,
            },
            { name: "Result", value: result, inline: false },
            {
              name: "Credits Change",
              value:
                winnings === betAmount
                  ? "±0"
                  : winnings > betAmount
                  ? `+${winnings - betAmount}`
                  : `-${betAmount}`,
              inline: true,
            },
            {
              name: "New Balance",
              value: `${latestUser.balance}`,
              inline: true,
            }
          )
          .setTimestamp();

        await buttonInteraction.editReply({
          embeds: [resultEmbed],
          components: [],
        });
      });

      collector?.on("end", async (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setColor("#95A5A6")
            .setTitle("⏱️ Time's Up!")
            .setDescription(
              "You didn't make a choice in time. Your bet has been returned."
            )
            .setTimestamp();

          await interaction.editReply({
            embeds: [timeoutEmbed],
            components: [],
          });
        }
      });
    } catch (error) {
      console.log(`Error with /rps: ${error}`);
      await interaction
        .reply({
          content: "An error occurred while processing your game.",
          flags: MessageFlags.Ephemeral,
        })
        .catch(() => {});
    }
  },
};
