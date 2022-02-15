import {
    BASE_TOKEN_CONTRACT_ADDRESS,
    BUSD_CONTRACT_ADDRESS,
} from "./constants";
import { getContractObject } from "./blockchain/utils";
import web3 from "./blockchain/web3";
const tokenAbi = [
    {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    }
];

async function calcSell(tokensToSell, tokenAddres) {
    //const tokenRouter = new ethers.Contract(tokenAddres, ERC20ABI);
    const tokenRouter = await new web3.eth.Contract(
        tokenAbi,
        tokenAddres.toLowerCase()
    );
    let tokenDecimals = await tokenRouter.methods.decimals().call();
    //const symbol = await tokenRouter.methods.symbol().call();
    //console.log ("Token:" + symbol);
    //console.log ("tokenDecimals:" + tokenDecimals);

    tokensToSell = setDecimals(tokensToSell, tokenDecimals);
    let amountOut;
    try {
        const router = await getContractObject();
        amountOut = await router.methods.getAmountsOut(tokensToSell, [tokenAddres, BASE_TOKEN_CONTRACT_ADDRESS]).call();
        amountOut = web3.utils.fromWei(amountOut[1]);
    } catch (error) {
        console.log("tokenPrice: calcSell - Exception: " + error);
    }

    if (!amountOut) return 0;
    return amountOut;
}
async function calcBNBPrice(kTokenContractAddress) {
    let bnbToSell = await web3.utils.toWei("1", "ether");
    let amountOut;
    const pairAddress = [BASE_TOKEN_CONTRACT_ADDRESS, kTokenContractAddress];
    try {
        const router = await getContractObject();
        amountOut = await router.methods.getAmountsOut(bnbToSell, pairAddress).call();
        amountOut = web3.utils.fromWei(amountOut[1]);
    } catch (error) {
        console.log("tokenPrice: calcBNBPrice-Exception ", error);
    }
    if (!amountOut) {
        return 0;
    }
    return amountOut;
}
function setDecimals(number, decimals) {
    number = number.toString();
    let numberAbs = number.split(".")[0];
    let numberDecimals = number.split(".")[1] ? number.split(".")[1] : "";
    while (numberDecimals.length < decimals) {
        numberDecimals += "0";
    }
    return numberAbs + numberDecimals;
}

export async function getTokenPrice(kTokenContractAddress) {
    var currentPrice = []; 
    //console.log("Monitor token Contract address: ", kTokenContractAddress);
    let bnbPrice = await calcBNBPrice(BUSD_CONTRACT_ADDRESS);
    let tokens_to_sell = 1;
    let priceInBnb = (await calcSell(tokens_to_sell, kTokenContractAddress.toLowerCase())) / tokens_to_sell;
    const priceInUSD = (priceInBnb * bnbPrice).toFixed(18);
    // console.log( 'SHIT_TOKEN VALUE IN BNB : ' + priceInBnb + ' | Just convert it to USD ' );
    //console.log(` VALUE IN USD: ${priceInUSD}`); // convert the token price from BNB to USD based on the retrived BNB value
    console.log(`*********CURRENT BNB PRICE: ${bnbPrice} CURRENT TOKEN IN USD: ${priceInUSD} ************`);

    currentPrice[0] = bnbPrice; 
    currentPrice[1] = priceInUSD; 
    return currentPrice;
}
