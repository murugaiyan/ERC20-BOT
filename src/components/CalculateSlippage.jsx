import { useState } from 'react';
import TextField from '@mui/material/TextField';
//import {makeStyles} from '@material-ui/core';

function CalculateSlippage(props) {

    const [errorText, setErrorText] = useState('');
    function handleChange(event) {
        event.preventDefault();
        if (event.target.name === 'contractAddress') {
            if (event.target.value.length < 42) {
                setErrorText("Incorrect Contract Address");
            }
            else {
                setErrorText('');
            }
        }
        props.onChange(event);
    }

    return (
        <>
            <div>
                No of Token Loss Due to Slippage
            </div>
        </>
    );
}

export default ContractTextField; 