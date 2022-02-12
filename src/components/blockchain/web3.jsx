import Web3 from "web3";
import {BLOCKCHAIN_NODE_PROVIDER} from '../constants'
const web3 = new Web3(new Web3.providers.HttpProvider(BLOCKCHAIN_NODE_PROVIDER));
 
export default web3;