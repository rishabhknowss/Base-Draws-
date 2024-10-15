# Base Draws - AI NFT Generator 
Base Draws is a project built using Solidity, JavaScript, Hardhat, Ethers.js, React.js, NFT.Storage, and Hugging Face AI models. Our goal is to provide a fun and innovative way to generate unique NFTs using cutting-edge AI technology.

## Technology Stack & Tools

- Solidity ( Smart Contracts )
- Javascript (React)
- [Hardhat](https://hardhat.org/) (Development)
- Ethers.js (Blockchain Interaction)
- [React.js](https://reactjs.org/) (Frontend Framework)
- [NFT.Storage](https://nft.storage/) (Connection to IPFS)
- [Hugging Face](https://huggingface.co/) (AI Models)
- Pinata Cloud


### BHAI SETUP DEKH LO 
- frontend
```
npm install 
npm start 
```
- web3 bits (make sure to have metamask with base sepolia configs)
```
npx hardhat run ./scripts/deploy.js --network baseSepolia
```

### env

```dotenv
REACT_APP_HUGGING_FACE_API_KEY=""
REACT_APP_NFT_STORAGE_API_KEY=""
REACT_APP_PRIVATE_KEY=""
REACT_APP_PINATA_API_KEY=""
REACT_APP_PINATA_API_KEY_SECRET=""
```