import { BotClient } from "../types";

export default async function getApplicationCommands(
  client: BotClient,
  guildId?: string
) {
  let applicationCommands;

  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    applicationCommands = guild.commands;
  } else {
    applicationCommands = client.application?.commands;
  }

  if (applicationCommands) {
    await applicationCommands.fetch({});
  }
  return applicationCommands;
}
