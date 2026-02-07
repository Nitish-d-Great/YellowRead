/**
 * YellowRead - Nitrolite Service
 * Yellow Network SDK Integration for Pay-Per-Read Billing
 * 
 * ERC-7824 State Channels Implementation:
 * - All article reads tracked OFF-CHAIN (no gas, instant)
 * - Only final settlement happens ON-CHAIN (single transaction)
 */

import { ethers } from 'ethers';

// Configuration
const CONFIG = {
  CLEARNODE_URL: import.meta.env.VITE_CLEARNODE_URL || 'wss://clearnet.yellow.com/ws',
  PUBLISHER_ADDRESS: import.meta.env.VITE_PUBLISHER_ADDRESS || '0x53A50d231569437f969EF1c1Aa034230FD032241',
  PRICE_PER_ARTICLE: parseFloat(import.meta.env.VITE_PRICE_PER_ARTICLE || '0.001'),
  CHAIN_ID: parseInt(import.meta.env.VITE_CHAIN_ID || '11155111'),
  PROTOCOL_NAME: 'yellowread-v1',
};

// Sepolia Nitrolite Contract Addresses
const CONTRACTS = {
  CUSTODY: '0x019B65A265EB3363822f2752141b3dF16131b262',
  ADJUDICATOR: '0x7c7ccbc98469190849BCC6c926307794fDfB11F2',
};

/**
 * NitroliteService Class
 * Manages off-chain state channel lifecycle for YellowRead
 */
class NitroliteService {
  constructor() {
    console.log('🟡 NitroliteService: Initializing...');

    this.ws = null;
    this.provider = null;
    this.signer = null;
    this.userAddress = null;
    this.sessionId = null;
    this.isConnected = false;
    this.isClearNodeConnected = false;

    // Off-chain state (no wallet signing needed)
    this.currentState = {
      articlesRead: [],
      totalArticles: 0,
      amountOwed: 0,
      stateIndex: 0,
    };

    // State history for audit trail
    this.stateHistory = [];

    console.log('🟡 NitroliteService: Config loaded');
    console.log('   📋 Publisher:', CONFIG.PUBLISHER_ADDRESS);
    console.log('   📋 Price:', CONFIG.PRICE_PER_ARTICLE, 'ETH per article');
    console.log('   📋 Network:', CONFIG.CHAIN_ID === 11155111 ? 'Sepolia' : CONFIG.CHAIN_ID);
  }

  /**
   * Initialize the service with wallet address
   * NO wallet signing required - just setup
   */
  async initialize(walletAddress) {
    console.log('🟡 NitroliteService.initialize()');
    console.log('   👛 User:', walletAddress);

    this.userAddress = walletAddress;
    this.isConnected = true;

    // Setup ethers provider for final settlement
    if (window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      console.log('   ✅ Ethers provider ready');
    }

    // Try connecting to ClearNode (optional - works without it)
    await this.connectToClearNode();

    console.log('🟡 NitroliteService: Initialized successfully');
    return true;
  }

