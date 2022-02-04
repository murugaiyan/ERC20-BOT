import {useState} from 'react'; 
import TextField from '@mui/material/TextField';
//import {makeStyles} from '@material-ui/core';

function ContractTextField(props) {
/*
    const useHelperTextStyles = makeStyles(() => ({
	root: {
		color: "red"
	}
}));
const helperTextStyles = useHelperTextStyles();
*/
    const [errorText, setErrorText] = useState(''); 
    function handleChange(event)
    {
       event.preventDefault(); 
       if(event.target.name === 'contractAddress')
       {
           if(event.target.value.length < 42)
           {
               setErrorText("Incorrect Contract Address");
           }
           else
           {
               setErrorText('');
           }
       }
       props.onChange(event); 
    }

    return(
        <>
            <div>                
                {/*FormHelperTextProps={{
						classes:{
							root:helperTextStyles.root
						}}} */}
            < TextField sx={{ width: "30%", textAlign: 'center'}}  id="outlined-basic" label={props.title} variant="outlined" color="primary" focused 
                        helperText={errorText} 
                        name={props.name} 
                        value={props.value}
                        onChange={(event) =>handleChange(event)}/>
            </div>
            </>
    ); 
}

export default ContractTextField; 