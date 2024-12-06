
require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const StellarSdk = require('stellar-sdk');
const SorobanClient = require('soroban-client');
const axios = require('axios');
const FormData = require('form-data'); // Import form-data for handling file uploads

const app = express();
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit to handle larger images if needed
app.use(cors());

// Retrieve Pinata and Stellar credentials from environment variables
const {
  PINATA_API_KEY,
  PINATA_API_SECRET,
  ADMIN_SECRET_KEY,
  CONTRACT_ID,
  PORT = 5001,
  SOROBAN_RPC_URL,
  SOROBAN_NETWORK_PASSPHRASE = 'Test SDF Future Network ; October 2022',
} = process.env;

// Validate that Pinata credentials are provided
if (!PINATA_API_KEY || !PINATA_API_SECRET) {
  console.error('Error: PINATA_API_KEY and PINATA_API_SECRET must be set in .env');
  process.exit(1);
}

// Validate that Stellar admin secret key and contract ID are provided
if (!ADMIN_SECRET_KEY) {
  console.error('Error: ADMIN_SECRET_KEY must be set in .env');
  process.exit(1);
}

if (!CONTRACT_ID) {
  console.error('Error: CONTRACT_ID must be set in .env');
  process.exit(1);
}

if (!SOROBAN_RPC_URL) {
  console.error('Error: SOROBAN_RPC_URL must be set in .env');
  process.exit(1);
}

// Initialize Stellar Admin Keypair
let adminKeypair;
try {
  adminKeypair = StellarSdk.Keypair.fromSecret(ADMIN_SECRET_KEY);
} catch (error) {
  console.error('Error: Invalid Stellar secret key provided.');
  process.exit(1);
}

// Initialize Soroban server
const sorobanServer = new SorobanClient.Server(SOROBAN_RPC_URL, { allowHttp: true });

/**
 * Function to upload image to Pinata
 * @param {string} imageData - Base64 encoded image data
 * @returns {string} - IPFS hash (CID) of the uploaded image
 */
const uploadImageToPinata = async (imageData) => {
  try {
    console.log('Starting uploadImageToPinata function.');

    if (typeof imageData !== 'string') {
      throw new Error('imageData must be a base64 encoded string.');
    }

    // Check if imageData starts with 'data:image/*;base64,'
    let base64Data = imageData;
    const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (matches) {
      base64Data = matches[2];
      console.log('Stripped data URI prefix from imageData.');
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Log buffer length
    console.log(`Converted imageData to buffer of length: ${buffer.length}`);

    // Optional: Detect the actual image type using 'file-type' package
    // For simplicity, assuming PNG here
    // Uncomment the following lines if you wish to detect the image type dynamically
    /*
    const FileType = require('file-type');
    const fileType = await FileType.fromBuffer(buffer);
    if (!fileType || !fileType.mime.startsWith('image/')) {
      throw new Error('Uploaded file is not a valid image.');
    }
    const contentType = fileType.mime;
    const fileExtension = fileType.ext;
    */

    const contentType = 'image/png'; // Adjust based on the image type if not using 'file-type'

    // Create form data
    const formData = new FormData();
    formData.append('file', buffer, 'nft-image.png'); // Removed contentType

    // Optional: Add metadata (e.g., name, keyvalues)
    const metadata = JSON.stringify({
      name: 'NFT Image',
    });
    formData.append('pinataMetadata', metadata);

    // Optional: Add pinataOptions (e.g., cidVersion)
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    // Make the request to Pinata
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

    // console.log(`'Sending request to Pinata...'`);

    const response = await axios.post(url, formData, {
      maxBodyLength: 'Infinity', // Prevents axios from throwing an error on large files
      headers: {
        ...formData.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });

    console.log(`Successfully uploaded to Pinata with IPFS Hash: ${response.data.IpfsHash}`);

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error.response?.data || error.message);
    throw new Error('Failed to upload image to IPFS.');
  }
};

/**
 * Endpoint to mint a new NFT
 */
app.post('/mint', async (req, res) => {
  try {
    const { toPublicKey, tokenId, imageData } = req.body;
    
    if (!toPublicKey || !tokenId || !imageData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters' 
      });
    }

    // Log the request details
    console.log('Received /mint request:', {
      toPublicKey,
      tokenId,
      imageDataLength: imageData.length
    });

    try {
      // Your existing IPFS upload code
      const ipfsHash = await uploadImageToPinata(imageData);
      
      // Your existing minting code
      // ... 

      res.json({ success: true, ipfsHash });
    } catch (error) {
      console.error('Server Error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error during minting process'
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error'
    });
  }
});

// User authentication and other routes...

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});