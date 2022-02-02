
import {BASE_TOKEN_CONTRACT_ADDRESS} from './constants'
import TokenSymbol  from './TokenSymbol'; 
import WalletAddress from './WalletAddress'; 
import WalletBalance from './WalletBalance'; 
import NetworkName from './NetworkName'; 
function WalletInfoDashboard()
{
    return (
        <>
        <p> 
            Blockchain Network: <NetworkName /> <br /><br />
            Wallet Address: <WalletAddress /> <br /><br />
            Wallet Balance (<TokenSymbol tokenAddress={BASE_TOKEN_CONTRACT_ADDRESS} />):  <WalletBalance /> 
            <hr />
         </p> 
        </>
    )
    
}
export default WalletInfoDashboard; 