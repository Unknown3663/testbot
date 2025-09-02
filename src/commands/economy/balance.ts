import {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  MessageFlags,
} from "discord.js";
import User from "../../models/User";
import { BotClient } from "../../types";

export default {
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

    const targetUserId =
      interaction.options.get("user")?.value || interaction.member?.user.id;

    await interaction.deferReply();

    const user = await User.findOne({
      userId: targetUserId,
      guildId: interaction.guild?.id,
    });

    if (!user) {
      // if the user never used the command before he doesn't have a profile
      await interaction.editReply(
        `<@${targetUserId}> doesn't have a profile yet.`
      );
      return;
    }

    await interaction.editReply(
      // if the user has a profile then show his balance
      targetUserId === interaction.member?.user.id
        ? `Your balance is **${user.balance}**`
        : `<@${targetUserId}>'s balance is **${user.balance}**`
    );
  },

  name: "balance",
  description: "See yours/someone else's balance",
  options: [
    {
      name: "user",
      description: "The user whose balance you want to get.",
      type: ApplicationCommandOptionType.User,
    },
  ],
};
