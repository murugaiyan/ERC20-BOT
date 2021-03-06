import {
  WALLET_PRIVATE_KEY,
  TRANSACTION_STATUS,
  ROUTER_CONTRACT_ADDRESS,
  PANCAKE_CONTRACT_ABI,
  UNISWAP_CONTRACT_ABI,
  BLOCKCHAIN_CHAIN_ID_NETWORK,
  BLOCKCHAIN_CHAIN_ID,
  TRANSACTION_DEADLINE,
  BLOCKCHAIN_GAS_PRICE_MULTIPLIER
} from "../constants";
import web3 from "./web3";

const routerFactoryABI = [
  {
    inputs: [
      { internalType: "address", name: "_feeToSetter", type: "address" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "pair",
        type: "address",
      },
      { indexed: false, internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "PairCreated",
    type: "event",
  },
  {
    constant: true,
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "allPairs",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "allPairsLength",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "tokenA", type: "address" },
      { internalType: "address", name: "tokenB", type: "address" },
    ],
    name: "createPair",
    outputs: [{ internalType: "address", name: "pair", type: "address" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "feeTo",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "feeToSetter",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "getPair",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ internalType: "address", name: "_feeTo", type: "address" }],
    name: "setFeeTo",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "_feeToSetter", type: "address" },
    ],
    name: "setFeeToSetter",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

const tokenAbi = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_symbol", type: "string" },
      { internalType: "uint256", name: "_decimals", type: "uint256" },
      { internalType: "uint256", name: "_supply", type: "uint256" },
      { internalType: "uint256", name: "_txFee", type: "uint256" },
      { internalType: "uint256", name: "_burnFee", type: "uint256" },
      { internalType: "uint256", name: "_charityFee", type: "uint256" },
      { internalType: "address", name: "_FeeAddress", type: "address" },
      { internalType: "address", name: "tokenOwner", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "FeeAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_BURN_FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_CHARITY_FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_TAX_FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_value", type: "uint256" }],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tAmount", type: "uint256" }],
    name: "deliver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "excludeAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "includeAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "isCharity",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "isExcluded",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "tAmount", type: "uint256" },
      { internalType: "bool", name: "deductTransferFee", type: "bool" },
    ],
    name: "reflectionFromToken",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "setAsCharityAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "rAmount", type: "uint256" }],
    name: "tokenFromReflection",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalBurn",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalCharity",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalFees",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_txFee", type: "uint256" },
      { internalType: "uint256", name: "_burnFee", type: "uint256" },
      { internalType: "uint256", name: "_charityFee", type: "uint256" },
    ],
    name: "updateFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
var txnStatus = {
  snipingStatus: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
  approvalStatus: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
  buyStatus: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
  sellStatus: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
  transferStatus: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
};
export async function getTokenSymbol(tokenAddres) {
  var symbol = ''; 
  try {
    const tokenRouter = new web3.eth.Contract(tokenAbi, tokenAddres);
    symbol = await tokenRouter.methods.symbol().call();

    //console.log ("utils: TokenSymbol: " + symbol);
  }
  catch(error)
  {
    console.log("utils getTokenSymbol Exception: " + error); 
  }
  return symbol;
}

export async function getTokenDecimal(tokenAddres) {
  var tokenDecimals = ''; 
  try {
  const tokenRouter = new web3.eth.Contract(tokenAbi, tokenAddres.toLowerCase());
  tokenDecimals = await tokenRouter.methods.decimals().call();
  //console.log ("utils: tokenDecimals:" + tokenDecimals);
  }
  catch(error)
  {
    console.log("utils getTokenDecimal Exception: " + error); 
  }
  return tokenDecimals;
}

export async function getWeb3Object(tokenAddres)
{
  const tokenRouter = new web3.eth.Contract(tokenAbi, tokenAddres.toLowerCase());
  return tokenRouter; 
}

export async function getNetworkGasPrice(realGasPrice, noOfQtyToSendInBNB) {
  var gasPrice = 0; 
  try {
    const bnbAmount = web3.utils.toWei(noOfQtyToSendInBNB, "ether");
    var bnbAmountInBN = web3.utils.toBN(bnbAmount);
    const extraAmount = await web3.utils.toWei("0.01", "ether");
    const extraAmountInBN = web3.utils.toBN(extraAmount);
    const curGas = web3.utils.toBN(Math.round(realGasPrice));

    var tmp1 = bnbAmountInBN.add(curGas);
    gasPrice = tmp1.add(extraAmountInBN);
  }
  catch(error)
  {
    console.log("utils getNetworkGasPrice Exception: " + error); 
  }
  return gasPrice;
}

export async function getTokenBalanceHumanReadable(tokenContractAddress) {
  var tokenBalanceReadable = ''; 
  try {
    const senderAddress = web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address;
    const tokenRouter = new web3.eth.Contract(tokenAbi,tokenContractAddress.toLowerCase());
    const tokenBalance = await tokenRouter.methods.balanceOf(senderAddress).call();
    const tokenDecimals = await tokenRouter.methods.decimals().call();
    
    tokenBalanceReadable = tokenBalance/(Math.pow(10, tokenDecimals)); 
    //console.log ("utils: getTokenBalanceHumanReadable:" + tokenBalanceReadable);
  }
  catch(error)
  {
    console.log("utils getTokenBalanceHumanReadable Exception: " + error); 
  }
  return tokenBalanceReadable;
}

