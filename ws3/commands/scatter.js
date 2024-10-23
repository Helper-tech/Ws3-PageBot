const fs = require('fs');
const path = require('path');

const colors = [
    '🔴', '🟠', '🟡', '🟢',
    '🔵', '🟣', '🟤', '⚫',
    '⚪',
    '🌟', '👑', '💎'
];

const MIN_BET = 50;
const MAX_BET = 1000000000;

function generatePattern() {
    let pattern = [];
    for (let i = 0; i < 4; i++) {
        let row = [];
        for (let j = 0; j < 5; j++) {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            row.push(randomColor);
        }
        pattern.push(row);
    }
    return pattern;
}

function calculateWinnings(pattern, betAmount) {
    let flatPattern = pattern.flat();
    let starCount = flatPattern.filter(color => color === '🌟').length;

    if (starCount >= 5) { 
        return { winnings: betAmount * 4, freeSpins: 3 }; 
    }

    let colorCounts = flatPattern.reduce((acc, color) => {
        acc[color] = (acc[color] || 0) + 1;
        return acc;
    }, {});

    let wildCardCount = colorCounts['👑'] || 0;

    for (let color of Object.keys(colorCounts)) {
        if (color !== '👑' && colorCounts[color] + wildCardCount >= 6) {
            return { winnings: betAmount * 2, freeSpins: 0 }; 
        }
    }

    return { winnings: -betAmount, freeSpins: 0 };
}

module.exports = {
    name: 'scatter',
    description: 'Play a scatter game by betting coins.',
    role: "user",
    credits: 'RightFall Haster',
    cooldown: 0,
    execute(api, event, args, command) {
        const userId = event.senderID;
        const coinBalanceFile = path.join(__dirname, `../database/coin_balances/${userId}.json`);
        const betAmount = parseInt(args[0]);

        if (isNaN(betAmount) || betAmount < MIN_BET || betAmount > MAX_BET) {
            api.sendMessage(`Please enter a valid bet amount between ${MIN_BET} and ${MAX_BET}.`, event.threadID, event.messageID);
            return;
        }

        let coinBalance = 0;
        if (fs.existsSync(coinBalanceFile)) {
            coinBalance = JSON.parse(fs.readFileSync(coinBalanceFile, 'utf8'));
        }

        if (coinBalance < betAmount) {
            api.sendMessage(`You don't have enough coins to bet ${betAmount}.`, event.threadID, event.messageID);
            return;
        }

        const pattern = generatePattern();
        let { winnings, freeSpins } = calculateWinnings(pattern, betAmount);

        coinBalance += winnings;

        fs.writeFileSync(coinBalanceFile, JSON.stringify(coinBalance));

        let patternMessage = 'Here is the scatter pattern:\n';
        pattern.forEach(row => {
            patternMessage += row.join(' ') + '\n';
        });

        let resultMessage = winnings > 0
            ? `Congratulations! You won ${winnings} coins!`
            : `Sorry, you lost ${-winnings} coins.`;

        api.sendMessage(`${patternMessage}\n${resultMessage}\nYou now have ${coinBalance} coins.`, event.threadID, event.messageID);

        // If there are free spins, conduct them
        if (freeSpins > 0) {
            api.sendMessage('Wow! You got Scatter! Conducting 3 free spins...', event.threadID, event.messageID);

            let totalFreeSpinWinnings = 0;
            let freeSpinCount = 0;

            const conductFreeSpin = () => {
                if (freeSpinCount < freeSpins) {
                    freeSpinCount++;
                    const freeSpinPattern = generatePattern();
                    const freeSpinResults = calculateWinnings(freeSpinPattern, betAmount);

                    totalFreeSpinWinnings += freeSpinResults.winnings > 0 ? freeSpinResults.winnings : 0;

                    let freeSpinPatternMessage = `Free Spin ${freeSpinCount} pattern:\n`;
                    freeSpinPattern.forEach(row => {
                        freeSpinPatternMessage += row.join(' ') + '\n';
                    });

                    api.sendMessage(freeSpinPatternMessage, event.threadID, event.messageID);

                    setTimeout(conductFreeSpin, 5000); // Conduct the next free spin after 5 seconds
                } else {
                    coinBalance += totalFreeSpinWinnings;
                    fs.writeFileSync(coinBalanceFile, JSON.stringify(coinBalance));
                    api.sendMessage(`Total winnings from free spins: ${totalFreeSpinWinnings} coins!\nYou now have ${coinBalance} coins.`, event.threadID, event.messageID);
                }
            };

            conductFreeSpin();
        }
    }
};