import web3 from './blockchain/web3'
import { ethers } from 'ethers'
import Button from './Button';
import './constants'
import TokenSymbol from './TokenSymbol';
import WalletBalance from './WalletBalance';
import TransactionStatus from './TransactionStatus';
import ContractTextField from './ContractTextField';
import { useState } from 'react';
import { WALLET_PRIVATE_KEY, BLOCKCHAIN_NODE_PROVIDER, BLOCKCHAIN_BLOCK_EXPLORER, TRANSACTION_STATUS, BASE_TOKEN_CONTRACT_ADDRESS } from './constants'
import { utilsSetTransferTokenTxnStatus } from './blockchain/utils'
import Typography from '@mui/material/Typography';

function TransferToken() {

    const [inputs, setInputs] = useState({
        receiverAddress: '',
        qtyToTransfer: ''
    });

    const [transactionHash, setTransactionHash] = useState({
        confirmedHash: '',
    });
    const [transactionStatus, setTransactionStatus] = useState({
        status: TRANSACTION_STATUS.TRANSACTION_NOT_STARTED
    });

    const handleChange = (event) => {
        const value = event.target.value;
        setInputs({
            ...inputs,
            [event.target.name]: value
        });
    }

    const TransferToken = (event) => {
        event.preventDefault();
        startTransferToken();
    }

    async function startTransferToken() {

        try {
            setTransactionHash({ confirmedHash: '' });
            setTransferTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_IN_PROGRESS);
            const senderAddress = await web3.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY).address;
            console.log("Transfer Token Contract Address: " + inputs.receiverAddress);
            console.log("Transfer Token Sender Address: " + senderAddress);
            const recvAddress = await web3.utils.toChecksumAddress(inputs.receiverAddress);
            const provider = new ethers.getDefaultProvider(BLOCKCHAIN_NODE_PROVIDER);
            const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);


            const txn = {
                to: recvAddress,
                value: ethers.utils.parseEther(inputs.qtyToTransfer)
            };
            await wallet.sendTransaction(txn)
                .then((txnObj) => {
                    console.log('Transfer tx: ' + BLOCKCHAIN_BLOCK_EXPLORER + txnObj.hash);
                    setTransferTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_SUCCESS);
                    setTransactionHash({ confirmedHash: BLOCKCHAIN_BLOCK_EXPLORER + txnObj.hash });
                }
                );
        }
        catch (error) {
            setTransferTokenTxnStatus(TRANSACTION_STATUS.TRANSACTION_COMPLETE_EXCEPTION);
            console.log("Transfer Exception: " + error);
        }
        function setTransferTokenTxnStatus(txnStatus) {
            setTransactionStatus({ status: txnStatus });
            utilsSetTransferTokenTxnStatus(txnStatus);
        }
    }

    return (
        <>
            <div>
                <br />
                <Typography variant="h6" component="div" gutterBottom>
                    <ContractTextField onChange={handleChange} title='Receiver Wallet Address' name="receiverAddress" />

                    {(inputs.receiverAddress.length === 42) &&
                        <div>
                            <br />
                            MaxAvailable (<TokenSymbol tokenAddress={BASE_TOKEN_CONTRACT_ADDRESS} />)::<WalletBalance />
                            <br />  <br />
                            <ContractTextField onChange={handleChange} title='Quantity to Transfer' name="qtyToTransfer" />
                            <Button OnClick={TransferToken} title="Send Token" />
                        </div>
                    }
                    {transactionStatus.status !== TRANSACTION_STATUS.TRANSACTION_NOT_STARTED &&
                        <TransactionStatus status={transactionStatus.status} />
                    }
                    <br />
                    {transactionStatus.status !== TRANSACTION_STATUS.TRANSACTION_NOT_STARTED &&
                        <label> Transaction Hash:
                            <a href={transactionHash.confirmedHash} target="_blank" rel="noopener noreferrer"> {transactionHash.confirmedHash} </a>
                        </label>
                    }
                </Typography>

            </div>
        </>
    );
}

export default TransferToken; 
