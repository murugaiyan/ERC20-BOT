BOT
This bot works in BSC Mainnet, BSC Testnet, Ethereum Mainnet and Ethereum Goerili network. Basically this bot would support any ERC20 tokens.

Functionality:

1. Dashboard - Still in development
2. Snipe Token - Buy the token after initial liquidity is added for tokens.
3. Approve Token - Approve the token
4. Buy Token - Buy the token instantly. Similar to Token buy in pancakeswap/uniswap.
5. Sell Token - Sell token has three sub functions
   a) Instant token sell
   b) Delayed sell - Sell token after some time, configured in seconds.
   c) NoofX sell - Sell token automatically after the token reached number of X(positive).

This token currently supports only for 1 token for the above functionality.

BOT Installation Guide

- install node js from https://nodejs.org/en/download/
- Download bot source source from github https://github.com/murugaiyan/ERC20-BOT ).
- update your erc20 wallet private key in environment file .env.bsc.mainnet(this file might be hidden on mac). See below for Example environment settings for the file .env.bsc.mainnet
- Navigate to that path using terminal (mac) / cmd (windows)
- run below cmd to install dependencies
  - npm update
- run below command for bot app to start
  - npm run start-bsc-mainnet - this will launch dbot web application on browser localhost:3000
- start using bot features from UI

BSC Mainnet:
npm run start-bsc-mainnet
BSC-Testnet
npm run start-bsc-testnet

Example BSC mainnet environment file (.env.bsc.mainnet).

REACT_APP_WALLET_PRIVATE_KEY=<YOUR PRIVATE KEY. SHOULD ENTER PRIVATE KEY ONLY(NO 0x, No single quotes('), no double quotes(")
REACT_APP_BLOCKCHAIN_NODE_PROVIDER=https://bsc-dataseed.binance.org/
REACT_APP_BLOCKCHAIN_BLOCK_EXPLORER=https://bscscan.com/tx/
REACT_APP_ROUTER_CONTRACT_ADDRESS=0x10ed43c718714eb63d5aa57b78b54704e256024e
REACT_APP_BASE_TOKEN_CONTRACT_ADDRESS=0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c
REACT_APP_USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
REACT_APP_BLOCKCHAIN_CHAIN_ID=56
