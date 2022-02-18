import {useState} from 'react'; 
import {BLOCKCHAIN_CHAIN_ID_NETWORK, BLOCKCHAIN_CHAIN_ID} from './constants'
function NetworkName()
{
    const [network, ] = useState({
        name:'unknown network'
    }); 
    
            if(BLOCKCHAIN_CHAIN_ID === BLOCKCHAIN_CHAIN_ID_NETWORK.BSC_MAINNET)
            {
                network.name = "BNB Chain";                  
            }
            else if(BLOCKCHAIN_CHAIN_ID  === BLOCKCHAIN_CHAIN_ID_NETWORK.BSC_TESTNET)
            {
                network.name = "BNB Chain Testnet";
            }
            else if(BLOCKCHAIN_CHAIN_ID === BLOCKCHAIN_CHAIN_ID_NETWORK.ETH_MAINNET)
            {
                network.name = "Ethereum Mainnet"; 
            }
            else if(BLOCKCHAIN_CHAIN_ID === BLOCKCHAIN_CHAIN_ID_NETWORK.ETH_GOERILI)
            {
                network.name = "Ethereum Goeril Testnet"; 
            }
            else
            {
                network.name = "unknown"; 
            }

    return (
        <>
        <label>{network.name}</label>
        </>
    );
}
export default NetworkName; 