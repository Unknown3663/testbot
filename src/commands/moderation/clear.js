const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType, Client, Interaction } =require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Clears a specified number of messages.',
    options: [
        {
            name: 'amount',
            description: 'The amount to clear',
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
            
            const amount = interaction.options.get('amount').value;
            const channel = interaction.channel;

            if (!interaction.member.permissions.has(PermissionsBitField.ManageMessegs))
                return interaction.reply({ content: "You don't have the required permissions to use this command.", ephemeral: true });
            if(!amount)
                return interaction.reply({ content: "Please provide an amount of messages to clear.", ephemeral: true });
            if(amount > 100 || amount < 1)
                return interaction.reply({ content: "Please provide a valid amount between 1 and 100.", ephemeral: true });

            try {

                await interaction.channel.bulkDelete(amount)
            
            } catch (error) {
                console.log(`there was an error clearing the msgs: ${error}`)
            }
            
            try {

                const embed = new EmbedBuilder()
                .setTitle('Message Clearing')
                .setDescription(`Successfully cleared ${amount} messages.`)
                .setColor("Blue")
               
               await interaction.reply({ embeds: [embed] })

            } catch (error) {
                console.log(`there was an error making the embed: ${error}`)
            }

           
        }
}