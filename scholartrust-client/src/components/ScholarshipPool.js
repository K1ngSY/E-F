import React, { useEffect, useState } from 'react';
import { TextField, Button } from '@mui/material';
import Web3 from 'web3';

export default function ScholarshipPool({ contract, account, web3 }) {
  const [donation, setDonation] = useState('');
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    if (contract) {
      contract.methods.getPoolBalance().call().then((b) => {
        setBalance(web3.utils.fromWei(b, 'ether'));
      });
    }
  }, [contract]);

  const handleDonate = async () => {
    await web3.eth.sendTransaction({
      from: account,
      to: contract.options.address,
      value: web3.utils.toWei(donation, 'ether')
    });
    alert('Thank you for your donation!');
  };

  return (
    <div>
      <h3>Pool Balance: {balance} ETH</h3>
      <TextField label="Amount in ETH" value={donation} onChange={(e) => setDonation(e.target.value)} />
      <Button variant="contained" onClick={handleDonate}>Donate</Button>
    </div>
  );
}

