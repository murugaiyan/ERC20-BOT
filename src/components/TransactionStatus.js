import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { TRANSACTION_STATUS } from './constants.js'
import { Oval } from 'react-loader-spinner';

function TransactionStatus(props) {
    const [txnStatus,] = useState({
        severity: 'error',
        statusMsg: 'Not Started'
    }
    );
    if (props.status === TRANSACTION_STATUS.TRANSACTION_COMPLETE_SUCCESS) {
        txnStatus.severity = 'success';
        txnStatus.statusMsg = 'Transaction Successful';
    }
    else if ((props.status === TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION) ||
        (props.status === TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED)) {
        txnStatus.severity = 'error';
        txnStatus.statusMsg = 'Transaction Failed';
    }
    else if (props.status === TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS) {
        txnStatus.severity = 'info';
        txnStatus.statusMsg = 'Transaction In Progress';
    }
    else {
        txnStatus.severity = 'warning';
        txnStatus.statusMsg = 'Transaction Not Started';
    }

    return (
        <>
            <Stack sx={{ width: '15%' }} spacing={2}>
                <Alert severity={txnStatus.severity}>Transaction Status: {txnStatus.statusMsg}</Alert>
                {txnStatus.severity === 'info' && < Oval className='OvalStyle' />}
            </Stack>
        </>
    );
}

export default TransactionStatus;

