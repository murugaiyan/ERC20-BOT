import { useState } from 'react';
import {getTokenSymbol} from './blockchain/utils';

function TokenSymbol(props)
{
    const [symbol, setSymbol] = useState(''); 
    getSymbols(); 
    async function getSymbols()
    {
        //console.log("utils: token address: " + props.tokenAddress); 
        setSymbol(await getTokenSymbol(props.tokenAddress));
    }

    return(
        <>
        <label >{symbol}</label>
        </>
    ); 
}

export default TokenSymbol; 

