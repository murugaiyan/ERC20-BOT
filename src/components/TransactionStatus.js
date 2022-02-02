import { useState } from 'react';
import Alert from '@mui/material/Alert';
import {TRANSACTION_STATUS} from './constants.js'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Oval } from  'react-loader-spinner';

function TransactionStatus(props)
{
    const [txnStatus, setStatus] = useState({
        severity:'error',
        statusMsg:'Not Started'
    }
    ); 
    if(props.status === TRANSACTION_STATUS.TRANSACTION_COMPLETE_SUCCESS)
    {
        txnStatus.severity = 'success'; 
        txnStatus.statusMsg = 'Transaction Successful'; 
    }
    else if ((props.status === TRANSACTION_STATUS.TRANACTIONO_COMPLETE_EXCEPTION) ||
        (props.status === TRANSACTION_STATUS.TRANSACTION_COMPLETE_FAILED))
    { 
        txnStatus.severity = 'error'; 
        txnStatus.statusMsg = 'Transaction Failed';         
    }
    else if (props.status === TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS)
    { 
        txnStatus.severity = 'info'; 
        txnStatus.statusMsg = 'Transaction In Progress'; 
    }

    return(
        <>
        <Alert severity={txnStatus.severity}>Transaction Status: {txnStatus.statusMsg}</Alert>
        {txnStatus.severity === 'info' && < Oval className='OvalStyle'/>}
        
        </>
    ); 
}

export default TransactionStatus; 

