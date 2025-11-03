import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'points'; // 'points', 'wins', 'streak'

    let sortQuery: Record<string, 1 | -1> = {};
    
    switch (type) {
      case 'wins':
        sortQuery = { totalWins: -1, totalFlips: 1 };
        break;
      case 'streak':
        sortQuery = { currentStreak: -1, totalWins: -1 };
        break;
      case 'earned':
        sortQuery = { totalEarned: -1, points: -1 };
        break;
      default:
        sortQuery = { points: -1, totalWins: -1 };
    }

    const users = await User.find({})
      .sort(sortQuery)
      .limit(limit)
      .select('walletAddress points totalWins totalLosses totalFlips currentStreak totalEarned')
      .lean();

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      walletAddress: user.walletAddress,
      points: user.points,
      totalWins: user.totalWins,
      totalLosses: user.totalLosses,
      totalFlips: user.totalFlips,
      currentStreak: user.currentStreak || 0,
      totalEarned: user.totalEarned || 0,
      winRate: user.totalFlips > 0 ? ((user.totalWins / user.totalFlips) * 100).toFixed(1) : '0.0',
    }));

    return NextResponse.json({
      leaderboard,
      type,
    });
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

