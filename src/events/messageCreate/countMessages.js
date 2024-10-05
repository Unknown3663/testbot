let messageCount = 0;

//function to count messages
module.exports = (client, message) => {
    if (!message.author.bot) {
        messageCount++;
    }
};

//log messsage count every minute and reset the count
const logMessageCount = () => {
    setInterval(() => {
        console.log(`Total messages in the last minute: ${messageCount}`);
        messageCount = 0;
    }, 60000); //60000 ms = 1 minute 
};

//immediately start the interval when the file is loaded
logMessageCount();