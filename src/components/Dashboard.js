
import TransactionStatus from './TransactionStatus'; 
import {TRANSACTION_STATUS} from './constants.js'
import {useState} from 'react'; 
import {utilsGetApproveTokenTxnStatus, utilsGetSnipeTokenTxnStatus, utilsGetBuyTokenTxnStatus, utilsGetSellTokenTxnStatus} from './blockchain/utils'

function Dashboard()
{
   
    const [txnStatus, ] = useState( {
        snipingStatus:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
        approvalStatus:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
        buyStatus:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
        sellStatus:TRANSACTION_STATUS.TRANSACTION_NOT_STARTED

    }); 

    txnStatus.approvalStatus = utilsGetApproveTokenTxnStatus (); 
    txnStatus.snipingStatus = utilsGetSnipeTokenTxnStatus(); 
    txnStatus.buyStatus = utilsGetBuyTokenTxnStatus(); 
    txnStatus.sellStatus = utilsGetSellTokenTxnStatus(); 
   
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