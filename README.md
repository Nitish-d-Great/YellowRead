# 🟡 YellowRead

### Decentralized Pay-Per-Read News Platform | Yellow Network State Channels

<p align="center">
  <img src="https://img.shields.io/badge/HackMoney-Hackathon%202026-blue" alt="HackMoney 2026">
  <img src="https://img.shields.io/badge/Yellow%20Network-Prize%20Track-yellow" alt="Yellow Network">
  <img src="https://img.shields.io/badge/ERC--7824-State%20Channels-green" alt="ERC-7824">
  <img src="https://img.shields.io/badge/Network-Sepolia-purple" alt="Sepolia">
</p>

---

## 🎯 What is YellowRead?

YellowRead revolutionizes news monetization using **Yellow Network's state channels**. Instead of subscriptions, users pay **0.001 ETH per article** they read — with all tracking happening **off-chain** (instant, gas-free) and only the final settlement on-chain.

> **"Pay only for what you read. No subscriptions. No ads. Just content."**

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔗 **Wallet Connect** | MetaMask integration with automatic Sepolia network switching |
| 📰 **Live News Feed** | Real-time Web3 news from CryptoCompare API |
| 💰 **Off-Chain Billing** | Articles tracked instantly via Nitrolite state channels |
| ⛽ **Gas Efficient** | Only 1 on-chain transaction at settlement |
| 📊 **Session Dashboard** | Real-time cost tracking & session stats |
| 🧾 **Transaction Receipt** | Full confirmation with Etherscan link |

---

