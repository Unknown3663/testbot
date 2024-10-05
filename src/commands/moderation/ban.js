const { client, interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  /**
   * 
   * @param {client} client 
   * @param {interaction} interaction 
   */
  
  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get('target-user').value;
    const reason = interaction.options.get('reason')?.value || "no reason provided";

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
      await interaction.editReply("you can't ban that user because they have the same/higher role than you");
      return;
    }

    if (taregerUserRolePosition >= botRolePosition) {
      await interaction.editReply("I can't ban that user because they have the same/higher role than me");
      return;
    }

    //ban the target user
    try {
      await targetUser.ban({ reason });
      await interaction.editReply(
        `user ${targetUser} was banned\n reason: ${reason}`
      );
    } catch (error) {
      console.log(`there was an error banning this uer: ${error}`)
    }
  },

  name: 'ban',
  description: 'bans a member from the server',
  options: [
    {
      name: 'target-user',
      description: 'the user to ban',
      required: true,
      type: ApplicationCommandOptionType.Mentionable,
    },
    {
      name: 'reason',
      description: 'the reason for the ban',
      type: ApplicationCommandOptionType.String,
    },
],
permissionsRequired: [PermissionFlagsBits.BanMembers],
botPermissions: [PermissionFlagsBits.BanMembers],
}