import ReactDOM, { render } from 'react-dom';
import Time from './components/Time'; 
import SnipingContract from './components/SnipingContract';
import Navigation from './components/Navigation';
import WalletInfoDashboard from './components/WalletInfoDashboard';
import cors from 'cors'; 


function App () {
  

return(
  <>
  <h2 align="center"> MURU BOT </h2>
  <Time />
  <WalletInfoDashboard />
  <Navigation />
  </>
)

}

export default App; 