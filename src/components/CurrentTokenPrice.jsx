import { useState, useEffect} from 'react';
import { getTokenPrice } from "./tokenPrice";
import {getTokenBalanceHumanReadable} from "./blockchain/utils"; 
//import { POLLING_BLOCKCHAIN_INTERVAL } from "./constants";

function CurrentTokenPrice(props)
{
        const [price, setPrice] = useState(0); 
        const [totalPrice, setTotalPrice] = useState(0); 
        //getPrice();
        useEffect(() => {
       getPrice();
        //setInterval(getPrice,POLLING_BLOCKCHAIN_INTERVAL.INTERVAL_MONITOR_TOKEN_PRICE);
        }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
        async function getPrice()
        {
            try {
                //console.log("utils: CurrenTokenPrice Address: " + props.tokenAddress); 
                const currentTokenPriceInUSD = await getTokenPrice(props.tokenAddress);
                const currentPrice = currentTokenPriceInUSD[1];
                setPrice(currentPrice);
                const tokenBalance = await getTokenBalanceHumanReadable(props.tokenAddress);
                if(tokenBalance === 0)
                {
                    setTotalPrice(0); 
                }
                else
                {
                    const tmpTotalPrice = currentPrice * tokenBalance;     
                    setTotalPrice(tmpTotalPrice);
                }
            }
            catch(error)
            {
                console.log("CurrenTokenPrice: Exception: " + error); 
            }
        }

    return(
        <>
        <div>
         USD Price/Token: {price}
         <br />
         Total Price: {totalPrice}
        </div>
        </>
    ); 
}

export default CurrentTokenPrice; 

