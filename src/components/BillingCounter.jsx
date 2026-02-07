import React from 'react';
import './BillingCounter.css';

const BillingCounter = ({ articlesRead, totalCost }) => {
  return (
    <div className="billing-counter">
      <div className="counter-header">
        <span className="counter-icon">💰</span>
        <h3>Billing Status</h3>
      </div>

      {/* Main Stats */}
      <div className="counter-stats">
        <div className="stat-item">
          <span className="stat-label">Articles Read</span>
          <span className="stat-value articles">{articlesRead}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-label">Total Cost</span>
          <span className="stat-value cost">{totalCost.toFixed(4)} ETH</span>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="pricing-info">
        <div className="price-row">
          <span>Rate</span>
          <span className="price-value">0.001 ETH / article</span>
        </div>
        <div className="price-row">
          <span>Per Article</span>
          <span className="price-value">~0.001 ETH</span>
        </div>
      </div>

      {/* Network Badge */}
      <div className="network-badge">
        <span className="network-dot" />
        <span>Sepolia Testnet</span>
      </div>
    </div>
  );
};

export default BillingCounter;