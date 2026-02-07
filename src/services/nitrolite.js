/**
 * YellowRead - Nitrolite SDK Integration
 * Yellow Network State Channels for Pay-Per-Read Billing
 * 
 * Uses @erc7824/nitrolite SDK
 * Docs: https://erc7824.org/
 */

import {
  createAppSessionMessage,
  createCloseAppSessionMessage,
  createAuthRequestMessage,
  createAuthVerifyMessage,
  parseRPCResponse,
  NitroliteRPC,
} from '@erc7824/nitrolite';
import { ethers } from 'ethers';

// Configuration
const CONFIG = {
  CLEARNODE_URL: import.meta.env.VITE_CLEARNODE_URL || 'wss://clearnet.yellow.com/ws',
  PUBLISHER_ADDRESS: import.meta.env.VITE_PUBLISHER_ADDRESS || '0x53A50d231569437f969EF1c1Aa034230FD032241',
  PRICE_PER_ARTICLE: parseFloat(import.meta.env.VITE_PRICE_PER_ARTICLE || '0.001'),
  CHAIN_ID: parseInt(import.meta.env.VITE_CHAIN_ID || '11155111'),
  PROTOCOL_NAME: 'yellowread-pay-per-article-v1',
  APP_DOMAIN: 'YellowRead',
  SESSION_EXPIRY: 3600,
};

/**
 * NitroliteService - Yellow Network Integration
 */
class NitroliteService {
  constructor() {
    console.log('🟡 NitroliteService: Initializing REAL SDK integration...');
    console.log('   📚 SDK: @erc7824/nitrolite');
    console.log('   📖 Docs: https://erc7824.org/');

    this.ws = null;
    this.isAuthenticated = false;
    this.jwtToken = null;
    this.sessionKey = null;
    this.userAddress = null;
    this.messageSigner = null;
    this.isConnected = false;
    this.isClearNodeConnected = false;
    this.appSessionId = null;
    this.sessionId = null;
    this._authParams = null;
    this.pendingRequests = new Map();

    // State tracking - THIS IS CRITICAL FOR BILLING
    this.currentState = {
      articlesRead: [],
      totalArticles: 0,
      amountOwed: 0,
      stateIndex: 0,
    };

    this.stateHistory = [];

    console.log('🟡 NitroliteService: Config loaded');
    console.log('   📋 ClearNode:', CONFIG.CLEARNODE_URL);
    console.log('   📋 Publisher:', CONFIG.PUBLISHER_ADDRESS);
    console.log('   📋 Price:', CONFIG.PRICE_PER_ARTICLE, 'ETH per article');
    console.log('   📋 Protocol:', CONFIG.PROTOCOL_NAME);
  }

  /**
   * Initialize with wallet
   */
  async initialize(walletAddress) {
    console.log('🟡 NitroliteService.initialize() - REAL SDK');
    console.log('   👛 User:', walletAddress);

    this.userAddress = walletAddress;

    // Generate session key
    this.sessionKey = ethers.Wallet.createRandom();
    console.log('   🔑 Session key:', this.sessionKey.address);

    // Message signer (without EIP-191 prefix per SDK docs)
    this.messageSigner = async (payload) => {
      try {
        const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const messageHash = ethers.id(message);
        const messageBytes = ethers.getBytes(messageHash);
        const signingKey = this.sessionKey.signingKey;
        const signature = signingKey.sign(messageBytes);
        return ethers.Signature.from(signature).serialized;
      } catch (error) {
        console.error('❌ Signing error:', error);
        throw error;
      }
    };

    // Mark as connected FIRST (local mode always works)
    this.isConnected = true;

    // Try to connect to ClearNode (optional - doesn't block)
    try {
      await this.connectToClearNode();

      // Try to authenticate (optional - doesn't block)
      if (this.isClearNodeConnected) {
        this.authenticate().catch(err => {
          console.log('   ⚠️ ClearNode auth skipped');
        });
      }
    } catch (err) {
      console.log('   ⚠️ ClearNode connection skipped');
    }

    console.log('🟡 NitroliteService: Ready (local billing enabled)');
    return true;
  }

