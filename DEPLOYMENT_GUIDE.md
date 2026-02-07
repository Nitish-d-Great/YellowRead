# YellowRead Deployment Guide

Complete guide to deploying YellowRead for the ETHGlobal Hackathon.

---

## Prerequisites

1. **Node.js 18+** installed
2. **MetaMask** browser extension
3. **Sepolia ETH** for testing ([Get from faucet](https://sepoliafaucet.com/))

---

## Local Development

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/yellowread.git
cd yellowread
npm install
```

### 2. Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your settings
VITE_CLEARNODE_URL=wss://clearnet.yellow.com/ws
VITE_PUBLISHER_ADDRESS=0xYourWalletAddress
VITE_CHAIN_ID=11155111
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

---

## Production Deployment

### Option 1: Netlify (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy on Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repo
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables in Netlify dashboard

3. **Your site is live!**

### Option 2: Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Add environment variables** in Vercel dashboard

### Option 3: GitHub Pages

1. **Install gh-pages**
```bash
npm install gh-pages --save-dev
```

2. **Add to package.json**
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. **Deploy**
```bash
npm run deploy
```

---

## Yellow Network Configuration

### ClearNode Connection

The app connects to Yellow Network's ClearNode for off-chain state channel management:

| Environment | ClearNode URL |
|-------------|---------------|
| Production | `wss://clearnet.yellow.com/ws` |
| Sandbox | `wss://clearnet-sandbox.yellow.com/ws` |

### Smart Contract Addresses (Sepolia)

For full Nitrolite integration, you'll need these deployed contracts:

```javascript
// Sepolia Testnet (Chain ID: 11155111)
const CONTRACTS = {
  Custody: '0x...', // Asset custody
  Adjudicator: '0x...' // Dispute resolution
};
```

Check latest addresses at:
https://github.com/erc7824/nitrolite/tree/main/contract/deployments/11155111

---

## Testing Checklist

### Wallet Connection
- [ ] MetaMask connects successfully
- [ ] Automatically switches to Sepolia network
- [ ] Shows wallet address in header

### Article Reading
- [ ] 12 demo articles display correctly
- [ ] Click article opens full view
- [ ] Read status tracked per article
- [ ] Billing counter updates

### Billing Logic
- [ ] 0 articles → 0.000 ETH
- [ ] 2 articles → 0.001 ETH  
- [ ] 4 articles → 0.002 ETH
- [ ] Re-reading doesn't charge again

### Payment Flow
- [ ] "Settle & Pay" navigates to payment page
- [ ] Invoice shows correct details
- [ ] MetaMask prompts for transaction
- [ ] Confirmation page shows tx hash
- [ ] Etherscan link works

---

## Hackathon Submission

### Required Materials

1. **Working Demo**
   - Deployed URL on Netlify/Vercel
   - Test on Sepolia network

2. **GitHub Repository**
   - Clean code with README
   - MIT License
   - Environment variables documented

3. **Demo Video (2-3 minutes)**
   - Connect wallet
   - Read 4+ articles
   - Show billing updates
   - Complete payment
   - Show Etherscan confirmation

### Submission Links

- ETHGlobal Showcase: https://ethglobal.com/showcase
- Yellow Network Track: Submit under "Yellow Network" prize track

---

## Troubleshooting

### MetaMask Issues

**"No accounts found"**
- Make sure MetaMask is unlocked
- Refresh the page and try again

**"Wrong network"**
- App will prompt to switch to Sepolia
- Accept the network switch in MetaMask

### Payment Failures

**"Transaction rejected"**
- User cancelled in MetaMask
- Show retry option

**"Insufficient funds"**
- Get Sepolia ETH from faucet
- https://sepoliafaucet.com/

### ClearNode Connection

**"WebSocket connection failed"**
- App falls back to direct payments
- Check network connectivity

---

## Support

- **Yellow Network Discord**: https://discord.gg/yellownetwork
- **ERC-7824 Docs**: https://erc7824.org
- **Nitrolite SDK**: https://github.com/erc7824/nitrolite

---

## License

MIT License - See LICENSE file
