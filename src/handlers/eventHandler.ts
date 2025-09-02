import path from "path";
import getAllFiles from "../utils/getAllFiles";
import { BotClient } from "../types";

export default function eventHandler(client: BotClient): void {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder).filter(
      (file: string) =>
        (file.endsWith(".ts") || file.endsWith(".js")) &&
        !file.endsWith(".d.ts")
    );
    eventFiles.sort((a: string, b: string) => (a > b ? 1 : -1));

    const eventName = eventFolder
      .replace(/\\/g, "/")
      .split("/")
      .pop() as string;

    client.on(eventName as any, async (arg: any) => {
      for (const eventFile of eventFiles) {
        try {
          // Handle both JS and TS files
          let eventFunction;
          if (eventFile.endsWith(".ts")) {
            const module = await import(eventFile);
            eventFunction = module.default;
          } else {
            eventFunction = require(eventFile);
          }

          if (typeof eventFunction === "function") {
            await eventFunction(client, arg);
          }
        } catch (error) {
          console.log(`Error loading event file ${eventFile}:`, error);
        }
      }
    });
  }
}
