import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Find user with game history
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const gameHistory = user.gameHistory || [];

    // Calculate win rate
    const winRate = user.totalFlips > 0 
      ? ((user.totalWins / user.totalFlips) * 100).toFixed(1)
      : '0.0';

    // Analytics by day (last 30 days)
    const dayAnalytics: Record<string, { wins: number; losses: number; totalPoints: number }> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    gameHistory
      .filter((game) => new Date(game.timestamp) >= thirtyDaysAgo)
      .forEach((game) => {
        const dateKey = new Date(game.timestamp).toISOString().split('T')[0];
        if (!dayAnalytics[dateKey]) {
          dayAnalytics[dateKey] = { wins: 0, losses: 0, totalPoints: 0 };
        }
        if (game.isWinner) {
          dayAnalytics[dateKey].wins++;
        } else {
          dayAnalytics[dateKey].losses++;
        }
        dayAnalytics[dateKey].totalPoints += game.pointsChange;
      });

    // Analytics by hour of day
    const hourAnalytics: Record<number, { wins: number; losses: number; count: number }> = {};
    for (let i = 0; i < 24; i++) {
      hourAnalytics[i] = { wins: 0, losses: 0, count: 0 };
    }

    gameHistory.forEach((game) => {
      const hour = new Date(game.timestamp).getHours();
      hourAnalytics[hour].count++;
      if (game.isWinner) {
        hourAnalytics[hour].wins++;
      } else {
        hourAnalytics[hour].losses++;
      }
    });

    // Recent games (last 20)
    const recentGames = gameHistory
      .slice(-20)
      .reverse()
      .map((game) => ({
        result: game.result,
        selectedSide: game.selectedSide,
        betAmount: game.betAmount,
        leverage: game.leverage || 2,
        pointsChange: game.pointsChange,
        isWinner: game.isWinner,
        timestamp: game.timestamp,
      }));

    // Best win streak
    let currentStreak = 0;
    let bestStreak = 0;
    gameHistory.forEach((game) => {
      if (game.isWinner) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    // Total points won/lost
    const totalPointsWon = gameHistory
      .filter((game) => game.isWinner)
      .reduce((sum, game) => sum + game.pointsChange, 0);
    
    const totalPointsLost = gameHistory
      .filter((game) => !game.isWinner)
      .reduce((sum, game) => sum + Math.abs(game.pointsChange), 0);

    // Biggest win
    const biggestWin = gameHistory
      .filter((game) => game.isWinner)
      .reduce((max, game) => (game.pointsChange > max.pointsChange ? game : max), 
        gameHistory.find((game) => game.isWinner) || null);

    return NextResponse.json({
      stats: {
        totalFlips: user.totalFlips,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        winRate: parseFloat(winRate),
        currentPoints: user.points,
        bestStreak,
        totalPointsWon,
        totalPointsLost,
        biggestWin: biggestWin ? {
          betAmount: biggestWin.betAmount,
          pointsChange: biggestWin.pointsChange,
          timestamp: biggestWin.timestamp,
        } : null,
      },
      dayAnalytics,
      hourAnalytics,
      recentGames,
    });
  } catch (error) {
    console.error('Error in GET /api/user/dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

