import web3 from './blockchain/web3'
import {ethers} from 'ethers'
import Button from './Button';
import './Approve.css';
import './constants'
import TokenSymbol  from './TokenSymbol'; 
import TokenBalance from './TokenBalance'; 
import TransactionStatus from './TransactionStatus'; 
import ContractTextField from './ContractTextField'; 
import {useState} from 'react'; 
import {WALLET_PRIVATE_KEY, ROUTER_CONTRACT_ADDRESS, BLOCKCHAIN_NODE_PROVIDER, BLOCKCHAIN_BLOCK_EXPLORER, TRANSACTION_STATUS} from './constants.js'
import {utilsSetApproveTokenTxnStatus} from './blockchain/utils'

function Approve() {


    const [inputs, setInputs] = useState({
        contractAddress:''
    }); 

    const [transactionHash, setTransactionHash] = useState({
        confirmedHash:'',
    });
    const [transactionStatus, setTransactionStatus] = useState({
        status:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED
    });

    

     const [tokenBalance, setTokenBalance] = useState(0); 
    const ERC20ABI = [
        "function approve(address , uint256 )  returns (bool)",
        "function symbol()  view returns (string)"
    ];

    const handleChange = (event) => {
        const value = event.target.value;
        setInputs({
          ...inputs,
          [event.target.name]: value
        });
      }

      const approveToken = (event) => {
        event.preventDefault();
        startApproveToken(); 
      }
      
       async  function startApproveToken () {
        
        try {
            setTransactionHash({confirmedHash:''});
            setApproveTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS); 
            const senderAddress = await web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address;
            console.log("Approve Token Contract Address: " + inputs.contractAddress); 
            console.log("Approve Token Sender Address: " + senderAddress); 
            const contract_id = await web3.utils.toChecksumAddress(inputs.contractAddress); 

        
            const provider = new ethers.getDefaultProvider(BLOCKCHAIN_NODE_PROVIDER);
            const signer = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
            const sellTokenContract = new ethers.Contract(contract_id, ERC20ABI,  signer);

            const TOKENS = await web3.utils.toHex('115792089237316195423570985008687907853269984665640564039457584007913129639935');
            const gasPrice = await web3.eth.getGasPrice();
            console.log("Current Gas Price: ", gasPrice); 
            const newGasPrice = Math.floor(gasPrice * 2);
            const data= await sellTokenContract.approve(ROUTER_CONTRACT_ADDRESS, TOKENS,
                                {
                                    gasPrice: ethers.BigNumber.from(newGasPrice).toHexString(),
                                    gasLimit: ethers.BigNumber.from(400000).toHexString()
                                }); 
            
            console.log('approve tx: ' +  BLOCKCHAIN_BLOCK_EXPLORER+data.hash);
            setApproveTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_SUCCESS); 
            setTransactionHash({confirmedHash:BLOCKCHAIN_BLOCK_EXPLORER+data.hash});
            
        }
        catch(error)
        {
            setApproveTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_EXCEPTION); 
            console.log("Approve Exception: " + error); 
        }
        function setApproveTokenTxnStatus(txnStatus)
        {
            setTransactionStatus({status:txnStatus}); 
            utilsSetApproveTokenTxnStatus(txnStatus); 
        }
      }

    return (
        <>    
           <div>
              <ContractTextField onChange={handleChange} title='Enter Valid Contract Address' name="contractAddress" />
                  
                    <br /> 
                    {inputs.contractAddress.length >=42 &&
                    <label> MaxAvailableToken (
                        {(inputs.contractAddress.length >=42) && <TokenSymbol tokenAddress={inputs.contractAddress} />}
                        ):: 
                        {(inputs.contractAddress.length >=42) && <TokenBalance tokenAddress={inputs.contractAddress} funcTokenBalance={setTokenBalance}/> }
                    </label>
                    }
                <br />
                 {(inputs.contractAddress.length >=42) &&
                    <Button OnClick={approveToken} title="Approve Token" /> 
                 }
               
           
             
                 {transactionStatus.status !== TRANSACTION_STATUS.TRANSACTION_NOT_STARTED &&
                    <TransactionStatus status={transactionStatus.status} /> 
                 }
                <br /> 
                 {transactionStatus.status !== TRANSACTION_STATUS.TRANSACTION_NOT_STARTED &&
                        <label> Transaction Hash:  
                            <a href ={transactionHash.confirmedHash} target="_blank" rel="noopener noreferrer"> {transactionHash.confirmedHash} </a>
                        </label>
                 }
            
            </div>
        </>
    );
}

export default Approve; 
