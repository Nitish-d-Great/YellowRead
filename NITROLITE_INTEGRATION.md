# YellowRead - Nitrolite Integration Guide

This document explains how YellowRead integrates with Yellow Network using the Nitrolite SDK (ERC-7824 standard) for off-chain state channel payments.

---

## Overview

YellowRead uses Yellow Network's state channels to enable pay-per-read micropayments. Instead of paying gas for every article read, users:

1. Open a state channel (one on-chain transaction)
2. Read articles with off-chain state updates (no gas)
3. Settle the final state on-chain (one transaction)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        YellowRead dApp                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Landing    │ -> │  News Feed   │ -> │   Payment    │  │
│  │    Page      │    │    Page      │    │    Page      │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │           │
│         └───────────────────┼───────────────────┘           │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │ Nitrolite       │                      │
│                    │ Service         │                      │
│                    └────────┬────────┘                      │
│                             │                               │
└─────────────────────────────┼───────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │  MetaMask   │    │  ClearNode  │    │  Sepolia    │
   │  Wallet     │    │  (WebSocket)│    │  Blockchain │
   └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Integration Flow

### 1. Session Creation

When a user starts reading:

```javascript
import { getNitroliteService } from './services/nitrolite';

// Initialize service
const service = getNitroliteService();
await service.initialize(walletAddress);

// Create reading session
const session = await service.createSession(depositAmount);
// Returns: { sessionId, deposit, state }
```

**What happens:**
- WebSocket connection to ClearNode is established
- Session definition is signed by user's wallet
- Initial state: user has full deposit, publisher has 0
- Session is stored locally and sent to ClearNode

### 2. Recording Article Reads

Each time a user reads a new article:

```javascript
// Record article read (called on article view)
const newState = await service.recordArticleRead(articleId);

// newState = {
//   articlesRead: 3,
//   userBalance: 0.0985,     // Decreased
//   publisherBalance: 0.001, // Increased (after 2 articles)
//   stateIndex: 3
// }
```

**What happens:**
- State is updated locally
- New state is signed by user's wallet
- Signed state sent to ClearNode (off-chain)
- ClearNode counter-signs and stores the state
- No blockchain transaction needed!

### 3. Billing Logic

```javascript
// Billing: 0.001 ETH per 2 articles
const PRICE_PER_TWO_ARTICLES = 0.001;

// Calculate cost
const pairsRead = Math.floor(articlesRead / 2);
const totalCost = pairsRead * PRICE_PER_TWO_ARTICLES;

// Examples:
// 1 article  → 0 pairs  → 0.000 ETH
// 2 articles → 1 pair   → 0.001 ETH
// 3 articles → 1 pair   → 0.001 ETH
// 4 articles → 2 pairs  → 0.002 ETH
// 10 articles → 5 pairs → 0.005 ETH
```

### 4. Session Settlement

When the user clicks "Settle & Pay":

```javascript
// Close session (creates final state with FINALIZE intent)
const closeResult = await service.closeSession();

// Process on-chain payment
const txResult = await service.processPayment(totalCost);

// txResult = {
//   success: true,
//   hash: "0x...",
//   blockNumber: 12345,
//   gasUsed: "21000"
// }
```

**What happens:**
- Final state signed with `intent: FINALIZE`
- Transaction sent to blockchain
- Publisher receives payment
- Session is closed

---

## State Channel Data Structures

### Session Definition

```javascript
const appDefinition = {
  protocol: 'yellowread-v1',       // Protocol identifier
  participants: [                   // Channel participants
    userAddress,                    // Reader (payer)
    publisherAddress                // Content provider (payee)
  ],
  weights: [50, 50],               // Equal voting power
  quorum: 100,                     // Both must agree
  challenge: 86400,                // 24-hour challenge period
  nonce: Date.now()                // Unique session ID
};
```

### State Update

