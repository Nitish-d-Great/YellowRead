# 🟡 Yellow Network / Nitrolite SDK Integration

## Overview

YellowRead uses the **real** `@erc7824/nitrolite` SDK for state channel operations. This document describes the integration details.

## SDK Version

```json
{
  "dependencies": {
    "@erc7824/nitrolite": "^0.5.0"
  }
}
```

## Imports Used

```javascript
import { 
  createAppSessionMessage,
  createCloseAppSessionMessage,
  createAuthRequestMessage,
  createAuthVerifyMessage,
  parseRPCResponse,
  NitroliteRPC,
} from '@erc7824/nitrolite';
```

## Integration Flow

### 1. WebSocket Connection

```javascript
// Connect to ClearNode
const ws = new WebSocket('wss://clearnet.yellow.com/ws');
```

### 2. Authentication Flow

Following the SDK documentation at https://erc7824.org/quick_start/connect_to_the_clearnode:

```javascript
// Step 1: Create auth request
const authRequest = await createAuthRequestMessage({
  wallet: userAddress,
  participant: userAddress,
  session_key: sessionKey.address,
  application: 'YellowRead',
  expires_at: expiresAt.toString(),
  scope: 'app',
  allowances: [],
});
ws.send(authRequest);

// Step 2: Handle auth_challenge (received from ClearNode)
// Sign with EIP-712
const authVerify = await createAuthVerifyMessage(
  eip712Signer,
  challengeMessage,
  authParams
);
ws.send(authVerify);

// Step 3: Receive auth_success with JWT token
```

### 3. Create App Session

```javascript
const appDefinition = {
  protocol: 'yellowread-pay-per-article-v1',
  participants: [userAddress, publisherAddress],
  weights: [100, 0],
  quorum: 100,
  challenge: 0,
  nonce: Date.now(),
};

const allocations = [
  { participant: userAddress, asset: 'eth', amount: '0' },
  { participant: publisherAddress, asset: 'eth', amount: '0' }
];

const sessionMessage = await createAppSessionMessage(
  messageSigner,
  [{ definition: appDefinition, allocations }]
);
ws.send(sessionMessage);
```

### 4. Send State Updates

```javascript
// Create signed state update using NitroliteRPC
const rpcMessage = NitroliteRPC.createRequest(
  'session_message',
  [{
    app_session_id: appSessionId,
    type: 'article_read',
    data: stateData,
    signature,
  }],
  Date.now()
);

const signedMessage = await NitroliteRPC.signMessage(rpcMessage, messageSigner);
ws.send(JSON.stringify(signedMessage));
```

### 5. Close Session

```javascript
const closeMessage = await createCloseAppSessionMessage(
  messageSigner,
  [{
    app_session_id: appSessionId,
    allocations: finalAllocations,
  }]
);
ws.send(closeMessage);
```

## Message Signer

Following SDK requirements (signs without EIP-191 prefix):

```javascript
const messageSigner = async (payload) => {
  const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const messageHash = ethers.id(message);
  const messageBytes = ethers.getBytes(messageHash);
  
  // Sign digest directly (not EIP-191)
  const signature = sessionKey.signingKey.sign(messageBytes);
  return ethers.Signature.from(signature).serialized;
};
```

## File Location

All Nitrolite integration code is in:
- `/src/services/nitrolite.js`

## ClearNode Endpoints

| Environment | URL |
|-------------|-----|
| Production | `wss://clearnet.yellow.com/ws` |
| Sandbox | `wss://clearnet-sandbox.yellow.com/ws` |

## Documentation References

- https://erc7824.org/
- https://erc7824.org/quick_start/
- https://erc7824.org/quick_start/connect_to_the_clearnode
- https://erc7824.org/quick_start/application_session
- https://erc7824.org/quick_start/close_session
- https://github.com/erc7824/nitrolite
- https://docs.yellow.org/docs/build/quick-start/