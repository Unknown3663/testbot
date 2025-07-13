const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  MessageFlags,
} = require("discord.js");
const User = require("../../models/User");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      // checking if the user running the command inside a guild or not
      interaction.reply({
        content: "You can only run this command inside a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const targetUserId =
      interaction.options.get("user")?.value || interaction.member.id;

    await interaction.deferReply();

    const user = await User.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!user) {
      // if the user never used the command before he doesn't have a profile
      interaction.editReply(`<@${targetUserId}> doesn't have a profile yet.`);
      return;
    }

    interaction.editReply(
      // if the user has a profile then show his balance
      targetUserId === interaction.member.id
        ? `Your balance is **${user.balance}**`
        : `<@${targetUserId}>'s balance is **${user.balance}**`
    );
  },

  name: "balance",
  description: "See yours/someone else's balance",
  options: [
    {
      name: "user",
      description: "The user whose balance you want to get.",
      type: ApplicationCommandOptionType.User,
    },
  ],
};
