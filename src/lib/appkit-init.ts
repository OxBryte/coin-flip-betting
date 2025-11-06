// Initialize AppKit at module level - MUST be imported before any component uses useAppKit
// This file ensures createAppKit is called before any hooks are used

import { createAppKit } from "@reown/appkit/react";
import { arbitrum, base, celo, mainnet } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// Get projectId from https://dashboard.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "YOUR_PROJECT_ID";

// Create metadata object
const metadata = {
  name: "Coin Flip Betting",
  description: "Bet crypto on heads or tails in a fair coin flip game",
  url: "https://coinflip-betting.com",
  icons: ["https://coinflip-betting.com/icon.png"],
};

// Set the networks
const networks = [mainnet, arbitrum, base, celo];

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// Initialize AppKit - MUST be called before useAppKit hook
// This runs at module level, ensuring it executes before any components render
if (typeof window !== "undefined") {
  try {
    createAppKit({
      adapters: [wagmiAdapter],
      networks,
      projectId,
      metadata,
      features: {
        analytics: true,
      },
    });
  } catch (error) {
    // AppKit may already be initialized in development (hot reload)
    if (process.env.NODE_ENV === "development") {
      console.warn("AppKit initialization warning:", error);
    }
  }
}

// Export the adapter for use in the provider
export { wagmiAdapter, networks, projectId };
