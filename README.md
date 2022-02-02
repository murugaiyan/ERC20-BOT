BOT
This bot works in BSC Mainnet, BSC Testnet, Ethereum Mainnet and Ethereum Goerili network. Basically this bot would support any ERC20 tokens.

Functionality:
Dashboard - Still in development
Snipe Token - Buy the token after initial liquidity is added for tokens.
Approve Token - Approve the token
Buy Token - Buy the token instantly. Similar to Token buy in pancakeswap/uniswap.
Sell Token - Sell token has three sub functions
a) Instant token sell
b) Delayed sell - Sell token after some time, configured in seconds.
c) NoofX sell - Sell token automatically after the token reached number of X(positive).

This token currently supports only for 1 token for the above functionality.

BOT Installation Guide

- install node js from https://nodejs.org/en/download/
- copy bot folder to any location
- update your erc20 wallet privat key in environment file .env.bsc.mainnet(this file might be hidden on mac). Example environment settings for the file .env.bsc.mainnet  
- Navigate to that path using terminal (mac) / cmd (windows)
- run below cmd to install dependencies
  - npm update
- run below command for bot app to start
  - npm run start-bsc-testnet - this will launch dbot web application on browser localhost:3000
- start using bot features from UI

Example BSC Testnet environment file.
REACT_APP_WALLET_PRIVATE_KEY=<YOUR PRIVATE KEY. SHOULD ENTER PRIVATE KEY ONLY(NO 0x, No single quotes('), no double quotes(")
REACT_APP_BLOCKCHAIN_NODE_PROVIDER=https://data-seed-prebsc-1-s1.binance.org:8545
REACT_APP_BLOCKCHAIN_BLOCK_EXPLORER=https://testnet.bscscan.com/tx/
REACT_APP_ROUTER_CONTRACT_ADDRESS=0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3
REACT_APP_BASE_TOKEN_CONTRACT_ADDRESS=0xae13d989dac2f0debff460ac112a837c89baa7cd
REACT_APP_BUSD_CONTRACT_ADDRESS=0x4fabb145d64652a948d72533023f6e7a623c7c53
REACT_APP_BLOCKCHAIN_CHAIN_ID=97

REACT_APP_WALLET_PRIVATE_KEY=<YOUR PRIVATE KEY. SHOULD ENTER PRIVATE KEY ONLY(NO 0x, No single quotes('), no double quotes(")
REACT_APP_BLOCKCHAIN_NODE_PROVIDER=https://bsc-dataseed.binance.org/
REACT_APP_BLOCKCHAIN_BLOCK_EXPLORER=https://bscscan.com/tx/
REACT_APP_ROUTER_CONTRACT_ADDRESS=0x10ed43c718714eb63d5aa57b78b54704e256024e
REACT_APP_BASE_TOKEN_CONTRACT_ADDRESS=0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c
REACT_APP_USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
REACT_APP_BLOCKCHAIN_CHAIN_ID=56

REACT_APP_WALLET_PRIVATE_KEY=<YOUR PRIVATE KEY. SHOULD ENTER PRIVATE KEY ONLY(NO 0x, No single quotes('), no double quotes(")
REACT_APP_BLOCKCHAIN_NODE_PROVIDER=https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
REACT_APP_BLOCKCHAIN_BLOCK_EXPLORER=https://goerli.etherscan.io/tx/
REACT_APP_ROUTER_CONTRACT_ADDRESS=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
REACT_APP_BASE_TOKEN_CONTRACT_ADDRESS=0xD9A5179F091d85051d3C982785Efd1455CEc8699
REACT_APP_BLOCKCHAIN_CHAIN_ID=5
