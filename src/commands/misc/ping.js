module.exports = {
  name: "ping",
  description: "replies with the bot ping",
  callback: async (client, interaction) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `Pong! Client: ${ping}ms | websocket: ${client.ws.ping}ms`
    );
  },
};
