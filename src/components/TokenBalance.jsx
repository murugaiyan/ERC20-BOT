import { useState } from 'react';
import {getTokenBalanceHumanReadable} from './blockchain/utils';

function TokenBalance(props)
{
    const [balance, setBalance] = useState(''); 
    try {
        getSymbols(); 
        async function getSymbols()
        {
            //console.log("utils: TokenBalance Address: " + props.tokenAddress); 
            const tokenBalance = await getTokenBalanceHumanReadable(props.tokenAddress);
            setBalance(tokenBalance);
            props.funcTokenBalance(tokenBalance); 
        }
    }
    catch(error)
    {
        console.log("TokenBalance: Exception: " + error); 
    }
    

    return(
        <>
        <label >{balance}</label>
        </>
    ); 
}

export default TokenBalance; 

