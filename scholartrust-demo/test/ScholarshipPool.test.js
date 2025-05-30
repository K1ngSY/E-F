const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ScholarshipPool", function () {
  let pool, owner, applicant;

  beforeEach(async () => {
    [owner, applicant] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ScholarshipPool");
    // 部署合约并预存 1 ETH
    pool = await Factory.deploy({ value: ethers.utils.parseEther("1") });
    await pool.deployed();
  });

  it("poolCount 应该是 1", async () => {
    expect(await pool.poolCount()).to.equal(1);
  });

  it("申请、投票、拨款流程", async () => {
    // applicant 申请
    await pool.connect(applicant).applyForScholarship(0);

    // 投票支持
    await pool.connect(applicant).vote(0, true);

    // 现在满足 votesFor*2 > applicantCount，可以拨款给调用者
    await expect(
      pool.connect(applicant).disburse(0)
    )
      .to.emit(pool, "Disbursed")
      .withArgs(
        0,
        applicant.address,
        ethers.utils.parseEther("1")
      );
  });
});
