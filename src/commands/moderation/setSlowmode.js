const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const durationInput = interaction.options.get("duration").value;

    const seconds = ms(durationInput) / 1000;

    if (isNaN(seconds)) {
      await interaction.reply({
        content:
          "❌ Please provide a valid duration like `5s`, `1m`, `10m`, `1h`.",
        ephemeral: true,
      });
      return;
    }

    if (seconds < 0 || seconds > 21600) {
      await interaction.reply({
        content: "⚠️ Duration must be between `0s` and `6h` (21600 seconds).",
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.channel;

    if (channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "❌ This command only works in text channels.",
        ephemeral: true,
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
        ephemeral: true,
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
