// scripts/deploy.js
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const Factory = await ethers.getContractFactory("ScholarshipPool");
  // 初始部署时打 0.5 ETH 到合约，用于第一个池
  const initFund = ethers.utils.parseEther("0.5");
  const contract = await Factory.deploy({ value: initFund });
  await contract.deployed();

  console.log("ScholarshipPool deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
