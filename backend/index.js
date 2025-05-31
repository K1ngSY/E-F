// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { JsonRpcProvider, Wallet, Contract, parseEther } = require("ethers");
const { addFile } = require("./ipfs");
const db = require("./db");  // ← New：database connection

// Path
const artifact = require("../scholartrust-demo/artifacts/contracts/ScholarshipPool.sol/ScholarshipPool.json");
const abi = artifact.abi;

const app = express();
app.use(cors());
app.use(express.json());

// —— Ethereum & Contract Setup —— //
const provider = new JsonRpcProvider(process.env.ETH_RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
const contract = new Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// Multer for file uploads
const upload = multer({ dest: path.join(__dirname, "uploads/") });

// —— Routes —— //

// 1. List all scholarship pools
app.get("/pools", async (req, res, next) => {
  try {
    const countBigInt = await contract.poolCount();
    const count = Number(countBigInt);
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({ poolId: i });
    }
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// 2. Create a new scholarship pool
app.post("/pools", async (req, res, next) => {
  try {
    const { name, description, amountEth } = req.body;
    const tx = await contract.createPool(name, description, {
      value: parseEther(amountEth),
    });
    await tx.wait();
    res.json({ txHash: tx.hash });
  } catch (err) {
    next(err);
  }
});

// 3. Apply for scholarship
app.post("/pools/:id/apply", async (req, res, next) => {
  try {
    const poolId = parseInt(req.params.id, 10);
    const tx = await contract.applyForScholarship(poolId);
    await tx.wait();
    res.json({ txHash: tx.hash });
  } catch (err) {
    next(err);
  }
});

// 4. Vote on an application
app.post("/pools/:id/vote", async (req, res, next) => {
  try {
    const poolId = parseInt(req.params.id, 10);
    const { support } = req.body;
    const tx = await contract.vote(poolId, support);
    await tx.wait();
    res.json({ txHash: tx.hash });
  } catch (err) {
    next(err);
  }
});

// 5. Disburse funds
app.post("/pools/:id/disburse", async (req, res, next) => {
  try {
    const poolId = parseInt(req.params.id, 10);
    const tx = await contract.disburse(poolId);
    await tx.wait();
    res.json({ txHash: tx.hash });
  } catch (err) {
    next(err);
  }
});

// 6. Upload application PDF to IPFS, store CID on‑chain & persist to DB
app.post(
  "/pools/:id/upload",
  upload.single("application"),
  async (req, res, next) => {
    try {
      const poolId = parseInt(req.params.id, 10);

      // 1) Read uploaded file
      const content = fs.readFileSync(req.file.path);

      // 2) Upload to IPFS
      const cid = await addFile(content);

      // 3) Cleanup temp file
      fs.unlinkSync(req.file.path);

      // 4) Call addRecord on‑chain
      const tx = await contract.addRecord(poolId, cid);
      await tx.wait();

      // 5) Persist record into PostgreSQL
      await db.query(
        `INSERT INTO records (pool_id, cid, tx_hash) VALUES ($1, $2, $3)`,
        [poolId, cid, tx.hash]
      );

      // 6) Respond with CID and transaction hash
      res.json({ cid, txHash: tx.hash });
    } catch (err) {
      next(err);
    }
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
