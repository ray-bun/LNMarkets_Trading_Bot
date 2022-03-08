#Warning
Educational only. Use it at your own risk. I am not responsible for any financial loss.

# LNMarkets_Trading_Bot

LNMarkets.com trading bot using TradingView Technical Analysis to automatically trade. Automatically trade with proper position sizing and risk management.

You can follow my telegram group to see bot live trading: https://t.me/lnmarketsbot

# Installation

1.

```
git clone https://github.com/RielBitcoin/LNMarkets_Trading_Bot.git
npm install

```

2. Go to https://app.supabase.io/
3. Create two projects (MAINNET, TESTNET)
4. Import Import_SQL.sql into SUPABASE (RENAME your botname and your preferred trading timeframe)

# Configuration

1. Rename SAMPLE.env to .env and do the configuration

# Running the bot

```
node startBot.js
```

I recommend using CRON or scheduler to run your bot every 5 mins etc..

#Future improvements

- Web interface
- Auto create database

#Warning
Educational only. Use it at your own risk. I am not responsible for any financial loss.
