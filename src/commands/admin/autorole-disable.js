const {
  Client,
  InteractionCollector,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const AutoRole = require("../../models/AutoRole");
const { permissionRequied } = require("./autorole-configure");

// Disabling the auto-role for the server
module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    // Check if user has permission to manage roles
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: "❌ You don't have permission to configure auto-roles!",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await interaction.deferReply();

      if (!(await AutoRole.exists({ guildId: interaction.guild.id }))) {
        interaction.editReply(
          "Auto role has not been configured for this server. Use `/autorole-configure` to set it up."
        );
        return;
      }

      await AutoRole.findOneAndDelete({ guildId: interaction.guild.id });
      interaction.editReply(
        "auto role has been disabled for this server. Use `/autorole-configure` to set it again."
      );
    } catch (error) {
      console.log(error);
    }
  },

  name: "autorole-disable",
  description: "Disable autorole for this server",
  permissionRequied: [PermissionFlagsBits.Administrator],
};
