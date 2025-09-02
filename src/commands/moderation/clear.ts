import {
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  Client,
  MessageFlags,
  ChatInputCommandInteraction,
  TextChannel,
  PermissionFlagsBits,
  GuildMemberRoleManager,
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
    interaction: ChatInputCommandInteraction
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
    interaction: ChatInputCommandInteraction
  ): Promise<void> => {
    const amount = interaction.options.get("amount")?.value as number;
    const channel = interaction.channel as TextChannel;

    // Check if user has permission
    if (
      !interaction.member?.permissions ||
      typeof interaction.member.permissions === "string" ||
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages
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
        PermissionsBitField.Flags.ManageMessages
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
      await channel.bulkDelete(amount);
    } catch (error) {
      console.log(`there was an error clearing the msgs: ${error}`);
      await interaction.reply({
        content:
          "There was an error deleting the messages. Make sure the messages aren't older than 14 days.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle("Message Clearing")
        .setDescription(`Successfully cleared ${amount} messages.`)
        .setColor("Blue");

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.log(`there was an error making the embed: ${error}`);
    }
  },
};

export default command;
