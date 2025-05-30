import React, { useState } from 'react';
import Web3 from 'web3';
import { Button } from '@mui/material';

export default function WalletConnect({ onWalletConnected }) {
  const [account, setAccount] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      onWalletConnected(web3, accounts[0]);
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <Button variant="contained" onClick={connectWallet}>
      {account ? `Connected: ${account.slice(0, 6)}...` : 'Connect Wallet'}
    </Button>
  );
}

