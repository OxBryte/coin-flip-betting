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
        <div className="text-gray-600 text-lg mb-4">Connect your wallet to view your dashboard</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-900 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg">No data available</div>
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">📊 Your Dashboard</h2>
        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
          <div className="text-gray-700 text-sm mb-2">Total Flips</div>
          <div className="text-3xl font-bold text-blue-700">{data.stats.totalFlips}</div>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
          <div className="text-gray-700 text-sm mb-2">Win Rate</div>
          <div className="text-3xl font-bold text-green-700">{data.stats.winRate}%</div>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5 shadow-sm">
          <div className="text-gray-700 text-sm mb-2">Best Streak</div>
          <div className="text-3xl font-bold text-purple-700">{data.stats.bestStreak}</div>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5 shadow-sm">
          <div className="text-gray-700 text-sm mb-2">Current Points</div>
          <div className="text-3xl font-bold text-emerald-700">{data.stats.currentPoints.toLocaleString()}</div>
        </div>
      </div>

      {/* Win/Loss Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8">
          <div className="text-gray-700 text-base mb-3">Total Wins</div>
          <div className="text-4xl font-bold text-green-600">{data.stats.totalWins}</div>
          <div className="text-green-700 text-sm mt-2">+{data.stats.totalPointsWon.toLocaleString()} points</div>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
          <div className="text-gray-700 text-base mb-3">Total Losses</div>
          <div className="text-4xl font-bold text-red-600">{data.stats.totalLosses}</div>
          <div className="text-red-700 text-sm mt-2">-{data.stats.totalPointsLost.toLocaleString()} points</div>
        </div>
      </div>

      {/* Biggest Win */}
      {data.stats.biggestWin && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8">
          <div className="text-gray-900 text-base mb-3 font-semibold">🏆 Biggest Win</div>
          <div className="text-2xl font-bold text-gray-900">
            +{data.stats.biggestWin.pointsChange.toLocaleString()} points
          </div>
          <div className="text-gray-700 text-sm mt-2">
            Bet: {data.stats.biggestWin.betAmount.toLocaleString()} points •{' '}
            {new Date(data.stats.biggestWin.timestamp).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Charts Grid - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last 7 Days Chart */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="text-gray-900 font-medium mb-4 text-lg">Wins & Losses (Last 7 Days)</div>
          <div className="flex items-end justify-between gap-3 h-48">
            {last7Days.map((date, index) => {
              const dayData = data.dayAnalytics[date] || { wins: 0, losses: 0 };
              const total = dayData.wins + dayData.losses;
              const winsHeight = total > 0 ? (dayData.wins / total) * 100 : 0;
              const lossesHeight = total > 0 ? (dayData.losses / total) * 100 : 0;

              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex flex-col-reverse w-full gap-0.5 h-40">
                    {total > 0 && (
                      <>
                        <div
                          className="bg-red-400 rounded-t"
                          style={{ height: `${lossesHeight}%` }}
                          title={`Losses: ${dayData.losses}`}
                        />
                        <div
                          className="bg-green-500 rounded-t"
                          style={{ height: `${winsHeight}%` }}
                          title={`Wins: ${dayData.wins}`}
                        />
                      </>
                    )}
                  </div>
                  <div className="text-gray-600 text-xs">{dayLabels[index]}</div>
                  <div className="text-gray-400 text-xs">{total}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance by Hour */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="text-gray-900 font-medium mb-4 text-lg">Performance by Hour of Day</div>
          {activeHours.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No hourly data yet. Start playing to see your best hours!</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-48 overflow-y-auto">
              {activeHours.map((hour) => {
                const stats = data.hourAnalytics[hour];
                const winRate = stats.count > 0 ? ((stats.wins / stats.count) * 100).toFixed(0) : 0;
                const hourLabel = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
                return (
                  <div key={hour} className="text-center bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-gray-700 text-xs mb-2 font-semibold">{hourLabel}</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-green-600 text-xs font-bold">{stats.wins}W</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-red-600 text-xs font-bold">{stats.losses}L</span>
                      </div>
                      <div className="text-gray-600 text-xs">{winRate}% WR</div>
                      <div className="text-gray-400 text-xs">{stats.count} games</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Games */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="text-gray-900 font-medium mb-4 text-lg">Recent Games</div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.recentGames.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No games yet. Start playing!</div>
          ) : (
            <>
              {data.recentGames.map((game, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    game.isWinner ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl ${game.isWinner ? 'text-green-600' : 'text-red-600'}`}>
                      {game.isWinner ? '✅' : '❌'}
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold">
                        {game.selectedSide.toUpperCase()} → {game.result.toUpperCase()}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {new Date(game.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${game.isWinner ? 'text-green-600' : 'text-red-600'}`}>
                      {game.pointsChange > 0 ? '+' : ''}{game.pointsChange.toLocaleString()}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Bet: {game.betAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

