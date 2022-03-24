import Web3 from "web3";
import network from "net"; 
import {BLOCKCHAIN_NODE_PROVIDER} from '../constants'
let web3; 
function getWeb3Provider()
{
    const provider = BLOCKCHAIN_NODE_PROVIDER; 
    try {
      
        if(provider.includes('http://') || provider.includes('https://'))
        {
            web3 = new Web3(new Web3.providers.HttpProvider(provider));
        }
        else if(provider.includes('ws://') || provider.includes('wss://'))
        {
            web3 = new Web3(new Web3.providers.WebsocketProvider(provider));
        }
        else if(provider.includes('.ipc'))
        {
            web3 = new Web3(new Web3.providers.IpcProvider(provider, network));
        }
    }
    catch (error)
    {
        console.log("getweb3provider: exception: " + error); 
    }
}
getWeb3Provider(); 
 
export default web3;