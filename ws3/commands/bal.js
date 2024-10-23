const fs = require('fs');
const path = require('path');

const MAX_COINS = 100e100; // 9 quadrillion

module.exports = {
    name: 'checkcoins',
    description: 'Check your coin balance.',
    coins: 0,
    role: 'user',
    cooldown: 0, // No cooldown
   async execute(api, event, args, command) {
        const userId = event.senderID;
        const coinBalanceFile = path.join(__dirname, `../database/coin_balances/${userId}.json`);

        let coinBalance = 0;

        // Check if the user's coin balance file exists
        if (fs.existsSync(coinBalanceFile)) {
            coinBalance = JSON.parse(fs.readFileSync(coinBalanceFile, 'utf8'));
        } else {
            // If the file doesn't exist, create it with initial balance of 0
            fs.writeFileSync(coinBalanceFile, JSON.stringify(coinBalance));
        }

        // Ensure the coin balance does not exceed the maximum allowed
        if (coinBalance > MAX_COINS) {
            coinBalance = MAX_COINS;
            fs.writeFileSync(coinBalanceFile, JSON.stringify(coinBalance));
        }

        // Send message to user with their current coin balance
        api.sendMessage(`You have ${coinBalance} coins.`, event.threadID, event.messageID);
    }
};
