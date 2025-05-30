// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ScholarshipPool {
    struct Scholarship {
        string name;
        string description;
        uint256 totalAmount;
        uint256 applicantCount;
        uint256 votesFor;
        mapping(address => bool) applied;
        mapping(address => bool) voted;
    }

    mapping(uint256 => Scholarship) private pools;
    uint256 public poolCount;

    event PoolCreated(uint256 indexed poolId, string name, uint256 totalAmount);
    event Applied(uint256 indexed poolId, address applicant);
    event Voted(uint256 indexed poolId, address voter, bool support);
    event Disbursed(uint256 indexed poolId, address recipient, uint256 amount);

    // 构造函数：接收初始资金并自动建池
    constructor() payable {
        require(msg.value > 0, "Must fund scholarship pool");
        Scholarship storage sp = pools[poolCount];
        sp.name = "";            // 默认名称，可后续扩展
        sp.description = "";     // 默认描述
        sp.totalAmount = msg.value;
        poolCount++;
        emit PoolCreated(0, sp.name, msg.value);
    }

    // Create additional scholarship pools on‑chain
    function createPool(string calldata name, string calldata desc) external payable {
        require(msg.value > 0, "Must fund scholarship pool");
        Scholarship storage sp = pools[poolCount];
        sp.name = name;
        sp.description = desc;
        sp.totalAmount = msg.value;
        emit PoolCreated(poolCount, name, msg.value);
        poolCount++;
    }

    // Apply for a scholarship
    function applyForScholarship(uint256 poolId) external {
        Scholarship storage sp = pools[poolId];
        require(!sp.applied[msg.sender], "Already applied");
        sp.applied[msg.sender] = true;
        sp.applicantCount++;
        emit Applied(poolId, msg.sender);
    }

    // Vote on an applicant (support = true/false)
    function vote(uint256 poolId, bool support) external {
        Scholarship storage sp = pools[poolId];
        require(sp.applied[msg.sender], "Must apply first");
        require(!sp.voted[msg.sender], "Already voted");
        sp.voted[msg.sender] = true;
        if (support) {
            sp.votesFor++;
        }
        emit Voted(poolId, msg.sender, support);
    }

    // Disburse funds if majority supports
    function disburse(uint256 poolId) external {
        Scholarship storage sp = pools[poolId];
        require(sp.votesFor * 2 > sp.applicantCount, "Not enough support");
        address payable recipient = payable(msg.sender);
        uint256 amount = sp.totalAmount;
        sp.totalAmount = 0;
        recipient.transfer(amount);
        emit Disbursed(poolId, recipient, amount);
    }
}
