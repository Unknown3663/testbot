import { ChatInputCommandInteraction } from "discord.js";
import { BotClient } from "../../types";

export default {
  name: "ping",
  description: "replies with the bot ping",
  callback: async (
    client: BotClient,
    interaction: ChatInputCommandInteraction
  ): Promise<void> => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply(
      `Pong! Client: ${ping}ms | websocket: ${client.ws.ping}ms`
    );
  },
};
