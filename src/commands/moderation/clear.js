const {
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  Client,
  Interaction,
  MessageFlags,
} = require("discord.js");

module.exports = {
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
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const amount = interaction.options.get("amount").value;
    const channel = interaction.channel;

    // Check if user has permission
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages
      )
    )
      return interaction.reply({
        content: "You don't have the required permissions to use this command.",
        flags: MessageFlags.Ephemeral,
      });

    // Check if bot has permission
    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.ManageMessages
      )
    )
      return interaction.reply({
        content: "I don't have the required permissions to delete messages.",
        flags: MessageFlags.Ephemeral,
      });

    if (!amount)
      return interaction.reply({
        content: "Please provide an amount of messages to clear.",
        flags: MessageFlags.Ephemeral,
      });
    if (amount > 100 || amount < 1)
      return interaction.reply({
        content: "Please provide a valid amount between 1 and 100.",
        flags: MessageFlags.Ephemeral,
      });

    try {
      await interaction.channel.bulkDelete(amount);
    } catch (error) {
      console.log(`there was an error clearing the msgs: ${error}`);
      return interaction.reply({
        content:
          "There was an error deleting the messages. Make sure the messages aren't older than 14 days.",
        flags: MessageFlags.Ephemeral,
      });
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
