import './SellToken.css'; 
import {getTokenPrice} from './tokenPrice'; 
import { getTokenBalanceHumanReadable} from './blockchain/utils';
import {useState} from 'react'; 
import web3 from './blockchain/web3'
import Button from './Button';
import TokenSymbol  from './TokenSymbol'; 
import TokenBalance from './TokenBalance'; 
import TransactionStatus from './TransactionStatus'; 

import {WALLET_PRIVATE_KEY, ROUTER_CONTRACT_ADDRESS, PANCAKE_CONTRACT_ABI, BASE_TOKEN_CONTRACT_ADDRESS, BLOCKCHAIN_BLOCK_EXPLORER, TRANSACTION_STATUS, POLLING_BLOCKCHAIN_INTERVAL} from './constants'


function SellToken(props)
{
    const [inputs, setInputs] = useState({
        contractAddress:"",
        noOfTokensToSell:0,
        noOfX:0,
        slippage:10,
        delayedSell:0,
        checked:false
      });
    const [monitorPriceTimerID, setMonitorPriceTimerID] = useState(0); 
    const [delayedSellTimerID, setDelayedSellTimerID] = useState(0); 

    const [currentToken, setTokenProperty] = useState({
        initialPrice: 0,
        ticker:"",
        qtyToBuy:0,
        decimals:0,
        symbol:'',
        startSell:false,
        maxAvailable:0,
        targetPrice:0,
        noOfXReached:0,
        currentPrice:0
      }); 
      const [swapToken, setSwaptoken] = useState( {
        tokenLoss:'',
        guarnteedToken:'',
        recvdToken:''
      }); 
      

      const [transactionHash, setTransactionHash] = useState({
        confirmedHash:'',
    });
    const [transactionStatus, setTransactionStatus] = useState({
        status:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED
    });

      const [tokenBalance, setTokenBalance] = useState(0); 
      const [visible, setVisible] = useState(true);
        var contract_id = '';

      const handleChange = (event) => {
        const value = event.target.value;
        setInputs({
          ...inputs,
          [event.target.name]: value
        });
      }
       const handleSubmit = (event) => {
        event.preventDefault();
      }

     async function handleGetBalance (event)  {
        event.preventDefault(); 
        const tokenBalance = await getTokenBalanceHumanReadable(inputs.contractAddress); 
        inputs.noOfTokensToSell = tokenBalance; 
        setTokenProperty({...currentToken, maxAvailable:tokenBalance}); 
        //setInputs({noOfTokensToSell:tokenBalance}); 
        
    }
    
    function handleCheckBox(event)
    {
        event.preventDefault();  
        setInputs({...inputs, checked:!inputs.checked});
        console.log("handleCheckBox: ", event.target.checked); 
    }
    
    async function handletSellButton  (event)  {
        event.preventDefault();  
        setVisible(visible =>!visible);
        if(visible){
            setTransactionHash({confirmedHash:''});
            setTransactionStatus({status:TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS});
            const tmpInitialPrice = await getTokenPrice(inputs.contractAddress); 
            setTokenProperty({...currentToken, initialPrice:tmpInitialPrice}); 
            const tmpX = parseInt(inputs.noOfX); 
            setInputs({...inputs, noOfX:tmpX}); 
            currentToken.initialPrice = tmpInitialPrice; 
            contract_id =  await web3.utils.toChecksumAddress(inputs.contractAddress); 

            var timeInSeconds = parseInt(inputs.delayedSell); 
            if(timeInSeconds)
            {
                timeInSeconds*=1000; 
                console.log("Delaying Sell Token in ms", timeInSeconds);
                const tmpTimerID = setTimeout(delayTimerExpiredStartSellToken, timeInSeconds); 
                setDelayedSellTimerID(tmpTimerID); 

            }
            else
            {
                if(tmpX === 0)
                {
                    setTokenProperty({...currentToken,targetPrice:tmpInitialPrice}); 
                    startSellToken(); 
                    //clearInterval(monitorPriceTimerID); 
                }
                else 
                {
                    const tmpTargetPrice = tmpX * tmpInitialPrice; 
                    currentToken.targetPrice = tmpTargetPrice; 
                    setTokenProperty({...currentToken,targetPrice:tmpTargetPrice}); 
                    monitorTokenPrice(); 
                    const intervalID = setInterval(monitorTokenPrice, POLLING_BLOCKCHAIN_INTERVAL.INTERVAL_SELL_CONTRACT);
                    setMonitorPriceTimerID(intervalID); 
                }
            }
        }
        else
        {
            const tmpX = parseInt(inputs.noOfX); 
            if(inputs.delayedSell !==0)
            {
                console.log("Delayed Sell Stopped") ;
                clearTimeout(delayedSellTimerID); 
                setInputs({...inputs, delayedSell:0}); 
            }
            if(tmpX !== 0)
            {
                console.log("No of X  Sell Stopped") ;
                clearInterval(monitorPriceTimerID); 
                setInputs({...inputs, noOfX:0}); 
            }
            
            setTransactionStatus({status:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED});
        }
        
    }
    function delayTimerExpiredStartSellToken()
    {
        console.log("Timer Expired Sell will trigger")
        startSellToken(); 
        setInputs({...inputs, delayedSell:0}); 
    }
    async function isTokenReachedExpectedTargetPrice( kNoOfX, kTokenPriceBeforeMonitor)
    {
        var result = false; 
        const currentTokenPriceInUSD = await getTokenPrice(contract_id); 
        currentToken.currentPrice = currentTokenPriceInUSD;
        //console.log("currentTokenPriceInUSD : ", currentTokenPriceInUSD); 
        var targetSellPrice = currentTokenPriceInUSD * (parseInt(kNoOfX)); 
        console.log("isTokenReachedExpectedTargetPrice: "+ currentTokenPriceInUSD + " TargetPrice: " + targetSellPrice + " kTokenPriceBeforeMonitor: "+kTokenPriceBeforeMonitor);
        if(kTokenPriceBeforeMonitor >= targetSellPrice )
        {
            result = true; 
        }
        const tmpNoOfX = (currentTokenPriceInUSD/kTokenPriceBeforeMonitor) - 1;
        setTokenProperty({...currentToken,noOfXReached:tmpNoOfX}); 
        return result; 
        
    }
    async function monitorTokenPrice()
    {
        //console.log("monitorTokenPrice --->"); 
        const bResult = await isTokenReachedExpectedTargetPrice(inputs.noOfX, currentToken.initialPrice); 
        if(bResult)
        {
            startSellToken(); 
            clearInterval(monitorPriceTimerID); 
            setInputs({...inputs, noOfX:0}); 
        }
    }


    async function startSellToken()
    {
        try{
        const senderAddress =  await web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address;
        console.log("Sell Token Wallet Address: " + senderAddress); 

        const sellTokenContract = await new web3.eth.Contract(PANCAKE_CONTRACT_ABI, ROUTER_CONTRACT_ADDRESS );

        const pairAddress = [contract_id, BASE_TOKEN_CONTRACT_ADDRESS];
        
        const deadline = await web3.utils.toHex(Math.round(Date.now()/1000)+60*20); 

        const inputTokenInWei = await web3.utils.toWei(inputs.noOfTokensToSell, 'ether');
        //var  amountIN = web3.utils.toBN(inputTokenInWei); 
        console.log("Nof of Tokens to Sell: " + inputs.noOfTokensToSell + " Slippage(%): " + inputs.slippage ); 
        
        const amount_out = await sellTokenContract.methods.getAmountsOut(inputTokenInWei, [contract_id, BASE_TOKEN_CONTRACT_ADDRESS]).call();
        const newTokenInReserve = await web3.utils.fromWei(amount_out[0]); 
        const bnbTokenInReserve = await web3.utils.fromWei(amount_out[1]); 

        const amountIn = amount_out[0]; 
        var slippageLoss = (amount_out[1] * inputs.slippage / 100); 
        var amountOutMinInNo = amount_out[1] - slippageLoss; 

        const amountOutMin = amountOutMinInNo.toString();

        const slippageLossReadable = await web3.utils.fromWei(slippageLoss.toString()); 
        const amountAmountAfterSlippage = await web3.utils.fromWei(amountOutMin); 
        
        setSwaptoken({...swapToken, recvdToken:bnbTokenInReserve}); 
        setSwaptoken({...swapToken, tokenLoss:slippageLossReadable}); 
        setSwaptoken({...swapToken, guarnteedToken:amountAmountAfterSlippage}); 

        console.log("Liquidity Reserve [NewToken][BNB]: "+ newTokenInReserve + " NewToken[]: " +  bnbTokenInReserve); 
        console.log(" Might Loss of Tokens due to Slippage: " + slippageLossReadable + " Guaranteed in Wallet: " + amountOutMin + " TotalSwapBNB: " + bnbTokenInReserve); 

       
        var data = await sellTokenContract.methods.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            pairAddress,
            senderAddress,
            deadline
        );
        
        var realGasPrice = 0; 
        const customGasPrice = 0; // Not Used
        if (customGasPrice) {
            realGasPrice = customGasPrice * 1000000000;
        } else {
            realGasPrice = await web3.eth.getGasPrice() * 1.4;
        }

        //const newValue = await getNetworkGasPrice(realGasPrice, inputs.noOfTokensToSell);
    
        var count = await web3.eth.getTransactionCount(senderAddress);
        var rawTransaction = {
            "from":senderAddress,
            "to": ROUTER_CONTRACT_ADDRESS,
            "gasPrice":web3.utils.toHex(realGasPrice),
            "gasLimit":web3.utils.toHex(500000),            
            "data":data.encodeABI(),
            "nonce":web3.utils.toHex(count)
        };
    
            const signed_txn = await web3.eth.accounts.signTransaction(rawTransaction, WALLET_PRIVATE_KEY);
            await web3.eth.sendSignedTransaction(signed_txn.rawTransaction)
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
                 setVisible(visible, true); 
            })
            .catch(function(error) {
                console.log("exception");
                setTransactionStatus({status:TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION});
                setVisible(visible, true); 
            }
            );
        }
        catch(error)
        {
            setTransactionStatus({status:TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION});
            setVisible(visible, true); 
            console.log("startSellToken-Exception: " + error)
        }
            
    }

    return(
        <>
            <div>
            <form onSubmit={handleSubmit}>
              <label >Sell Token Contract Address: 
                  <input 
                  type="text" 
                  name="contractAddress" 
                  value={inputs.contractAddress || ""} 
                  onChange={handleChange}
                  />
                </label>
                {inputs.contractAddress.length >=42 &&
                  <p>
                        <label> MaxAvailableToken (<TokenSymbol tokenAddress={inputs.contractAddress} />):: 
                                                <TokenBalance tokenAddress={inputs.contractAddress} funcTokenBalance={setTokenBalance}/> 
                                                
                        </label>
                  </p>
                   
                }
                
                {inputs.contractAddress.length >=42 && tokenBalance !==0 &&
                    <label>
                        <p>
                            <label> Enable Delayed Sell:  </label>
                            <input type='checkbox' onChange={handleCheckBox} />
                        </p>
                        <p>
                            
                                {inputs.checked === true &&
                                <label>
                                    Delayed Sell in Seconds: 
                                    <input 
                                    type="text" 
                                    name="delayedSell" 
                                    value={inputs.delayedSell || ""} 
                                    onChange={handleChange}
                                    /> 
                                </label>
                                }                
                        </p>
                        <p>
                            <label>Quantity of Tokens to Sell: 
                            <input 
                            type="text" 
                            name="noOfTokensToSell"
                            value={inputs.noOfTokensToSell || ""} 
                            onChange={handleChange}
                            />
                            {tokenBalance !==0 &&<Button OnClick={handleGetBalance} title="Max" />}
                            </label> 
                        </p>
                        <p>             
                            <label>Number of X to Sell: 
                            <input 
                            type="text" 
                            name="noOfX"
                            value={inputs.noOfX || ""} 
                            onChange={handleChange}
                            />
                            </label>
                        </p> 
                        <p>             
                            <label>Slippage in Percentage: 
                            <input 
                            type="text" 
                            name="slippage"
                            value={inputs.slippage || ""} 
                            onChange={handleChange}
                            />
                            </label>
                        </p>
                    </label>
                }
                </form>
               {inputs.contractAddress.length >=42 && tokenBalance !==0 &&
                    <Button OnClick={handletSellButton} title={visible ? "Start Sell" : "Stop Sell" } > </Button> 
                }
            
             <p>
                  {transactionStatus.status !== TRANSACTION_STATUS.TRANSACTION_NOT_STARTED &&
                    <label>
                        <hr></hr>
                        <p> Trying to sell quantity of tokens: {inputs.noOfTokensToSell} InitialTokenPrice:{currentToken.initialPrice} TargetTokenPrice:{currentToken.targetPrice} NoOfXReached:{currentToken.noOfXReached}</p>
                        <p> Guaranteed Token Swap : {swapToken.guarnteedToken} </p>
                        <p> No of Tokens Loss due to Slippage({inputs.slippage }%): {swapToken.tokenLoss} </p>
                        <p> Current Token ((<TokenSymbol tokenAddress={inputs.contractAddress} />) Price: {currentToken.currentPrice} </p>
                        <hr></hr>
                            <TransactionStatus  status={transactionStatus.status} /> 
                        <p> 
                            <label> Transaction Hash:  
                                <a href ={transactionHash.confirmedHash} target="_blank" rel="noopener" > {transactionHash.confirmedHash} </a>
                            </label>
                        </p>
                    </label>
                    }
            </p>
            </div>
        </>
    )
}
export default SellToken; 