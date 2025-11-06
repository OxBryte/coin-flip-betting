# 🪙 Coin Flip Betting

A modern, interactive coin flip betting application built with Next.js and Tailwind CSS. Bet on heads or tails with a beautiful, responsive UI and seamless wallet integration.

## Features

- 🔗 **Wallet Integration** - Connect your wallet using Reown/WalletConnect
- 📊 **Analytics Dashboard** - Comprehensive dashboard with win/loss analytics by day and hour (default view)
- 🎯 **Heads/Tails Betting** - Choose your side and place bets
- ⚡ **Leverage Trading** - Choose leverage from 1x to 100x (futures-style trading)
- 💰 **Points System** - Track your points in real-time with MongoDB
- 🔐 **User Authentication** - Automatic user creation on wallet connection
- 📈 **Game History** - View recent games with detailed results, leverage, and timestamps
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

## Required Packages

### Core Dependencies

```json
{
  "next": "16.0.1",
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "typescript": "^5",
  "tailwindcss": "^4"
}
```

### WalletConnect/Reown Packages 🔑

The following **Reown (WalletConnect) packages** are essential for wallet connectivity:

```json
{
  "@reown/appkit": "^1.8.12",
  "@reown/appkit-adapter-wagmi": "^1.8.12"
}
```

**Why these packages?**

- **`@reown/appkit`**: The main Reown AppKit library that provides wallet connection UI components and core functionality. This is the modern rebrand of WalletConnect's AppKit.
- **`@reown/appkit-adapter-wagmi`**: Adapter that seamlessly integrates Reown AppKit with Wagmi, enabling React hooks for wallet interactions.

These packages work together to provide:

- ✅ Wallet connection UI (Connect Wallet button, wallet selection modal)
- ✅ Support for 300+ wallets via WalletConnect protocol
- ✅ Seamless integration with Wagmi hooks (`useAccount`, `useConnect`, etc.)
- ✅ Mobile wallet deep linking
- ✅ QR code scanning for WalletConnect-compatible wallets

### Additional Required Packages

```json
{
  "wagmi": "^2.19.2",
  "viem": "^2.38.6",
  "@tanstack/react-query": "^5.90.6",
  "mongoose": "^8.19.2"
}
```

**Package Details:**

- **`wagmi`**: React Hooks library for Ethereum that works seamlessly with Reown AppKit
- **`viem`**: TypeScript Ethereum library for low-level interactions
- **`@tanstack/react-query`**: Powerful data synchronization library for server state management
- **`mongoose`**: MongoDB object modeling for Node.js

### Development Dependencies

```json
{
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "16.0.1"
}
```

## Getting Started

### Installation

Install all dependencies including the required WalletConnect/Reown packages:

```bash
npm install
```

This will install:

- ✅ Core packages (Next.js, React, TypeScript)
- ✅ **WalletConnect/Reown packages** (`@reown/appkit`, `@reown/appkit-adapter-wagmi`)
- ✅ Wagmi & Viem for Ethereum interactions
- ✅ MongoDB with Mongoose
- ✅ TanStack Query for state management
- ✅ Tailwind CSS for styling

**Note:** Make sure you have Node.js 18+ installed before running the installation.

#### Installing WalletConnect/Reown Packages Separately

If you need to install the WalletConnect/Reown packages separately, you can use:

```bash
npm install @reown/appkit@^1.8.12 @reown/appkit-adapter-wagmi@^1.8.12
```

Or with yarn:

```bash
yarn add @reown/appkit@^1.8.12 @reown/appkit-adapter-wagmi@^1.8.12
```

These packages must be installed together with their peer dependencies (`wagmi` and `viem`):

```bash
npm install @reown/appkit @reown/appkit-adapter-wagmi wagmi viem
```

### Environment Setup

Create a `.env.local` file in the root directory and add the following:

```bash
# Reown/WalletConnect Project ID (REQUIRED for @reown/appkit)
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here

# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coinflip?retryWrites=true&w=majority
```

**Getting your Reown Project ID (Required for WalletConnect):**

The `NEXT_PUBLIC_REOWN_PROJECT_ID` is **essential** for the `@reown/appkit` package to work. Without it, wallet connections will fail.

1. Visit [Reown Cloud Dashboard](https://dashboard.reown.com)
2. Sign in or create a free account
3. Create a new project or use an existing one
4. Copy your Project ID from the project settings
5. Add it to your `.env.local` file as `NEXT_PUBLIC_REOWN_PROJECT_ID`

**Note:** The Project ID is used by the WalletConnect protocol to establish secure connections between your app and user wallets. It's safe to expose this in your client-side code (hence the `NEXT_PUBLIC_` prefix).

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
3. **Choose Your Leverage** - Select leverage from 1x to 100x (futures-style trading)
   - Higher leverage = Higher potential win but you only risk your bet amount
   - Example: 10x leverage with 100 points bet = potential +900 win, but only -100 loss
4. **Select Your Side** - Click on Heads 🟡 or Tails ⚪️
5. **Flip the Coin** - Click the "Flip Coin!" button
6. **Instant Payouts** - If you win, you instantly receive your profit based on leverage! Points are updated immediately in the database.

## Wallet Support

The app supports multiple wallet providers through **Reown (WalletConnect) packages** (`@reown/appkit` & `@reown/appkit-adapter-wagmi`):

### Supported Wallets

The following wallets are supported out of the box:

**Desktop Wallets:**

- MetaMask
- Coinbase Wallet
- Rainbow Wallet
- Trust Wallet
- Ledger Live
- Zerion

**Mobile Wallets (via WalletConnect):**

- MetaMask Mobile
- Trust Wallet
- Rainbow Mobile
- Coinbase Wallet Mobile
- SafePal
- TokenPocket

**And 300+ more wallets** via the WalletConnect protocol!

### How It Works

The wallet connectivity is powered by:

1. **`@reown/appkit`** - Provides the wallet connection UI and core connection logic
2. **`@reown/appkit-adapter-wagmi`** - Bridges AppKit with Wagmi hooks for seamless integration
3. **Wagmi** - React hooks for interacting with connected wallets (`useAccount`, `useBalance`, etc.)

When users click "Connect Wallet", they'll see a modal powered by Reown AppKit that lists all available wallets. Mobile users can scan a QR code to connect via WalletConnect-compatible wallets.

## Points System & Leverage

- **Starting Points:** Every new user receives 1,000 points upon wallet connection
- **Leverage Trading:** Choose leverage from 1x to 100x (similar to futures trading)
  - **If you win:** You get betAmount × (leverage - 1) in profit
    - Example: 100 points bet with 10x leverage = +900 points profit
  - **If you lose:** You only lose your bet amount (the margin)
    - Example: 100 points bet with 10x leverage = -100 points loss
- **Instant Payouts:** Winners receive their profit instantly based on leverage
- **Points Storage:** All points are stored securely in MongoDB
- **Statistics:** Track your total flips, wins, losses, and leverage used in real-time

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
