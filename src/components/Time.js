import './Time.css'; 
import { ReactComponent as ClockIcon } from '../icons/clock.svg';
import { ReactComponent as CalenderIcon } from '../icons/calendar.svg';
import React, { useState, useEffect } from 'react';
import { POLLING_BLOCKCHAIN_INTERVAL} from './constants'


function Time()
{
    const [dateState, setDateState] = useState(new Date()); 
    useEffect(() => {
        setInterval(() => setDateState(new Date()), POLLING_BLOCKCHAIN_INTERVAL.INTERVAL_TIME_UPDATE);
 }, []);
    return(
        <>
            <div className="Time">
            <CalenderIcon />
              {dateState.toLocaleDateString('en-GB', {
                 day: 'numeric',
                 month: 'short',
                 year: 'numeric',
              })}
			<ClockIcon />
                {dateState.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                })}
		</div>
            
             
             
        </>
            
    )
}

export default Time; 