import "./SnipingContract.css";

import { useState } from "react";
import Button from "./Button";
import web3 from "./blockchain/web3";
import TokenSymbol from "./TokenSymbol";
import ContractTextField from "./ContractTextField";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { getTokenPrice } from "./tokenPrice";

import {
  getNetworkGasPrice,
  getCurrentGasPrice,
  getContractObject,
  getTransactionDeadline,
  getTokenBalanceInWei,
  getTokenBalanceHumanReadable
} from "./blockchain/utils";
import TransactionStatus from "./TransactionStatus";
import {
  WALLET_PRIVATE_KEY,
  ROUTER_CONTRACT_ADDRESS,
  BASE_TOKEN_CONTRACT_ADDRESS,
  BLOCKCHAIN_BLOCK_EXPLORER,
  TRANSACTION_STATUS,
  POLLING_BLOCKCHAIN_INTERVAL,
} from "./constants";
import { utilsSetSnipeTokenTxnStatus, getWeb3Object, utilsSetSellTokenTxnStatus } from "./blockchain/utils";
import Typography from "@mui/material/Typography";

let intervalID = ''; 
function SnipingContract() {

  let contractAddress = ''; 
  const [inputs, setInputs] = useState({
    contractAddress: "",
    noOfTokensToBuy: '0.1',
    snipingTimerID: 0,
    slippage: 10,
    noOfX: 10,
    qtyPercentageToSell:100,
    delayedSell:60,
    checked:true
  });
  const [currentToken, setTokenProperty] = useState({
    initialPrice: 0,
    noOfXReached: 0,
    targetPrice: 0,
  });
  const [monitorPriceTimerID, setMonitorPriceTimerID] = useState(0);
  const [delayedSellTimerID, setDelayedSellTimerID] = useState(0);


  const [walletInfo, setWalletInfo] = useState({
    senderAddress: "",
    contractID: "",
    snipingTargetTokenQty: 0,
  });

  const [visibleSnipe, setVisibleSnipe] = useState(true);
  const [visibleSnipeAndSell, setVisibleSnipeAndSell] = useState(true);
  

  const [transactionHash, setTransactionHash] = useState({confirmedHash: "",
  });
  const [transactionStatus, setTransactionStatus] = useState({status: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
  });

  const [timerID, setTimerID] = useState({snipeTokenTimerID: 0,
  });
  const [swapToken] = useState({
    tokenLoss: "",
    guarnteedToken: "",
    recvdToken: "",
  });
   const [tokenCurrentPrice, setTokenCurrentPrice] = useState(0);

  const handleChange = (event) => {
    const value = event.target.value;
    setInputs({...inputs,[event.target.name]: value,});
  };

 function handleCheckBox(event) 
{
  event.preventDefault();
  setInputs({ ...inputs, checked: !inputs.checked });
}

async function handleSnipe(event) 
{
    event.preventDefault();
    setVisibleSnipe((visibleSnipe) => !visibleSnipe);
    getTokenInfo(); 

    if (visibleSnipe)
     {
      console.log("Snipper Started ");
      const address =web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address.toLowerCase();
      console.log("Wallet Address:" + address);
      walletInfo.senderAddress = address;
      setTransactionHash({ confirmedHash: "" });
      setSnipingTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS);
      walletInfo.contractID = await getContractObject();
      const intervalID = setInterval(startSnipeToken, POLLING_BLOCKCHAIN_INTERVAL.INTERVAL_SNIPING_CONTRACT);
      timerID.snipeTokenTimerID = intervalID;
      setTimerID(timerID, intervalID);
    } 
    else 
    {
      console.log("Stopped Snipper ");
      setSnipingTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_NOT_STARTED);
      clearInterval(timerID.snipeTokenTimerID);
    }
}

