import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { walletAddress, betAmount, selectedSide, leverage } = body;

    if (!walletAddress || !betAmount || !selectedSide) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, betAmount, selectedSide' },
        { status: 400 }
      );
    }

    // Validate bet amount
    const betPoints = parseFloat(betAmount);
    if (isNaN(betPoints) || betPoints <= 0) {
      return NextResponse.json(
        { error: 'Invalid bet amount' },
        { status: 400 }
      );
    }

    // Validate and set leverage (default to 2x if not provided)
    const leverageMultiplier = leverage ? parseFloat(leverage) : 2;
    if (isNaN(leverageMultiplier) || leverageMultiplier < 1 || leverageMultiplier > 100) {
      return NextResponse.json(
        { error: 'Invalid leverage. Must be between 1x and 100x' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please connect your wallet first.' },
        { status: 404 }
      );
    }

    // Check if user has enough points for bet (only need bet amount, not leveraged amount)
    if (user.points < betPoints) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      );
    }

    // Generate coin flip result (heads or tails)
    const coinResult: 'heads' | 'tails' = Math.random() > 0.5 ? 'heads' : 'tails';
    const isWinner = coinResult === selectedSide;

    // Calculate payout with leverage (futures-style)
    // Win: Get betAmount * leverage (your bet + profit)
    // Loss: Lose only your bet amount (margin)
    let pointsChange = 0;
    let newPoints = user.points;

    if (isWinner) {
      // Winner: Total return = betAmount * leverage
      // Profit = betAmount * leverage - betAmount = betAmount * (leverage - 1)
      const totalReturn = betPoints * leverageMultiplier;
      const profit = betPoints * (leverageMultiplier - 1);
      pointsChange = profit; // Net gain
      newPoints = user.points + profit;
    } else {
      // Loser: Lose only the margin (bet amount)
      pointsChange = -betPoints;
      newPoints = user.points - betPoints;
    }

    // Create game history entry
    const gameHistoryEntry = {
      result: coinResult,
      selectedSide: selectedSide as 'heads' | 'tails',
      betAmount: betPoints,
      leverage: leverageMultiplier,
      pointsChange,
      isWinner,
      timestamp: new Date(),
    };

    // Update user in database
    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      {
        $set: {
          points: newPoints,
        },
        $inc: {
          totalFlips: 1,
          ...(isWinner ? { totalWins: 1 } : { totalLosses: 1 }),
        },
        $push: {
          gameHistory: {
            $each: [gameHistoryEntry],
            $slice: -1000, // Keep only last 1000 games
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      result: coinResult,
      isWinner,
      pointsChange,
      leverage: leverageMultiplier,
      user: {
        walletAddress: updatedUser!.walletAddress,
        points: updatedUser!.points,
        totalWins: updatedUser!.totalWins,
        totalLosses: updatedUser!.totalLosses,
        totalFlips: updatedUser!.totalFlips,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/user/flip:', error);
    return NextResponse.json(
      { error: 'Failed to process coin flip' },
      { status: 500 }
    );
  }
}

