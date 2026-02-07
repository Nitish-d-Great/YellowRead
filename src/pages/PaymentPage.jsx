import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Header from '../components/Header';
import { getNitroliteService } from '../services/nitrolite';
import './PaymentPage.css';

const PaymentPage = ({ walletAddress, sessionData, nitrolite }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  // Redirect if no wallet connected
  if (!walletAddress) {
    return (
      <div className="payment-page">
        <Header walletAddress={walletAddress} />
        <div className="payment-container">
          <div className="payment-card">
            <div className="empty-state">
              <div className="empty-icon">🔒</div>
              <h2>Wallet Not Connected</h2>
              <p>Please connect your wallet to continue</p>
              <button className="primary-btn" onClick={() => navigate('/')}>
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get Nitrolite service and state
  const nitroliteState = nitrolite?.getState?.() || {};

  // Use sessionData for billing
  const articlesRead = sessionData?.totalArticles || 0;
  const totalCost = sessionData?.totalCost || 0;
  const stateUpdates = nitroliteState.stateHistory?.length || 0;
  const sessionId = nitroliteState.appSessionId || nitroliteState.localSessionId;
  const isClearNodeConnected = nitroliteState.isAuthenticated;

  // Redirect if nothing to pay
  if (totalCost === 0) {
    return (
      <div className="payment-page">
        <Header walletAddress={walletAddress} />
        <div className="payment-container">
          <div className="payment-card">
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h2>No Payment Due</h2>
              <p>Read some articles to generate a bill</p>
              <button className="primary-btn" onClick={() => navigate('/feed')}>
                Browse Articles
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { label: 'Close Session', icon: '🔒' },
    { label: 'Prepare TX', icon: '📝' },
    { label: 'Sign', icon: '✍️' },
    { label: 'Confirm', icon: '✅' },
  ];

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const gasSaved = Math.max(0, (stateUpdates - 1) * 21000 * 20 / 1e9);
  const publisherAddress = import.meta.env.VITE_PUBLISHER_ADDRESS;

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    setCurrentStep(0);

    try {
      // Step 0: Close Nitrolite session
      console.log('🔒 Closing Yellow Network session...');
      if (nitrolite) {
        nitrolite.closeSession();
      }
      await new Promise(resolve => setTimeout(resolve, 600));
      setCurrentStep(1);

      // Step 1: Prepare settlement
      console.log('📝 Preparing on-chain settlement...');
      await new Promise(resolve => setTimeout(resolve, 600));
      setCurrentStep(2);

      // Step 2: Process payment
      console.log('💳 Initiating on-chain payment...');

      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const amountWei = ethers.parseEther(totalCost.toString());

      console.log('📤 Sending transaction...');
      console.log('   To:', publisherAddress);
      console.log('   Amount:', totalCost, 'ETH');

      const tx = await signer.sendTransaction({
        to: publisherAddress,
        value: amountWei,
      });

      console.log('📤 Transaction sent:', tx.hash);
      setCurrentStep(3);

      // Wait for confirmation
      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();

      console.log('✅ Settlement confirmed!');
      console.log('📦 Block:', receipt.blockNumber);
      console.log('⛽ Gas used:', receipt.gasUsed.toString());

      // Navigate to confirmation
      navigate('/confirmation', {
        state: {
          txHash: tx.hash,
          amount: totalCost,
          articlesRead: articlesRead,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          sessionId: sessionId,
          stateUpdates: stateUpdates,
        }
      });

    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <Header walletAddress={walletAddress} />

      <div className="payment-container">
        <div className="payment-card">

          {/* Card Header */}
          <div className="card-header">
            <div className="header-icon">💳</div>
            <div className="header-text">
              <h1>Settlement Summary</h1>
              <p>Finalize your off-chain session</p>
            </div>
          </div>

          {/* Yellow Network Status */}
          <div className="yellow-status-card">
            <div className="status-header">
              <span className="yellow-icon">🟡</span>
              <span className="status-title">Yellow Network Session</span>

            </div>

            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Session ID</span>
                <span className="status-value mono">{sessionId?.slice(8, 28) || 'N/A'}...</span>
              </div>
              <div className="status-item">
                <span className="status-label">State Updates</span>
                <span className="status-value highlight">{stateUpdates}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Gas Saved</span>
                <span className="status-value green">~{gasSaved.toFixed(6)} ETH</span>
              </div>
              <div className="status-item">
                <span className="status-label">Settlement</span>
                <span className="status-value">1 TX on-chain</span>
              </div>
            </div>
          </div>

          {/* Invoice Section */}
          <div className="invoice-card">
            <div className="invoice-header">
              <span>📄</span>
              <span>Invoice Details</span>
            </div>

            <div className="invoice-body">
              <div className="invoice-line">
                <span>Articles Read</span>
                <span className="value">{articlesRead}</span>
              </div>
              <div className="invoice-line">
                <span>Rate</span>
                <span className="value">0.001 ETH / article</span>
              </div>
              <div className="invoice-line">
                <span>Network</span>
                <span className="value network">
                  <span className="dot"></span>
                  Sepolia
                </span>
              </div>
            </div>

            <div className="invoice-total">
              <span>Total Amount</span>
              <span className="total-value">{totalCost.toFixed(4)} ETH</span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="tx-details">
            <div className="tx-row">
              <div className="tx-label">
                <span className="tx-icon">👤</span>
                <span>From</span>
              </div>
              <div className="tx-value">{formatAddress(walletAddress)}</div>
            </div>
            <div className="tx-arrow">↓</div>
            <div className="tx-row">
              <div className="tx-label">
                <span className="tx-icon">📰</span>
                <span>To (Publisher)</span>
              </div>
              <div className="tx-value">{formatAddress(publisherAddress)}</div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button className="error-close" onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="processing-overlay">
              <div className="processing-card">
                <div className="processing-spinner"></div>
                <h3>Processing Settlement</h3>
                <p className="processing-status">{steps[currentStep]?.label}...</p>

                <div className="steps-progress">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`step-item ${index < currentStep ? 'done' : ''} ${index === currentStep ? 'active' : ''}`}
                    >
                      <div className="step-icon">
                        {index < currentStep ? '✓' : step.icon}
                      </div>
                      <span className="step-label">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="secondary-btn"
              onClick={() => navigate('/feed')}
              disabled={isProcessing}
            >
              ← Back
            </button>
            <button
              className="primary-btn"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="btn-spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span>💎</span>
                  Settle {totalCost.toFixed(4)} ETH
                </>
              )}
            </button>
          </div>

          {/* Footer Badge */}
          <div className="card-footer">
            <div className="powered-badge">
              <span className="badge-icon">🟡</span>
              <div className="badge-text">
                <span className="badge-title">Powered by Yellow Network</span>
                <span className="badge-subtitle">ERC-7824 State Channels</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;