import React from 'react';
import { isConnected, getPublicKey } from '@stellar/freighter-api';

function WalletConnect({ setPublicKey }) {
  const handleLogin = async () => {
    if (await isConnected()) {
      const pubKey = await getPublicKey();
      setPublicKey(pubKey);
    } else {
      alert('Please install the Freighter wallet extension.');
    }
  };

  return (
    <div className="wallet-connect">
      <button onClick={handleLogin}>Connect Stellar Wallet</button>
    </div>
  );
}

export default WalletConnect;
