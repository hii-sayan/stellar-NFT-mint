import './MintNFT.css';
import React, { useState } from 'react';
import axios from 'axios';

function MintNFT({ publicKey }) {
  const [imageData, setImageData] = useState(null);
  const [tokenId, setTokenId] = useState('');
  const [minting, setMinting] = useState(false);
  const [message, setMessage] = useState('');
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [mintedNFTs, setMintedNFTs] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('Only JPEG, PNG, and GIF files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setImageData(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleMint = async () => {
    if (!imageData || !tokenId) {
      setMessage('Please provide both Token ID and Image.');
      return;
    }

    setMinting(true);
    setMessage('Uploading image to IPFS and minting NFT, please wait...');

    try {
      const response = await axios.post('http://localhost:5001/mint', {
        toPublicKey: publicKey,
        tokenId: parseInt(tokenId),
        imageData,
      });

      if (response.data.success) {
        const ipfsHash = response.data.ipfsHash;
        const pinataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        
        const newNFT = {
          tokenId,
          ipfsUrl: pinataUrl,
          timestamp: new Date().toISOString()
        };
        
        setMintedNFTs(prev => [newNFT, ...prev]); // Add to beginning of array
        setIpfsUrl(pinataUrl);
        setMessage('NFT minted successfully!');
        
        // Clear the form
        setTokenId('');
        setImageData(null);
      } else {
        setMessage(`Minting failed: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Minting Error:', error);
      setMessage(`Minting failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="mint-nft-container">
      <div className="mint-section">
        <h2 className="section-title">Mint Your NFT</h2>
        
        <div className="input-group">
          <label htmlFor="tokenId" className="input-label">Token ID:</label>
          <input
            id="tokenId"
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            min="1"
            className="input-field"
            placeholder="Enter unique token ID"
            required
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="imageUpload" className="input-label">Upload Image:</label>
          <input 
            id="imageUpload"
            type="file" 
            accept="image/jpeg,image/png,image/gif" 
            onChange={handleImageUpload} 
            className="file-input"
            required 
          />
        </div>
        
        <button 
          onClick={handleMint} 
          disabled={minting || !imageData || !tokenId}
          className="mint-button"
        >
          {minting ? 'Minting...' : 'Mint NFT'}
        </button>
        
        {message && (
          <p className={`message ${message.includes('failed') ? 'error-message' : 'success-message'}`}>
            {message}
          </p>
        )}
      </div>

      {mintedNFTs.length > 0 && (
        <div className="nft-collection">
          <h3 className="section-title">Your NFT Collection</h3>
          <div className="nft-grid">
            {mintedNFTs.map((nft, index) => (
              <div key={index} className="nft-card">
                <div className="nft-image-container">
                  <img 
                    src={nft.ipfsUrl} 
                    alt={`NFT ${nft.tokenId}`} 
                    className="nft-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'placeholder-image.png';
                    }}
                  />
                </div>
                <div className="nft-details">
                  <p className="nft-token-id">Token ID: {nft.tokenId}</p>
                  <a 
                    href={nft.ipfsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-link"
                  >
                    View on IPFS
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MintNFT;