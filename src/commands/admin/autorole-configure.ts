import {
  ApplicationCommandOptionType,
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
  options: Array<{
    name: string;
    description: string;
    type: ApplicationCommandOptionType;
    required: boolean;
  }>;
  permissionsRequired: bigint[];
  botPermissions: bigint[];
}

// Configuring the auto-role for the server
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
    if (!interaction.inGuild()) {
      await interaction.reply("You can only run this command inside a server.");
      return;
    }

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

    // Check if bot has permission to manage roles
    if (
      !interaction.guild?.members?.me?.permissions?.has(
        PermissionFlagsBits.ManageRoles
      )
    ) {
      await interaction.reply({
        content: "❌ I don't have permission to manage roles!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetRoleId = interaction.options.get("role")?.value as string;

    try {
      await interaction.deferReply();

      let autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });

      if (autoRole) {
        if (autoRole.roleId === targetRoleId) {
          await interaction.editReply(
            "Auto role has already been configured for that role. To disable run `/autorole-disable`"
          );
          return;
        }

        autoRole.roleId = targetRoleId;
      } else {
        autoRole = new AutoRole({
          guildId: interaction.guild.id,
          roleId: targetRoleId,
        });
      }

      await autoRole.save();
      await interaction.editReply(
        "Autorole has now been configured. To disable run `/autorole-disable`"
      );
    } catch (error) {
      console.log(error);
    }
  },

  name: "autorole-configure",
  description: "Configure your auto-role for this server.",
  options: [
    {
      name: "role",
      description: "The role you want users to get on join.",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageRoles],
};

export default command;
