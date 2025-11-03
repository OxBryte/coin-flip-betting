# 🪙 Coin Flip Betting

A modern, interactive coin flip betting application built with Next.js and Tailwind CSS. Bet on heads or tails with a beautiful, responsive UI and seamless wallet integration.

## Features

- 🔗 **Wallet Integration** - Connect your wallet using Reown/WalletConnect
- 📊 **Analytics Dashboard** - Comprehensive dashboard with win/loss analytics by day and hour (default view)
- 🎯 **Heads/Tails Betting** - Choose your side and place bets
- ⚡ **Instant Payouts** - Winners receive points immediately (2x bet amount)
- 💰 **Points System** - Track your points in real-time with MongoDB
- 🔐 **User Authentication** - Automatic user creation on wallet connection
- 📈 **Game History** - View recent games with detailed results and timestamps
- 🎨 **Minimalistic UI** - Clean, light theme design with centered layout
- 🎬 **Smooth Animations** - Coin flip animations and transitions
- 🔄 **Auto Commit** - Automated git commits and pushes

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Wallet:** Reown (WalletConnect) + Wagmi + Viem
- **Database:** MongoDB with Mongoose
- **State Management:** TanStack Query
- **Deployment:** Vercel-ready

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory and add the following:

```bash
# Reown/WalletConnect Project ID
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here

# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coinflip?retryWrites=true&w=majority
```

**Getting your Project ID:**
- Visit [Reown Cloud](https://dashboard.reown.com)
- Create a new project or use an existing one
- Copy your Project ID

**Setting up MongoDB:**
1. Create a free MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user and set a password
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Click "Connect" → "Connect your application"
6. Copy the connection string and replace `<password>` with your database user password
7. Add the connection string to `.env.local` as `MONGODB_URI`

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
│   │   ├── api/
│   │   │   └── user/
│   │   │       ├── route.ts       # User authentication API
│   │   │       ├── dashboard/
│   │   │       │   └── route.ts   # Dashboard analytics API
│   │   │       └── flip/
│   │   │           └── route.ts   # Coin flip & payout API
│   │   ├── page.tsx              # Main coin flip betting component
│   │   ├── layout.tsx            # Root layout with AppKit provider
│   │   └── globals.css            # Global styles with Tailwind
│   ├── components/
│   │   ├── AppKitProvider.tsx    # Wallet connection provider
│   │   └── Dashboard.tsx         # Analytics dashboard component
│   ├── lib/
│   │   └── mongodb.ts            # MongoDB connection utility
│   └── models/
│       └── User.ts               # User model schema
├── auto-commit.sh                # Auto commit and push script
├── package.json
└── README.md
```

## How to Play

1. **Connect Your Wallet** - Click "Connect Wallet" and select your preferred wallet (MetaMask, WalletConnect, etc.)
   - Your account is automatically created with 1,000 starting points
2. **Set Your Bet Amount** - Choose from preset amounts (10, 50, 100, 500) or enter a custom value in points
3. **Select Your Side** - Click on Heads 🟡 or Tails ⚪️
4. **Flip the Coin** - Click the "Flip Coin!" button
5. **Instant Payouts** - If you win, you instantly receive 2x your bet amount in points! Your points are updated immediately in the database.

## Wallet Support

The app supports multiple wallet providers through Reown/WalletConnect:

- MetaMask
- Coinbase Wallet
- Rainbow Wallet
- Trust Wallet
- And 300+ more wallets via WalletConnect

## Points System

- **Starting Points:** Every new user receives 1,000 points upon wallet connection
- **Instant Payouts:** Winners receive 2x their bet amount instantly
- **Points Storage:** All points are stored securely in MongoDB
- **Statistics:** Track your total flips, wins, and losses in real-time

## Analytics Dashboard

The dashboard is the default view when you connect your wallet. It provides comprehensive analytics and insights with a clean, minimalistic interface:

### Key Metrics
- **Total Flips:** Your overall game count
- **Win Rate:** Percentage of games won
- **Best Streak:** Longest consecutive win streak
- **Current Points:** Your available points balance
- **Total Wins/Losses:** Lifetime win/loss counts with points earned/lost

### Analytics Features
- **7-Day Performance Chart:** Visual representation of wins vs losses over the last 7 days
- **Hourly Performance:** See which hours of the day you perform best (with win rate for each hour)
- **Recent Games:** Scrollable list of your last 20 games with:
  - Result (heads/tails)
  - Your selection
  - Points change
  - Timestamp
- **Biggest Win:** Highlight of your largest win with bet amount and date
- **Auto-Refresh:** Dashboard automatically updates when you complete a game

### View Modes
- **Dashboard View:** Analytics and statistics (default, centered layout)
- **Play View:** Coin flip betting interface

## Design

The application features a **minimalistic light theme** with:
- Clean, centered layout for optimal viewing
- Subtle gray color scheme with minimal borders
- Compact, information-dense dashboard
- Focus on content over decoration
- Responsive design that works on all screen sizes

## Features in Development

- Real crypto smart contracts integration
- Provably fair randomization
- Multiplayer betting pools
- Global leaderboard
- Enhanced history filtering and export
- Cross-chain support

## License

MIT

## Warning

⚠️ This is a demo application. No real money or cryptocurrency is being wagered in this version.
