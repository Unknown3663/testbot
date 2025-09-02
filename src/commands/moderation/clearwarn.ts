import {
  Client,
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  MessageFlags,
  ChatInputCommandInteraction,
  User,
} from "discord.js";
import warningSchema from "../../models/warnSchema";

interface Command {
  name: string;
  description: string;
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
  name: "clearwarn",
  description: "Clears a user warning.",
  options: [
    {
      name: "user",
      description: "The user you want to clear the warning for.",
      type: ApplicationCommandOptionType.User,
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
    if (
      !interaction.member?.permissions ||
      typeof interaction.member.permissions === "string" ||
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      await interaction.reply({
        content:
          "❌ You do not have the required permissions to clear people's warnings.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const { options, guildId } = interaction;
    const target = options.getUser("user") as User;

    const embed = new EmbedBuilder();

    try {
      const data = await warningSchema.findOne({
        GuildID: guildId,
        UserID: target.id,
        UserTag: target.tag,
      });

      if (data) {
        await warningSchema.findOneAndDelete({
          GuildID: guildId,
          UserID: target.id,
          UserTag: target.tag,
        });

        embed
          .setTitle("User Warning Cleared")
          .setDescription(`The warnings for <@${target.id}> has been cleared.`)
          .setColor("DarkGreen");

        await interaction.reply({ embeds: [embed] });
      } else {
        embed
          .setTitle("No Warnings Found")
          .setDescription(`<@${target.id}> has no warnings to clear.`)
          .setColor("Red");

        await interaction.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "An error occurred while clearing warnings.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default command;
