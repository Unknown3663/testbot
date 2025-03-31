const { Client, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const warningSchema = require('../../models/warnSchema');

module.exports = {
    name: 'warnings',
    description: 'The user warnings',
    options: [     // the options for the command
        {
            name: 'user',
            description: 'The user you want to see his/her warnings.',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {

        const { options, guildId } = interaction;
        const target = options.getUser('user');

        const embed = new EmbedBuilder(); //embed for wanrnings of a member
        const noWarns = new EmbedBuilder(); //embed if no warnings are assigned to a member

        try {
            const data = await warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: target.tag }); //finding if the user has any warnings 

            if (data) {   // if the user has warnings
                embed.setColor('Purple')
                    .setDescription(`:white_check_mark:  ${target.tag}'s warnings: \n${data.Content.map(
                        (w, i) =>
                            `
                            **Warning**: ${i + 1}
                            **Warning Moderator**: ${w.ExecuterTag}
                            **Warn reason**: ${w.Reason}
                        `
                    ).join('-')}`);

                interaction.reply({ embeds: [embed] }); // reply with the warnings embed
            } else {
                noWarns.setColor('Green')
                    .setDescription(`:white_check_mark:  ${target.tag} has **0** warnings!`);

                interaction.reply({ embeds: [noWarns] }); // if not then reply with the no warnings embed
            }
        } catch (err) {
            console.error(err);
            interaction.reply({ content: 'An error occurred while fetching warnings.', ephemeral: true });
        }
    }
}
