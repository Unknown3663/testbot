const { Client, EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require('discord.js');
const warningSchema = require('../../models/warnSchema');

module.exports = {
    name: 'clearwarn',
    description: 'Clears a user warning.',
    options: [
        {
            name: 'user',
            description: 'The user you want to clear the warning for.',
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
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
            return interaction.reply({ content: 'You do not have the required permissions to clear people\'s warnings.', ephemeral: true });

        const { options, guildId } = interaction;
        const target = options.getUser('user');

        const embed = new EmbedBuilder();

        try {
            const data = await warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: target.tag });

            if (data) {
                await warningSchema.findOneAndDelete({ GuildID: guildId, UserID: target.id, UserTag: target.tag });

                embed.setTitle('User Warning Cleared')
                    .setDescription(`The warnings for <@${target.id}> has been cleared.`)
                    .setColor('DarkGreen');

                interaction.reply({ embeds: [embed] });
            } else {
                interaction.reply({ content: `${target.tag} has no warnings.` });
            }
        } catch (err) {
            console.error(`Error clearing warning: ${err}`);
            interaction.reply({ content: 'An error occurred while clearing the warning.', ephemeral: true });
        }
    }
}
