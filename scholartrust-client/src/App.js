// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import {
  Container,
  Box,
  Typography,
  TextField,ç
  Button,
  Divider,
  Grid,
} from "@mui/material";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
const RPC_URL = process.env.REACT_APP_ETH_RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS =
  process.env.REACT_APP_CONTRACT_ADDRESS || "0xYourContractAddressHere";
const POOL_ABI = ["function disburse(uint256 poolId) external"];

function App() {
  // JSON‑RPC provider for balance queries
  const [provider, setProvider] = useState(null);

  // Fund wallet private key & derived address & balance
  const [fundPk, setFundPk] = useState("");
  const [fundAddress, setFundAddress] = useState("");
  const [fundBalance, setFundBalance] = useState("0");

  // Student wallet private key, manual address & balance
  const [studentPk, setStudentPk] = useState("");
  const [studentAddrInput, setStudentAddrInput] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [studentBalance, setStudentBalance] = useState("0");

  // Fixed poolId = 0 for demo
  const poolId = 0;

  // Application form fields
  const [studentName, setStudentName] = useState("");
  const [studentID, setStudentID] = useState("");
  const [applyAmount, setApplyAmount] = useState("0.05");
  const [applicationFile, setApplicationFile] = useState(null);

  // Voting state for 3 simulated reviewers
  const [votes, setVotes] = useState([null, null, null]);
  const [supportCount, setSupportCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [canDisburse, setCanDisburse] = useState(false);

  // Initialize provider & load balances on mount
  useEffect(() => {
    const prov = new ethers.JsonRpcProvider(RPC_URL);
    setProvider(prov);
    refreshBalances();
  }, []);

  // Refresh pool & fund & student balances
  async function refreshBalances() {
    if (!provider) return;
    try {
      // Pool (contract) balance
      const poolBal = await provider.getBalance(CONTRACT_ADDRESS);
      setFundBalance(ethers.formatEther(poolBal));

      // Derive fund address from PK
      if (fundPk) {
        const w = new ethers.Wallet(fundPk);
        setFundAddress(await w.getAddress());
      }

      // Student address: prefer PK-derived, else manual
      let addr = "";
      if (studentPk) {
        const w2 = new ethers.Wallet(studentPk);
        addr = await w2.getAddress();
      } else if (studentAddrInput) {
        addr = studentAddrInput.trim();
      }
      setStudentAddress(addr);

      // Query student balance
      if (addr && ethers.isAddress(addr)) {
        const bal2 = await provider.getBalance(addr);
        setStudentBalance(ethers.formatEther(bal2));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Create or top‑up pool (demo uses createPool)
  async function handleFundPool() {
    if (!fundPk) {
      return alert("Enter Fund private key first");
    }
    try {
      const amountEth = prompt("Amount to fund pool (ETH):", "1.0");
      if (!amountEth) return;
      await axios.post(`${BACKEND}/pools`, {
        name: "Demo Pool",
        description: "Front-end deposit",
        amountEth,
      });
      alert("Pool funded");
      refreshBalances();
    } catch (e) {
      console.error(e);
      alert("Funding failed: " + e.message);
    }
  }

  // Submit application: upload PDF & apply
  async function handleSubmitApplication() {
    if (!applicationFile) {
      return alert("Please select a PDF file");
    }
    try {
      // 1) Upload & record
      const form = new FormData();
      form.append("application", applicationFile);
      const res = await axios.post(
        `${BACKEND}/pools/${poolId}/upload`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert(`Upload success: CID=${res.data.cid}`);

      // 2) Apply
      await axios.post(`${BACKEND}/pools/${poolId}/apply`);
      alert("Application registered");

      // Reset voting UI
      setVotes([null, null, null]);
      setSupportCount(0);
      setTotalCount(0);
      setCanDisburse(false);
    } catch (e) {
      console.error(e);
      alert("Application failed: " + (e.response?.data?.error || e.message));
    }
  }

  // One reviewer vote -> backend
  async function handleOneVote(index, support) {
    if (votes[index] !== null) return;
    try {
      await axios.post(`${BACKEND}/pools/${poolId}/vote`, { support });
      const newVotes = [...votes];
      newVotes[index] = support;
      setVotes(newVotes);
      const nt = totalCount + 1;
      const ns = supportCount + (support ? 1 : 0);
      setTotalCount(nt);
      setSupportCount(ns);
      setCanDisburse(ns > nt / 2);
    } catch (err) {
      console.error(err);
      alert("Vote failed: " + (err.response?.data?.error || err.message));
    }
  }

  // Disburse scholarship: student wallet signs
  async function handleDisburse() {
    if (!canDisburse) {
      return alert("Not enough support");
    }
    if (!studentPk && !ethers.isAddress(studentAddrInput)) {
      return alert("Enter student PK or valid address");
    }
    try {
      // Student signer
      const signer = studentPk
        ? new ethers.Wallet(studentPk, provider)
        : provider.getSigner(studentAddress);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        POOL_ABI,
        signer
      );
      const tx = await contract.disburse(poolId);
      await tx.wait();
      alert("Disbursed on-chain");
      refreshBalances();
    } catch (e) {
      console.error(e);
      alert("Disburse failed: " + (e.error?.message || e.message));
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Scholarship Demo
      </Typography>

      {/* Fund & Pool Info */}
      <Box sx={{ mb: 3, p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
        <Typography variant="h6">Fund Pool</Typography>
        <TextField
          label="Fund Private Key"
          fullWidth
          value={fundPk}
          onChange={(e) => setFundPk(e.target.value.trim())}
          helperText={`Pool Balance: ${fundBalance} ETH`}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleFundPool}>
          Fund Pool
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Student Wallet & Balances */}
      <Box sx={{ mb: 3, p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
        <Typography variant="h6">Student Wallet</Typography>
        <TextField
          label="Student Private Key (optional)"
          fullWidth
          value={studentPk}
          onChange={(e) => setStudentPk(e.target.value.trim())}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Student Address (if no PK)"
          fullWidth
          value={studentAddrInput}
          onChange={(e) => setStudentAddrInput(e.target.value.trim())}
          helperText={`Address: ${studentAddress} | Balance: ${studentBalance} ETH`}
        />
        <Button variant="outlined" onClick={refreshBalances} sx={{ mt: 2 }}>
          Refresh Balances
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Application & Voting */}
      <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
        <Typography variant="h6">
          Application & Voting (Pool #{poolId})
        </Typography>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Student Name"
            fullWidth
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Student ID"
            fullWidth
            value={studentID}
            onChange={(e) => setStudentID(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Application Amount (ETH)"
            fullWidth
            value={applyAmount}
            onChange={(e) => setApplyAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setApplicationFile(e.target.files[0])}
            style={{ marginBottom: 16 }}
          />
          <Button variant="contained" onClick={handleSubmitApplication}>
            Submit Application
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography>
          Votes: {supportCount} support / {totalCount} total
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {votes.map((v, idx) => (
            <Grid key={idx} item>
              <Typography>Reviewer {idx + 1}</Typography>
              <Button
                size="small"
                variant="outlined"
                color="success"
                disabled={v !== null}
                onClick={() => handleOneVote(idx, true)}
                sx={{ mr: 1 }}
              >
                Support
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={v !== null}
                onClick={() => handleOneVote(idx, false)}
              >
                Oppose
              </Button>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Button
          variant="contained"
          color="primary"
          disabled={!canDisburse}
          onClick={handleDisburse}
        >
          {canDisburse ? "Disburse Scholarship" : "Not Enough Support"}
        </Button>
      </Box>
    </Container>
  );
}

export default App;
