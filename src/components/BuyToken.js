import {useState} from 'react'; 
import Button from './Button';
import web3 from './blockchain/web3'
import fs from 'fs'; 
import {WALLET_PRIVATE_KEY, ROUTER_CONTRACT_ADDRESS, PANCAKE_CONTRACT_ABI, BASE_TOKEN_CONTRACT_ADDRESS, BLOCKCHAIN_BLOCK_EXPLORER, TRANSACTION_STATUS} from './constants.js'
import { getNetworkGasPrice } from './blockchain/utils';
import TokenSymbol  from './TokenSymbol'; 
import TokenBalance from './TokenBalance'; 
import TransactionStatus from './TransactionStatus'; 

function BuyToken()
{
    const [inputs, setInputs] = useState({
        contractAddress:"",
        noOfBNBToBuy:0,
        slippage:10
      });
    const [currentToken, setTokenProperty] = useState({
        price: "0.000000",
        ticker:"",
        qtyToBuy:0,
        startBuy:false
      }); 
    const [contractABI, setContractABI] = useState(0); 

    const [transactionHash, setTransactionHash] = useState({
        confirmedHash:'',
    });
    const [transactionStatus, setTransactionStatus] = useState({
        status:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED
    });
    const [tokenBalance, setTokenBalance] = useState(0); 
    const [visible, setVisible] = useState(true);

    const handleChange = (event) => {
        const value = event.target.value;
        setInputs({
          ...inputs,
          [event.target.name]: value
        });
      }
      const handleSubmit = (event) => {
        event.preventDefault();
        console.log(inputs.contractAddress + inputs.noOfBNBToBuy);
        setTokenProperty({startBuy:true}); 
        
      }
    const handleStopBuy = (event) => {
        event.preventDefault();  
       setTokenProperty({startBuy:true}); 
    }

    const handleStartBuy = (event) => {
        event.preventDefault();  
        setTokenProperty({startBuy:false}); 
        setVisible(visible =>!visible);
        if(visible){
            
            buyTokenLoop(); 
        }
    }

    async function buyTokenLoop()
    {
        try
        {
        setTransactionHash({confirmedHash:''});
        setTransactionStatus({status:TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS}); 
        const senderAddress = await web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address;
       
        const contract_id = await web3.utils.toChecksumAddress(inputs.contractAddress); 
        console.log("contract id: " + contract_id); 

        const wallet_balance = await web3.eth.getBalance(senderAddress); 
        var balance = await web3.utils.fromWei(wallet_balance, 'ether')
        
        //const routerAbi = JSON.parse(fs.readFileSync('pancake-router-abi.json', 'utf-8'));

        const buyTokenContract = new web3.eth.Contract(PANCAKE_CONTRACT_ABI, ROUTER_CONTRACT_ADDRESS );

        var amountOutMin = await web3.utils.toWei(inputs.noOfBNBToBuy);
        console.log("Buy  Token Contract Address: " + contract_id); 
        console.log("Buy Token Sender Address: " + senderAddress); 
        console.log("No of tokens to Buy: " + inputs.noOfBNBToBuy + "Converted ETH: " + amountOutMin); 
        console.log("Slippage: " + inputs.slippage); 
        console.log("Balance in Wallet : " + balance); 

        const pairAddress = [BASE_TOKEN_CONTRACT_ADDRESS, contract_id];
        const deadline = await web3.utils.toHex(Math.round(Date.now()/1000)+60*20); 
        
            if(0 == inputs.slippage)
            {
                inputs.slippage = 1; 
            }
            
           
            var amountIN = await web3.utils.toWei(inputs.noOfBNBToBuy, 'ether');
            console.log("Nof of BNB to Buy: " + inputs.noOfBNBToBuy + " Slippage(%): " + inputs.slippage ); 
           
            const amount_out = await buyTokenContract.methods.getAmountsOut(amountIN, [BASE_TOKEN_CONTRACT_ADDRESS, contract_id]).call();
            const bnbTokenInReserve = await web3.utils.fromWei(amount_out[0]); 
            const newTokenInReserve = await web3.utils.fromWei(amount_out[1]); 

            const slippageLoss = (inputs.slippage/100);
            
            const lossOfTokenDueToSlippage = (newTokenInReserve * slippageLoss);
            amountIN = newTokenInReserve - lossOfTokenDueToSlippage; 
            var BN1 = web3.utils.BN;
            const amountOutHex = new BN1(amountIN).toString();
            const newAmountOutAfterSlippage = await web3.utils.toWei(amountOutHex); 
            console.log("Liquidity Reserve [BNB][NewToken]: "+ bnbTokenInReserve + " NewToken[]: " + newTokenInReserve ); 
            console.log(" Might Loss of Tokens due to Slippage: " + lossOfTokenDueToSlippage, " Guaranteed in Wallet: " + amountIN); 
            console.log("No of Tokens to Swap: " + amountOutHex);

            var data = await buyTokenContract.methods.swapETHForExactTokens(
            web3.utils.toHex(amount_out[1]),
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

        const newValue = await getNetworkGasPrice(realGasPrice, inputs.noOfBNBToBuy); 

        var count = await web3.eth.getTransactionCount(senderAddress);
        

        var rawTransaction = {
            "from":senderAddress,
            "to": ROUTER_CONTRACT_ADDRESS,
            "gasPrice":web3.utils.toHex(realGasPrice),  
			"gasLimit":web3.utils.toHex(500000),         
            "data":data.encodeABI(),
            "nonce":web3.utils.toHex(count),
            "value": web3.utils.toHex(newValue)
        };
    
        const signed_txn = await web3.eth.accounts.signTransaction(rawTransaction, WALLET_PRIVATE_KEY);

        const tx_token = await web3.eth.sendSignedTransaction(signed_txn.rawTransaction)
        .once('sending', function(payload){ 
            console.log("txn sending: " + payload); 
            })
        .once('sent', function(payload){ 
            console.log("txn sent: " +payload); 
            })
        .once('transactionHash', function(hash){ 
             setTransactionHash({confirmedHash:BLOCKCHAIN_BLOCK_EXPLORER+hash});
            console.log("txn transactionHash: "+  BLOCKCHAIN_BLOCK_EXPLORER+hash); 
            })
        .once('receipt', function(receipt){ 
            console.log("txn receipt: "+ receipt); 
            })
        .once('confirmation', function(confNumber, receipt, latestBlockHash){ 
            console.log("txn confirmation: " + confNumber + " receipt: " + receipt + " latestBlockHash: " + latestBlockHash); 
            })
        .on('error', function(error){ 
            console.log("OnError: "+ error); 
            setTransactionStatus({status:TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED}); 
            })
        .then(function(receipt){
            if(receipt.status)
            {
                setTransactionStatus({status:TRANSACTION_STATUS.TRANSACTION_COMPLETE_SUCCESS}); 
            }
            else
            {
                setTransactionStatus({status:TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED}); 
            }
            console.log("confirmed receipt: "+ receipt.status); 
            setVisible(visible, true); 
            
        })
        .catch(function(error) {
            console.log("exception: " + error);
            setVisible(visible, true); 
            setTransactionStatus({status:TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION});
        }
        );
              
        }
        catch(error)
        {
            console.log("Exception: " + error); 
            setVisible(visible, true); 
            setTransactionStatus({status:TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION});
        }
      

            
    }
    return (
        <>
        <div>
        <form onSubmit={handleSubmit}>
              <label>Buy Token Contract Address: 
                    <input 
                    type="text" 
                    name="contractAddress" 
                    value={inputs.contractAddress || ""} 
                    onChange={handleChange}
                    />
                    </label>
                <p>
                     {inputs.contractAddress.length >=42 &&
                   
                        <label> MaxAvailableToken (<TokenSymbol tokenAddress={inputs.contractAddress} />):: 
                                                        <TokenBalance tokenAddress={inputs.contractAddress} funcTokenBalance={setTokenBalance}/> 
                        </label>                
                     }
                </p>
                <p>
                     {inputs.contractAddress.length >=42 &&
                        <label>Number of BNB to spend: 
                        <input 
                        type="text" 
                        name="noOfBNBToBuy"
                        value={inputs.noOfBNBToBuy || ""} 
                        onChange={handleChange}
                        />
                        </label>
                    }
                </p>                
                <p>
                    {inputs.contractAddress.length >=42 &&
                        <label>Slippage in Percentage: 
                        <input 
                        type="text" 
                        name="slippage"
                        value={inputs.slippage || ""} 
                        onChange={handleChange}
                        />
                        </label>
                    }
                </p> 
            </form>
            <div>
                {inputs.contractAddress.length >=42 &&
                    <Button OnClick={handleStartBuy} title={visible ? "Start Buy" : "Stop Buy" } > </Button> 
                }
            </div>
            <p>
                <label>
                 {transactionStatus.status !== TRANSACTION_STATUS.TRANSACTION_NOT_STARTED &&
                    <TransactionStatus  status={transactionStatus.status} /> 
                 }
                 </label>
            </p>
            <p> 
                {transactionStatus.status !== TRANSACTION_STATUS.TRANSACTION_NOT_STARTED &&
                    <label> Transaction Hash:  
                        <a href ={transactionHash.confirmedHash} target="_blank"> {transactionHash.confirmedHash} </a>
                    </label>
                }
            </p>
        </div>
        </>
    );
}
export default BuyToken; 