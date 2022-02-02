import { useState } from 'react';
import web3 from './blockchain/web3';
import { WALLET_PRIVATE_KEY} from './constants.js'


function WalletAddress(props)
{
    const [address, setAddress] = useState(''); 
    getWalletAddress(); 
    async function getWalletAddress()
    {
        const senderAddress = await web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address;
        setAddress(senderAddress); 
    }
    
    return(
        <>
        <label >{address}</label>
        </>
    ); 
}

export default WalletAddress; 

