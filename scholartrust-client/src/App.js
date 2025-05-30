// import React, { useState } from 'react';
// import WalletConnect from './components/WalletConnect';
// import ApplicationForm from './components/ApplicationForm';
// import ScholarshipPool from './components/ScholarshipPool';
// import { getContract } from './utils/contract';
//
// function App() {
//   const [account, setAccount] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [web3, setWeb3] = useState(null);
//
//   const onWalletConnected = (web3Instance, account) => {
//     setWeb3(web3Instance);
//     setAccount(account);
//     setContract(getContract(web3Instance));
//   };
//
//   return (
//     <div style={{ padding: 20 }}>
//       <WalletConnect onWalletConnected={onWalletConnected} />
//       {account && contract && (
//         <>
//           <ScholarshipPool contract={contract} account={account} web3={web3} />
//           <ApplicationForm contract={contract} account={account} />
//         </>
//       )}
//     </div>
//   );
// }
//
// export default App;

import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import WalletConnect from './components/WalletConnect';
import ApplicationForm from './components/ApplicationForm';
import ScholarshipPool from './components/ScholarshipPool';
import { uploadToIPFS } from './utils/ipfs';
import { Container, Typography, Divider } from '@mui/material';

// --- Fake Contract for Testing ---
const fakeContract = {
  methods: {
    submitApplication: (hash) => ({
      send: ({ from }) => {
        console.log('Fake contract call: submitApplication');
        console.log('Metadata hash:', hash);
        console.log('From:', from);
        return Promise.resolve();
      },
    }),
    getPoolBalance: () => ({
      call: () => Promise.resolve('1000000000000000000'), // 1 ETH in wei
    }),
  },
  options: {
    address: '0xFakeContractAddress123',
  },
};

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);

  // Initialize mock environment for testing
  useEffect(() => {
    const initMockEnvironment = () => {
      const mockWeb3 = new Web3();
      setWeb3(mockWeb3);
      setAccount('0xMockAccount123');
      setContract(fakeContract);
    };

    initMockEnvironment();
  }, []);

  const handleWalletConnected = (web3Instance, userAccount) => {
    setWeb3(web3Instance);
    setAccount(userAccount);
    setContract(fakeContract); // Still using fake contract for now
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        ScholarTrust 🏫
      </Typography>
      <WalletConnect onWalletConnected={handleWalletConnected} />
      <Divider sx={{ my: 4 }} />
      {account && contract && web3 && (
        <>
          <Typography variant="h6">💰 Scholarship Pool</Typography>
          <ScholarshipPool contract={contract} account={account} web3={web3} />
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6">📝 Submit Application</Typography>
          <ApplicationForm contract={contract} account={account} />
        </>
      )}
    </Container>
  );
}

export default App;

