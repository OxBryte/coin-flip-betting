# 🪙 Coin Flip Betting

A modern, interactive coin flip betting application built with Next.js and Tailwind CSS. Bet on heads or tails with a beautiful, responsive UI.

## Features

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
- **Deployment:** Vercel-ready

## Getting Started

### Installation

```bash
npm install
```

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
│   └── app/
│       ├── page.tsx          # Main coin flip betting component
│       ├── layout.tsx        # Root layout
│       └── globals.css       # Global styles with Tailwind
├── auto-commit.sh            # Auto commit and push script
├── package.json
└── README.md
```

## How to Play

1. **Set Your Bet Amount** - Choose from preset amounts or enter a custom value
2. **Select Your Side** - Click on Heads 🟡 or Tails ⚪️
3. **Flip the Coin** - Click the "Flip Coin!" button
4. **Win or Lose** - If the coin lands on your chosen side, you win!

## Features in Development

- Real crypto integration
- Wallet connection (MetaMask, WalletConnect)
- Provably fair randomization
- Multiplayer betting pools
- Leaderboard
- History tracking

## License

MIT

## Warning

⚠️ This is a demo application. No real money or cryptocurrency is being wagered in this version.
