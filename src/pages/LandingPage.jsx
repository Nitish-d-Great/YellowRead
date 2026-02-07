import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = ({ onWalletConnect }) => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to use YellowRead');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Check if on Sepolia network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') { // Sepolia chain ID
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            // Add Sepolia network
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Success - pass address to parent
      if (onWalletConnect) {
        onWalletConnect(accounts[0]);
      }

      // Navigate to feed
      navigate('/feed');
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Background Effects */}
      <div className="bg-gradient" />
      <div className="bg-pattern" />

      {/* Main Content */}
      <div className="landing-content">
        {/* Logo */}
        <div className="logo-section">
          <div className="logo">
            <span className="logo-icon">📰</span>
            <span className="logo-text">YellowRead</span>
          </div>
          <p className="logo-tagline">Pay-Per-Read News Platform</p>
        </div>

        {/* Hero */}
        <div className="hero-section">
          <h1 className="hero-title">
            Read News.
            <br />
            <span className="text-highlight">Pay Per Article.</span>
          </h1>
          <p className="hero-description">
            No subscriptions. No paywalls. Just pay{' '}
            <span className="text-yellow">0.001 ETH per article</span> you read.
            Powered by Yellow Network state channels.
          </p>
        </div>

        {/* Connect Card */}
        <div className="connect-card">
          <h2>Get Started</h2>
          <p>Connect your wallet to start reading</p>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            className="connect-button"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className="spinner" />
                Connecting...
              </>
            ) : (
              <>
                <span className="metamask-icon">🦊</span>
                Connect MetaMask
              </>
            )}
          </button>

          <p className="network-note">
            <span className="network-dot" />
            Sepolia Testnet
          </p>
        </div>

        {/* Features */}
        <div className="features-section">
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Instant Payments</h3>
            <p>Off-chain state channels mean zero wait times</p>
          </div>
          <div className="feature">
            <div className="feature-icon">💰</div>
            <h3>Pay What You Read</h3>
            <p>0.001 ETH for every article - no subscriptions</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Trustless & Secure</h3>
            <p>All payments cryptographically signed</p>
          </div>
        </div>

        {/* Powered By */}
        <div className="powered-by">
          <p>Powered by</p>
          <div className="yellow-network">
            <span className="yellow-logo">🟡</span>
            <span>Yellow Network</span>
          </div>
          <span className="erc-badge">ERC-7824</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;