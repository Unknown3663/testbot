const { Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
  const { RankCardBuilder, Font } = require('canvacord');
  const calculateLevelXp = require('../../utils/calculateLevelXp');
  const Level = require('../../models/Level');
  
  module.exports = {
    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: async (client, interaction) => {
      if (!interaction.inGuild()) { //checking if the user running the command inside a guild or not
        interaction.reply('You can only run this command inside a server.');
        return;
      }
  
      await interaction.deferReply();
  
      const mentionedUserId = interaction.options.get('target-user')?.value;
      const targetUserId = mentionedUserId || interaction.member.id;
      const targetUserObj = await interaction.guild.members.fetch(targetUserId);
  
      const fetchedLevel = await Level.findOne({ // fetching the user's level
        userId: targetUserId,
        guildId: interaction.guild.id,
      });
  
      if (!fetchedLevel) { // if the user never used the command before he doesn't have a profile
        interaction.editReply(
          mentionedUserId
            ? `${targetUserObj.user.username} doesn't have any levels yet. Try again when they chat a little more.`
            : "You don't have any levels yet. Chat a little more and try again."
        );
        return;
      }
  
      let allLevels = await Level.find({ guildId: interaction.guild.id }).select(
        '-_id userId level xp'
      );
  
      allLevels.sort((a, b) => {
        if (a.level === b.level) {
          return b.xp - a.xp;
        } else {
          return b.level - a.level;
        }
      });
  
      let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

        Font.loadDefault();
         const rank = new RankCardBuilder()
         .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256, forceStatic: true }))
         .setRank(currentRank)
         .setLevel(fetchedLevel.level)
         .setCurrentXP(fetchedLevel.xp)
         .setRequiredXP(calculateLevelXp(fetchedLevel.level))
         .setStyles({
             progressbar: {
                 thumb: {
                     style: {
                        backgroundColor: "#FFFFFF"
                     }
                 }
             },
         })
         .setUsername(targetUserObj.user.username)
         .setStatus(targetUserObj.presence.status)
         .setBackground('images/CardBackGround.png')
         .setBackgroundCrop('images/CardBackGround.png')
         .setDisplayName(targetUserObj.user.displayName);

    const data = await rank.build();
    const attachment = new AttachmentBuilder(data);
    interaction.editReply({ files: [attachment] });
    },
  
    name: 'level',
    description: "Shows your/someone's level.",
    options: [
      {
        name: 'target-user',
        description: 'The user whose level you want to see.',
        type: ApplicationCommandOptionType.Mentionable,
      },
    ],
  };