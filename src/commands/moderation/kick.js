const {
  client,
  interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {client} client
   * @param {interaction} interaction
   */

  callback: async (client, interaction) => {
    // Check if user has permission to kick members
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({
        content: "❌ You don't have permission to kick members!",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check if bot has permission to kick members
    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.KickMembers
      )
    ) {
      return interaction.reply({
        content: "❌ I don't have permission to kick members!",
        flags: MessageFlags.Ephemeral,
      });
    }

    const targetUserId = interaction.options.get("target-user").value;
    const reason =
      interaction.options.get("reason")?.value || "no reason provided";

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply("that user doesn't exist in the server.");
      return;
    }

    if (targetUser.id === interaction.ownerId) {
      await interaction.editReply("I can't ban the owner of the server.");
      return;
    }

    const taregerUserRolePosition = targetUser.roles.highest.position; //highest role of the target user
    const requistUserRolePosition = interaction.member.roles.highest.position; //highest role of the user running the command
    const botRolePosition = interaction.guild.members.me.roles.highest.position; //highest role of the bot

    if (taregerUserRolePosition >= requistUserRolePosition) {
      await interaction.editReply(
        "you can't kick that user because they have the same/higher role than you"
      );
      return;
    }

    if (taregerUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "I can't kick that user because they have the same/higher role than me"
      );
      return;
    }

    //kick the target user
    try {
      await targetUser.kick({ reason });
      await interaction.editReply(
        `user ${targetUser} was kicked\n reason: ${reason}`
      );
    } catch (error) {
      console.log(`there was an error kicking this uer: ${error}`);
    }
  },

  name: "kick",
  description: "Kicks a member from the server",
  options: [
    {
      name: "target-user",
      description: "the user to kick",
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: "reason",
      description: "the reason for the kick",
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
};
