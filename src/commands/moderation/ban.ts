import {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  MessageFlags,
  GuildMember,
} from "discord.js";
import { BotClient } from "../../types";

export default {
  callback: async (
    client: BotClient,
    interaction: ChatInputCommandInteraction
  ): Promise<void> => {
    const member = interaction.member as GuildMember;

    // Check if user has permission to ban members
    if (!member?.permissions.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({
        content: "❌ You don't have permission to ban members!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if bot has permission to ban members
    if (
      !interaction.guild?.members.me?.permissions.has(
        PermissionFlagsBits.BanMembers
      )
    ) {
      await interaction.reply({
        content: "❌ I don't have permission to ban members!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetInput = interaction.options.get("target-user")?.value as string;
    const reason =
      (interaction.options.get("reason")?.value as string) ||
      "no reason provided";

    await interaction.deferReply();

    // Extract user ID from mention or use direct ID
    let targetUserId: string;
    if (targetInput.startsWith("<@") && targetInput.endsWith(">")) {
      // It's a mention, extract the ID
      targetUserId = targetInput.slice(2, -1);
      if (targetUserId.startsWith("!")) {
        targetUserId = targetUserId.slice(1);
      }
    } else {
      // Assume it's already a user ID
      targetUserId = targetInput;
    }

    // Validate that it's a valid user ID (should be numeric and 17-19 digits)
    if (!/^\d{17,19}$/.test(targetUserId)) {
      await interaction.editReply(
        "❌ Please provide a valid user mention or user ID."
      );
      return;
    }

    try {
      // Try to fetch the user from Discord's API (works even if they're not in the server)
      const targetUser = await client.users.fetch(targetUserId);

      if (!targetUser) {
        await interaction.editReply("❌ That user doesn't exist on Discord.");
        return;
      }

      // Check if the user is the server owner
      if (targetUser.id === interaction.guild?.ownerId) {
        await interaction.editReply("❌ I can't ban the owner of the server.");
        return;
      }

      // Check if the user is trying to ban themselves
      if (targetUser.id === interaction.user.id) {
        await interaction.editReply("❌ You can't ban yourself!");
        return;
      }

      // Check if the user is trying to ban the bot
      if (targetUser.id === client.user?.id) {
        await interaction.editReply("❌ I can't ban myself!");
        return;
      }

      // Try to get member if they're in the server (for role position checks)
      let targetMember: GuildMember | null = null;
      try {
        targetMember =
          (await interaction.guild?.members.fetch(targetUserId)) || null;
      } catch (error) {
        // User is not in the server, which is fine for banning
      }

      // If user is in the server, check role hierarchy
      if (targetMember) {
        const targetUserRolePosition = targetMember.roles.highest.position;
        const requestUserRolePosition = member?.roles.highest.position || 0;
        const botRolePosition =
          interaction.guild?.members.me?.roles.highest.position || 0;

        if (targetUserRolePosition >= requestUserRolePosition) {
          await interaction.editReply(
            "❌ You can't ban that user because they have the same/higher role than you."
          );
          return;
        }

        if (targetUserRolePosition >= botRolePosition) {
          await interaction.editReply(
            "❌ I can't ban that user because they have the same/higher role than me."
          );
          return;
        }
      }

      // Ban the user (works whether they're in the server or not)
      await interaction.guild?.members.ban(targetUserId, { reason });

      const userTag = targetMember ? targetMember.user.tag : targetUser.tag;
      const memberStatus = targetMember ? "(was in server)" : "(not in server)";

      await interaction.editReply(
        `✅ User ${userTag} ${memberStatus} was banned.\nReason: ${reason}`
      );
    } catch (error: any) {
      console.log(`Error banning user: ${error}`);
      if (error.code === 10013) {
        await interaction.editReply("❌ That user doesn't exist on Discord.");
      } else if (error.code === 10026) {
        await interaction.editReply(
          "❌ That user is already banned from this server."
        );
      } else {
        await interaction.editReply(
          "❌ An error occurred while trying to ban that user."
        );
      }
    }
  },

  name: "ban",
  description: "bans a user from the server (works with user ID or mention)",
  options: [
    {
      name: "target-user",
      description: "the user to ban (mention or user ID)",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "reason",
      description: "the reason for the ban",
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};
