import React from 'react';
import './Header.css';

const Header = ({ walletAddress }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo */}
        <a href="/" className="header-logo">
          <span className="logo-icon">📰</span>
          <span className="logo-text">YellowRead</span>
        </a>

        {/* Right Side */}
        <div className="header-right">
          {/* Yellow Network Badge */}
          <div className="yellow-badge">
            <span className="yellow-icon">🟡</span>
            <span className="badge-text">Yellow Network</span>
          </div>

          {/* Wallet */}
          {walletAddress && (
            <div className="wallet-pill">
              <span className="wallet-icon">🦊</span>
              <span className="wallet-address">{formatAddress(walletAddress)}</span>
              <span className="network-indicator" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
