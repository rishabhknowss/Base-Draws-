import { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';

import Spinner from 'react-bootstrap/Spinner';
import Navigation from './components/Navigation';

import NFT from './abis/NFT.json';
import config from './config.json';

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;
console.log("Pinata API Key:", pinataApiKey);
console.log("Pinata Secret API Key:", pinataSecretApiKey);

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [nft, setNFT] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [url, setURL] = useState(null);

  const [message, setMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  const loadBlockchainData = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const network = await provider.getNetwork();

      if (network.chainId === 84532) {
        const nft = new ethers.Contract(config[network.chainId].nft.address, NFT, provider);
        setNFT(nft);
      } else {
        window.alert("Please connect to Base Sepolia network");
      }
    } else {
      window.alert("Please install MetaMask");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (name === "" || description === "") {
      window.alert("Please provide a name and description");
      return;
    }

    setIsWaiting(true);

    try {
      const imageData = await createImage();

      if (imageData) {
        const url = await uploadToPinata(imageData);

        if (url) {
          await mintImage(url);
        }
      }
    } catch (error) {
      console.error("Error in submit handler:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsWaiting(false);
    }
  };

  const createImage = async () => {
    setMessage("Generating Image...");

    const URL = `https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev`;

    try {
      const response = await axios({
        url: URL,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          inputs: description,
          options: { wait_for_model: true },
        }),
        responseType: 'arraybuffer',
      });

      const type = response.headers['content-type'];
      const data = response.data;

      const base64data = Buffer.from(data).toString('base64');
      const img = `data:${type};base64,` + base64data; 
      setImage(img);

      return data;
    } catch (error) {
      console.error("Error creating image:", error);
      setMessage("Error generating image");
      return null;
    }
  };

  const uploadToPinata = async (imageData) => {
    setMessage("Uploading Image...");

    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

    let data = new FormData();
    data.append('file', new File([imageData], "image.jpeg", { type: "image/jpeg" }));

    const metadata = JSON.stringify({
      name: name,
      keyvalues: {
        description: description,
      },
    });
    data.append('pinataMetadata', metadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    data.append('pinataOptions', pinataOptions);

    try {
      const response = await axios.post(url, data, {
        maxContentLength: 'Infinity', 
        headers: {
          'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });

      const ipfsHash = response.data.IpfsHash;
      const pinataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      setURL(pinataUrl);

      return pinataUrl;
    } catch (error) {
      console.error('Error uploading file to Pinata:', error);
      setMessage("Error uploading file to Pinata");
      return null;
    }
  };

  const mintImage = async (tokenURI) => {
    setMessage("Waiting for Mint...");

    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Get the current balance
      const balance = await provider.getBalance(address);
      
      // Get the cost from the contract
      const cost = await nft.cost();
      
      console.log(`Minting cost: ${ethers.utils.formatEther(cost)} ETH`);
      console.log(`User balance: ${ethers.utils.formatEther(balance)} ETH`);

      // Check if the user has enough balance
      if (balance.lt(cost)) {
        throw new Error(`Insufficient funds. You need at least ${ethers.utils.formatEther(cost)} ETH to mint.`);
      }
      
      const transaction = await nft.connect(signer).mint(tokenURI, { value: cost });
      await transaction.wait();

      setMessage("Mint successful!");
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMessage(`Mint failed: ${error.message}`);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <div className='form' class='frosted-glass'>
        <form onSubmit={submitHandler}>
          <input
            type="text"
            placeholder="Create a name..."
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Create a description..."
            onChange={(e) => setDescription(e.target.value)}
          />
          <input type="submit" value="Create & Mint" />
        </form>

        <div className="image">
          {!isWaiting && image ? (
            <img src={image} alt="AI generated image" />
          ) : isWaiting ? (
            <div className="image__placeholder">
              <Spinner animation="border" />
              <p>{message}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      {!isWaiting && url && (
        <p className=''>
          View&nbsp;<a href={url} target="_blank" rel="noreferrer">Metadata</a>
        </p>
      )}
    </div>
  );
}

export default App;