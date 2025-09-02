import { Client, Message } from "discord.js";

let messageCount = 0;

// function to count messages
export default (client: Client, message: Message): void => {
  if (!message.author.bot) {
    messageCount++;
  }
};

// log message count every minute and reset the count
const logMessageCount = (): void => {
  setInterval(() => {
    console.log(`Total messages in the last minute: ${messageCount}`);
    messageCount = 0;
  }, 60000); // 60000 ms = 1 minute
};

// immediately start the interval when the file is loaded
// logMessageCount();
