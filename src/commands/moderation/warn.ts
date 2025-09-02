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
  name: "warn",
  description: "Warn a user in the server.",
  options: [
    {
      name: "user",
      description: "The user you want to warn.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the warning.",
      type: ApplicationCommandOptionType.String,
      required: false,
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
        content: "❌ You do not have the required permissions to warn users.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const { options, guildId } = interaction;
    const target = options.getUser("user") as User;
    const reason = options.getString("reason") || "no reason given";
    const userTag = `${target.tag}`; // Changed this to target.tag to ensure we're saving the warned user's tag

    // Find if this user already has warnings in this guild
    const data = await warningSchema.findOne({
      GuildID: guildId,
      UserID: target.id,
      UserTag: userTag,
    });

    if (!data) {
      // If the user has no previous warnings, create a new document
      const newData = new warningSchema({
        GuildID: guildId,
        UserID: target.id,
        UserTag: userTag,
        Content: [
          {
            ExecuterId: interaction.user.id,
            ExecuterTag: interaction.user.tag,
            Reason: reason,
          },
        ],
      });
      await newData.save();
    } else {
      // If the user already has warnings, append the new warning
      const warnContent = {
        ExecuterId: interaction.user.id,
        ExecuterTag: interaction.user.tag,
        Reason: reason,
      };
      data.Content.push(warnContent);
      await data.save();
    }

    // Notify the moderator and the user about the warning
    const embed = new EmbedBuilder()
      .setColor("DarkRed")
      .setTitle("User Warned")
      .setDescription(`User: ${target.tag}\nReason: ${reason}`);

    const embed2 = new EmbedBuilder()
      .setColor("DarkRed")
      .setTitle("Warnings")
      .setDescription(
        `You have been warned in ${interaction.guild?.name}\nReason: ${reason}`
      );

    // Try to DM the user about their warning, fail silently if DMs are blocked
    target.send({ embeds: [embed2] }).catch((err) => {
      return;
    });

    // Send the confirmation message to the moderator
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
