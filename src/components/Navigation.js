import React from 'react';
import {useState} from 'react'; 
import './Navigation.css'
import Button from './Button';
import SnipingContract from './SnipingContract';
import SellToken from './SellToken'; 
import BuyToken from './BuyToken';
import Dashboard from './Dashboard';
import Approve from './Approve';
function Navigation()
{

    const [tokenFunction, setTokenFunction] = useState({
        dashBoard:false,
        approve:false,
        snipeToken:false,
        buyToken:false,
        sellToken:false
    }); 
        const handleDashboard = (event) => {
            event.preventDefault();  
            setTokenFunction({dashBoard:true});
        }
        const handleSnipeToken = (event) => {
            event.preventDefault();  
            setTokenFunction({snipeToken:true});
        }
        const handleSellToken = (event) => {
            event.preventDefault();  
            setTokenFunction({sellToken:true});
        }
        const handleBuyToken = (event) => {
            event.preventDefault();  
            setTokenFunction({buyToken:true});
        }
        const handleApproveToken = (event) => {
            event.preventDefault();  
            setTokenFunction({approve:true});
        }

    return(
        <>
       
        <Button OnClick={handleDashboard} title="Dashboard" />
        <Button OnClick={handleSnipeToken} title="Snipe Token" />
        <Button OnClick={handleApproveToken} title="Approve Token " />
        <Button OnClick={handleBuyToken} title="Buy Token " />
        <Button OnClick={handleSellToken} title="Sell Token " />
        <hr />
        {tokenFunction.snipeToken === true && <SnipingContract /> }
        {tokenFunction.approve === true && <Approve /> }
        {tokenFunction.sellToken === true && <SellToken /> }
        {tokenFunction.buyToken === true && <BuyToken /> }
        {tokenFunction.dashBoard === true && <Dashboard /> }
       
        </>
    )
}
export default Navigation; 