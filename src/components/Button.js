import React from 'react';
import './Button.css';

function Button (props) {

    return(
        <>
        <button 
            className="load-button"
            onClick={props.OnClick}
        >
            {props.title}
        </button>
        </>
    ); 
}

export default Button; 