async function handleSnipeAndSell(event) 
{
   event.preventDefault();
   setVisibleSnipeAndSell((visibleSnipeAndSell) => !visibleSnipeAndSell);
   var timeInSeconds = parseInt(inputs.delayedSell);
  if (0 === inputs.noOfX.length)
  {
    inputs.noOfX = "0"; 
  }
  const tmpX = parseInt(inputs.noOfX);
  setInputs({ ...inputs, noOfX: tmpX });
  getTokenInfo(); 

  
   if(visibleSnipeAndSell)
   {      
      const tmpInitialPrice  = await getTokenPrice(contractAddress);
      setTokenCurrentPrice(tmpInitialPrice[1]); 
      const tokenInitPrice = tmpInitialPrice[1]; 
      setTokenProperty({ ...currentToken, initialPrice: tokenInitPrice });
      currentToken.initialPrice = tokenInitPrice;
      console.log("Snipper Started ");
      const address =web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address.toLowerCase();
      console.log("Wallet Address:" + address);
      walletInfo.senderAddress = address;
      setTransactionHash({ confirmedHash: "" });
      setSnipingTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS);
      walletInfo.contractID = await getContractObject();
      
      intervalID = setInterval(async function(){
      if(await startSnipeToken())
      {
        clearInterval(intervalID); 
        if (timeInSeconds)
        {
          timeInSeconds *= 1000;
          console.log("Delaying Sell Token in " + inputs.delayedSell + " seconds");
          const tmpTimerID = setTimeout(delayTimerExpiredStartSellToken, timeInSeconds);
          setDelayedSellTimerID(tmpTimerID);
        }      
        else if (tmpX === 0) 
        {
          setTokenProperty({ ...currentToken, targetPrice: tokenInitPrice });
          startSellToken();
        } 
        else 
        {
          const tmpTargetPrice = tmpX * tokenInitPrice;
          currentToken.targetPrice = tmpTargetPrice;
          setTokenProperty({ ...currentToken, targetPrice: tmpTargetPrice });
          monitorTokenPrice();
          const intervalID = setInterval(monitorTokenPrice, POLLING_BLOCKCHAIN_INTERVAL.INTERVAL_SELL_CONTRACT);
          setMonitorPriceTimerID(intervalID);
        }

      }
      }, POLLING_BLOCKCHAIN_INTERVAL.INTERVAL_SNIPING_CONTRACT);

  }
  else 
  {     
    if (timeInSeconds !== 0) 
    {
      console.log("Delayed Sell Stopped");
      clearInterval(intervalID);
      clearTimeout(delayedSellTimerID);
      setInputs({ ...inputs, delayedSell: 0 });
    }
    if (tmpX !== 0) 
    {
      console.log("No of X  Sell Stopped");
      clearInterval(monitorPriceTimerID);
      //setInputs({ ...inputs, noOfX: 0 });
    }
    setSellTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_NOT_STARTED);
  }
}

