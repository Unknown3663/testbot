import {
  Client,
  EmbedBuilder,
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
  name: "warnings",
  description: "The user warnings",
  options: [
    // the options for the command
    {
      name: "user",
      description: "The user you want to see his/her warnings.",
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
    const { options, guildId } = interaction;
    const target = options.getUser("user") as User;

    const embed = new EmbedBuilder(); //embed for warnings of a member
    const noWarns = new EmbedBuilder(); //embed if no warnings are assigned to a member

    try {
      const data = await warningSchema.findOne({
        GuildID: guildId,
        UserID: target.id,
        UserTag: target.tag,
      }); //finding if the user has any warnings

      if (data) {
        // if the user has warnings
        embed.setColor("Purple").setDescription(
          `:white_check_mark:  ${target.tag}'s warnings: \n${data.Content.map(
            (w: any, i: number) =>
              `
                            **Warning**: ${i + 1}
                            **Warning Moderator**: ${w.ExecuterTag}
                            **Warn reason**: ${w.Reason}
                        `
          ).join("-")}`
        );

        await interaction.reply({ embeds: [embed] }); // reply with the warnings embed
      } else {
        noWarns
          .setColor("Green")
          .setDescription(
            `:white_check_mark:  ${target.tag} has **0** warnings!`
          );

        await interaction.reply({ embeds: [noWarns] }); // if not then reply with the no warnings embed
      }
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "An error occurred while fetching warnings.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default command;
