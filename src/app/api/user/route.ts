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

    // Find or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      // Create new user with starting points
      user = await User.create({
        walletAddress: walletAddress.toLowerCase(),
        points: 1000, // Starting points
        totalWins: 0,
        totalLosses: 0,
        totalFlips: 0,
      });
    }

    return NextResponse.json({
      walletAddress: user.walletAddress,
      points: user.points,
      totalWins: user.totalWins,
      totalLosses: user.totalLosses,
      totalFlips: user.totalFlips,
    });
  } catch (error) {
    console.error('Error in GET /api/user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (user) {
      return NextResponse.json({
        walletAddress: user.walletAddress,
        points: user.points,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        totalFlips: user.totalFlips,
      });
    }

    // Create new user
    user = await User.create({
      walletAddress: walletAddress.toLowerCase(),
      points: 1000, // Starting points
      totalWins: 0,
      totalLosses: 0,
      totalFlips: 0,
    });

    return NextResponse.json({
      walletAddress: user.walletAddress,
      points: user.points,
      totalWins: user.totalWins,
      totalLosses: user.totalLosses,
      totalFlips: user.totalFlips,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

