import getApproveTokenTxnStatus from './Approve'
import getSnipeTokenTxnStatus from './SnipingContract'; 
import getSellTokenTxnStatus from './SellToken'; 
import getBuyTokenTxnStatus from './BuyToken'; 
import TransactionStatus from './TransactionStatus'; 
import {TRANSACTION_STATUS} from './constants.js'
import {useState} from 'react'; 
function Dashboard()
{
   
    const [txnStatus, setTxnStatus] = useState( {
        snipingStatus:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
        approvalStatus:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
        buyStatus:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
        sellStatus:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED

    }); 

    txnStatus.snipingStatus = getSnipeTokenTxnStatus(); 
    txnStatus.approvalStatus = getApproveTokenTxnStatus(); 
    txnStatus.buyStatus = getBuyTokenTxnStatus(); 
    txnStatus.sellStatus = getSellTokenTxnStatus(); 

    console.log("Dashboard Sell Status: ", txnStatus.sellStatus); 

/*
    setTxnStatus({...txnStatus, snipingStatus:getSnipeTokenTxnStatus() }); 
    setTxnStatus({...txnStatus, approvalStatus:getApproveTokenTxnStatus() }); 
    setTxnStatus({...txnStatus, buyStatus:getBuyTokenTxnStatus() }); 
    setTxnStatus({...txnStatus, sellStatus:getSellTokenTxnStatus() }); 
  */     
   
    return (
        <>
        <div> 
            Sniping Token Status :  <TransactionStatus  status={txnStatus.snipingStatus} /> <br /><br />
            Approval Token Status:   <TransactionStatus  status={txnStatus.approvalStatus} /> <br /><br />
            Buy Token Status:  <TransactionStatus  status={txnStatus.buyStatus} /> <br /><br />
            Sell Token Status:   <TransactionStatus  status={txnStatus.sellStatus} /> <br /><br />
            <hr />
         </div> 
        </>
    );
    
}
export default Dashboard; 