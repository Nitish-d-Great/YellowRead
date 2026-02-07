import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './ConfirmationPage.css';

const ConfirmationPage = ({ walletAddress, sessionData, onNewSession }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get payment data from navigation state
  const paymentData = location.state || {};

  const txHash = paymentData.txHash;
  const amount = paymentData.amount || 0;
  const articlesRead = paymentData.articlesRead || sessionData?.totalArticles || 0;
  const blockNumber = paymentData.blockNumber;
  const gasUsed = paymentData.gasUsed;
  const sessionId = paymentData.sessionId;
  const stateUpdates = paymentData.stateUpdates || 0;

  const handleStartNew = () => {
    if (onNewSession) {
      onNewSession();
    }
    navigate('/feed');
  };

  const handleViewEtherscan = () => {
    if (txHash) {
      window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const formatHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 14)}...${hash.slice(-12)}`;
  };

  const publisherAddress = import.meta.env.VITE_PUBLISHER_ADDRESS;

  return (
    <div className="confirmation-page">
      <Header walletAddress={walletAddress} />

      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon-wrapper">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="success-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
            </div>
          </div>
          <h1>Payment Successful!</h1>
          <p>Your reading session has been settled on-chain</p>
        </div>

        {/* Transaction Card */}
        <div className="transaction-card">
          <div className="card-section-header">
            <span className="section-icon">🧾</span>
            <h2>Transaction Receipt</h2>
          </div>

          <div className="transaction-details">
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value status-confirmed">
                <span className="status-dot"></span>
                Confirmed
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Transaction Hash</span>
              <span className="detail-value hash-value">
                {formatHash(txHash)}
                {txHash && (
                  <button
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(txHash)}
                    title="Copy hash"
                  >
                    📋
                  </button>
                )}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">From</span>
              <span className="detail-value mono">{formatAddress(walletAddress)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">To (Publisher)</span>
              <span className="detail-value mono">{formatAddress(publisherAddress)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Block Number</span>
              <span className="detail-value">{blockNumber || 'Pending...'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Gas Used</span>
              <span className="detail-value">{gasUsed || '~21000'}</span>
            </div>
          </div>

          {/* Amount Section */}
          <div className="amount-section">
            <div className="amount-row">
              <span>Articles Read</span>
              <span>{articlesRead}</span>
            </div>
            <div className="amount-row">
              <span>Off-chain Updates</span>
              <span>{stateUpdates}</span>
            </div>
            <div className="amount-row total">
              <span>Amount Paid</span>
              <span className="total-amount">{amount.toFixed(4)} ETH</span>
            </div>
          </div>

          {/* Etherscan Button */}
          {txHash && (
            <button className="etherscan-btn" onClick={handleViewEtherscan}>
              <span>🔗</span>
              View on Etherscan
              <span className="external-icon">↗</span>
            </button>
          )}
        </div>

        {/* Yellow Network Badge */}
        <div className="yellow-badge-card">
          <div className="badge-content">
            <span className="badge-logo">🟡</span>
            <div className="badge-text">
              <span className="badge-title">Powered by Yellow Network</span>
              <span className="badge-subtitle">ERC-7824 State Channels</span>
            </div>
          </div>
          <p className="badge-description">
            This payment was processed using Nitrolite SDK for instant,
            off-chain settlement with on-chain finality.
          </p>
        </div>

        {/* Session Summary */}
        <div className="session-summary-card">
          <h3>📊 Session Summary</h3>
          <div className="summary-stats">
            <div className="stat-box">
              <span className="stat-number">{articlesRead}</span>
              <span className="stat-label">Articles</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stateUpdates}</span>
              <span className="stat-label">Updates</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{amount.toFixed(4)}</span>
              <span className="stat-label">ETH Paid</span>
            </div>
          </div>
          {sessionId && (
            <p className="session-id-text">Session: {sessionId}</p>
          )}
        </div>

        {/* Action Button */}
        <button className="new-session-btn" onClick={handleStartNew}>
          📰 Start New Reading Session
        </button>

        {/* Footer */}
        <div className="confirmation-footer">
          <p>Thank you for using YellowRead!</p>
          <p className="footer-tagline">Pay-per-read news • Powered by state channels</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