## 🎬 Demo Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. CONNECT WALLET                                              │
│     └─→ MetaMask popup → Approve connection                     │
│     └─→ Yellow Network session created (off-chain)              │
│                                                                 │
│  2. READ ARTICLES                                               │
│     └─→ Click any article to read                               │
│     └─→ State updated OFF-CHAIN (no wallet popup!)              │
│     └─→ Billing counter updates: 0.001 ETH per article          │
│                                                                 │
│  3. SETTLE PAYMENT                                              │
│     └─→ Click "Settle & Pay"                                    │
│     └─→ Review session summary                                  │
│     └─→ ONE MetaMask transaction (final settlement)             │
│                                                                 │
│  4. CONFIRMATION                                                │
│     └─→ Transaction hash, block number, gas used                │
│     └─→ View on Sepolia Etherscan                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite |
| **Styling** | CSS with custom design system |
| **Blockchain** | Ethereum Sepolia Testnet |
| **Wallet** | MetaMask via ethers.js v6 |
| **State Channels** | Yellow Network (Nitrolite SDK) |
| **Protocol** | ERC-7824 |
| **News API** | CryptoCompare (real-time Web3 news) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Sepolia ETH ([Get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/Nitish-d-Great/YellowRead.git
cd YellowRead

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 💰 Pricing Model

| Action | Cost | Transaction |
|--------|------|-------------|
| Read 1 article | 0.001 ETH | ❌ Off-chain |
| Read 5 articles | 0.005 ETH | ❌ Off-chain |
| Read 10 articles | 0.010 ETH | ❌ Off-chain |
| **Settlement** | Total owed | ✅ On-chain (1 TX) |

**Why this matters:**
- Traditional approach: 10 articles = 10 on-chain transactions = ~$5 in gas
- YellowRead: 10 articles = 1 on-chain transaction = ~$0.10 in gas

---

## 🔗 Yellow Network Integration

### How State Channels Work

```
┌──────────────┐     Off-Chain      ┌──────────────┐
│              │◄──────────────────►│              │
│    User      │   State Updates    │  ClearNode   │
│   Wallet     │   (instant, free)  │   (Yellow)   │
│              │                    │              │
└──────┬───────┘                    └──────────────┘
       │
       │ On-Chain (only at settlement)
       ▼
┌──────────────┐
│   Ethereum   │
│   Sepolia    │
└──────────────┘
```

### Nitrolite Service Flow

```javascript
// 1. Initialize session (wallet connect)
const nitrolite = getNitroliteService();
await nitrolite.initialize(walletAddress);
nitrolite.createSession();

// 2. Record article reads (OFF-CHAIN - no signing!)
nitrolite.recordArticleRead(articleId);
// State updates instantly, no wallet popup

// 3. Settlement (ONE on-chain transaction)
nitrolite.closeSession();
await nitrolite.processSettlement();
// Only now does MetaMask appear
```

### Console Output Example

```
🟡 NitroliteService: Initializing...
🔗 Wallet connected: 0x1365...8415
🟡 Yellow Network session created: session_1770445...

📰 Off-chain state update: {article: '57808224', total: 1, owed: '0.001 ETH'}
📰 Off-chain state update: {article: '57808100', total: 2, owed: '0.002 ETH'}
📰 Off-chain state update: {article: '57808147', total: 3, owed: '0.003 ETH'}

🔒 Closing Yellow Network session...
💳 Initiating on-chain payment (single transaction)...
📤 Transaction sent: 0x99b59e6c76a2e645d9ffc1f116aa15ad93337e66d73ed7778564fa82b4953558
✅ Settlement confirmed!
📦 Block: 10208726
⛽ Gas used: 21000
```

---

## 📁 Project Structure

```
yellowread/
├── src/
│   ├── App.jsx                    # Main app with routing
│   ├── main.jsx                   # Entry point
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx        # Wallet connection
│   │   ├── NewsFeedPage.jsx       # Article browsing + billing
│   │   ├── PaymentPage.jsx        # Settlement summary
│   │   └── ConfirmationPage.jsx   # Transaction receipt
│   │
│   ├── components/
│   │   ├── Header.jsx             # Navigation with wallet status
│   │   ├── ArticleCard.jsx        # News article display
│   │   └── BillingCounter.jsx     # Real-time cost tracker
│   │
│   ├── services/
│   │   ├── nitrolite.js           # Yellow Network integration
│   │   └── newsApi.js             # CryptoCompare API
│   │
│   ├── hooks/
│   │   └── useWallet.js           # Wallet connection hook
│   │
│   ├── data/
│   │   └── articles.js            # Fallback demo articles
│   │
│   └── styles/
│       └── global.css             # Design system & variables
│
├── .env                           # Environment variables
├── package.json
├── vite.config.js
└── index.html
```

---

## ⚙️ Environment Variables

```env
# Publisher wallet (receives payments)
VITE_PUBLISHER_ADDRESS=0x53A50d231569437f969EF1c1Aa034230FD032241

# Yellow Network
VITE_CLEARNODE_URL=wss://clearnet.yellow.com/ws

# Pricing (ETH per article)
VITE_PRICE_PER_ARTICLE=0.001

# Network
VITE_CHAIN_ID=11155111
```

---

## ✅ Yellow Network Prize Qualification

| Requirement | Implementation |
|-------------|----------------|
| ✅ Use Yellow SDK / Nitrolite | Full Nitrolite service integration (`src/services/nitrolite.js`) |
| ✅ Off-chain transaction logic | Article reads tracked via state updates (no gas) |
| ✅ Session-based spending | Reading sessions with per-article billing |
| ✅ On-chain settlement | Single transaction settlement via smart contract |
| ✅ Working prototype | Fully functional on Sepolia testnet |
| ✅ Demo video | 2-3 minute walkthrough of user flow |

### Why YellowRead Fits the Track

> **"Pay-Per-Use App: charge users per API call, minute, or read action - settle once at the end of session."**
> — Yellow Network Prize Description

YellowRead demonstrates exactly this: micropayments per article read, tracked off-chain, settled on-chain once.

---

## 🧪 Testing

1. Get Sepolia ETH: [sepoliafaucet.com](https://sepoliafaucet.com/)
2. Open app: `npm run dev` → http://localhost:5173
3. Connect MetaMask (will prompt to switch to Sepolia)
4. Read some articles (watch console for off-chain updates)
5. Click "Settle & Pay"
6. Approve single MetaMask transaction
7. View confirmation with Etherscan link

---

## 📜 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🔗 Links

- **Repository**: [github.com/Nitish-d-Great/YellowRead](https://github.com/Nitish-d-Great/YellowRead)
- **Yellow Network**: [yellow.org](https://yellow.org)
- **ERC-7824 Spec**: [erc7824.org](https://erc7824.org)
- **Sepolia Etherscan**: [sepolia.etherscan.io](https://sepolia.etherscan.io)

---

## 🏆 Built For

**HackMoney Hackathon 2026** — Yellow Network Prize Track ($15,000)

---

## 📄 License

MIT

---

<p align="center">
  <b>🟡 Powered by Yellow Network | ERC-7824 State Channels</b>
</p>