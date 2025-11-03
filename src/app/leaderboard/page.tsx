'use client';

import { useAccount } from 'wagmi';
import Leaderboard from '@/components/Leaderboard';

export default function LeaderboardPage() {
  const { address } = useAccount();

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500 text-sm">Top players by points, wins, streaks and earnings</p>
        </div>
        <Leaderboard currentWallet={address} />
      </div>
    </main>
  );
}