export async function getTokenBalanceInWei(tokenContractAddress) {
  var tokenBalance = ''; 
   try {
    const senderAddress = await web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address;
    const tokenRouter = new web3.eth.Contract(tokenAbi,tokenContractAddress.toLowerCase());

    tokenBalance = await tokenRouter.methods.balanceOf(senderAddress).call();

    const tokenDecimals = await tokenRouter.methods.decimals().call();

    if(tokenDecimals === "9")
    {
        tokenBalance = web3.utils.fromWei(tokenBalance, "gwei");
    }
    else
    {
        tokenBalance = web3.utils.fromWei(tokenBalance, "ether");
    }
    //console.log ("utils: getTokenBalanceInWei:" + tokenBalance);
  }
  catch(error)
  {
    console.log("utils getTokenBalanceInWei Exception: " + error); 
  }
  return tokenBalance;
}

export function utilsSetApproveTokenTxnStatus(status) {
  txnStatus.approvalStatus = status;
}
export function utilsGetApproveTokenTxnStatus() {
  return txnStatus.approvalStatus;
}

export function utilsSetSnipeTokenTxnStatus(status) {
  txnStatus.snipingStatus = status;
}
export function utilsGetSnipeTokenTxnStatus() {
  return txnStatus.snipingStatus;
}

export function utilsSetBuyTokenTxnStatus(status) {
  txnStatus.buyStatus = status;
}
export function utilsGetBuyTokenTxnStatus() {
  return txnStatus.buyStatus;
}

export function utilsSetSellTokenTxnStatus(status) {
  txnStatus.sellStatus = status;
}
export function utilsGetSellTokenTxnStatus() {
  return txnStatus.sellStatus;
}

export function utilsSetTransferTokenTxnStatus(status) {
  txnStatus.transferStatus = status;
}
export function utilsGetTransferTokenTxnStatus() {
  return txnStatus.transferStatus;
}

export async function getContractObject() {
  var contractObject = "";
  if (
    BLOCKCHAIN_CHAIN_ID_NETWORK.ETH_MAINNET === BLOCKCHAIN_CHAIN_ID ||
    BLOCKCHAIN_CHAIN_ID_NETWORK.ETH_GOERILI === BLOCKCHAIN_CHAIN_ID
  ) 
  {
    contractObject = await new web3.eth.Contract(
      UNISWAP_CONTRACT_ABI,
      ROUTER_CONTRACT_ADDRESS
    );
  } 
  else if (
    BLOCKCHAIN_CHAIN_ID_NETWORK.BSC_MAINNET === BLOCKCHAIN_CHAIN_ID ||
    BLOCKCHAIN_CHAIN_ID_NETWORK.BSC_TESTNET === BLOCKCHAIN_CHAIN_ID) 
  {
    contractObject = await new web3.eth.Contract(
      PANCAKE_CONTRACT_ABI,
      ROUTER_CONTRACT_ADDRESS
    );
  }

  return contractObject;
}

export async function getCurrentGasPrice(customGasPrice) {
  var realGasPrice = 0;
  try {
      if (customGasPrice) {
        realGasPrice = customGasPrice * 1000000000;
      } else {
        var gasPriceMultiplier = BLOCKCHAIN_GAS_PRICE_MULTIPLIER; 
        if(gasPriceMultiplier === 0)
        {
          gasPriceMultiplier = 1; 
        }
        realGasPrice = await web3.eth.getGasPrice() ;
        console.log("current gas Price: " + realGasPrice + " Gas Multiplier: " + gasPriceMultiplier); 
        
        realGasPrice*= gasPriceMultiplier;
      }
  }
  catch(error)
  {
    console.log("utils getCurrentGasPrice Exception: " + error); 
  }
  
  realGasPrice = Math.round(realGasPrice);
  return realGasPrice;
}

export async function getSwapPair(address1, tokenContractAddress) {
  var tokenRouter = '';
  var pairAddress = ''; 
  try {
    if (
      BLOCKCHAIN_CHAIN_ID_NETWORK.ETH_MAINNET === BLOCKCHAIN_CHAIN_ID ||
      BLOCKCHAIN_CHAIN_ID_NETWORK.ETH_GOERILI === BLOCKCHAIN_CHAIN_ID
    ) {
      tokenRouter = new web3.eth.Contract(
        routerFactoryABI,
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f".toLowerCase()
      );
    } else if (BLOCKCHAIN_CHAIN_ID_NETWORK.BSC_MAINNET === BLOCKCHAIN_CHAIN_ID) {
      tokenRouter = new web3.eth.Contract(
        routerFactoryABI,
        "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73".toLowerCase()
      );
    } else if (BLOCKCHAIN_CHAIN_ID_NETWORK.BSC_TESTNET === BLOCKCHAIN_CHAIN_ID) {
      tokenRouter = new web3.eth.Contract(
        routerFactoryABI,
        "0x6725F303b657a9451d8BA641348b6761A6CC7a17".toLowerCase()
      );
    }

    pairAddress = await tokenRouter.methods.getPair(address1, tokenContractAddress).call();
  }
  catch(error)
  {
    console.log("utils getSwapPair Exception: " + error); 
  }
  return pairAddress;
}

export function getTransactionDeadline() {
  const deadline = web3.utils.toHex(Math.round(Date.now() / 1000) + 60 * TRANSACTION_DEADLINE);
  return deadline;
}
