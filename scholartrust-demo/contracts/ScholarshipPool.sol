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

    // 每个池的基本信息
    mapping(uint256 => Scholarship) private pools;
    uint256 public poolCount;

    // 新增：每个池对应的 IPFS CID 列表
    mapping(uint256 => string[]) public records;

    // 事件
    event PoolCreated(uint256 indexed poolId, string name, uint256 totalAmount);
    event Applied(uint256 indexed poolId, address applicant);
    event Voted(uint256 indexed poolId, address voter, bool support);
    event Disbursed(uint256 indexed poolId, address recipient, uint256 amount);
    event RecordAdded(uint256 indexed poolId, string cid);

    /// @notice 部署时可支付初始资金，为池子 0 预置一个 empty pool
    constructor() payable {
        require(msg.value > 0, "Must fund scholarship pool");
        Scholarship storage sp = pools[poolCount];
        sp.name = "";
        sp.description = "";
        sp.totalAmount = msg.value;
        poolCount++;
        emit PoolCreated(0, "", msg.value);
    }

    /// @notice 创建新的奖学金池
    function createPool(string calldata name, string calldata desc) external payable {
        require(msg.value > 0, "Must fund scholarship pool");
        Scholarship storage sp = pools[poolCount];
        sp.name = name;
        sp.description = desc;
        sp.totalAmount = msg.value;
        emit PoolCreated(poolCount, name, msg.value);
        poolCount++;
    }

    /// @notice 申请该奖学金（同一地址只能申请一次）
    function applyForScholarship(uint256 poolId) external {
        Scholarship storage sp = pools[poolId];
        require(!sp.applied[msg.sender], "Already applied");
        sp.applied[msg.sender] = true;
        sp.applicantCount++;
        emit Applied(poolId, msg.sender);
    }

    /// @notice 对申请者投票：support = true 表示支持
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

    /// @notice 如果支持票数过半，则拨款给调用者
    function disburse(uint256 poolId) external {
        Scholarship storage sp = pools[poolId];
        require(sp.votesFor * 2 > sp.applicantCount, "Not enough support");
        uint256 amount = sp.totalAmount;
        sp.totalAmount = 0;
        address payable recipient = payable(msg.sender);
        recipient.transfer(amount);
        emit Disbursed(poolId, recipient, amount);
    }

    /// @notice 新增存证记录：在链上记录 IPFS 上存储的文件 CID
    function addRecord(uint256 poolId, string calldata cid) external {
        records[poolId].push(cid);
        emit RecordAdded(poolId, cid);
    }
}
