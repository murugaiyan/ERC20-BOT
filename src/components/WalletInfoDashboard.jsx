
import { BASE_TOKEN_CONTRACT_ADDRESS } from './constants'
import TokenSymbol from './TokenSymbol';
import WalletAddress from './WalletAddress';
import WalletBalance from './WalletBalance';
import NetworkName from './NetworkName';
import Typography from '@mui/material/Typography';

function WalletInfoDashboard() {
    return (
        <>
            <div>
                <Typography variant="h6" component="div" gutterBottom>
                    <hr />
                    Blockchain Network: <NetworkName /> <br /><br />
                    Wallet Address: <WalletAddress /> <br /><br />
                    Wallet Balance (<TokenSymbol tokenAddress={BASE_TOKEN_CONTRACT_ADDRESS} />):  <WalletBalance />
                    <hr />
                </Typography>
            </div>
        </>
    )

}
export default WalletInfoDashboard; 