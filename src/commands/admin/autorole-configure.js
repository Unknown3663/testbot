const {
  ApplicationCommandOptionType,
  Client,
  Interaction,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const AutoRole = require("../../models/AutoRole");

// Configuring the auto-role for the server
module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("You can only run this command inside a server.");
      return;
    }

    // Check if user has permission to manage roles
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: "❌ You don't have permission to configure auto-roles!",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check if bot has permission to manage roles
    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ManageRoles
      )
    ) {
      return interaction.reply({
        content: "❌ I don't have permission to manage roles!",
        flags: MessageFlags.Ephemeral,
      });
    }

    const targetRoleId = interaction.options.get("role").value;

    try {
      await interaction.deferReply();

      let autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });

      if (autoRole) {
        if (autoRole.roleId === targetRoleId) {
          interaction.editReply(
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
      interaction.editReply(
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
