'use client';

import { useEffect, useState } from 'react';

interface DashboardData {
  stats: {
    totalFlips: number;
    totalWins: number;
    totalLosses: number;
    winRate: number;
    currentPoints: number;
    bestStreak: number;
    totalPointsWon: number;
    totalPointsLost: number;
    biggestWin: {
      betAmount: number;
      pointsChange: number;
      timestamp: string;
    } | null;
  };
  dayAnalytics: Record<string, { wins: number; losses: number; totalPoints: number }>;
  hourAnalytics: Record<number, { wins: number; losses: number; count: number }>;
  recentGames: Array<{
    result: string;
    selectedSide: string;
    betAmount: number;
    pointsChange: number;
    isWinner: boolean;
    timestamp: string;
  }>;
}

interface DashboardProps {
  walletAddress: string | undefined;
}

export default function Dashboard({ walletAddress }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!walletAddress) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/dashboard?walletAddress=${walletAddress}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchDashboardData();
    }
  }, [walletAddress]);

  // Listen for refresh events from game completion
  useEffect(() => {
    const handleRefresh = () => {
      if (walletAddress) {
        fetchDashboardData();
      }
    };

    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, [walletAddress]);

  if (!walletAddress) {
    return (
      <div className="text-center py-12">
        <div className="text-white/70 text-lg mb-4">Connect your wallet to view your dashboard</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-white text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-white/70 text-lg">No data available</div>
      </div>
    );
  }

  // Get last 7 days for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dayLabels = last7Days.map((date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  });

  // Filter hours with activity for better display
  const activeHours = Object.entries(data.hourAnalytics)
    .filter(([_, stats]) => stats.count > 0)
    .map(([hour]) => parseInt(hour));

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">📊 Your Dashboard</h2>
        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg">
          <div className="text-white/80 text-xs mb-1">Total Flips</div>
          <div className="text-2xl font-bold text-white">{data.stats.totalFlips}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg">
          <div className="text-white/80 text-xs mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-white">{data.stats.winRate}%</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg">
          <div className="text-white/80 text-xs mb-1">Best Streak</div>
          <div className="text-2xl font-bold text-white">{data.stats.bestStreak}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 shadow-lg">
          <div className="text-white/80 text-xs mb-1">Current Points</div>
          <div className="text-2xl font-bold text-white">{data.stats.currentPoints.toLocaleString()}</div>
        </div>
      </div>

      {/* Win/Loss Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
          <div className="text-white/70 text-sm mb-2">Total Wins</div>
          <div className="text-3xl font-bold text-green-400">{data.stats.totalWins}</div>
          <div className="text-green-300 text-xs mt-1">+{data.stats.totalPointsWon.toLocaleString()} points</div>
        </div>
        <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
          <div className="text-white/70 text-sm mb-2">Total Losses</div>
          <div className="text-3xl font-bold text-red-400">{data.stats.totalLosses}</div>
          <div className="text-red-300 text-xs mt-1">-{data.stats.totalPointsLost.toLocaleString()} points</div>
        </div>
      </div>

      {/* Biggest Win */}
      {data.stats.biggestWin && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-400/30">
          <div className="text-white/90 text-sm mb-2">🏆 Biggest Win</div>
          <div className="text-xl font-bold text-white">
            +{data.stats.biggestWin.pointsChange.toLocaleString()} points
          </div>
          <div className="text-white/70 text-xs mt-1">
            Bet: {data.stats.biggestWin.betAmount.toLocaleString()} points •{' '}
            {new Date(data.stats.biggestWin.timestamp).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Last 7 Days Chart */}
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
        <div className="text-white font-medium mb-4">Wins & Losses (Last 7 Days)</div>
        <div className="flex items-end justify-between gap-2 h-40">
          {last7Days.map((date, index) => {
            const dayData = data.dayAnalytics[date] || { wins: 0, losses: 0 };
            const total = dayData.wins + dayData.losses;
            const winsHeight = total > 0 ? (dayData.wins / total) * 100 : 0;
            const lossesHeight = total > 0 ? (dayData.losses / total) * 100 : 0;

            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex flex-col-reverse w-full gap-0.5 h-32">
                  {total > 0 && (
                    <>
                      <div
                        className="bg-red-400 rounded-t"
                        style={{ height: `${lossesHeight}%` }}
                        title={`Losses: ${dayData.losses}`}
                      />
                      <div
                        className="bg-green-400 rounded-t"
                        style={{ height: `${winsHeight}%` }}
                        title={`Wins: ${dayData.wins}`}
                      />
                    </>
                  )}
                </div>
                <div className="text-white/60 text-xs">{dayLabels[index]}</div>
                <div className="text-white/40 text-xs">{total}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance by Hour */}
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
        <div className="text-white font-medium mb-4">Performance by Hour of Day</div>
        {activeHours.length === 0 ? (
          <div className="text-white/50 text-center py-4">No hourly data yet. Start playing to see your best hours!</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {activeHours.map((hour) => {
              const stats = data.hourAnalytics[hour];
              const winRate = stats.count > 0 ? ((stats.wins / stats.count) * 100).toFixed(0) : 0;
              const hourLabel = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
              return (
                <div key={hour} className="text-center bg-white/5 rounded-lg p-3">
                  <div className="text-white/70 text-xs mb-2 font-semibold">{hourLabel}</div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-400 text-xs font-bold">{stats.wins}W</span>
                      <span className="text-white/40">/</span>
                      <span className="text-red-400 text-xs font-bold">{stats.losses}L</span>
                    </div>
                    <div className="text-white/60 text-xs">{winRate}% WR</div>
                    <div className="text-white/40 text-xs">{stats.count} games</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Games */}
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
        <div className="text-white font-medium mb-4">Recent Games</div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {data.recentGames.length === 0 ? (
            <div className="text-white/50 text-center py-4">No games yet. Start playing!</div>
          ) : (
            data.recentGames.map((game, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  game.isWinner ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-2xl ${game.isWinner ? 'text-green-400' : 'text-red-400'}`}>
                    {game.isWinner ? '✅' : '❌'}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {game.selectedSide.toUpperCase()} → {game.result.toUpperCase()}
                    </div>
                    <div className="text-white/60 text-xs">
                      {new Date(game.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${game.isWinner ? 'text-green-400' : 'text-red-400'}`}>
                  {game.pointsChange > 0 ? '+' : ''}{game.pointsChange.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

