import path from "path";
import {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  MessageFlags,
} from "discord.js";
import { RankCardBuilder, Font } from "canvacord";
import calculateLevelXp from "../../utils/calculateLevelXp";
import Level from "../../models/Level";
import { BotClient } from "../../types";

export default {
  callback: async (
    client: BotClient,
    interaction: ChatInputCommandInteraction
  ): Promise<void> => {
    if (!interaction.inGuild()) {
      // checking if the user running the command inside a guild or not
      await interaction.reply({
        content: "You can only run this command inside a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    const mentionedUserId = interaction.options.get("target-user")
      ?.value as string;
    const targetUserId = mentionedUserId || interaction.member?.user.id;
    const targetUserObj = await interaction.guild?.members.fetch(
      targetUserId as string
    );

    if (!targetUserObj) {
      await interaction.editReply("Could not find the target user.");
      return;
    }

    const fetchedLevel = await Level.findOne({
      // fetching the user's level
      userId: targetUserId,
      guildId: interaction.guild?.id,
    });

    if (!fetchedLevel) {
      // if the user never used the command before he doesn't have a profile
      await interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.username} doesn't have any levels yet. Try again when they chat a little more.`
          : "You don't have any levels yet. Chat a little more and try again."
      );
      return;
    }

    let allLevels = await Level.find({ guildId: interaction.guild?.id }).select(
      "-_id userId level xp"
    );

    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let currentRank =
      allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    Font.loadDefault();
    const rank = new RankCardBuilder()
      .setAvatar(
        targetUserObj.user.displayAvatarURL({ size: 256, forceStatic: true })
      )
      .setRank(currentRank)
      .setLevel(fetchedLevel.level)
      .setCurrentXP(fetchedLevel.xp)
      .setRequiredXP(calculateLevelXp(fetchedLevel.level))
      .setStyles({
        progressbar: {
          thumb: {
            style: {
              backgroundColor: "#FFFFFF",
            },
          },
        },
      })
      .setUsername(targetUserObj.user.username)
      .setStatus(targetUserObj.presence?.status || "offline")
      .setBackground(path.join(__dirname, "../../../images/CardBackGround.png"))
      .setDisplayName(targetUserObj.user.displayName);

    const data = await rank.build();
    const attachment = new AttachmentBuilder(data);
    await interaction.editReply({ files: [attachment] });
  },

  name: "level",
  description: "Shows your/someone's level.",
  options: [
    {
      name: "target-user",
      description: "The user whose level you want to see.",
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
};
