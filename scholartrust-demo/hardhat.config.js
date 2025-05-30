require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

// module.exports = {
//   solidity: "0.8.17",
//   networks: {
//     goerli: {
//       url: process.env.GOERLI_RPC_URL,
//       accounts: [process.env.PRIVATE_KEY]
//     }
//   }
// };

module.exports = {
  solidity: "0.8.17",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
};
