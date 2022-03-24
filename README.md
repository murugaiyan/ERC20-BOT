BOT
This bot works in BSC Mainnet, BSC Testnet, Ethereum Mainnet and Ethereum Goerili network. Basically this bot would support any ERC20 tokens.

Functionality:

1. Dashboard - Still in development
2. Snipe Token - Buy the token after initial liquidity is added for tokens.
	a) Snipe and sell  - Snipe the token after token launch and sell it automatically after delayed sell. Auto sell after noofX features not implemented. 
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
- update your erc20 wallet private key in environment file .env.bsc.mainnet(this file might be hidden on mac).
- Navigate to that path using terminal (mac) / cmd (windows)
- run below cmd to install dependencies
  - npm install
- run below command for bot app to start
  - npm run start-bsc-mainnet - this will launch dbot web application on browser localhost:3000
- start using bot features from UI

Note: correct private key in .env.xxxxxxx file needs to be updated before running this app. Otherwise this application won't work.
Note: TokenX/BUSD pair currently not supported. Tokenx/BNB pair should work. 

BSC Mainnet:
npm run start-bsc-mainnet

BSC-Testnet
npm run start-bsc-testnet