function delayTimerExpiredStartSellToken() 
{
    console.log("Timer Expired Sell will trigger");
    startSellToken();
    setInputs({ ...inputs, delayedSell: 0 });
}

  async function getTokenInfo()
  {
    contractAddress = web3.utils.toChecksumAddress(inputs.contractAddress).toLowerCase();
  }

  async function startSnipeToken() {
    const bResult = await isTokenLaunched();
    if (bResult) 
    {
      console.log(" isTokenLaunched:" + (bResult ? "YES" : "NO"));
      setVisibleSnipe(visibleSnipe, true);
      //console.log("Token Snipped Successfully... " + timerID.snipeTokenTimerID);
      clearInterval(timerID.snipeTokenTimerID);
    }
    return bResult; 
  }

  async function isTokenLaunched() 
  {
    try 
    {
        var bResult = false;
        
        const routerPair = [BASE_TOKEN_CONTRACT_ADDRESS, contractAddress];
        const amountsOutResult = await walletInfo.contractID.methods.getAmountsOut(web3.utils.toWei(inputs.noOfTokensToBuy.toString(), "ether"), routerPair).call();
        var amountOut = amountsOutResult[1];
        if (amountOut > 0)
        {
          clearInterval(timerID.snipeTokenTimerID);
          bResult = true;
          console.log("Trading pair is active.");
          const bnbTokenInReserve = web3.utils.fromWei(amountsOutResult[0]);
          const newTokenInReserve = web3.utils.fromWei(amountsOutResult[1]);

          setWalletInfo({...walletInfo,snipingTargetTokenQty: newTokenInReserve});

          console.log("Token: " + newTokenInReserve + "BNB: " + bnbTokenInReserve);

          const slippageLoss = inputs.slippage / 100;

          const lossOfTokenDueToSlippage = newTokenInReserve * slippageLoss;
          var amountIN = newTokenInReserve - lossOfTokenDueToSlippage;
          var BN1 = web3.utils.BN;
          var amountOutHex = new BN1(amountIN).toString();
          console.log("Liquidity Reserve [BNB][NewToken]: " +bnbTokenInReserve +" NewToken[]: " +newTokenInReserve);
          console.log(" Might Loss of Tokens due to Slippage: " + lossOfTokenDueToSlippage," Guaranteed in Wallet: " + amountIN);
          console.log("No of Tokens to Swap: " + amountOutHex);

          amountOutHex = web3.utils.toWei(amountOutHex);

          var data = await walletInfo.contractID.methods.swapExactETHForTokensSupportingFeeOnTransferTokens(/*swapETHForExactTokens*/ web3.utils.toHex(amountOutHex), routerPair, walletInfo.senderAddress, getTransactionDeadline());

          const count = await web3.eth.getTransactionCount(walletInfo.senderAddress);

          const realGasPrice = await getCurrentGasPrice(false);

          const newValue = await getNetworkGasPrice(realGasPrice, inputs.noOfTokensToBuy);

          var rawTransaction = {
            from: walletInfo.senderAddress,
            to: ROUTER_CONTRACT_ADDRESS,
            gasPrice: web3.utils.toHex(realGasPrice),
            gasLimit: web3.utils.toHex(1500000),
            data: data.encodeABI(),
            nonce: web3.utils.toHex(count),
            value: web3.utils.toHex(newValue),
          };

          const signedTx = await web3.eth.accounts.signTransaction(rawTransaction, WALLET_PRIVATE_KEY);

          await web3.eth
            .sendSignedTransaction(signedTx.rawTransaction)
            .once("sending", function (payload) {
              console.log("txn sending: " + payload);
            })
            .once("sent", function (payload) {
              console.log("txn sent: " + payload);
            })
            .once("transactionHash", function (hash) {
              console.log(
                "txn transactionHash: " + BLOCKCHAIN_BLOCK_EXPLORER + hash
              );
              setTransactionHash({
                confirmedHash: BLOCKCHAIN_BLOCK_EXPLORER + hash,
              });
            })
            .once("receipt", function (receipt) {
              console.log("txn receipt: " + receipt);
            })
            .once("confirmation", function (confNumber, receipt, latestBlockHash) {
              console.log("txn confirmation: " + confNumber + " receipt" + receipt);
            })
            .on("error", function (error) {
              console.log("OnError: " + error);
              setSnipingTokenTxnStatus(
                TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED
              );
            })
            .then(function (receipt) {
              console.log("confirmed receipt: " + receipt.status);
              if (receipt.status) {
                setSnipingTokenTxnStatus(
                  TRANSACTION_STATUS.TRANSACTION_COMPLETE_SUCCESS
                );
              } else {
                setSnipingTokenTxnStatus(
                  TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED
                );
              }
            })
            .catch(function (error) {
              console.log("exception");
              setSnipingTokenTxnStatus(
                TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION
              );
            });
        }
    }
    catch(error)
    {
      console.log("isTokenLaunched: Exception: " + error); 
    }
    return bResult;
  }

  async function isTokenReachedExpectedTargetPrice(kNoOfX, kTokenPriceBeforeMonitor) 
{
    var result = false;
    const currentTokenPriceInUSD = await getTokenPrice(contractAddress);
    const tmpTokenCurrentPrice = currentTokenPriceInUSD[1];
    setTokenCurrentPrice(tmpTokenCurrentPrice); 
    //console.log("currentTokenPriceInUSD : ", tokenCurrentPrice);
    var targetSellPrice = tmpTokenCurrentPrice * parseInt(kNoOfX);
    console.log("isTokenReachedExpectedPrice: CurrentPrice: " +tmpTokenCurrentPrice +" TargetPrice: " +targetSellPrice + " TokenPriceBeforeMonitor: " +kTokenPriceBeforeMonitor);
    
    if (kTokenPriceBeforeMonitor >= targetSellPrice) 
    {
      result = true;
    }
    const tmpNoOfX = tmpTokenCurrentPrice / kTokenPriceBeforeMonitor - 1;
    setTokenProperty({ ...currentToken, noOfXReached: tmpNoOfX });
    return result;
}

async function monitorTokenPrice() 
{
    //console.log("monitorTokenPrice --->");
    const bResult = await isTokenReachedExpectedTargetPrice(inputs.noOfX, currentToken.initialPrice);
    if (bResult) {
      startSellToken();
      clearInterval(monitorPriceTimerID);
      //setInputs({ ...inputs, noOfX: 0 });
    }
}

