'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { arbitrum, mainnet } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Setup queryClient
const queryClient = new QueryClient();

// Get projectId from https://dashboard.reown.com
// For now, using a placeholder - user should replace with their actual project ID
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID';

// Create metadata object
const metadata = {
  name: 'Coin Flip Betting',
  description: 'Bet crypto on heads or tails in a fair coin flip game',
  url: 'https://coinflip-betting.com', // Replace with your actual domain
  icons: ['https://coinflip-betting.com/icon.png'] // Replace with your icon URL
};

// Set the networks
const networks = [mainnet, arbitrum];

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
});

// Create modal - this should only be called once in the app
if (typeof window !== 'undefined') {
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    features: {
      analytics: true // Optional - defaults to your Cloud configuration
    }
  });
}

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

