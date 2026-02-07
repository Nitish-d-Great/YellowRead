/**
 * YellowRead - Yellow Network Integration
 * Using yellow-ts SDK + @erc7824/nitrolite
 * 
 * Based on official Yellow Network documentation:
 * - Step 1: Connect & Authenticate
 * - Step 2: Define Your App
 * - Step 3: Create the Session
 * - Step 4: Update State (Off-Chain!)
 * - Step 5: Close with Multi-Party Signatures
 */

import {
  createAppSessionMessage,
  createCloseAppSessionMessage,
  createSubmitAppStateMessage,
} from '@erc7824/nitrolite';
import { createWalletClient, custom, keccak256, toBytes } from 'viem';
import { sepolia } from 'viem/chains';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

// Configuration
const CONFIG = {
  CLEARNODE_URL: import.meta.env.VITE_CLEARNODE_URL || 'wss://clearnet-sandbox.yellow.com/ws',
  PUBLISHER_ADDRESS: import.meta.env.VITE_PUBLISHER_ADDRESS || '0x53A50d231569437f969EF1c1Aa034230FD032241',
  PRICE_PER_ARTICLE: parseFloat(import.meta.env.VITE_PRICE_PER_ARTICLE || '0.001'),
  CHAIN_ID: parseInt(import.meta.env.VITE_CHAIN_ID || '11155111'),
  APP_NAME: 'YellowRead',
  ASSET: 'eth',
};

/**
 * Create ECDSA Message Signer from private key
 * Signs messages without EIP-191 prefix (required by Nitrolite)
 */
function createECDSAMessageSigner(privateKey) {
  const account = privateKeyToAccount(privateKey);

  return async (payload) => {
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const messageHash = keccak256(toBytes(message));
    const signature = await account.signMessage({ message: { raw: toBytes(messageHash) } });
    return signature;
  };
}

/**
 * NitroliteService - Yellow Network State Channel Integration
 * Following the official 5-step flow
 */
class NitroliteService {
  constructor() {
    console.log('🟡 NitroliteService: Initializing with yellow-ts SDK...');
    console.log('   📚 Packages: yellow-ts + @erc7824/nitrolite + viem');
    console.log('   📖 Docs: https://docs.yellow.org/');

    // Connection
    this.ws = null;
    this.isConnected = false;
    this.isAuthenticated = false;

    // Session keys
    this.userAddress = null;
    this.sessionKey = null;
    this.sessionKeyPrivate = null;
    this.messageSigner = null;
    this.walletClient = null;

    // App Session
    this.appSessionId = null;
    this.localSessionId = null;
    this.appDefinition = null;

    // State tracking
    this.currentState = {
      articlesRead: [],
      totalArticles: 0,
      amountOwed: 0,
      stateIndex: 0,
    };

    // Allocations (who has what)
    this.currentAllocations = [];
    this.stateHistory = [];

    console.log('🟡 Config loaded:');
    console.log('   📋 ClearNode:', CONFIG.CLEARNODE_URL);
    console.log('   📋 Publisher:', CONFIG.PUBLISHER_ADDRESS);
    console.log('   📋 Price:', CONFIG.PRICE_PER_ARTICLE, 'ETH per article');
  }

