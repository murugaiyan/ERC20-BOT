import { useState } from 'react';
import {getTokenSymbol} from './blockchain/utils';

function TokenSymbol(props)
{
        const [symbol, setSymbol] = useState(''); 
        getSymbols(); 
        async function getSymbols()
        {
             try {
                //console.log("utils: token address: " + props.tokenAddress); 
                setSymbol(await getTokenSymbol(props.tokenAddress));
                }
                catch(error){
                    console.log("TokenSymbol: Exception: " + error); 
                }
        }

    return(
        <>
            <label ><b>{symbol}</b></label>
        </>
    ); 
}

export default TokenSymbol; 

