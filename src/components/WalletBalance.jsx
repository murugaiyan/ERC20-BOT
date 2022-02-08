import { useState } from "react";
import web3 from "./blockchain/web3";
import { WALLET_PRIVATE_KEY, POLLING_BLOCKCHAIN_INTERVAL } from "./constants";

function WalletBalance(props) {
  const [balance, setBalance] = useState("");
  try {
    setWalletBalance();
    setInterval(
      setWalletBalance,
      POLLING_BLOCKCHAIN_INTERVAL.INTERVAL_WALLET_BALANCE
    );

    async function setWalletBalance() {
      const walletKey = WALLET_PRIVATE_KEY.toString();
      if (walletKey.length === 64 || walletKey.length === 66) {
        const senderAddress = web3.eth.accounts
          .privateKeyToAccount(WALLET_PRIVATE_KEY)
          .address.toLowerCase();
        const balance = await web3.eth.getBalance(senderAddress);
        const balanceReadable = web3.utils.fromWei(balance, "ether");
        //console.log("utils: BNB Balance: " + balanceReadable);
        setBalance(balanceReadable);
      }
    }
  } catch (error) {
    console.log("WalletBalance: exception: " + error);
  }

  return (
    <>
      <label>{balance}</label>
    </>
  );
}

export default WalletBalance;
