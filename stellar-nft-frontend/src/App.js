import React, { useState } from 'react';
import WalletConnect from './WalletConnect';
import MintNFT from './MintNFT';
import './App.css';

function App() {
  const [publicKey, setPublicKey] = useState('');

  return (
    <div className="app-container">
      <h1>Stellar NFT Minting Platform</h1>
      {!publicKey ? (
        <WalletConnect setPublicKey={setPublicKey} />
      ) : (
        <MintNFT publicKey={publicKey} />
      )}
    </div>
  );
}

export default App;