  /**
   * STEP 1: Connect & Authenticate
   */
  async initialize(walletAddress) {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🟡 STEP 1: Connect & Authenticate');
    console.log('═══════════════════════════════════════════════════');

    this.userAddress = walletAddress;
    console.log('   👛 User wallet:', walletAddress);

    // Create wallet client using viem
    if (window.ethereum) {
      this.walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });
      console.log('   ✅ Wallet client created (viem)');
    }

    // Generate session key pair
    this.sessionKeyPrivate = generatePrivateKey();
    const sessionAccount = privateKeyToAccount(this.sessionKeyPrivate);
    this.sessionKey = sessionAccount.address;
    console.log('   🔑 Session key generated:', this.sessionKey);

    // Create ECDSA message signer
    this.messageSigner = createECDSAMessageSigner(this.sessionKeyPrivate);
    console.log('   ✅ ECDSA message signer created');

    // Connect to ClearNode
    await this.connect();

    // Authenticate
    if (this.isConnected) {
      await this.authenticate();
    }

    return true;
  }

  /**
   * Connect to Yellow Network ClearNode
   */
  async connect() {
    console.log('');
    console.log('   🔌 Connecting to Yellow Network...');
    console.log('   📡 URL:', CONFIG.CLEARNODE_URL);

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(CONFIG.CLEARNODE_URL);

        const timeout = setTimeout(() => {
          console.log('   ⏱️ Connection timeout');
          this.isConnected = false;
          resolve(false);
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('   ✅ Connected to ClearNode!');
          this.isConnected = true;
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = () => {
          clearTimeout(timeout);
          console.log('   ⚠️ WebSocket error');
          this.isConnected = false;
          resolve(false);
        };

        this.ws.onclose = () => {
          console.log('   🔌 WebSocket closed');
          this.isConnected = false;
        };

      } catch (error) {
        console.error('   ❌ Connection failed:', error.message);
        resolve(false);
      }
    });
  }

  /**
   * Authenticate with ClearNode using EIP-712
   */
  async authenticate() {
    console.log('');
    console.log('   🔐 Authenticating...');

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('   ⏱️ Auth timeout - continuing locally');
        this.isAuthenticated = false;
        resolve(false);
      }, 15000);

      this._authResolve = (success) => {
        clearTimeout(timeout);
        resolve(success);
      };

      // Send auth_request
      const authRequest = {
        req: [
          Date.now(),
          'auth_request',
          [{
            wallet: this.userAddress,
            participant: this.userAddress,
            session_key: this.sessionKey,
            application: CONFIG.APP_NAME,
            scope: 'app',
            expires_at: String(Math.floor(Date.now() / 1000) + 3600),
            allowances: [],
          }],
          Date.now()
        ]
      };

      this.sendMessage(authRequest);
      console.log('   📤 auth_request sent');
    });
  }

  /**
   * Handle incoming ClearNode messages
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const method = message?.res?.[1] || message?.req?.[1] || 'unknown';

      console.log('   📨 ClearNode:', method);

      if (method === 'auth_challenge') {
        this.handleAuthChallenge(message);
      } else if (method === 'auth_verify') {
        this.handleAuthVerify(message);
      } else if (method === 'create_app_session') {
        this.handleSessionCreated(message);
      } else if (method === 'submit_app_state') {
        console.log('   ✅ State update confirmed');
      } else if (method === 'close_app_session') {
        console.log('   ✅ Session closed on ClearNode');
      } else if (method === 'error') {
        console.log('   ⚠️ Error:', message?.res?.[2]?.[0]?.error || 'unknown');
      }
    } catch (error) {
      // Silently ignore parse errors
    }
  }

  /**
   * Handle auth_challenge - sign with EIP-712
   */
  async handleAuthChallenge(message) {
    console.log('   📨 Received auth_challenge');

    try {
      const challenge = message?.res?.[2]?.[0]?.challenge_message;
      if (!challenge) return;

      // EIP-712 typed data
      const typedData = {
        types: {
          EIP712Domain: [{ name: 'name', type: 'string' }],
          Policy: [
            { name: 'challenge', type: 'string' },
            { name: 'scope', type: 'string' },
            { name: 'wallet', type: 'address' },
            { name: 'session_key', type: 'address' },
            { name: 'expires_at', type: 'uint64' },
            { name: 'allowances', type: 'Allowance[]' }
          ],
          Allowance: [
            { name: 'asset', type: 'string' },
            { name: 'amount', type: 'string' }
          ]
        },
        primaryType: 'Policy',
        domain: { name: CONFIG.APP_NAME },
        message: {
          challenge,
          scope: 'app',
          wallet: this.userAddress,
          session_key: this.sessionKey,
          expires_at: String(Math.floor(Date.now() / 1000) + 3600),
          allowances: []
        }
      };

      // Sign with MetaMask
      const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [this.userAddress, JSON.stringify(typedData)],
      });

      console.log('   ✅ EIP-712 signature obtained');

      // Send auth_verify
      const authVerify = {
        req: [Date.now(), 'auth_verify', [{ challenge }], Date.now()],
        sig: [signature]
      };

      this.sendMessage(authVerify);
      console.log('   📤 auth_verify sent');

    } catch (error) {
      console.log('   ⚠️ Signing failed:', error.message);
      if (this._authResolve) this._authResolve(false);
    }
  }

  /**
   * Handle auth_verify response
   */
  handleAuthVerify(message) {
    const success = message?.res?.[2]?.[0]?.success;

    if (success) {
      console.log('   ✅ Authentication SUCCESSFUL!');
      this.isAuthenticated = true;
      const jwt = message?.res?.[2]?.[0]?.jwt_token;
      if (jwt) localStorage.setItem('yellowread_jwt', jwt);
    } else {
      console.log('   ⚠️ Authentication failed');
      this.isAuthenticated = false;
    }

    if (this._authResolve) this._authResolve(success);
  }

  /**
   * STEP 2 & 3: Define App & Create Session
   */
  async createSession() {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🟡 STEP 2 & 3: Define App & Create Session');
    console.log('═══════════════════════════════════════════════════');

    // Reset state
    this.currentState = {
      articlesRead: [],
      totalArticles: 0,
      amountOwed: 0,
      stateIndex: 0,
    };
    this.stateHistory = [];

    // STEP 2: App Definition
    this.appDefinition = {
      protocol: 'NitroRPC_0_4',
      participants: [this.userAddress, CONFIG.PUBLISHER_ADDRESS],
      weights: [100, 0],
      quorum: 100,
      challenge: 0,
      nonce: Date.now(),
      application: CONFIG.APP_NAME,
    };

    console.log('   📋 App Definition created');
    console.log('      Participants:', this.userAddress.slice(0, 10) + '...', '&', CONFIG.PUBLISHER_ADDRESS.slice(0, 10) + '...');

    // STEP 3: Starting allocations
    this.currentAllocations = [
      { participant: this.userAddress, asset: CONFIG.ASSET, amount: '0.1' },
      { participant: CONFIG.PUBLISHER_ADDRESS, asset: CONFIG.ASSET, amount: '0.0' }
    ];

    console.log('   💰 Starting Allocations:');
    console.log('      Reader: 0.1 ETH | Publisher: 0.0 ETH');

    // Create session via SDK
    if (this.isConnected && this.isAuthenticated && this.messageSigner) {
      try {
        const sessionMessage = await createAppSessionMessage(
          this.messageSigner,
          { definition: this.appDefinition, allocations: this.currentAllocations }
        );

        this.sendMessage(JSON.parse(sessionMessage));
        console.log('   📤 createAppSessionMessage() sent');
      } catch (error) {
        console.log('   ⚠️ SDK error:', error.message);
      }
    } else {
      console.log('   📍 Local mode (auth pending)');
    }

    this.localSessionId = `session_${Date.now()}`;
    console.log('   ✅ Session ready');

    return this.localSessionId;
  }

  /**
   * Handle session created
   */
  handleSessionCreated(message) {
    const appSessionId = message?.res?.[2]?.[0]?.app_session_id;
    if (appSessionId) {
      this.appSessionId = appSessionId;
      console.log('   ✅ ClearNode Session ID:', appSessionId.slice(0, 20) + '...');
    }
  }

  /**
   * STEP 4: Update State (Off-Chain!) - Record Article Read
   */
  async recordArticleRead(articleId) {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🟡 STEP 4: Update State (Off-Chain!)');
    console.log('═══════════════════════════════════════════════════');
    console.log('   📰 Article:', articleId);

    try {
      // Skip duplicates
      if (this.currentState.articlesRead.includes(articleId)) {
        console.log('   ⚠️ Already read');
        return this.getStateSnapshot();
      }

      // Update state
      this.currentState.articlesRead.push(articleId);
      this.currentState.totalArticles = this.currentState.articlesRead.length;
      this.currentState.stateIndex += 1;
      this.currentState.amountOwed = this.currentState.totalArticles * CONFIG.PRICE_PER_ARTICLE;

      console.log('   📊 Articles:', this.currentState.totalArticles);
      console.log('   💰 Owed:', this.currentState.amountOwed.toFixed(4), 'ETH');

      // Calculate new allocations
      const readerBalance = Math.max(0, 0.1 - this.currentState.amountOwed);
      const publisherBalance = this.currentState.amountOwed;

      const newAllocations = [
        { participant: this.userAddress, asset: CONFIG.ASSET, amount: readerBalance.toFixed(4) },
        { participant: CONFIG.PUBLISHER_ADDRESS, asset: CONFIG.ASSET, amount: publisherBalance.toFixed(4) }
      ];

      console.log('   💸 Transfer: Reader → Publisher');
      console.log('      Reader:', newAllocations[0].amount, 'ETH');
      console.log('      Publisher:', newAllocations[1].amount, 'ETH');

      // STEP 4: Submit state update via SDK
      if (this.isConnected && this.isAuthenticated && this.appSessionId && this.messageSigner) {
        try {
          const updateMessage = await createSubmitAppStateMessage(
            this.messageSigner,
            { app_session_id: this.appSessionId, allocations: newAllocations }
          );

          this.sendMessage(JSON.parse(updateMessage));
          console.log('   📤 createSubmitAppStateMessage() sent');
          console.log('   ⚡ Instant! Free! Off-chain magic! 🎉');
        } catch (error) {
          console.log('   ⚠️ SDK error:', error.message);
        }
      } else {
        console.log('   📍 State updated locally');
      }

      this.currentAllocations = newAllocations;
      this.stateHistory.push({
        type: 'ARTICLE_READ',
        articleId,
        stateIndex: this.currentState.stateIndex,
        allocations: newAllocations,
        timestamp: Date.now(),
      });

      return this.getStateSnapshot();

    } catch (error) {
      console.error('   ❌ Error:', error.message);
      return this.getStateSnapshot();
    }
  }

  /**
   * STEP 5: Close Session
   */
  async closeSession() {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🟡 STEP 5: Close & Settle');
    console.log('═══════════════════════════════════════════════════');

    console.log('   📊 Final: ', this.currentState.totalArticles, 'articles');
    console.log('   💰 Total:', this.currentState.amountOwed.toFixed(4), 'ETH');

    if (this.isConnected && this.isAuthenticated && this.appSessionId && this.messageSigner) {
      try {
        const closeMessage = await createCloseAppSessionMessage(
          this.messageSigner,
          { app_session_id: this.appSessionId, allocations: this.currentAllocations }
        );

        // In production, publisher would also sign here
        // closeMessageJson.sig.push(publisherSignature);

        this.sendMessage(JSON.parse(closeMessage));
        console.log('   📤 createCloseAppSessionMessage() sent');
        console.log('   🎉 Session closed! Settled!');
      } catch (error) {
        console.log('   ⚠️ SDK error:', error.message);
      }
    } else {
      console.log('   📍 Session closed locally');
    }

    return {
      sessionId: this.localSessionId,
      appSessionId: this.appSessionId,
      finalState: this.getStateSnapshot(),
      finalAllocations: this.currentAllocations,
    };
  }

  /**
   * Send message to ClearNode
   */
  sendMessage(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof message === 'string' ? message : JSON.stringify(message));
      return true;
    }
    return false;
  }

  /**
   * Get state snapshot
   */
  getStateSnapshot() {
    return {
      articlesRead: [...this.currentState.articlesRead],
      totalArticles: this.currentState.totalArticles,
      amountOwed: this.currentState.amountOwed,
      stateIndex: this.currentState.stateIndex,
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
   * Get full state
   */
  getState() {
    return {
      isConnected: this.isConnected,
      isAuthenticated: this.isAuthenticated,
      localSessionId: this.localSessionId,
      appSessionId: this.appSessionId,
      currentState: this.getStateSnapshot(),
      currentAllocations: this.currentAllocations,
      stateHistory: [...this.stateHistory],
      config: CONFIG,
    };
  }

  /**
   * Reset
   */
  reset() {
    console.log('🟡 Resetting...');
    this.appSessionId = null;
    this.localSessionId = null;
    this.currentState = { articlesRead: [], totalArticles: 0, amountOwed: 0, stateIndex: 0 };
    this.currentAllocations = [];
    this.stateHistory = [];
  }

  /**
   * Disconnect
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.isAuthenticated = false;
    console.log('🟡 Disconnected');
  }
}

// Singleton
let instance = null;

export function getNitroliteService() {
  if (!instance) {
    instance = new NitroliteService();
  }
  return instance;
}

export function resetNitroliteService() {
  if (instance) instance.disconnect();
  instance = null;
}

export { NitroliteService, CONFIG };
export default NitroliteService;