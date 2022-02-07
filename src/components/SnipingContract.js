import './SnipingContract.css';

import { useState } from 'react';
import Button from './Button';
import web3 from './blockchain/web3'
import TokenSymbol from './TokenSymbol';
import { getNetworkGasPrice } from './blockchain/utils';
import TransactionStatus from './TransactionStatus';
import ContractTextField from './ContractTextField';
import { WALLET_PRIVATE_KEY, ROUTER_CONTRACT_ADDRESS, PANCAKE_CONTRACT_ABI, BASE_TOKEN_CONTRACT_ADDRESS, BLOCKCHAIN_BLOCK_EXPLORER, TRANSACTION_STATUS, POLLING_BLOCKCHAIN_INTERVAL } from './constants'
import { utilsSetSnipeTokenTxnStatus } from './blockchain/utils'
import Typography from '@mui/material/Typography';


function SnipingContract() {
  const [inputs, setInputs] = useState({
    contractAddress: "",
    noOfTokensToBuy: 0,
    snipingTimerID: 0,
    slippage: 10
  });
  const [walletInfo, setWalletInfo] = useState({
    senderAddress: "",
    contractID: '',
    snipingTargetTokenQty: 0
  });
  const [visible, setVisible] = useState(true);

  const [transactionHash, setTransactionHash] = useState({
    confirmedHash: '',
  });
  const [transactionStatus, setTransactionStatus] = useState({
    status: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED
  });

  const [timerID, setTimerID] = useState({
    snipeTokenTimerID: 0
  });



  const handleChange = (event) => {
    const value = event.target.value;
    setInputs({
      ...inputs,
      [event.target.name]: value
    });
  }


  const handleSnipe = (event) => {
    event.preventDefault();
    setVisible(visible => !visible);

    if (visible) {
      console.log("Snipper Started ");
      const address = web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address;
      console.log("Wallet Address:" + address);
      walletInfo.senderAddress = address;
      setTransactionHash({ confirmedHash: '' });
      setSnipingTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS);
      walletInfo.contractID = new web3.eth.Contract(PANCAKE_CONTRACT_ABI, ROUTER_CONTRACT_ADDRESS);
      const intervalID = setInterval(startSnipeToken, POLLING_BLOCKCHAIN_INTERVAL.INTERVAL_SELL_CONTRACT);
      timerID.snipeTokenTimerID = intervalID;
      setTimerID(timerID, intervalID);
    }
    else {
      console.log("Stopped Snipper ");
      setSnipingTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_NOT_STARTED);

      clearInterval(timerID.snipeTokenTimerID);
    }

  }
  async function startSnipeToken() {
    const bResult = await isTokenLaunched();
    console.log(" isTokenLaunched:" + (bResult ? "YES" : "NO"));
    if (bResult) {
      setVisible(visible, true);
      console.log("Token Snipped Successfully... " + timerID.snipeTokenTimerID);
      clearInterval(timerID.snipeTokenTimerID);
    }
  }

  async function isTokenLaunched() {
    var bResult = false;
    const routerPair = [BASE_TOKEN_CONTRACT_ADDRESS, inputs.contractAddress];
    const amountsOutResult = await walletInfo.contractID.methods.getAmountsOut(web3.utils.toWei(inputs.noOfTokensToBuy, 'ether'), routerPair).call();
    var amountOut = amountsOutResult[1];
    if (amountOut > 0) {
      bResult = true;
      amountOut = amountOut - (amountOut * inputs.slippage / 100);
      console.log('Trading pair is active.');
      const bnbTokenInReserve = web3.utils.fromWei(amountsOutResult[0]);
      const newTokenInReserve = web3.utils.fromWei(amountsOutResult[1]);

      setWalletInfo({ ...walletInfo, snipingTargetTokenQty: newTokenInReserve });

      console.log("Token: " + newTokenInReserve + "BNB: " + bnbTokenInReserve);

      var amountOutMinBN = Math.round(100);
      amountOutMinBN = new web3.utils.BN(amountOutMinBN).toString();
      const transactionDeadline = web3.utils.toHex(Math.round(Date.now() / 1000) + 60 * 20);
      console.log('Method executeTransaction, params: { amountOut: ' + amountOutMinBN + ', tokenAddress: ' + inputs.contractAddress + ', senderAddress: ' + walletInfo.senderAddress + '}');
      const data = await walletInfo.contractID.methods.swapExactETHForTokens(amountOutMinBN, routerPair, walletInfo.senderAddress, transactionDeadline);

      const count = await web3.eth.getTransactionCount(walletInfo.senderAddress);

      var realGasPrice = 0;
      const customGasPrice = 0; // Not Used
      if (customGasPrice) {
        realGasPrice = customGasPrice * 1000000000;
      } else {
        realGasPrice = await web3.eth.getGasPrice() * 1.4;
      }

      const newValue = await getNetworkGasPrice(realGasPrice, inputs.noOfTokensToBuy);
      var rawTransaction = {
        "from": walletInfo.senderAddress,
        "to": ROUTER_CONTRACT_ADDRESS,
        "gasPrice": web3.utils.toHex(realGasPrice),
        "gasLimit": web3.utils.toHex(500000),
        "data": data.encodeABI(),
        "nonce": web3.utils.toHex(count),
        "value": web3.utils.toHex(newValue)
      }



      const signedTx = await web3.eth.accounts.signTransaction(rawTransaction, WALLET_PRIVATE_KEY);
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .once('sending', function (payload) {
          console.log("txn sending: " + payload);
        })
        .once('sent', function (payload) {
          console.log("txn sent: " + payload);
        })
        .once('transactionHash', function (hash) {
          console.log("txn transactionHash: " + BLOCKCHAIN_BLOCK_EXPLORER + hash);
          setTransactionHash({ confirmedHash: BLOCKCHAIN_BLOCK_EXPLORER + hash });
        })
        .once('receipt', function (receipt) {
          console.log("txn receipt: " + receipt);
        })
        .once('confirmation', function (confNumber, receipt, latestBlockHash) {
          console.log("txn confirmation: " + confNumber + " receipt" + receipt);
        })
        .on('error', function (error) {
          console.log("OnError: " + error);
          setSnipingTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED);
        })
        .then(function (receipt) {
          console.log("confirmed receipt: " + receipt.status);
          if (receipt.status) {
            setSnipingTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_SUCCESS);
          }
          else {
            setSnipingTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED);
          }
        })
        .catch(function (error) {
          console.log("exception");
          setSnipingTokenTxnStatus(TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION);
        }
        );

    }
    return bResult;
  }


  function setSnipingTokenTxnStatus(txnStatus) {
    setTransactionStatus({ status: txnStatus });
    utilsSetSnipeTokenTxnStatus(txnStatus);
  }


  return (
    <>
      <div>
        <br />
        <Typography variant="h6" component="div" gutterBottom>
          <ContractTextField onChange={handleChange} title='Snipe Token Contract Address' name="contractAddress" />
          <br /><br />
          {inputs.contractAddress.length === 42 &&
            <div>
              <ContractTextField onChange={handleChange} title='Quantity of BNB to Snipe' name="noOfTokensToBuy" value={inputs.noOfTokensToBuy} />
              <br /> <br />
              <ContractTextField onChange={handleChange} title='Transaction Slippage (%)' name="slippage" value={inputs.slippage} />
            </div>
          }

          <br /> <br />
          {inputs.contractAddress.length === 42 && inputs.noOfTokensToBuy !== 0 &&
            <Button OnClick={handleSnipe} title={visible ? "Start Snipe" : "Stop Snipe"} />
          }
          <hr />

          {transactionStatus.status !== TRANSACTION_STATUS.TRANSACTION_NOT_STARTED &&
            <label>
              Sniping Contract Address: {inputs.contractAddress}
              <br /> <br />
              Current Sniping Token (<TokenSymbol tokenAddress={inputs.contractAddress} />) : {walletInfo.snipingTargetTokenQty}

              <TransactionStatus status={transactionStatus.status} />


              Transaction Hash:
              <a href={transactionHash.confirmedHash} target="_blank" rel="noopener noreferrer"> {transactionHash.confirmedHash} </a>
            </label>
          }
        </Typography>
      </div>
    </>
  )
}


export default SnipingContract; 