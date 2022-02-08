import "./SellToken.css";
import { getTokenPrice } from "./tokenPrice";
import { getTokenBalanceHumanReadable } from "./blockchain/utils";
import { useState } from "react";
import web3 from "./blockchain/web3";
import Button from "./Button";
import TokenSymbol from "./TokenSymbol";
import TokenBalance from "./TokenBalance";
import TransactionStatus from "./TransactionStatus";
import ContractTextField from "./ContractTextField";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import {
  WALLET_PRIVATE_KEY,
  ROUTER_CONTRACT_ADDRESS,
  BASE_TOKEN_CONTRACT_ADDRESS,
  BLOCKCHAIN_BLOCK_EXPLORER,
  TRANSACTION_STATUS,
  POLLING_BLOCKCHAIN_INTERVAL,
} from "./constants";
import {
  utilsSetSellTokenTxnStatus,
  getContractObject,
  getCurrentGasPrice,
  getSwapPair,
  getTransactionDeadline,
} from "./blockchain/utils";

function SellToken(props) {
  const [inputs, setInputs] = useState({
    contractAddress: "",
    noOfTokensToSell: 0,
    noOfX: 0,
    slippage: 10,
    delayedSell: 0,
    checked: false,
  });
  const [monitorPriceTimerID, setMonitorPriceTimerID] = useState(0);
  const [delayedSellTimerID, setDelayedSellTimerID] = useState(0);

  const [currentToken, setTokenProperty] = useState({
    initialPrice: 0,
    ticker: "",
    qtyToBuy: 0,
    decimals: 0,
    symbol: "",
    startSell: false,
    maxAvailable: 0,
    targetPrice: 0,
    noOfXReached: 0,
    currentPrice: 0,
  });
  const [swapToken] = useState({
    tokenLoss: "",
    guarnteedToken: "",
    recvdToken: "",
  });

  const [transactionHash, setTransactionHash] = useState({
    confirmedHash: "",
  });
  const [transactionStatus, setTransactionStatus] = useState({
    status: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
  });

  const [tokenBalance, setTokenBalance] = useState(0);
  const [visible, setVisible] = useState(true);
  var contract_id = "";

  const handleChange = (event) => {
    const value = event.target.value;
    setInputs({
      ...inputs,
      [event.target.name]: value,
    });
  };

  async function handleGetBalance(event) {
    event.preventDefault();
    const tokenBalance = await getTokenBalanceHumanReadable(
      inputs.contractAddress
    );
    inputs.noOfTokensToSell = tokenBalance;
    setTokenProperty({ ...currentToken, maxAvailable: tokenBalance });
    setInputs({ ...inputs, noOfTokensToSell: tokenBalance });
  }

  function handleCheckBox(event) {
    event.preventDefault();
    setInputs({ ...inputs, checked: !inputs.checked });
  }

  async function handletSellButton(event) {
    event.preventDefault();
    setVisible((visible) => !visible);
    if (visible) {
      setTransactionHash({ confirmedHash: "" });
      setSellTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS);
      const tmpInitialPrice = await getTokenPrice(inputs.contractAddress);
      setTokenProperty({ ...currentToken, initialPrice: tmpInitialPrice });
      const tmpX = parseInt(inputs.noOfX);
      setInputs({ ...inputs, noOfX: tmpX });
      currentToken.initialPrice = tmpInitialPrice;
      contract_id = await web3.utils
        .toChecksumAddress(inputs.contractAddress)
        .toLowerCase();

      const pairValid = await getSwapPair(
        BASE_TOKEN_CONTRACT_ADDRESS,
        contract_id
      );

      if (0 >= tmpInitialPrice) {
        console.log("Price Calculation is wrong: " + tmpInitialPrice);
        setSellTokenTxnStatus(
          TRANSACTION_STATUS.TRANSACTION_COMPLETE_EXCEPTION
        );
        setVisible(visible, true);
        return;
      }

      if (web3.utils.toBN(pairValid).isZero()) {
        console.log("Pair Invalid: " + pairValid);
        setSellTokenTxnStatus(
          TRANSACTION_STATUS.TRANSACTION_COMPLETE_EXCEPTION
        );
        setVisible(visible, true);
        return;
      }

      const sellTokenContract = await getContractObject();
      await updateSlippageLossToken(sellTokenContract);
      var timeInSeconds = parseInt(inputs.delayedSell);
      if (timeInSeconds) {
        timeInSeconds *= 1000;
        console.log(
          "Delaying Sell Token in " + inputs.delayedSell + " seconds"
        );
        const tmpTimerID = setTimeout(
          delayTimerExpiredStartSellToken,
          timeInSeconds
        );
        setDelayedSellTimerID(tmpTimerID);
      } else if (tmpX === 0) {
        setTokenProperty({ ...currentToken, targetPrice: tmpInitialPrice });
        startSellToken();
      } else {
        const tmpTargetPrice = tmpX * tmpInitialPrice;
        currentToken.targetPrice = tmpTargetPrice;
        setTokenProperty({ ...currentToken, targetPrice: tmpTargetPrice });
        monitorTokenPrice();
        const intervalID = setInterval(
          monitorTokenPrice,
          POLLING_BLOCKCHAIN_INTERVAL.INTERVAL_SELL_CONTRACT
        );
        setMonitorPriceTimerID(intervalID);
      }
    } else {
      const tmpX = parseInt(inputs.noOfX);
      if (inputs.delayedSell !== 0) {
        console.log("Delayed Sell Stopped");
        clearTimeout(delayedSellTimerID);
        setInputs({ ...inputs, delayedSell: 0 });
      }
      if (tmpX !== 0) {
        console.log("No of X  Sell Stopped");
        clearInterval(monitorPriceTimerID);
        setInputs({ ...inputs, noOfX: 0 });
      }

      setSellTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_NOT_STARTED);
    }
  }
  function delayTimerExpiredStartSellToken() {
    console.log("Timer Expired Sell will trigger");
    startSellToken();
    setInputs({ ...inputs, delayedSell: 0 });
  }

  async function isTokenReachedExpectedTargetPrice(
    kNoOfX,
    kTokenPriceBeforeMonitor
  ) {
    var result = false;
    const currentTokenPriceInUSD = await getTokenPrice(contract_id);
    currentToken.currentPrice = currentTokenPriceInUSD;
    //console.log("currentTokenPriceInUSD : ", currentTokenPriceInUSD);
    var targetSellPrice = currentTokenPriceInUSD * parseInt(kNoOfX);
    console.log(
      "isTokenReachedExpectedTargetPrice: " +
        currentTokenPriceInUSD +
        " TargetPrice: " +
        targetSellPrice +
        " kTokenPriceBeforeMonitor: " +
        kTokenPriceBeforeMonitor
    );
    if (kTokenPriceBeforeMonitor >= targetSellPrice) {
      result = true;
    }
    const tmpNoOfX = currentTokenPriceInUSD / kTokenPriceBeforeMonitor - 1;
    setTokenProperty({ ...currentToken, noOfXReached: tmpNoOfX });
    return result;
  }
  async function monitorTokenPrice() {
    //console.log("monitorTokenPrice --->");
    const bResult = await isTokenReachedExpectedTargetPrice(
      inputs.noOfX,
      currentToken.initialPrice
    );
    if (bResult) {
      startSellToken();
      clearInterval(monitorPriceTimerID);
      setInputs({ ...inputs, noOfX: 0 });
    }
  }

  async function updateSlippageLossToken(sellTokenContractID) {
    var amountIn = "";
    try {
      const inputTokenInWei = await web3.utils.toWei(
        inputs.noOfTokensToSell,
        "ether"
      );
      console.log(
        "Nof of Tokens to Sell: " +
          inputs.noOfTokensToSell +
          " Slippage(%): " +
          inputs.slippage
      );

      const amount_out = await sellTokenContractID.methods
        .getAmountsOut(inputTokenInWei, [
          contract_id,
          BASE_TOKEN_CONTRACT_ADDRESS,
        ])
        .call();
      const newTokenInReserve = web3.utils.fromWei(amount_out[0]);
      const bnbTokenInReserve = web3.utils.fromWei(amount_out[1]);

      amountIn = amount_out[0];
      var slippageLoss = (amount_out[1] * inputs.slippage) / 100;
      slippageLoss = Math.round(slippageLoss);

      var amountOutMinInNo = amount_out[1] - slippageLoss;
      //amountOutMinInNo = Math.round(amountOutMinInNo);
      //var BN1 = web3.utils.BN;
      //amountOutMinInNo = new BN1(amountOutMinInNo);

      const slippageLossReadable = web3.utils.fromWei(slippageLoss.toString());
      const amountAmountAfterSlippage = amountOutMinInNo.toString();

      //setSwaptoken({ ...swapToken, guarnteedToken: amountAmountAfterSlippage });
      //setSwaptoken({ ...swapToken, recvdToken: bnbTokenInReserve });
      //setSwaptoken({ ...swapToken, tokenLoss: slippageLossReadable });

      swapToken.guarnteedToken = web3.utils.fromWei(amountAmountAfterSlippage);
      swapToken.recvdToken = bnbTokenInReserve;
      swapToken.tokenLoss = slippageLossReadable;

      console.log(
        "Liquidity Reserve [NewToken][BNB]: " +
          newTokenInReserve +
          " NewToken[]: " +
          bnbTokenInReserve
      );
      console.log(
        " Might Loss of Tokens due to Slippage: " +
          slippageLossReadable +
          " Guaranteed in Wallet: " +
          web3.utils.fromWei(amountAmountAfterSlippage) +
          " TotalSwapBNB: " +
          bnbTokenInReserve
      );
    } catch (error) {
      console.log("updateSlippageLossToken: Exception: " + error);
    }

    return [amountIn, amountOutMinInNo];
  }

  async function startSellToken() {
    try {
      const pairAddress = [contract_id, BASE_TOKEN_CONTRACT_ADDRESS];
      const sellTokenContract = await getContractObject();

      const senderAddress = await web3.eth.accounts.privateKeyToAccount(
        WALLET_PRIVATE_KEY
      ).address;
      console.log("Sell Token Wallet Address: " + senderAddress);

      var swapAmount = [0, 0];
      swapAmount = await updateSlippageLossToken(sellTokenContract);

      const data =
        await sellTokenContract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
          web3.utils.toHex(swapAmount[0]),
          web3.utils.toHex(swapAmount[1]),
          pairAddress,
          senderAddress,
          getTransactionDeadline()
        );
      /*
            const data = await sellTokenContract.methods.swapExactTokensForETH(
                web3.utils.toHex(amountIn),
                web3.utils.toHex(amountOutMin),
                pairAddress,
                senderAddress,
                deadline
            );*/

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

      const signed_txn = await web3.eth.accounts.signTransaction(
        rawTransaction,
        WALLET_PRIVATE_KEY
      );
      await web3.eth
        .sendSignedTransaction(signed_txn.rawTransaction)
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
          setVisible(visible, true);
        })
        .catch(function (error) {
          console.log("exception");
          setSellTokenTxnStatus(
            TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION
          );
          setVisible(visible, true);
        });
    } catch (error) {
      setSellTokenTxnStatus(TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION);
      setVisible(visible, true);
      console.log("startSellToken-Exception: " + error);
    }
  }

  function setSellTokenTxnStatus(txnStatus) {
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
            title="Sell Token Contract Address"
            name="contractAddress"
          />
          <br></br>
          {inputs.contractAddress.length === 42 && (
            <label>
              {" "}
              MaxAvailableToken (
              <TokenSymbol tokenAddress={inputs.contractAddress} />
              )::
              <TokenBalance
                tokenAddress={inputs.contractAddress}
                funcTokenBalance={setTokenBalance}
              />
            </label>
          )}

          {inputs.contractAddress.length === 42 && tokenBalance !== 0 && (
            <label>
              <br />
              <br />
              <ContractTextField
                onChange={handleChange}
                title="Quantity of Tokens to sell"
                name="noOfTokensToSell"
                value={inputs.noOfTokensToSell}
              />
              {tokenBalance !== 0 && (
                <Button OnClick={handleGetBalance} title=" Get Max" />
              )}
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
                title="Slippage in Percentage"
                name="slippage"
                value={inputs.slippage}
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
            </label>
          )}
          {inputs.contractAddress.length === 42 && tokenBalance !== 0 && (
            <Button
              OnClick={handletSellButton}
              title={visible ? "Start Sell" : "Stop Sell"}
            >
              {" "}
            </Button>
          )}

          <div>
            {transactionStatus.status !==
              TRANSACTION_STATUS.TRANSACTION_NOT_STARTED && (
              <label>
                <hr></hr>
                <br />
                <b>Quantity to sell: </b>
                {inputs.noOfTokensToSell} <b>NoOfXReached:</b>
                {currentToken.noOfXReached}
                <br /> <br />
                <b>Initial Price:</b>
                {currentToken.initialPrice}
                <b> Target Price:</b>
                {currentToken.targetPrice}
                <b>
                  {" "}
                  Current (
                  <TokenSymbol tokenAddress={inputs.contractAddress} />) Price:
                </b>
                {currentToken.currentPrice}
                <br /> <br />
                <b>Minimum Received: </b>
                {swapToken.guarnteedToken} <b>Maximum Received: </b>
                {swapToken.recvdToken}
                <br /> <br />
                <b>Loss due to Slippage:</b>({inputs.slippage}%):
                {swapToken.tokenLoss}
                <br /> <br />
                <hr></hr>
                <br />
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
          </div>
        </Typography>
      </div>
    </>
  );
}
export default SellToken;
