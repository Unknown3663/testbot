import {
  Client,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
  ChatInputCommandInteraction,
  TextChannel,
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
    required: boolean;
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
    // Check if user has permission to manage channels
    if (
      !interaction.member?.permissions ||
      typeof interaction.member.permissions === "string" ||
      !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
    ) {
      await interaction.reply({
        content:
          "❌ You do not have permission to manage slowmode in channels.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if bot has permission to manage channels
    if (
      !interaction.guild?.members?.me?.permissions?.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      await interaction.reply({
        content: "❌ I do not have permission to manage channels.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const durationInput = interaction.options.get("duration")?.value as string;

    // Simple duration parsing
    const parseDuration = (str: string): number => {
      const units: { [key: string]: number } = {
        s: 1,
        sec: 1,
        second: 1,
        seconds: 1,
        m: 60,
        min: 60,
        minute: 60,
        minutes: 60,
        h: 3600,
        hr: 3600,
        hour: 3600,
        hours: 3600,
      };

      const match = str.match(
        /^(\d+)\s*(s|sec|second|seconds|m|min|minute|minutes|h|hr|hour|hours)$/i
      );
      if (!match || !match[1] || !match[2]) return NaN;

      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      return value * (units[unit] || 0);
    };

    const seconds = parseDuration(durationInput);

    if (isNaN(seconds)) {
      await interaction.reply({
        content:
          "❌ Please provide a valid duration like `5s`, `1m`, `10m`, `1h`.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (seconds < 0 || seconds > 21600) {
      await interaction.reply({
        content: "⚠️ Duration must be between `0s` and `6h` (21600 seconds).",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const channel = interaction.channel as TextChannel;

      if (channel.type !== ChannelType.GuildText) {
        await interaction.editReply({
          content: "❌ Slowmode can only be set in text channels.",
        });
        return;
      }

      await channel.setRateLimitPerUser(seconds);

      if (seconds === 0) {
        await interaction.editReply(
          "✅ Slowmode has been **disabled** for this channel."
        );
      } else {
        const formatDuration = (sec: number): string => {
          const hours = Math.floor(sec / 3600);
          const minutes = Math.floor((sec % 3600) / 60);
          const remainingSeconds = sec % 60;

          const parts = [];
          if (hours > 0) parts.push(`${hours}h`);
          if (minutes > 0) parts.push(`${minutes}m`);
          if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

          return parts.join(" ");
        };

        await interaction.editReply(
          `✅ Slowmode has been set to **${formatDuration(
            seconds
          )}** for this channel.`
        );
      }
    } catch (error) {
      console.error("Error setting slowmode:", error);
      await interaction.editReply({
        content: "❌ An error occurred while setting slowmode.",
      });
    }
  },

  name: "slowmode",
  description: "Set slowmode for a channel.",
  options: [
    {
      name: "duration",
      description:
        "Slowmode duration (0s to disable, max 6h). Example: 5s, 1m, 1h",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};

export default command;
