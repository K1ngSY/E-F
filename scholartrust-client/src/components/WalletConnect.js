// src/components/WalletConnect.js
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Button } from '@mui/material';
import MyContract from '../contracts/ScholarshipPool.json'; // replace with your ABI

// ⚠️ Use one of the private keys from Hardhat node output
const CONTRACT_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const PRIVATE_KEY = '0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897'; // deployed on localhost

const WalletConnect = ({ onWalletConnected }) => {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const connectWithoutMetaMask = async () => {
      const web3Instance = new Web3('http://127.0.0.1:8545'); // Hardhat node
      const acct = web3Instance.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
      web3Instance.eth.accounts.wallet.add(acct);
      web3Instance.eth.defaultAccount = acct.address;

      setAccount(acct.address);
      setWeb3(web3Instance);

      // Optional: pass to parent component
      if (onWalletConnected) {
        const contract = new web3Instance.eth.Contract(MyContract.abi, CONTRACT_ADDRESS);
        onWalletConnected(web3Instance, acct.address, contract);
      }
    };

    connectWithoutMetaMask();
  }, [onWalletConnected]);

  return (
    <Button variant="contained" disabled>
      Connected: {account ? `${account.slice(0, 6)}...` : 'Loading...'}
    </Button>
  );
};

export default WalletConnect;

