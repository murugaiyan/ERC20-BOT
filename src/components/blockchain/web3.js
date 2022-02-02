import Web3 from "web3";
import {BLOCKCHAIN_NODE_PROVIDER} from '../constants'
//window.ethereum.request({ method: "eth_requestAccounts" });
 
//const web3 = new Web3(window.ethereum);
//const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/')); // MAINNET
const web3 = new Web3(new Web3.providers.HttpProvider(BLOCKCHAIN_NODE_PROVIDER));
 
export default web3;