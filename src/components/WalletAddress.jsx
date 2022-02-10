import { useState } from 'react';
import web3 from './blockchain/web3';
import { WALLET_PRIVATE_KEY} from './constants'


function WalletAddress(props)
{
    const [address, setAddress] = useState(''); 
    try{
        
        getWalletAddress(); 
        async function getWalletAddress()
        {
            const senderAddress = await web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address.toLowerCase();
            setAddress(senderAddress); 
        }
    }
    catch(error)
    {
        console.log("WalletAddress: Exception: " + error); 
    }

    
    return(
        <>
        <label >{address}</label>
        </>
    ); 
}

export default WalletAddress; 

