# ScholarTrust — Decentralized Scholarship Distribution Platform

## Overview

ScholarTrust is a decentralized platform that streamlines scholarship donations, applications, reviews, and fund disbursements using blockchain technology. It addresses common issues in traditional scholarship systems such as lengthy approval processes, lack of transparency, and data tampering risks.

By leveraging Ethereum smart contracts, IPFS decentralized storage, and a user-friendly React frontend, ScholarTrust enables donors, students, and reviewers to participate in a transparent, secure, and automated scholarship workflow.

---

## Features

- **Donor Wallet Integration:** Donors fund scholarship pools using Ethereum wallets.
- **Application Submission:** Students submit encrypted application materials stored on IPFS.
- **On-chain Voting:** Community or teachers vote on scholarship applications directly on the blockchain.
- **Automatic Disbursement:** Smart contracts release funds automatically upon approval.
- **Transparent Dashboard:** Real-time visualization of funds, applications, and statuses.
- **Backend API:** Node.js + Express server for file uploads and data management.
- **Decentralized Storage:** Application files and metadata stored on IPFS.

---

## Technology Stack

- **Frontend:** React, Web3.js, Material-UI
- **Blockchain:** Solidity smart contracts on Ethereum (local Hardhat or public testnet)
- **Storage:** IPFS (InterPlanetary File System)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Deployment:** Docker, AWS ECS

---

## Getting Started

### Prerequisites

- Node.js (recommended v16.x)
- npm or yarn
- MetaMask browser extension or alternative Ethereum wallet
- Hardhat (for local blockchain testing)
- PostgreSQL database
- Docker (optional for containerized deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/scholartrust.git
   cd scholartrust
   ```

2. Install frontend dependencies:
   ```bash
    cd scholartrust-client
    npm install
   ```

3. Install backend dependencies:
   ```bash
    cd ../scholartrust-server
    npm install
   ```

4. Set up PostgreSQL database and configure environment variables for database connection and Ethereum private keys.

### Running the Project Locally
1. Start local Ethereum blockchain (Hardhat):
   ```bash
    npx hardhat node
   ```

2. Deploy the smart contract:
   ```bash
    npx hardhat run scripts/deploy.js --network localhost
   ```

3. Start backend server:
   ```bash
    cd scholartrust-server
    npm start
   ```

4. Start frontend React app:
   ```bash
    cd scholartrust-client
    npm start
    ```
5. Open http://localhost:3000 in your browser and connect your wallet (MetaMask) to the local Hardhat network.