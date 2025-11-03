# 🪙 Coin Flip Betting

A modern, interactive coin flip betting application built with Next.js and Tailwind CSS. Bet on heads or tails with a beautiful, responsive UI and seamless wallet integration.

## Features

- 🔗 **Wallet Integration** - Connect your wallet using Reown/WalletConnect
- 🎯 **Heads/Tails Betting** - Choose your side and place bets
- 💰 **Wallet Balance** - Track your balance in real-time
- 🎨 **Beautiful UI** - Modern glassmorphic design with Tailwind CSS
- 🎬 **Smooth Animations** - Coin flip animations and transitions
- 📊 **Statistics** - Track your total flips and current bets
- 🔄 **Auto Commit** - Automated git commits and pushes

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Wallet:** Reown (WalletConnect) + Wagmi + Viem
- **State Management:** TanStack Query
- **Deployment:** Vercel-ready

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory and add your Reown Project ID:

```bash
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
```

Get your Project ID from [Reown Cloud](https://dashboard.reown.com).

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Auto Commit

The project includes an auto-commit script that automatically commits and pushes changes every 60 seconds:

```bash
./auto-commit.sh
```

## Project Structure

```
coin-flip-betting/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main coin flip betting component
│   │   ├── layout.tsx        # Root layout with AppKit provider
│   │   └── globals.css       # Global styles with Tailwind
│   └── components/
│       └── AppKitProvider.tsx # Wallet connection provider
├── auto-commit.sh            # Auto commit and push script
├── package.json
└── README.md
```

## How to Play

1. **Connect Your Wallet** - Click "Connect Wallet" and select your preferred wallet (MetaMask, WalletConnect, etc.)
2. **Set Your Bet Amount** - Choose from preset amounts or enter a custom value
3. **Select Your Side** - Click on Heads 🟡 or Tails ⚪️
4. **Flip the Coin** - Click the "Flip Coin!" button
5. **Win or Lose** - If the coin lands on your chosen side, you win!

## Wallet Support

The app supports multiple wallet providers through Reown/WalletConnect:

- MetaMask
- Coinbase Wallet
- Rainbow Wallet
- Trust Wallet
- And 300+ more wallets via WalletConnect

## Features in Development

- Real crypto smart contracts integration
- Provably fair randomization
- Multiplayer betting pools
- Leaderboard
- History tracking
- Cross-chain support

## License

MIT

## Warning

⚠️ This is a demo application. No real money or cryptocurrency is being wagered in this version.
