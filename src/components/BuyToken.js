import {useState} from 'react'; 
import Button from './Button';
import web3 from './blockchain/web3'
import {WALLET_PRIVATE_KEY, ROUTER_CONTRACT_ADDRESS, PANCAKE_CONTRACT_ABI, BASE_TOKEN_CONTRACT_ADDRESS, BLOCKCHAIN_BLOCK_EXPLORER, TRANSACTION_STATUS} from './constants.js'
import {  utilsSetBuyTokenTxnStatus} from './blockchain/utils';
import { getNetworkGasPrice } from './blockchain/utils';
import TokenSymbol  from './TokenSymbol'; 
import TokenBalance from './TokenBalance'; 
import TransactionStatus from './TransactionStatus'; 
import ContractTextField from './ContractTextField'; 

function BuyToken()
{
    const [inputs, setInputs] = useState({
        contractAddress:"",
        noOfBNBToBuy:0,
        slippage:10
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
     

    const handleStartBuy = (event) => {
        event.preventDefault();  
        //setTokenProperty({startBuy:false}); 
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
        utilsSetBuyTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS); 
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
        
            if(0 === inputs.slippage)
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

        await web3.eth.sendSignedTransaction(signed_txn.rawTransaction)
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
            utilsSetBuyTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED); 
            })
        .then(function(receipt){
            if(receipt.status)
            {
                utilsSetBuyTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_SUCCESS); 
            }
            else
            {
                utilsSetBuyTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED); 
            }
            console.log("confirmed receipt: "+ receipt.status); 
            setVisible(visible, true); 
            
        })
        .catch(function(error) {
            console.log("exception: " + error);
            setVisible(visible, true); 
            utilsSetBuyTokenTxnStatus(TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION);
        }
        );
              
        }
        catch(error)
        {
            console.log("Exception: " + error); 
            setVisible(visible, true); 
            utilsSetBuyTokenTxnStatus(TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION);
        }
      
        function setBuyTokenTxnStatus(txnStatus)
        {
            utilsSetBuyTokenTxnStatus(txnStatus); 
            setTransactionStatus({status:txnStatus});
        }
            
    }
    return (
        <>
        <div>        
              <ContractTextField onChange={handleChange} title='Enter Valid Contract Address' name="contractAddress" />
                    <br /><br /> 
                     {inputs.contractAddress.length >=42 &&
                   <div>
                         MaxAvailableToken (<TokenSymbol tokenAddress={inputs.contractAddress} />):: 
                                                        <TokenBalance tokenAddress={inputs.contractAddress} funcTokenBalance={setTokenBalance}/> 
                     <br /><br />        
                     <ContractTextField onChange={handleChange} title='Number of BNB to spend' name="noOfBNBToBuy" />
                        
                   
                    <br /><br /> 
                    <ContractTextField onChange={handleChange} title='Slippage in Percentage' name="slippage" />
                   
                    <br /><br /> 
                    <Button OnClick={handleStartBuy} title={visible ? "Start Buy" : "Stop Buy" } > </Button> 
                    </div>
                    } 
           
                    {transactionStatus.status !== TRANSACTION_STATUS.TRANSACTION_NOT_STARTED &&
                        <TransactionStatus  status={transactionStatus.status} /> 
                    }
                
                    {transactionStatus.status !== TRANSACTION_STATUS.TRANSACTION_NOT_STARTED &&
                        <label> Transaction Hash:  
                            <a href ={transactionHash.confirmedHash} target="_blank" rel="noopener noreferrer"> {transactionHash.confirmedHash} </a>
                        </label>
                    }
        </div>
        </>
    );
}
export default BuyToken; 