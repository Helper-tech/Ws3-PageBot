const fs = require('fs');
const path = require('path');

module.exports = {
    description: 'Claim your Daily coins',
    coins: 0,
    role: "user",
    cooldown: 1, 
    execute(api, event, args, command) {
        const userId = event.senderID;
        const dailyDir = path.join(__dirname, '../database/daily2');
        const dailyFile = path.join(dailyDir, `${userId}.json`);
        const coinBalanceDir = path.join(__dirname, '../database/coin_balances');
        const coinBalanceFile = path.join(coinBalanceDir, `${userId}.json`);
        const now = new Date();

        // Ensure the directories exist
        if (!fs.existsSync(dailyDir)) {
            fs.mkdirSync(dailyDir, { recursive: true });
        }
        if (!fs.existsSync(coinBalanceDir)) {
            fs.mkdirSync(coinBalanceDir, { recursive: true });
        }

        if (fs.existsSync(dailyFile)) {
            const lastClaimed = new Date(JSON.parse(fs.readFileSync(dailyFile, 'utf8')).lastClaimed);
            const oneDay = 24 * 60 * 60 * 1000; 

            if ((now - lastClaimed) < oneDay) {
                const nextClaim = new Date(lastClaimed.getTime() + oneDay);
                const timeLeft = nextClaim - now;
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                api.sendMessage(`You have already claimed your daily coins. Try again in ${hoursLeft} hours and ${minutesLeft} minutes.`, event.threadID, event.messageID);
                return;
            }
        }

        const randomCoins = Math.floor(Math.random() * (5500 - 1550 + 1)) + 1550;

        let coinBalance = 0;
        if (fs.existsSync(coinBalanceFile)) {
            coinBalance = JSON.parse(fs.readFileSync(coinBalanceFile, 'utf8'));
        }
        coinBalance += randomCoins;

        fs.writeFileSync(coinBalanceFile, JSON.stringify(coinBalance));
        fs.writeFileSync(dailyFile, JSON.stringify({ lastClaimed: now }));

        api.sendMessage(`✅You have received ${randomCoins} coins! You now have ${coinBalance} coins.`, event.threadID, event.messageID);
    }
};