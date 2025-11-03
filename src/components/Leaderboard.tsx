'use client';

import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  points: number;
  totalWins: number;
  totalLosses: number;
  totalFlips: number;
  currentStreak: number;
  totalEarned: number;
  winRate: string;
}

interface LeaderboardProps {
  currentWallet?: string;
}

export default function Leaderboard({ currentWallet }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [type, setType] = useState<'points' | 'wins' | 'streak' | 'earned'>('points');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/leaderboard?type=${type}&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [type]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Leaderboard</h2>
        <div className="flex gap-1 bg-gray-100 p-1 rounded">
          <button
            onClick={() => setType('points')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              type === 'points'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Points
          </button>
          <button
            onClick={() => setType('wins')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              type === 'wins'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Wins
          </button>
          <button
            onClick={() => setType('streak')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              type === 'streak'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Streak
          </button>
          <button
            onClick={() => setType('earned')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              type === 'earned'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Earned
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-900 text-lg">Loading leaderboard...</div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 text-lg">No players yet</div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.walletAddress}
              className={`flex items-center justify-between p-3 rounded bg-white ${
                entry.walletAddress.toLowerCase() === currentWallet?.toLowerCase()
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-gray-900 w-8">
                  {getRankEmoji(entry.rank)}
                </div>
                <div>
                  <div className="text-gray-900 text-sm font-medium">
                    {entry.walletAddress.toLowerCase() === currentWallet?.toLowerCase()
                      ? `You (${formatAddress(entry.walletAddress)})`
                      : formatAddress(entry.walletAddress)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {entry.totalWins}W / {entry.totalLosses}L ({entry.winRate}%)
                    {entry.currentStreak > 0 && (
                      <span className="text-orange-600 ml-1">🔥 {entry.currentStreak}x</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-900 text-sm font-semibold">
                  {type === 'points' && `${entry.points.toLocaleString()} pts`}
                  {type === 'wins' && `${entry.totalWins} wins`}
                  {type === 'streak' && `🔥 ${entry.currentStreak}`}
                  {type === 'earned' && `${entry.totalEarned.toLocaleString()} pts`}
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {entry.totalFlips} flips
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

