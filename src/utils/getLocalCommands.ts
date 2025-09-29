import { join } from "path";
import getAllFiles from "./getAllFiles";

export default function getLocalCommands(exceptions: string[] = []): any[] {
  let localCommands: any[] = [];

  const commandCategories = getAllFiles(
    join(__dirname, "..", "commands"),
    true
  );

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory).filter(
      (file: string) =>
        (file.endsWith(".ts") || file.endsWith(".js")) &&
        !file.endsWith(".d.ts")
    );

    for (const commandFile of commandFiles) {
      try {
        // Handle both JS and TS files
        let commandObject;
        if (commandFile.endsWith(".ts")) {
          // For TypeScript files in development, require directly
          commandObject = require(commandFile);
        } else {
          commandObject = require(commandFile);
        }

        // Handle both default exports and direct exports
        const command = commandObject.default || commandObject;

        if (exceptions.includes(command.name)) {
          continue;
        }

        localCommands.push(command);
      } catch (error) {
        console.log(`Error loading command file ${commandFile}:`, error);
      }
    }
  }

  return localCommands;
}
