const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    // Remove this permission check since it's handled in handleCommands.js
    // if (
    //   !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)
    // ) {
    //   return interaction.reply({
    //     content: "🚫 You do not have permission to use this command.",
    //     flags: MessageFlags.Ephemeral,
    //   });
    // }

    const durationInput = interaction.options.get("duration").value;
    const seconds = ms(durationInput) / 1000;

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

    const channel = interaction.channel;

    if (channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "❌ This command only works in text channels.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await channel.setRateLimitPerUser(seconds);
      const { default: prettyMs } = await import("pretty-ms");
      await interaction.reply(
        `🕒 Slowmode set to **${prettyMs(ms(durationInput), {
          verbose: true,
        })}**.`
      );
    } catch (err) {
      console.error("Error setting slowmode:", err);
      await interaction.reply({
        content: "❌ Failed to set slowmode. Please check my permissions.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },

  name: "slowmode",
  description: "Set the slowmode for the current text channel.",
  options: [
    {
      name: "duration",
      description: "Cooldown duration (e.g., 5s, 10m, 1h, 0s to disable)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
