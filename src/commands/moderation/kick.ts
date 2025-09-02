import {
  Client,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  MessageFlags,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";

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
    required?: boolean;
    type: ApplicationCommandOptionType;
  }>;
  permissionsRequired: bigint[];
  botPermissions: bigint[];
}

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
    // Check if user has permission to kick members
    if (
      !interaction.member?.permissions ||
      typeof interaction.member.permissions === "string" ||
      !interaction.member.permissions.has(PermissionFlagsBits.KickMembers)
    ) {
      await interaction.reply({
        content: "❌ You don't have permission to kick members!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if bot has permission to kick members
    if (
      !interaction.guild?.members?.me?.permissions?.has(
        PermissionFlagsBits.KickMembers
      )
    ) {
      await interaction.reply({
        content: "❌ I don't have permission to kick members!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetUserId = interaction.options.get("target-user")
      ?.value as string;
    const reason =
      (interaction.options.get("reason")?.value as string) ||
      "no reason provided";

    await interaction.deferReply();

    const targetUser = await interaction.guild?.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply("that user doesn't exist in the server.");
      return;
    }

    if (targetUser.id === interaction.guild?.ownerId) {
      await interaction.editReply("I can't kick the owner of the server.");
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; //highest role of the target user
    const requestUserRolePosition = (interaction.member as GuildMember).roles
      .highest.position; //highest role of the user running the command
    const botRolePosition =
      interaction.guild?.members?.me?.roles.highest.position || 0; //highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "you can't kick that user because they have the same/higher role than you"
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "I can't kick that user because they have the same/higher role than me"
      );
      return;
    }

    //kick the target user
    try {
      await targetUser.kick(reason);
      await interaction.editReply(
        `user ${targetUser} was kicked\n reason: ${reason}`
      );
    } catch (error) {
      console.log(`there was an error kicking this user: ${error}`);
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

export default command;