async function updateSlippageLossToken(sellTokenContractID)
{
    var amountIn = '';
    var amountOutMinInNo = ''; 
    try 
    {
      //const inputTokenInWei = await web3.utils.toWei( inputs.noOfTokensToSell.toString(), "ether");
      let inputTokenInWei = await getTokenBalanceHumanReadable(contractAddress); 
      //let inputTokenInWei ; 
      const tokenRouter = await getWeb3Object(contractAddress.toString());
      const tokenDecimals = await tokenRouter.methods.decimals().call();

      inputs.noOfTokensToSell = inputTokenInWei;
       if(tokenDecimals === "9")
      {
          inputTokenInWei = web3.utils.toWei(inputs.noOfTokensToSell.toString(), "gwei");
      }
      else
      {
          inputTokenInWei = web3.utils.toWei(inputs.noOfTokensToSell.toString(), "ether");
      }
    
      console.log("Nof of Tokens to Sell: " +inputs.noOfTokensToSell +" Slippage(%): " +inputs.slippage);

      const amount_out = await sellTokenContractID.methods.getAmountsOut(inputTokenInWei, [contractAddress, BASE_TOKEN_CONTRACT_ADDRESS]).call();
      const newTokenInReserve = web3.utils.fromWei(amount_out[0]);
      const bnbTokenInReserve = web3.utils.fromWei(amount_out[1]);
      amountIn = amount_out[0];
      var slippageLoss = (amount_out[1] * inputs.slippage) / 100;
      slippageLoss = Math.round(slippageLoss);

      amountOutMinInNo = amount_out[1] - slippageLoss;
     

      const slippageLossReadable = web3.utils.fromWei(slippageLoss.toString());
      const amountAmountAfterSlippage = amountOutMinInNo.toString();

      

      const currentTokenPriceInUSD = await getTokenPrice(contractAddress);
      const curBNBPrice = currentTokenPriceInUSD[0];
      const curTokenPrice = currentTokenPriceInUSD[1];
      const totalTokenPrice = curTokenPrice * inputs.noOfTokensToSell; 

      swapToken.guarnteedToken = ((totalTokenPrice/curBNBPrice) - (((newTokenInReserve * inputs.slippage) / 100) * curTokenPrice / curBNBPrice ) )* inputs.noOfX;
      swapToken.recvdToken = (totalTokenPrice/curBNBPrice) * inputs.noOfX;
      swapToken.tokenLoss = swapToken.recvdToken - swapToken.guarnteedToken;

      console.log("Liquidity Reserve [NewToken][BNB]: " + newTokenInReserve + " NewToken[]: " + bnbTokenInReserve);
      console.log(" Might Loss of Tokens due to Slippage: " + slippageLossReadable +" Guaranteed in Wallet: " +web3.utils.fromWei(amountAmountAfterSlippage) +" TotalSwapBNB: " +bnbTokenInReserve);
    } 
    catch (error) {
      console.log("updateSlippageLossToken: Exception: " + error);
      amountIn = 0; 
      amountOutMinInNo = 0; 
    }

    return [amountIn, amountOutMinInNo];
  }

  

  async function startSellToken() 
  {
    try 
    {
      const pairAddress = [contractAddress, BASE_TOKEN_CONTRACT_ADDRESS];
      const sellTokenContract = await getContractObject();

      const senderAddress = await web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address;
      console.log("Sell Token Wallet Address: " + senderAddress);

      var swapAmount = [0, 0];
      swapAmount = await updateSlippageLossToken(sellTokenContract);

      if( swapAmount[0] > 0)
      {

          const data =await sellTokenContract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
              web3.utils.toHex(swapAmount[0]),
              web3.utils.toHex(swapAmount[1]),
              pairAddress,
              senderAddress,
              getTransactionDeadline()
            );
        
          const realGasPrice = await getCurrentGasPrice(false);

          const count = await web3.eth.getTransactionCount(senderAddress);
          const rawTransaction = {
            from: senderAddress,
            to: ROUTER_CONTRACT_ADDRESS,
            gasPrice: web3.utils.toHex(realGasPrice),
            gasLimit: web3.utils.toHex(1500000),
            data: data.encodeABI(),
            nonce: web3.utils.toHex(count),
          };

          const signed_txn = await web3.eth.accounts.signTransaction(rawTransaction, WALLET_PRIVATE_KEY);
          await web3.eth.sendSignedTransaction(signed_txn.rawTransaction)
            .once("sending", function (payload) {
              console.log("txn sending: " + payload);
            })
            .once("sent", function (payload) {
              console.log("txn sent: " + payload);
            })
            .once("transactionHash", function (hash) {
              console.log( "txn transactionHash: " + BLOCKCHAIN_BLOCK_EXPLORER + hash);
              setTransactionHash({confirmedHash: BLOCKCHAIN_BLOCK_EXPLORER + hash});
            })
            .once("receipt", function (receipt) {
              console.log("txn receipt: " + receipt);
            })
            .once("confirmation", function (confNumber, receipt) {
              console.log("txn confirmation: " + confNumber + " receipt" + receipt);
            })
            .on("error", function (error) {
              console.log("OnError: " + error);
              setSellTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED);
            })
            .then(function (receipt) {
              console.log("confirmed receipt: " + receipt.status);
              if (receipt.status) {
                setSellTokenTxnStatus(
                  TRANSACTION_STATUS.TRANSACTION_COMPLETE_SUCCESS
                );
              } else {
                setSellTokenTxnStatus(
                  TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED
                );
              }
              setVisibleSnipe(visibleSnipe, true);
            })
            .catch(function (error) {
              console.log("exception: " + error);
              setSellTokenTxnStatus(
                TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION
              );
              setVisibleSnipe(visibleSnipe, true);
            });
         }        
    }
    catch (error) 
    {
      setSellTokenTxnStatus(TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION);
      setVisibleSnipe(visibleSnipe, true);
      console.log("startSellToken-Exception: " + error);
    }
  }



  function setSnipingTokenTxnStatus(txnStatus)
  {
    setTransactionStatus({ status: txnStatus });
    utilsSetSnipeTokenTxnStatus(txnStatus);
  }

  function setSellTokenTxnStatus(txnStatus) 
  {
    setTransactionStatus({ status: txnStatus });
    utilsSetSellTokenTxnStatus(txnStatus);
  }
  return (
    <>
      <div>
        <br />
        <Typography variant="h6" component="div" gutterBottom>
          <ContractTextField
            onChange={handleChange}
            title="Snipe Token Contract Address"
            name="contractAddress"
          />
          <br />
          <br />
          {inputs.contractAddress.length === 42 && (
            <div>
              <ContractTextField
                onChange={handleChange}
                title="Quantity of BNB to Snipe"
                name="noOfTokensToBuy"
                value={inputs.noOfTokensToBuy}
              />
              <br /> <br />
              <ContractTextField
                onChange={handleChange}
                title="Transaction Slippage (%)"
                name="slippage"
                value={inputs.slippage}
              />
          <br /> <br />
          <ContractTextField
                onChange={handleChange}
                title="Number of X to sell"
                name="noOfX"
                value={inputs.noOfX}
              />
              <br /> <br />
              <ContractTextField
                onChange={handleChange}
                title="Quantity(%) to sell"
                name="noOfX"
                value={inputs.qtyPercentageToSell}
              />
              <br /> 
              <FormGroup>
                <FormControlLabel
                  label="Enable Delayed Sell"
                  control={
                    <Checkbox
                      checked={inputs.checked}
                      onChange={handleCheckBox}
                    />
                  }
                />
               
                {inputs.checked === true && (
                  <div>
                    <br />
                    <ContractTextField
                      onChange={handleChange}
                      title="Delayed Sell in Seconds"
                      name="delayedSell"
                      value={inputs.delayedSell}
                    />
                  </div>
                )}
              </FormGroup>
               </div>
                )}
          {inputs.contractAddress.length === 42 &&
            inputs.noOfTokensToBuy !== 0 && (
              <div>
              <Button
                OnClick={handleSnipe}
                title={visibleSnipe ? "Start Snipe" : "Stop Snipe"}
              />
              <Button
                OnClick={handleSnipeAndSell}
                title={visibleSnipeAndSell ? "Start Snipe&Sell" : "Stop Snipe&Sell"}
              />
              </div>
            )}
          
          {transactionStatus.status !==
            TRANSACTION_STATUS.TRANSACTION_NOT_STARTED && (
            <label>
              Sniping Contract Address: {inputs.contractAddress}
              <br /> <br />
              Current Sniping Token (
              <TokenSymbol tokenAddress={inputs.contractAddress} />) :{" "}
              {walletInfo.snipingTargetTokenQty}
              <TransactionStatus status={transactionStatus.status} />
              Transaction Hash:
              <a
                href={transactionHash.confirmedHash}
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                {transactionHash.confirmedHash}{" "}
              </a>
            </label>
          )}
        </Typography>
      </div>
    </>
  );
}

export default SnipingContract;
