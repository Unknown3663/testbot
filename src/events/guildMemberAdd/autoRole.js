const { Client, GuildMember, PermissionFlagsBits } = require("discord.js");
const AutoRole = require("../../models/AutoRole");

/**
 *
 * @param {Client} client
 * @param {GuildMember} member
 */
module.exports = async (client, member) => {
  try {
    let guild = member.guild;
    if (!guild) return;

    const autoRole = await AutoRole.findOne({ guildId: guild.id });
    if (!autoRole) return;

    // Check if bot has permission to manage roles
    if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      console.log(
        `Missing permissions to assign auto-role in guild: ${guild.name}`
      );
      return;
    }

    // Check if the role exists
    const role = guild.roles.cache.get(autoRole.roleId);
    if (!role) {
      console.log(
        `Auto-role not found in guild: ${guild.name}. Role ID: ${autoRole.roleId}`
      );
      return;
    }

    // Check if bot's role is higher than the auto-role
    if (guild.members.me.roles.highest.position <= role.position) {
      console.log(
        `Cannot assign auto-role (${role.name}) - bot's role is not high enough in guild: ${guild.name}`
      );
      return;
    }

    await member.roles.add(autoRole.roleId);
    console.log(
      `Successfully assigned auto-role (${role.name}) to ${member.user.tag} in guild: ${guild.name}`
    );
  } catch (error) {
    console.log(`Error giving role automatically: ${error}`);
  }
};
