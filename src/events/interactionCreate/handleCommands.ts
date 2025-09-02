import config from "../../../config.json";
import getLocalCommands from "../../utils/getLocalCommands";
import { MessageFlags, Interaction } from "discord.js";
import { BotClient } from "../../types";

const { devs, testServer } = config;

export default async function handleCommands(
  client: BotClient,
  interaction: Interaction
): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) return;

    if (commandObject.devOnly) {
      if (!devs.includes(interaction.member?.user.id || "")) {
        await interaction.reply({
          content: "Only developers are allowed to run this command.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    if (commandObject.testOnly) {
      if (!(interaction.guild?.id === testServer)) {
        await interaction.reply({
          content: "This command cannot be ran here.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    // Permission checks are handled individually by each command

    await commandObject.callback(client, interaction);
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
  }
}