  /**
   * Connect to ClearNode WebSocket
   */
  async connectToClearNode() {
    console.log('🟡 Connecting to ClearNode...');
    console.log('   🌐 URL:', CONFIG.CLEARNODE_URL);

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(CONFIG.CLEARNODE_URL);

        const timeout = setTimeout(() => {
          console.log('   ⏱️ Connection timeout (10s)');
          this.isClearNodeConnected = false;
          resolve(false);
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('   ✅ ClearNode WebSocket CONNECTED!');
          this.isClearNodeConnected = true;
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleClearNodeMessage(event.data);
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.log('   ⚠️ WebSocket error - using local mode');
          this.isClearNodeConnected = false;
          resolve(false);
        };

        this.ws.onclose = () => {
          console.log('   🔌 WebSocket closed');
          this.isClearNodeConnected = false;
          this.isAuthenticated = false;
        };

      } catch (error) {
        console.error('   ❌ Connection error:', error);
        this.isClearNodeConnected = false;
        resolve(false);
      }
    });
  }

  /**
   * Authenticate with ClearNode
   */
  async authenticate() {
    console.log('🔐 Starting authentication flow...');

    return new Promise((resolve) => {
      const authTimeout = setTimeout(() => {
        console.log('   ⏱️ Auth timeout (20s)');
        resolve(false);
      }, 20000);

      this.pendingRequests.set('auth', { resolve, timeout: authTimeout });
      this.sendAuthRequest();
    });
  }

  /**
   * Send auth_request
   */
  async sendAuthRequest() {
    console.log('   📤 Sending auth_request...');

    const expiresAt = Math.floor(Date.now() / 1000) + CONFIG.SESSION_EXPIRY;

    this._authParams = {
      scope: 'app',
      application: CONFIG.APP_DOMAIN,
      participant: this.userAddress,
      expires_at: expiresAt.toString(),
      allowances: [],
    };

    try {
      const authRequest = await createAuthRequestMessage({
        wallet: this.userAddress,
        participant: this.userAddress,
        session_key: this.sessionKey.address,
        application: CONFIG.APP_DOMAIN,
        expires_at: expiresAt.toString(),
        scope: 'app',
        allowances: [],
      });

      this.sendToClearNode(authRequest);
      console.log('   ✅ auth_request sent');
    } catch (error) {
      console.log('   ⚠️ SDK auth failed, trying manual:', error.message);
      // Manual fallback
      const authRequest = {
        req: [Date.now(), 'auth_request', [{
          wallet: this.userAddress,
          participant: this.userAddress,
          session_key: this.sessionKey.address,
          application: CONFIG.APP_DOMAIN,
          expires_at: expiresAt.toString(),
          scope: 'app',
          allowances: [],
        }], Date.now()]
      };
      this.sendToClearNode(JSON.stringify(authRequest));
    }
  }

  /**
   * Handle auth_challenge
   */
  async handleAuthChallenge(challengeData) {
    console.log('   📨 Received auth_challenge');

    try {
      // Try EIP-712 signing with MetaMask
      const eip712Signer = async (typedData) => {
        return await window.ethereum.request({
          method: 'eth_signTypedData_v4',
          params: [this.userAddress, JSON.stringify(typedData)],
        });
      };

      const authVerify = await createAuthVerifyMessage(
        eip712Signer,
        challengeData,
        this._authParams
      );

      this.sendToClearNode(authVerify);
      console.log('   ✅ auth_verify sent');
    } catch (error) {
      console.log('   ⚠️ EIP-712 failed:', error.message);

      // Fallback to session key
      try {
        const challenge = challengeData.params?.challengeMessage ||
          challengeData.res?.[2]?.[0]?.challengeMessage ||
          JSON.stringify(challengeData);

        const signature = await this.messageSigner(challenge);

        const authVerify = {
          req: [Date.now(), 'auth_verify', [{ signature, challenge }], Date.now()],
          sig: [signature]
        };

        this.sendToClearNode(JSON.stringify(authVerify));
        console.log('   ✅ auth_verify sent (session key)');
      } catch (e) {
        console.error('   ❌ All signing failed:', e.message);
      }
    }
  }

  /**
   * Handle auth result
   */
  handleAuthResult(success, jwtToken) {
    const pending = this.pendingRequests.get('auth');

    if (success) {
      console.log('   ✅ Authentication SUCCESSFUL!');
      this.isAuthenticated = true;
      if (jwtToken) {
        this.jwtToken = jwtToken;
        localStorage.setItem('yellowread_jwt', jwtToken);
      }
    } else {
      console.log('   ⚠️ Auth not successful, using local mode');
      this.isAuthenticated = false;
    }

    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve(success);
      this.pendingRequests.delete('auth');
    }
  }

  /**
   * Handle ClearNode messages - WITH ROBUST ERROR HANDLING
   */
  handleClearNodeMessage(data) {
    try {
      let message;

      // Try SDK parser first
      try {
        message = parseRPCResponse(data);
      } catch {
        // Fallback to JSON
        try {
          message = JSON.parse(data);
        } catch {
          // Silently ignore unparseable messages
          return;
        }
      }

      if (!message) return;

      // Extract method from various formats
      const method = message?.method ||
        message?.res?.[1] ||
        message?.result?.method ||
        message?.req?.[1] ||
        'unknown';

      // Route messages safely - all in try-catch
      try {
        if (method === 'auth_challenge' || String(method).includes('challenge')) {
          this.handleAuthChallenge(message);
        } else if (method === 'auth_verify' || method === 'auth_success') {
          const success = message?.params?.success ||
            message?.res?.[2]?.[0]?.success ||
            method === 'auth_success';
          const jwt = message?.params?.jwtToken || message?.res?.[2]?.[0]?.jwtToken;
          this.handleAuthResult(success, jwt);
        } else if (method === 'auth_failure') {
          this.handleAuthResult(false, null);
        } else if (method === 'create_app_session') {
          const appId = message?.params?.app_session_id || message?.res?.[2]?.[0]?.app_session_id;
          if (appId) {
            this.appSessionId = appId;
            console.log('   🆔 App session:', String(appId).slice(0, 20) + '...');
          }
        } else if (method === 'assets') {
          console.log('   📋 ClearNode: assets');
        } else if (method === 'error') {
          // Log but don't throw
          const errorMsg = message?.params?.error || message?.error || message?.res?.[2]?.[0]?.error;
          if (errorMsg) {
            console.log('   ⚠️ ClearNode message:', errorMsg);
          }
        }
        // Silently ignore all other message types
      } catch (routeError) {
        // Silently ignore routing errors
      }

    } catch (error) {
      // Completely silent - don't let any errors propagate
    }
  }

  /**
   * Send to ClearNode
   */
  sendToClearNode(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message);
      this.ws.send(payload);
      return true;
    }
    return false;
  }

  /**
   * Create reading session
   */
  async createSession() {
    const sessionNonce = Date.now();
    this.sessionId = `session_${sessionNonce}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('🟡 NitroliteService.createSession()');
    console.log('   🆔 Session:', this.sessionId);

    // RESET STATE - Critical for billing
    this.currentState = {
      articlesRead: [],
      totalArticles: 0,
      amountOwed: 0,
      stateIndex: 0,
    };

    this.stateHistory = [{
      type: 'SESSION_START',
      sessionId: this.sessionId,
      timestamp: Date.now(),
    }];

    // Try to create real app session (don't block on failure)
    if (this.isClearNodeConnected && this.isAuthenticated) {
      try {
        const appDefinition = {
          protocol: CONFIG.PROTOCOL_NAME,
          participants: [this.userAddress, CONFIG.PUBLISHER_ADDRESS],
          weights: [100, 0],
          quorum: 100,
          challenge: 0,
          nonce: sessionNonce,
        };

        const allocations = [
          { participant: this.userAddress, asset: 'eth', amount: '0' },
          { participant: CONFIG.PUBLISHER_ADDRESS, asset: 'eth', amount: '0' }
        ];

        const sessionMessage = await createAppSessionMessage(
          this.messageSigner,
          [{ definition: appDefinition, allocations }]
        );

        this.sendToClearNode(sessionMessage);
        console.log('   ✅ App session request sent to ClearNode');
      } catch (error) {
        console.log('   ⚠️ ClearNode session skipped:', error.message);
      }
    } else {
      console.log('   📍 Running in local mode (ClearNode optional)');
    }

    console.log('   ✅ Session ready - billing will work locally');
    return this.sessionId;
  }

  /**
   * Record article read - ALWAYS UPDATES LOCAL STATE
   */
  async recordArticleRead(articleId) {
    try {
      // Skip duplicates
      if (this.currentState.articlesRead.includes(articleId)) {
        console.log('🟡 Article already counted:', articleId);
        return {
          articlesRead: [...this.currentState.articlesRead],
          totalArticles: this.currentState.totalArticles,
          amountOwed: this.currentState.amountOwed,
          stateIndex: this.currentState.stateIndex,
        };
      }

      // UPDATE LOCAL STATE (always works)
      this.currentState.articlesRead.push(articleId);
      this.currentState.totalArticles = this.currentState.articlesRead.length;
      this.currentState.stateIndex += 1;
      this.currentState.amountOwed = this.currentState.totalArticles * CONFIG.PRICE_PER_ARTICLE;

      console.log('🟡 Article recorded:', articleId);
      console.log('   📊 Total:', this.currentState.totalArticles);
      console.log('   💰 Owed:', this.currentState.amountOwed, 'ETH');

      // Add to history
      this.stateHistory.push({
        type: 'ARTICLE_READ',
        stateIndex: this.currentState.stateIndex,
        articleId,
        totalArticles: this.currentState.totalArticles,
        amountOwed: this.currentState.amountOwed,
        timestamp: Date.now(),
      });

      // Try to send to ClearNode (optional, doesn't affect billing)
      if (this.isClearNodeConnected && this.isAuthenticated && this.appSessionId) {
        try {
          const stateData = {
            articleId,
            stateIndex: this.currentState.stateIndex,
            totalArticles: this.currentState.totalArticles,
            amountOwed: ethers.parseEther(this.currentState.amountOwed.toString()).toString(),
          };

          const signature = await this.messageSigner(stateData);

          const rpcMessage = NitroliteRPC.createRequest(
            'session_message',
            [{
              app_session_id: this.appSessionId,
              type: 'article_read',
              data: stateData,
              signature,
            }],
            Date.now()
          );

          const signedMessage = await NitroliteRPC.signMessage(rpcMessage, this.messageSigner);
          this.sendToClearNode(JSON.stringify(signedMessage));
          console.log('   📤 State sent to ClearNode');
        } catch (error) {
          // Don't break billing if ClearNode fails
          console.log('   ⚠️ ClearNode update failed (billing still works)');
        }
      }

      // Return a DEEP COPY with articlesRead as a new array
      return {
        articlesRead: [...this.currentState.articlesRead],
        totalArticles: this.currentState.totalArticles,
        amountOwed: this.currentState.amountOwed,
        stateIndex: this.currentState.stateIndex,
      };

    } catch (error) {
      console.error('❌ recordArticleRead error:', error);
      // Even on error, return current state as deep copy
      return {
        articlesRead: [...(this.currentState.articlesRead || [])],
        totalArticles: this.currentState.totalArticles || 0,
        amountOwed: this.currentState.amountOwed || 0,
        stateIndex: this.currentState.stateIndex || 0,
      };
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      sessionId: this.sessionId,
      appSessionId: this.appSessionId,
      isConnected: this.isConnected,
      isClearNodeConnected: this.isClearNodeConnected,
      isAuthenticated: this.isAuthenticated,
      currentState: { ...this.currentState },
      stateHistory: [...this.stateHistory],
      config: {
        publisher: CONFIG.PUBLISHER_ADDRESS,
        pricePerArticle: CONFIG.PRICE_PER_ARTICLE,
        clearNodeUrl: CONFIG.CLEARNODE_URL,
        protocol: CONFIG.PROTOCOL_NAME,
        sdk: '@erc7824/nitrolite',
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
   * Close session
   */
  async closeSession() {
    console.log('🟡 NitroliteService.closeSession()');
    console.log('   📊 Final:', this.currentState.totalArticles, 'articles');
    console.log('   💰 Owed:', this.currentState.amountOwed, 'ETH');

    this.stateHistory.push({
      type: 'SESSION_CLOSE',
      sessionId: this.sessionId,
      finalState: { ...this.currentState },
      timestamp: Date.now(),
    });

    // Try SDK close
    if (this.isClearNodeConnected && this.isAuthenticated && this.appSessionId) {
      try {
        const amountWei = ethers.parseEther(this.currentState.amountOwed.toString()).toString();

        const finalAllocations = [
          { participant: this.userAddress, asset: 'eth', amount: '0' },
          { participant: CONFIG.PUBLISHER_ADDRESS, asset: 'eth', amount: amountWei }
        ];

        const closeMessage = await createCloseAppSessionMessage(
          this.messageSigner,
          [{ app_session_id: this.appSessionId, allocations: finalAllocations }]
        );

        this.sendToClearNode(closeMessage);
        console.log('   ✅ close_app_session sent');
      } catch (error) {
        console.log('   ⚠️ SDK close failed:', error.message);
      }
    }

    return {
      sessionId: this.sessionId,
      appSessionId: this.appSessionId,
      finalState: { ...this.currentState },
      stateHistory: [...this.stateHistory],
    };
  }

  /**
   * Reset
   */
  reset() {
    console.log('🟡 NitroliteService.reset()');
    this.sessionId = null;
    this.appSessionId = null;
    this.currentState = {
      articlesRead: [],
      totalArticles: 0,
      amountOwed: 0,
      stateIndex: 0,
    };
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
    this.isClearNodeConnected = false;
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
  if (instance) {
    instance.disconnect();
  }
  instance = null;
}

export { NitroliteService, CONFIG };
export default NitroliteService;