```javascript
const stateUpdate = {
  type: 'state_update',
  stateIndex: 5,                   // Incrementing counter
  articleId: 'article-001',        // Which article was read
  articlesRead: 5,                 // Total articles read
  userBalance: '0.098',            // Remaining user balance
  publisherBalance: '0.002',       // Publisher earnings
  timestamp: Date.now(),
  signature: '0x...'               // User's signature
};
```

### Final State

```javascript
const finalState = {
  type: 'session_close',
  intent: 'FINALIZE',              // Settlement intent
  sessionId: 'session_123',
  stateIndex: 10,
  articlesRead: 10,
  userBalance: '0.095',            // Refund amount
  publisherBalance: '0.005',       // Payment amount
  timestamp: Date.now(),
  signature: '0x...'
};
```

---

## Security Model

### Trust Guarantees

| Threat | Mitigation |
|--------|------------|
| Publisher inflates article count | Every state requires reader's signature |
| Reader denies reading articles | Every state requires publisher counter-signature |
| Stale state submission | Challenge period allows submitting newer state |
| ClearNode goes offline | Latest signed state can settle on-chain directly |

### Signature Verification

```javascript
// Every state update is signed by the user
const message = JSON.stringify(stateUpdate);
const signature = await signer.signMessage(message);

// ClearNode verifies and counter-signs
// Both signatures required for settlement
```

---

## ClearNode Communication

### WebSocket Connection

```javascript
const ws = new WebSocket('wss://clearnet.yellow.com/ws');

ws.onopen = () => {
  console.log('Connected to ClearNode');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleClearNodeMessage(message);
};
```

### Message Types

| Type | Direction | Purpose |
|------|-----------|---------|
| `create_session` | App → ClearNode | Create new state channel |
| `session_created` | ClearNode → App | Confirm session creation |
| `state_update` | App → ClearNode | Update channel state |
| `state_accepted` | ClearNode → App | Confirm state update |
| `counter_signed` | ClearNode → App | Publisher's counter-signature |
| `session_close` | App → ClearNode | Request settlement |
| `session_closed` | ClearNode → App | Confirm settlement |

---

## Fallback Mode

If ClearNode is unavailable, YellowRead falls back to direct on-chain payments:

```javascript
// Check connection status
if (!service.isConnected) {
  // Fallback: Direct ETH transfer
  const tx = await signer.sendTransaction({
    to: publisherAddress,
    value: ethers.parseEther(amount)
  });
}
```

---

## Contract Addresses (Sepolia)

```javascript
// Nitrolite contracts on Sepolia testnet
const SEPOLIA_CONTRACTS = {
  CUSTODY: '0x...', // Asset custody contract
  ADJUDICATOR: '0x...' // Dispute resolution contract
};
```

For latest addresses, see:
https://github.com/erc7824/nitrolite/tree/main/contract/deployments/11155111

---

## Error Handling

```javascript
try {
  await service.recordArticleRead(articleId);
} catch (error) {
  if (error.message === 'Insufficient balance') {
    // Prompt user to settle and top up
  } else if (error.code === 4001) {
    // User rejected signature
  } else {
    // General error handling
  }
}
```

---

## Best Practices

1. **Always verify connection** before attempting state updates
2. **Store state history** locally for dispute resolution
3. **Implement retry logic** for WebSocket disconnections
4. **Show clear billing status** so users know their costs
5. **Handle signature rejections** gracefully
6. **Provide fallback** to direct payments if needed

---

## Resources

- [ERC-7824 Specification](https://erc7824.org/)
- [Yellow Network Docs](https://docs.yellow.org/)
- [Nitrolite SDK](https://www.npmjs.com/package/@erc7824/nitrolite)
- [GitHub Repository](https://github.com/erc7824/nitrolite)

---

## Support

For questions about Yellow Network integration:
- Discord: https://discord.gg/yellownetwork
- GitHub Issues: https://github.com/erc7824/nitrolite/issues
