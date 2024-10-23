const fs = require('fs');

const path = require('path');

const MAX_COINS = 100e100; // 999 billion

const MIN_DEPOSIT = 90000000000; // 900 billion

const coinBalancesPath = path.join(__dirname, '../database/coin_balances');

const bankBalancesPath = path.join(__dirname, '../database/bank_balances');

// Ensure directories exist

if (!fs.existsSync(coinBalancesPath)) {

    fs.mkdirSync(coinBalancesPath, { recursive: true });

}

if (!fs.existsSync(bankBalancesPath)) {

    fs.mkdirSync(bankBalancesPath, { recursive: true });

}

function loadCoinBalance(userId) {

    const coinBalanceFile = path.join(coinBalancesPath, `${userId}.json`);

    if (fs.existsSync(coinBalanceFile)) {

        return JSON.parse(fs.readFileSync(coinBalanceFile, 'utf8'));

    }

    return 0;

}

function saveCoinBalance(userId, balance) {

    const coinBalanceFile = path.join(coinBalancesPath, `${userId}.json`);

    fs.writeFileSync(coinBalanceFile, JSON.stringify(balance));

}

function loadBankBalances(userId) {

    const bankBalanceFile = path.join(bankBalancesPath, `${userId}.json`);

    if (fs.existsSync(bankBalanceFile)) {

        return JSON.parse(fs.readFileSync(bankBalanceFile, 'utf8'));

    }

    return [];

}

function saveBankBalances(userId, balances) {

    const bankBalanceFile = path.join(bankBalancesPath, `${userId}.json`);

    fs.writeFileSync(bankBalanceFile, JSON.stringify(balances, null, 2));

}

module.exports = {

    name: 'bank',

    description: 'Banking system to deposit and withdraw coins.',

    role: 'user',

    credits: 'YAFB',

    cooldown: 0,

    async execute(api, event, args) {

        const userId = event.senderID;

        if (args.length === 0) {

            const bankBalances = loadBankBalances(userId);

            if (bankBalances.length === 0) {

                api.sendMessage('Your bank is empty. use bank deposit to deposit coins', event.threadID, event.messageID);

                return;

            }

            let bankInfo = '🏦 Your Bank Deposits 🏦\n\n';

            bankBalances.sort((a, b) => b.amount - a.amount).forEach((deposit, index) => {

                bankInfo += `#${index + 1}: ${deposit.amount} coins\n`;

            });

            api.sendMessage(bankInfo, event.threadID, event.messageID);

            return;

        }

        const command = args[0].toLowerCase();

        if (command === 'deposit') {

            let coinBalance = loadCoinBalance(userId);

            if (coinBalance < MIN_DEPOSIT) {

                api.sendMessage(`You need at least ${MIN_DEPOSIT} coins to make a deposit.`, event.threadID, event.messageID);

                return;

            }

            const depositAmount = coinBalance > MAX_COINS ? MAX_COINS : coinBalance;

            // Deduct the deposit amount from the user's balance

            coinBalance -= depositAmount;

            saveCoinBalance(userId, coinBalance);

            let bankBalances = loadBankBalances(userId);

            bankBalances.push({ amount: depositAmount });

            saveBankBalances(userId, bankBalances);

            api.sendMessage(`Successfully deposited ${depositAmount} coins to your bank.`, event.threadID, event.messageID);

        } else if (command === 'withdraw') {

            const depositNumber = parseInt(args[1]);

            if (isNaN(depositNumber)) {

                api.sendMessage('Please enter a valid deposit number to withdraw.', event.threadID, event.messageID);

                return;

            }

            let bankBalances = loadBankBalances(userId);

            if (depositNumber < 1 || depositNumber > bankBalances.length) {

                api.sendMessage('Invalid deposit number.', event.threadID, event.messageID);

                return;

            }

            const [withdrawal] = bankBalances.splice(depositNumber - 1, 1);

            saveBankBalances(userId, bankBalances);

            let coinBalance = loadCoinBalance(userId);

            coinBalance += withdrawal.amount;

            saveCoinBalance(userId, coinBalance);

            api.sendMessage(`Successfully withdrew ${withdrawal.amount} coins from your bank.`, event.threadID, event.messageID);

        } else {

            api.sendMessage('Invalid command. Use "bank deposit" to deposit all your coins or "bank withdraw <number>" to withdraw.', event.threadID, event.messageID);

        }

    }

};
