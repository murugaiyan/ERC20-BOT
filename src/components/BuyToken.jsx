import { useState } from "react";
import Button from "./Button";
import web3 from "./blockchain/web3";
import {
  WALLET_PRIVATE_KEY,
  BASE_TOKEN_CONTRACT_ADDRESS,
  BLOCKCHAIN_BLOCK_EXPLORER,
  TRANSACTION_STATUS,
  ROUTER_CONTRACT_ADDRESS,
} from "./constants";
import {
  utilsSetBuyTokenTxnStatus,
  getContractObject,
  getNetworkGasPrice,
  getCurrentGasPrice,
  getSwapPair,
  getTransactionDeadline,
} from "./blockchain/utils";
import TokenSymbol from "./TokenSymbol";
import TokenBalance from "./TokenBalance";
import TransactionStatus from "./TransactionStatus";
import ContractTextField from "./ContractTextField";
import Typography from "@mui/material/Typography";
import CurrentTokenPrice from "./CurrentTokenPrice";
function BuyToken() {
  const [inputs, setInputs] = useState({
    contractAddress: "",
    noOfBNBToBuy: 0,
    slippage: 10,
  });
  /*
      const [currentToken, setTokenProperty] = useState({
          price: "0.000000",
          ticker:"",
          qtyToBuy:0,
          startBuy:false
        });
        */

  const [transactionHash, setTransactionHash] = useState({
    confirmedHash: "",
  });
  const [transactionStatus, setTransactionStatus] = useState({
    status: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
  });
  const [, setTokenBalance] = useState(0);
  const [visible, setVisible] = useState(true);

  const handleChange = (event) => {
    const value = event.target.value;
    setInputs({
      ...inputs,
      [event.target.name]: value,
    });
  };

  const handleStartBuy = (event) => {
    event.preventDefault();
    //setTokenProperty({startBuy:false});
    setVisible((visible) => !visible);
    if (visible) {
      buyTokenLoop();
    }
  };

  async function buyTokenLoop() {
    try {
      setTransactionHash({ confirmedHash: "" });
      setBuyTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS);
      const senderAddress = web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address;

      const contract_id = web3.utils.toChecksumAddress(inputs.contractAddress).toLowerCase();

      console.log("Buy  Token Contract Address: " + contract_id);
      //console.log("Buy Token Sender Address: " + senderAddress);
      console.log("No of BNB to Buy: " + inputs.noOfBNBToBuy);
      console.log("Slippage: " + inputs.slippage);
      //console.log("Balance in Wallet : " + balance);

      const pairAddress = [BASE_TOKEN_CONTRACT_ADDRESS, contract_id];

      if (0 === inputs.slippage) {
        inputs.slippage = 1;
      }

      var amountIN = web3.utils.toWei(inputs.noOfBNBToBuy, "ether");

      const pair = await getSwapPair(BASE_TOKEN_CONTRACT_ADDRESS, contract_id);

      if (web3.utils.toBN(pair).isZero()) {
        console.log("Pair Invalid: ", pair);
        setBuyTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_EXCEPTION);
        setVisible(visible, true);
        return;
      }

      const buyTokenContract = await getContractObject();

      const amount_out = await buyTokenContract.methods.getAmountsOut(amountIN, pairAddress).call();
      const bnbTokenInReserve = web3.utils.fromWei(amount_out[0]);
      const newTokenInReserve = web3.utils.fromWei(amount_out[1]);

      const slippageLoss = inputs.slippage / 100;

      const lossOfTokenDueToSlippage = newTokenInReserve * slippageLoss;
      amountIN = newTokenInReserve - lossOfTokenDueToSlippage;
      var BN1 = web3.utils.BN;
      var amountOutHex = new BN1(amountIN).toString();
      console.log("Liquidity Reserve [BNB][NewToken]: " +bnbTokenInReserve +" NewToken[]: " +newTokenInReserve);
      console.log(" Might Loss of Tokens due to Slippage: " + lossOfTokenDueToSlippage," Guaranteed in Wallet: " + amountIN);
      console.log("No of Tokens to Swap: " + amountOutHex);

      amountOutHex = web3.utils.toWei(amountOutHex);

      var data = await buyTokenContract.methods.swapExactETHForTokensSupportingFeeOnTransferTokens(/*swapETHForExactTokens*/ web3.utils.toHex(amountOutHex), pairAddress, senderAddress, getTransactionDeadline());

      const realGasPrice = await getCurrentGasPrice(false);
      const newValue = await getNetworkGasPrice(realGasPrice, inputs.noOfBNBToBuy);
      console.log("Sending Base Token Amount:" +newValue +" Base Token supposed to send: ",inputs.noOfBNBToBuy);

      var count = await web3.eth.getTransactionCount(senderAddress);

      var rawTransaction = {
        from: senderAddress,
        to: ROUTER_CONTRACT_ADDRESS,
        gasPrice: web3.utils.toHex(realGasPrice),
        gasLimit: web3.utils.toHex(1500000),
        data: data.encodeABI(),
        nonce: web3.utils.toHex(count),
        value: web3.utils.toHex(newValue),
      };

      const signed_txn = await web3.eth.accounts.signTransaction(rawTransaction,WALLET_PRIVATE_KEY);

      await web3.eth
        .sendSignedTransaction(signed_txn.rawTransaction)
        .once("sending", function (payload) {
          console.log("txn sending: " + payload);
        })
        .once("sent", function (payload) {
          console.log("txn sent: " + payload);
        })
        .once("transactionHash", function (hash) {
          setTransactionHash({
            confirmedHash: BLOCKCHAIN_BLOCK_EXPLORER + hash,
          });
          console.log(
            "txn transactionHash: " + BLOCKCHAIN_BLOCK_EXPLORER + hash
          );
        })
        .once("receipt", function (receipt) {
          console.log("txn receipt: " + receipt);
        })
        .once("confirmation", function (confNumber, receipt, latestBlockHash) {
          console.log(
            "txn confirmation: " +
              confNumber +
              " receipt: " +
              receipt +
              " latestBlockHash: " +
              latestBlockHash
          );
        })
        .on("error", function (error) {
          console.log("OnError: " + error);
          setBuyTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED);
        })
        .then(function (receipt) {
          if (receipt.status) {
            setBuyTokenTxnStatus(
              TRANSACTION_STATUS.TRANSACTION_COMPLETE_SUCCESS
            );
          } else {
            setBuyTokenTxnStatus(
              TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED
            );
          }
          console.log("confirmed receipt: " + receipt.status);
          setVisible(visible, true);
        })
        .catch(function (error) {
          console.log("exception: " + error);
          setVisible(visible, true);
          setBuyTokenTxnStatus(
            TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION
          );
        });
    } catch (error) {
      console.log("Exception: " + error);
      setVisible(visible, true);
      setBuyTokenTxnStatus(TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION);
    }

    function setBuyTokenTxnStatus(txnStatus) {
      utilsSetBuyTokenTxnStatus(txnStatus);
      setTransactionStatus({ status: txnStatus });
    }
  }
  return (
    <>
      <div>
        <br />
        <Typography variant="h6" component="div" gutterBottom>
          <ContractTextField
            onChange={handleChange}
            title="Buy Token Contract Address"
            name="contractAddress"
          />
          <br />
          {inputs.contractAddress.length === 42 && (
            <div>
              MaxAvailableToken (
              <TokenSymbol tokenAddress={inputs.contractAddress} />
              )::
              <TokenBalance
                tokenAddress={inputs.contractAddress}
                funcTokenBalance={setTokenBalance}
              />
              <CurrentTokenPrice tokenAddress={inputs.contractAddress}/>
              <br />
              <ContractTextField
                onChange={handleChange}
                title="Number of BNB to spend"
                name="noOfBNBToBuy"
              />
              <br />
              <br />
              <ContractTextField
                onChange={handleChange}
                title="Slippage in Percentage"
                name="slippage"
                value={inputs.slippage}
              />
              <br />
              <br />
              <Button
                OnClick={handleStartBuy}
                title={visible ? "Start Buy" : "Stop Buy"}
              >
                {" "}
              </Button>
            </div>
          )}

          {transactionStatus.status !==
            TRANSACTION_STATUS.TRANSACTION_NOT_STARTED && (
            <TransactionStatus status={transactionStatus.status} />
          )}

          {transactionStatus.status !==
            TRANSACTION_STATUS.TRANSACTION_NOT_STARTED && (
            <label>
              {" "}
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
export default BuyToken;
