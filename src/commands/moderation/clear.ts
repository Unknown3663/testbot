import {
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  Client,
  MessageFlags,
  ChatInputCommandInteraction,
  TextChannel,
  PermissionFlagsBits,
} from "discord.js";

interface Command {
  name: string;
  description: string;
  permissionsRequired: bigint[];
  botPermissions: bigint[];
  options: Array<{
    name: string;
    description: string;
    type: ApplicationCommandOptionType;
    required: boolean;
  }>;
  callback: (
    client: Client,
    interaction: ChatInputCommandInteraction,
  ) => Promise<void>;
}

const command: Command = {
  name: "clear",
  description: "Clears a specified number of messages.",
  permissionsRequired: [PermissionsBitField.Flags.ManageMessages],
  botPermissions: [PermissionsBitField.Flags.ManageMessages],
  options: [
    {
      name: "amount",
      description: "The amount to clear",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],

  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  callback: async (
    client: Client,
    interaction: ChatInputCommandInteraction,
  ): Promise<void> => {
    const amount = interaction.options.get("amount")?.value as number;
    const channel = interaction.channel as TextChannel;

    // Check if user has permission
    if (
      !interaction.member?.permissions ||
      typeof interaction.member.permissions === "string" ||
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages,
      )
    ) {
      await interaction.reply({
        content: "You don't have the required permissions to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if bot has permission
    if (
      !interaction.guild?.members?.me?.permissions?.has(
        PermissionsBitField.Flags.ManageMessages,
      )
    ) {
      await interaction.reply({
        content: "I don't have the required permissions to delete messages.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (!amount) {
      await interaction.reply({
        content: "Please provide an amount of messages to clear.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (amount > 100 || amount < 1) {
      await interaction.reply({
        content: "Please provide a valid amount between 1 and 100.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      const messages = await channel.messages.fetch({ limit: amount });
      const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const validMessages = messages.filter(
        (msg) => msg.createdTimestamp > fourteenDaysAgo,
      );

      if (validMessages.size === 0) {
        await interaction.reply({
          content:
            "No messages were cleared. All selected messages were older than 14 days.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await channel.bulkDelete(validMessages);

      const skipped = amount - validMessages.size;
      const embed = new EmbedBuilder()
        .setTitle("Message Clearing")
        .setDescription(
          `Successfully cleared ${validMessages.size} messages.` +
            (skipped > 0
              ? `\n\n*Note: ${skipped} message(s) could not be cleared because they were older than 14 days.*`
              : ""),
        )
        .setColor("Blue");

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(`there was an error clearing the msgs: ${error}`);
      await interaction.reply({
        content: "There was an error while trying to delete the messages.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default command;
