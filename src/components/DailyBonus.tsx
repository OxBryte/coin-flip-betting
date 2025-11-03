'use client';

import { useEffect, useState } from 'react';

interface DailyBonusProps {
  walletAddress: string | undefined;
  onBonusClaimed: () => void;
}

export default function DailyBonus({ walletAddress, onBonusClaimed }: DailyBonusProps) {
  const [canClaim, setCanClaim] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const checkBonus = async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`/api/user/daily-bonus?walletAddress=${walletAddress}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to check daily bonus' }));
        throw new Error(errorData.error || 'Failed to check daily bonus');
      }
      const data = await response.json();
      setCanClaim(data.canClaim ?? false);
      setBonusAmount(data.bonusAmount ?? 50);
      setCurrentStreak(data.currentStreak ?? 0);
      setClaimed(!data.canClaim);
    } catch (error) {
      console.error('Error checking daily bonus:', error);
      // Set defaults on error
      setCanClaim(false);
      setBonusAmount(50);
      setCurrentStreak(0);
      setClaimed(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      checkBonus();
    }
  }, [walletAddress]);

  const handleClaim = async () => {
    if (!walletAddress || !canClaim || isClaiming) return;

    try {
      setIsClaiming(true);
      const response = await fetch('/api/user/daily-bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to claim bonus');
      }

      const data = await response.json();
      setCanClaim(false);
      setClaimed(true);
      onBonusClaimed();
      
      // Show notification
      alert(`🎉 Daily Bonus Claimed! +${data.bonusAmount} points!${currentStreak > 0 ? `\n🔥 ${currentStreak}x Streak Bonus!` : ''}`);
      
      // Refresh bonus info
      setTimeout(() => {
        checkBonus();
      }, 1000);
    } catch (error) {
      console.error('Error claiming bonus:', error);
      alert(error instanceof Error ? error.message : 'Failed to claim daily bonus');
    } finally {
      setIsClaiming(false);
    }
  };

  if (!walletAddress) return null;

  return (
    <div className={`rounded-lg p-4 mb-4 ${
      canClaim ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300' : 'bg-gray-50 border border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gray-900 font-semibold text-sm mb-1">
            {canClaim ? '🎁 Daily Bonus Available!' : '✅ Daily Bonus Claimed'}
          </div>
          <div className="text-gray-600 text-xs">
            {canClaim 
              ? `Claim ${bonusAmount || 50} points${currentStreak > 0 ? ` (+${currentStreak * 10} streak bonus)` : ''}!`
              : 'Come back tomorrow for another bonus'
            }
          </div>
          {currentStreak > 0 && (
            <div className="text-orange-600 text-xs mt-1 font-medium">
              🔥 {currentStreak}x Win Streak Active
            </div>
          )}
        </div>
        {canClaim && (
          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaiming ? 'Claiming...' : `Claim ${bonusAmount || 50} pts`}
          </button>
        )}
      </div>
    </div>
  );
}

