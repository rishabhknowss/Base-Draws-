require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.REACT_APP_PRIVATE_KEY],
      chainId: 84532
    }
  }
};