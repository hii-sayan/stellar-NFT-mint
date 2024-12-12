import React, { useState } from 'react';
import WalletConnect from './WalletConnect';
import MintNFT from './MintNFT';
import './App.css';

function App() {
  const [publicKey, setPublicKey] = useState('');

  return (
    <div className="app-wrapper">
      <header className="main-header">
        <div className="header-content">
          <h1 className="main-title">Mint Your Stellar NFT</h1>
          <p className="header-subtitle">
            Create unique digital assets on the Stellar blockchain
          </p>
        </div>
      </header>

      <main className="app-container">
        <div className="content-section">
          {!publicKey ? (
            <div className="wallet-connect-section">
              <div className="wallet-intro">
                <h2>Get Started</h2>
                <p>Connect your Stellar wallet to begin minting NFTs</p>
              </div>
              <WalletConnect setPublicKey={setPublicKey} />
            </div>
          ) : (
            <MintNFT publicKey={publicKey} />
          )}
        </div>
      </main>

      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span>🌟 Stellar NFT Platform</span>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Contact</a>
            <a href="#" className="footer-link">Help</a>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Stellar NFT Platform. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
