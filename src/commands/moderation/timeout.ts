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
    // Check if user has permission to timeout members
    if (
      !interaction.member?.permissions ||
      typeof interaction.member.permissions === "string" ||
      !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)
    ) {
      await interaction.reply({
        content: "❌ You don't have permission to timeout members!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if bot has permission to timeout members
    if (
      !interaction.guild?.members?.me?.permissions?.has(
        PermissionFlagsBits.ModerateMembers
      )
    ) {
      await interaction.reply({
        content: "❌ I don't have permission to timeout members!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const mentionable = interaction.options.get("target-user")?.value as string;
    const duration = interaction.options.get("duration")?.value as string; // 1d, 1 day, 1s 5s, 5m
    const reason =
      (interaction.options.get("reason")?.value as string) ||
      "No reason provided";

    await interaction.deferReply();

    const targetUser = await interaction.guild?.members.fetch(mentionable);
    if (!targetUser) {
      await interaction.editReply("That user doesn't exist in this server.");
      return;
    }

    if (targetUser.user.bot) {
      await interaction.editReply("I can't timeout a bot.");
      return;
    }

    // Simple duration parsing (ms package equivalent)
    const parseDuration = (str: string): number => {
      const units: { [key: string]: number } = {
        s: 1000,
        sec: 1000,
        second: 1000,
        seconds: 1000,
        m: 60000,
        min: 60000,
        minute: 60000,
        minutes: 60000,
        h: 3600000,
        hr: 3600000,
        hour: 3600000,
        hours: 3600000,
        d: 86400000,
        day: 86400000,
        days: 86400000,
      };

      const match = str.match(
        /^(\d+)\s*(s|sec|second|seconds|m|min|minute|minutes|h|hr|hour|hours|d|day|days)$/i
      );
      if (!match || !match[1] || !match[2]) return NaN;

      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      return value * (units[unit] || 0);
    };

    const msDuration = parseDuration(duration);
    if (isNaN(msDuration)) {
      await interaction.editReply("Please provide a valid timeout duration.");
      return;
    }

    if (msDuration < 5000 || msDuration > 2.419e9) {
      await interaction.editReply(
        "Timeout duration cannot be less than 5 seconds or more than 28 days."
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = (interaction.member as GuildMember).roles
      .highest.position; // Highest role of the user running the cmd
    const botRolePosition =
      interaction.guild?.members?.me?.roles.highest.position || 0; // Highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "You can't timeout that user because they have the same/higher role than you."
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "I can't timeout that user because they have the same/higher role than me."
      );
      return;
    }

    // Timeout the user
    try {
      const formatDuration = (ms: number): string => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
        if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
        return `${seconds} second${seconds > 1 ? "s" : ""}`;
      };

      if (targetUser.isCommunicationDisabled()) {
        await targetUser.timeout(msDuration, reason);
        await interaction.editReply(
          `${targetUser}'s timeout has been updated to ${formatDuration(
            msDuration
          )}\nReason: ${reason}`
        );
        return;
      }

      await targetUser.timeout(msDuration, reason);
      await interaction.editReply(
        `${targetUser} was timed out for ${formatDuration(
          msDuration
        )}.\nReason: ${reason}`
      );
    } catch (error) {
      console.log(`There was an error when timing out: ${error}`);
    }
  },

  name: "timeout",
  description: "Timeout a user.",
  options: [
    {
      name: "target-user",
      description: "The user you want to timeout.",
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: "duration",
      description: "Timeout duration (30m, 1h, 1 day).",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the timeout.",
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};

export default command;
