import './SnipingContract.css'; 

import {useState} from 'react'; 
import Button from './Button';
import web3 from './blockchain/web3'
import TokenSymbol  from './TokenSymbol'; 
import { getNetworkGasPrice } from './blockchain/utils';
import TokenBalance from './TokenBalance'; 
import TransactionStatus from './TransactionStatus'; 
import {WALLET_PRIVATE_KEY, ROUTER_CONTRACT_ADDRESS, PANCAKE_CONTRACT_ABI, BASE_TOKEN_CONTRACT_ADDRESS, BLOCKCHAIN_BLOCK_EXPLORER, TRANSACTION_STATUS, POLLING_BLOCKCHAIN_INTERVAL} from './constants'


const eSnipingStatus = {
    NOT_STARTED:0,
    STARTED:1,
    IN_PROGRESS:2,
    STOPPED:3
};

function SnipingContract() {
    const [inputs, setInputs] = useState({
      contractAddress:"",
      noOfTokensToBuy:0,
      snipingTimerID:0,
      slippage:10
    });
    const [walletInfo, setWalletInfo] = useState({
      senderAddress:"",
      contractID:'',
      snipingTargetTokenQty:0
    });
    const [visible, setVisible] = useState(true);

    const [transactionHash, setTransactionHash] = useState({
        confirmedHash:'',
    });
    const [transactionStatus, setTransactionStatus] = useState({
        status:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED
    });

    const [timerID, setTimerID] = useState({
      snipeTokenTimerID:0
    }); 
    const [txnParams, setTxnParams] = useState(''); 



    const handleChange = (event) => {
      const value = event.target.value;
      setInputs({
        ...inputs,
        [event.target.name]: value
      });
    }

  
  const handleSnipe = (event) => {
      event.preventDefault();  
      setVisible(visible =>!visible);

      if(visible)
      {
          console.log("Snipper Started "); 
          const address = web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address;
          console.log("Wallet Address:" + address); 
          walletInfo.senderAddress = address; 
          setTransactionHash({confirmedHash:''});
          setTransactionStatus({status:TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS});
          walletInfo.contractID = new web3.eth.Contract(PANCAKE_CONTRACT_ABI, ROUTER_CONTRACT_ADDRESS);          
          const intervalID = setInterval( startSnipeToken, 10000 /*POLLING_BLOCKCHAIN_INTERVAL.INTERVAL_SELL_CONTRACT*/); 
          timerID.snipeTokenTimerID = intervalID; 
      }
      else
      {
         console.log("Stopped Snipper "); 
         setTransactionStatus({status:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED});
          
          clearInterval(timerID.snipeTokenTimerID); 
      }
      
  }
    async function startSnipeToken()
    {
      const bResult = isTokenLaunched(); 
      console.log(" isTokenLaunched:" + (bResult?"YES":"NO")); 
        if(bResult)
        {
            setVisible(visible, true); 
            console.log("Token Snipped Successfully... " + timerID.snipeTokenTimerID); 
            clearInterval(timerID.snipeTokenTimerID); 
        }
    }

    async function isTokenLaunched()
    {
        var bResult = false; 
        const routerPair = [BASE_TOKEN_CONTRACT_ADDRESS,  inputs.contractAddress]; 
        const amountsOutResult = await walletInfo.contractID.methods.getAmountsOut(web3.utils.toWei(inputs.noOfTokensToBuy, 'ether'), routerPair).call(); 
        var amountOut = amountsOutResult[1];
        if (amountOut > 0) 
        {
            bResult = true; 
            amountOut = amountOut - (amountOut * inputs.slippage / 100);
            console.log('Trading pair is active.');
            const bnbTokenInReserve = await web3.utils.fromWei(amountsOutResult[0]); 
            const newTokenInReserve  = await web3.utils.fromWei(amountsOutResult[1]);

            setWalletInfo({...walletInfo, snipingTargetTokenQty:newTokenInReserve});

            console.log("Token: " + newTokenInReserve +"BNB: " + bnbTokenInReserve);

            var amountOutMinBN = Math.round(100); 
            amountOutMinBN = new web3.utils.BN(amountOutMinBN).toString();
            const transactionDeadline = await web3.utils.toHex(Math.round(Date.now()/1000)+60*20); 
            console.log('Method executeTransaction, params: { amountOut: ' + amountOutMinBN  + ', tokenAddress: ' + inputs.contractAddress  + ', senderAddress: ' + walletInfo.senderAddress + '}');
            const data = await walletInfo.contractID.methods.swapExactETHForTokens(amountOutMinBN, routerPair, walletInfo.senderAddress , transactionDeadline);

            const count =  await web3.eth.getTransactionCount(walletInfo.senderAddress);

            var realGasPrice = 0; 
                    const customGasPrice = 0; // Not Used
                    if (customGasPrice) {
                        realGasPrice = customGasPrice * 1000000000;
                    } else {
                        realGasPrice =  await web3.eth.getGasPrice() * 1.4;
                    }

            const newValue =  await getNetworkGasPrice(realGasPrice, inputs.noOfTokensToBuy); 
            var rawTransaction = {
                "from":walletInfo.senderAddress,
                "to": ROUTER_CONTRACT_ADDRESS,
                "gasPrice":web3.utils.toHex(realGasPrice),  
                "gasLimit":web3.utils.toHex(500000),         
                "data":data.encodeABI(),
                "nonce":web3.utils.toHex(count),
                "value": web3.utils.toHex(newValue)
            }



            const signedTx = await web3.eth.accounts.signTransaction(rawTransaction, WALLET_PRIVATE_KEY); 
            await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                    .once('sending', function(payload){ 
                        console.log("txn sending: " + payload); 
                    })
                    .once('sent', function(payload){ 
                        console.log("txn sent: " +payload); 
                    })
                    .once('transactionHash', function(hash){ 
                        console.log("txn transactionHash: " + BLOCKCHAIN_BLOCK_EXPLORER+hash); 
                        setTransactionHash({confirmedHash:BLOCKCHAIN_BLOCK_EXPLORER+hash});
                    })
                    .once('receipt', function(receipt){ 
                        console.log("txn receipt: "+ receipt); 
                    })
                    .once('confirmation', function(confNumber, receipt, latestBlockHash){ 
                        console.log("txn confirmation: " + confNumber + " receipt" + receipt); 
                    })
                    .on('error', function(error){ 
                        console.log("OnError: "+ error); 
                        setTransactionStatus({status:TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED}); 
                    })
                    .then(function(receipt){
                        console.log("confirmed receipt: "+ receipt.status); 
                        if(receipt.status)
                        {
                            setTransactionStatus({status:TRANSACTION_STATUS.TRANSACTION_COMPLETE_SUCCESS}); 
                        }
                        else
                        {
                            setTransactionStatus({status:TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED}); 
                        }
                    })
                    .catch(function(error) {
                        console.log("exception");
                        setTransactionStatus({status:TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION});
                    }
                    );              
          
        } 
        return bResult; 
  }

  

    
  
    return (
        <>
            <form >
              <label>Sniping Token Contract Address: 
                  <input 
                  type="text" 
                  name="contractAddress" 
                  value={inputs.contractAddress || ""} 
                  onChange={handleChange}
                  />
                </label>
                <p>
                  
                  {inputs.contractAddress.length >=42 &&
                      <label> Quantity of BNB to Buy:
                        <input 
                        type="text" 
                        name="noOfTokensToBuy"
                        value={inputs.noOfTokensToBuy || ""} 
                        onChange={handleChange}
                        />
                      </label>
                    }
                      <br /><br />
                       {inputs.contractAddress.length >=42 &&
                      <label>
                        Transaction Slippage (%):
                        <input 
                        type="text" 
                        name="slippage"
                        value={inputs.slippage || ""} 
                        onChange={handleChange}
                        />
                        </label>
                      }

                    <br />
                     {inputs.contractAddress.length >=42 && inputs.noOfTokensToBuy !==0 &&
                    <Button OnClick={handleSnipe} title={visible ? "Start Snipe" : "Stop Snipe" } /> 
                 }
                </p>
            </form>
            <hr />
            <p>
               {transactionStatus.status !== TRANSACTION_STATUS.TRANSACTION_NOT_STARTED &&
                  <label>
                    Sniping Contract Address: {inputs.contractAddress}
                      <br /> <br />  
                      Current Sniping Token (<TokenSymbol tokenAddress={inputs.contractAddress} />) : {walletInfo.snipingTargetTokenQty}
                       
                      <TransactionStatus  status={transactionStatus.status} /> 
                        
                          
                        Transaction Hash:  
                                <a href ={transactionHash.confirmedHash} target="_blank"> {transactionHash.confirmedHash} </a>
                  </label>
                }
            </p>
           
            
      </>
    )
  }
  

export default SnipingContract; 