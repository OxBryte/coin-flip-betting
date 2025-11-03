import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

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

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if bonus was already claimed today
    if (user.dailyBonusClaimed) {
      const lastClaimed = new Date(user.dailyBonusClaimed);
      const lastClaimedDate = new Date(lastClaimed.getFullYear(), lastClaimed.getMonth(), lastClaimed.getDate());
      
      if (lastClaimedDate.getTime() === today.getTime()) {
        return NextResponse.json(
          { error: 'Daily bonus already claimed today' },
          { status: 400 }
        );
      }
    }

    // Calculate bonus based on streak
    const bonusAmount = 50 + (user.currentStreak * 10); // Base 50 + 10 per streak

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      {
        $inc: {
          points: bonusAmount,
          totalEarned: bonusAmount,
        },
        $set: {
          dailyBonusClaimed: now,
          lastLoginDate: now,
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      bonusAmount,
      user: {
        walletAddress: updatedUser!.walletAddress,
        points: updatedUser!.points,
        currentStreak: updatedUser!.currentStreak,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/user/daily-bonus:', error);
    return NextResponse.json(
      { error: 'Failed to claim daily bonus' },
      { status: 500 }
    );
  }
}

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

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { canClaim: false, bonusAmount: 0, currentStreak: 0 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let canClaim = true;
    if (user.dailyBonusClaimed) {
      const lastClaimed = new Date(user.dailyBonusClaimed);
      const lastClaimedDate = new Date(lastClaimed.getFullYear(), lastClaimed.getMonth(), lastClaimed.getDate());
      canClaim = lastClaimedDate.getTime() !== today.getTime();
    }

    const bonusAmount = 50 + (user.currentStreak * 10);

    return NextResponse.json({
      canClaim,
      bonusAmount,
      currentStreak: user.currentStreak,
    });
  } catch (error) {
    console.error('Error in GET /api/user/daily-bonus:', error);
    return NextResponse.json(
      { error: 'Failed to check daily bonus' },
      { status: 500 }
    );
  }
}

