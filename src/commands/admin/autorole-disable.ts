import {
  Client,
  PermissionFlagsBits,
  MessageFlags,
  ChatInputCommandInteraction,
} from "discord.js";
import AutoRole from "../../models/AutoRole";

interface Command {
  callback: (
    client: Client,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
  name: string;
  description: string;
  permissionsRequired: bigint[];
}

// Disabling the auto-role for the server
const command: Command = {
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  callback: async (
    client: Client,
    interaction: ChatInputCommandInteraction
  ): Promise<void> => {
    // Check if user has permission to manage roles
    if (
      !interaction.member?.permissions ||
      typeof interaction.member.permissions === "string" ||
      !interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)
    ) {
      await interaction.reply({
        content: "❌ You don't have permission to configure auto-roles!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await interaction.deferReply();

      if (!(await AutoRole.exists({ guildId: interaction.guild?.id }))) {
        await interaction.editReply(
          "Auto role has not been configured for this server. Use `/autorole-configure` to set it up."
        );
        return;
      }

      await AutoRole.findOneAndDelete({ guildId: interaction.guild?.id });
      await interaction.editReply(
        "auto role has been disabled for this server. Use `/autorole-configure` to set it again."
      );
    } catch (error) {
      console.log(error);
    }
  },

  name: "autorole-disable",
  description: "Disable autorole for this server",
  permissionsRequired: [PermissionFlagsBits.Administrator],
};

export default command;
