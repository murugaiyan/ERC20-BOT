
import TransactionStatus from './TransactionStatus';
import { TRANSACTION_STATUS } from './constants'
import { useState } from 'react';
import { utilsGetApproveTokenTxnStatus, utilsGetSnipeTokenTxnStatus, utilsGetBuyTokenTxnStatus, utilsGetSellTokenTxnStatus, utilsGetTransferTokenTxnStatus } from './blockchain/utils'
import Typography from '@mui/material/Typography';

function Dashboard() {

    const [txnStatus,] = useState({
        snipingStatus: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
        approvalStatus: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
        buyStatus: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
        sellStatus: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED,
        transferStatus: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED
    });

    txnStatus.approvalStatus = utilsGetApproveTokenTxnStatus();
    txnStatus.snipingStatus = utilsGetSnipeTokenTxnStatus();
    txnStatus.buyStatus = utilsGetBuyTokenTxnStatus();
    txnStatus.sellStatus = utilsGetSellTokenTxnStatus();
    txnStatus.transferStatus = utilsGetTransferTokenTxnStatus();

    return (
        <>
            <div>
                <br />
                <Typography variant="h6" component="div" gutterBottom>
                    Sniping Token Status :  <TransactionStatus status={txnStatus.snipingStatus} /> <br />
                    Approval Token Status:   <TransactionStatus status={txnStatus.approvalStatus} /> <br />
                    Buy Token Status:  <TransactionStatus status={txnStatus.buyStatus} /> <br />
                    Sell Token Status:   <TransactionStatus status={txnStatus.sellStatus} /> <br />
                    Transfer Token Status:   <TransactionStatus status={txnStatus.transferStatus} /> <br />
                </Typography>
            </div>
        </>
    );

}
export default Dashboard; 