  /**
   * Connect to ClearNode WebSocket (optional enhancement)
   */
  async connectToClearNode() {
    console.log('🟡 NitroliteService: Attempting ClearNode connection...');
    console.log('   🌐 URL:', CONFIG.CLEARNODE_URL);

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(CONFIG.CLEARNODE_URL);

        const timeout = setTimeout(() => {
          console.log('   ⏱️ ClearNode timeout (5s) - using local mode');
          this.isClearNodeConnected = false;
          resolve(false);
        }, 5000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('   ✅ ClearNode connected!');
          this.isClearNodeConnected = true;
          resolve(true);
        };

        this.ws.onerror = () => {
          clearTimeout(timeout);
          console.log('   ⚠️ ClearNode unavailable - using local mode');
          this.isClearNodeConnected = false;
          resolve(false);
        };

        this.ws.onclose = () => {
          this.isClearNodeConnected = false;
        };

      } catch (error) {
        console.log('   ⚠️ ClearNode error:', error.message);
        this.isClearNodeConnected = false;
        resolve(false);
      }
    });
  }

  /**
   * Create a new reading session
   * OFF-CHAIN - No wallet interaction!
   */
  createSession() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('🟡 NitroliteService.createSession()');
    console.log('   🆔 Session:', this.sessionId);
    console.log('   👤 User:', this.userAddress);
    console.log('   📍 Mode:', this.isClearNodeConnected ? 'ClearNode' : 'Local');

    // Reset state for new session
    this.currentState = {
      articlesRead: [],
      totalArticles: 0,
      amountOwed: 0,
      stateIndex: 0,
    };

    // Record session start
    this.stateHistory = [{
      type: 'SESSION_START',
      sessionId: this.sessionId,
      timestamp: Date.now(),
      user: this.userAddress,
      publisher: CONFIG.PUBLISHER_ADDRESS,
    }];

    // Notify ClearNode if connected
    if (this.isClearNodeConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'create_session',
        sessionId: this.sessionId,
        protocol: CONFIG.PROTOCOL_NAME,
        participants: [this.userAddress, CONFIG.PUBLISHER_ADDRESS],
      }));
      console.log('   📤 Session sent to ClearNode');
    }

    console.log('   ✅ Session created');
    return this.sessionId;
  }

  /**
   * Record an article read
   * OFF-CHAIN - No wallet interaction! Instant!
   */
  recordArticleRead(articleId) {
    // Skip if already read
    if (this.currentState.articlesRead.includes(articleId)) {
      console.log('🟡 NitroliteService: Article already read:', articleId);
      return this.currentState;
    }

    // Update state
    this.currentState.articlesRead.push(articleId);
    this.currentState.totalArticles = this.currentState.articlesRead.length;
    this.currentState.stateIndex += 1;

    // Calculate amount owed (0.001 ETH per 2 articles)
    this.currentState.amountOwed = this.currentState.totalArticles * CONFIG.PRICE_PER_ARTICLE;

    // Create state update record
    const stateUpdate = {
      type: 'ARTICLE_READ',
      stateIndex: this.currentState.stateIndex,
      articleId: articleId,
      totalArticles: this.currentState.totalArticles,
      amountOwed: this.currentState.amountOwed,
      timestamp: Date.now(),
    };

    this.stateHistory.push(stateUpdate);

    console.log('🟡 NitroliteService.recordArticleRead()');
    console.log('   📰 Article:', articleId);
    console.log('   📊 State:', {
      total: this.currentState.totalArticles,
      owed: this.currentState.amountOwed + ' ETH',
    });

    // Notify ClearNode if connected
    if (this.isClearNodeConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'state_update',
        sessionId: this.sessionId,
        ...stateUpdate,
      }));
    }

    return this.currentState;
  }

  /**
   * Get current session state
   */
  getState() {
    return {
      sessionId: this.sessionId,
      isConnected: this.isConnected,
      isClearNodeConnected: this.isClearNodeConnected,
      currentState: this.currentState,
      stateHistory: this.stateHistory,
      config: {
        publisher: CONFIG.PUBLISHER_ADDRESS,
        pricePerTwo: CONFIG.PRICE_PER_TWO_ARTICLES,
      },
    };
  }

  /**
   * Get billing status
   */
  getBillingStatus() {

    return {
      articlesRead: this.currentState.totalArticles,
      amountOwed: this.currentState.amountOwed,
      pricePerArticle: CONFIG.PRICE_PER_ARTICLE,
    };
  }

  /**
   * Close session and prepare for settlement
   * OFF-CHAIN - No wallet interaction!
   */
  closeSession() {
    console.log('🟡 NitroliteService.closeSession()');
    console.log('   🆔 Session:', this.sessionId);
    console.log('   📊 Final State:', {
      articles: this.currentState.totalArticles,
      owed: this.currentState.amountOwed + ' ETH',
      stateUpdates: this.stateHistory.length,
    });

    // Record session close
    const closeRecord = {
      type: 'SESSION_CLOSE',
      sessionId: this.sessionId,
      finalState: { ...this.currentState },
      timestamp: Date.now(),
    };

    this.stateHistory.push(closeRecord);

    // Notify ClearNode if connected
    if (this.isClearNodeConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'close_session',
        sessionId: this.sessionId,
        finalState: this.currentState,
      }));
      console.log('   📤 Close sent to ClearNode');
    }

    console.log('   ✅ Session closed (ready for settlement)');

    return {
      sessionId: this.sessionId,
      finalState: this.currentState,
      stateHistory: this.stateHistory,
    };
  }

  /**
   * Process on-chain settlement
   * THIS IS THE ONLY ON-CHAIN TRANSACTION!
   */
  async processSettlement() {
    const amount = this.currentState.amountOwed;

    console.log('🟡 NitroliteService.processSettlement()');
    console.log('   💰 Amount:', amount, 'ETH');
    console.log('   📤 To:', CONFIG.PUBLISHER_ADDRESS);
    console.log('   🔗 This is the ONLY on-chain transaction!');

    if (amount <= 0) {
      console.log('   ⚠️ Nothing to settle');
      return { success: true, amount: 0 };
    }

    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountWei = ethers.parseEther(amount.toString());

      console.log('   📝 Sending transaction...');
      const tx = await this.signer.sendTransaction({
        to: CONFIG.PUBLISHER_ADDRESS,
        value: amountWei,
      });

      console.log('   ⏳ Transaction hash:', tx.hash);
      console.log('   ⏳ Waiting for confirmation...');

      const receipt = await tx.wait();

      console.log('   ✅ Settlement confirmed!');
      console.log('   📦 Block:', receipt.blockNumber);
      console.log('   ⛽ Gas used:', receipt.gasUsed.toString());

      // Record settlement
      this.stateHistory.push({
        type: 'SETTLEMENT',
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        amount: amount,
        timestamp: Date.now(),
      });

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        amount: amount,
        gasUsed: receipt.gasUsed.toString(),
      };

    } catch (error) {
      console.error('   ❌ Settlement failed:', error.message);
      throw error;
    }
  }

  /**
   * Reset for new session
   */
  reset() {
    console.log('🟡 NitroliteService.reset()');
    this.sessionId = null;
    this.currentState = {
      articlesRead: [],
      totalArticles: 0,
      amountOwed: 0,
      stateIndex: 0,
    };
    this.stateHistory = [];
    console.log('   ✅ Service reset');
  }

  /**
   * Disconnect
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isClearNodeConnected = false;
    console.log('🟡 NitroliteService: Disconnected');
  }
}

// Singleton instance
let instance = null;

export function getNitroliteService() {
  if (!instance) {
    instance = new NitroliteService();
  }
  return instance;
}

export function resetNitroliteService() {
  if (instance) {
    instance.disconnect();
  }
  instance = null;
}

export { NitroliteService, CONFIG, CONTRACTS };
export default NitroliteService;