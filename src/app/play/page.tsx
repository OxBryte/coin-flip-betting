'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import DailyBonus from '@/components/DailyBonus';

type BetSide = 'heads' | 'tails' | null;
type CoinState = 'idle' | 'flipping' | 'result';

export default function PlayPage() {
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  const [betAmount, setBetAmount] = useState<string>('10');
  const [leverage, setLeverage] = useState<string>('2');
  const [selectedSide, setSelectedSide] = useState<BetSide>(null);
  const [coinState, setCoinState] = useState<CoinState>('idle');
  const [result, setResult] = useState<BetSide>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [isWinner, setIsWinner] = useState<boolean | null>(null);
  const [pointsChange, setPointsChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUserData = useCallback(async () => {
    if (!address) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user?walletAddress=${address}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchUserData();
    } else {
      setUserData(null);
    }
  }, [isConnected, address, fetchUserData]);

  const handleBetPlace = (side: BetSide) => {
    if (!isConnected || !userData) {
      open();
      return;
    }
    setSelectedSide(side);
  };

  const handleFlip = async () => {
    if (!isConnected || !address) {
      open();
      return;
    }
    if (!selectedSide || coinState === 'flipping' || !userData) return;

    const amount = parseFloat(betAmount);
    const leverageVal = parseFloat(leverage);

    if (isNaN(amount) || isNaN(leverageVal) || amount <= 0 || leverageVal < 1 || leverageVal > 100) {
      alert('Invalid bet amount or leverage');
      return;
    }

    if (amount > userData.points) {
      alert('Insufficient points');
      return;
    }

    setCoinState('flipping');
    setResult(null);
    setIsWinner(null);
    setPointsChange(0);

    try {
      const response = await fetch('/api/user/flip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          betAmount: amount,
          selectedSide,
          leverage: leverageVal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process flip');
      }

      const data = await response.json();
      setResult(data.result);
      setIsWinner(data.isWinner);
      setPointsChange(data.pointsChange);
      setUserData(data.user);
      setCoinState('result');

      window.dispatchEvent(new Event('dashboard-refresh'));

      setTimeout(() => {
        setCoinState('idle');
        setSelectedSide(null);
        setPointsChange(0);
      }, 3000);
    } catch (error) {
      console.error('Error processing flip:', error);
      alert(error instanceof Error ? error.message : 'Failed to process coin flip');
      setCoinState('idle');
    }
  };

  const points = userData?.points || 0;
  const totalFlips = userData?.totalFlips || 0;
  const totalWins = userData?.totalWins || 0;
  const totalLosses = userData?.totalLosses || 0;
  const currentStreak = userData?.currentStreak || 0;

  const getCoinIcon = () => (
    <div className="text-6xl">🪙</div>
  );

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Play</h1>
          <p className="text-gray-500 text-sm">Bet on heads or tails and win points instantly</p>
        </div>

        {/* Wallet Connection Status */}
        <div className="mb-5">
          {isConnected ? (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-sm">✅</div>
                  <div className="text-gray-700 text-sm font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                </div>
                <button onClick={() => disconnect()} className="px-3 py-1.5 bg-white hover:bg-gray-50 rounded text-gray-600 text-xs font-medium transition-colors border border-gray-200">Disconnect</button>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-gray-700 text-sm">Connect your wallet to play</div>
                <button onClick={() => open()} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors">Connect</button>
              </div>
            </div>
          )}
        </div>

        {isConnected && (
          <DailyBonus
            walletAddress={address}
            onBonusClaimed={() => {
              fetchUserData();
              window.dispatchEvent(new Event('dashboard-refresh'));
            }}
          />
        )}

        {isConnected ? (
          <>
            {/* Points Balance */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8 text-center shadow-sm">
              <div className="text-gray-700 text-sm font-medium mb-1">Your Points</div>
              <div className="text-4xl font-bold text-gray-900">{isLoading ? 'Loading...' : points.toLocaleString()}</div>
              {pointsChange !== 0 && (
                <div className={`text-lg font-semibold mt-2 ${pointsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {pointsChange > 0 ? '+' : ''}{pointsChange} points
                </div>
              )}
              {currentStreak > 0 && (
                <div className="text-orange-600 text-sm font-semibold mt-2">
                  🔥 {currentStreak}x Win Streak Active!
                </div>
              )}
            </div>

            {/* Coin Display */}
            <div className="flex justify-center items-center mb-8">
              <div className="bg-gray-100 rounded-full p-12 shadow-lg border-4 border-gray-200">
                {getCoinIcon()}
              </div>
            </div>

            {/* Result Display */}
            {coinState === 'result' && result && (
              <div className={`text-center mb-6 p-4 rounded-2xl ${isWinner ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                <div className="text-3xl font-bold mb-2 text-gray-900">{isWinner ? '🎉 You Won! 🎉' : '😔 You Lost'}</div>
                <div className="text-lg font-medium text-gray-800">Result: <span className="uppercase font-bold">{result}</span></div>
                <div className="text-sm text-gray-700 mt-1">
                  {isWinner
                    ? `+${pointsChange.toFixed(2)} points (${parseFloat(leverage) || 2}x leverage)`
                    : `${pointsChange.toFixed(2)} points (${parseFloat(leverage) || 2}x leverage)`}
                </div>
                {isWinner && (
                  <>
                    <div className="text-xs text-green-600 mt-2 font-semibold">⚡ Instant Payout! Your points have been updated.</div>
                    {userData?.currentStreak && userData.currentStreak > 1 && (
                      <div className="text-xs text-orange-600 mt-1 font-semibold">🔥 {userData.currentStreak}x Win Streak! Bonus applied!</div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Bet Amount Input */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2 text-center text-sm">Bet Amount</label>
              <div className="flex gap-2">
                <button onClick={() => setBetAmount('10')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs transition-colors">10</button>
                <button onClick={() => setBetAmount('50')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs transition-colors">50</button>
                <button onClick={() => setBetAmount('100')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs transition-colors">100</button>
                <button onClick={() => setBetAmount('500')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-xs transition-colors">500</button>
                <input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Custom" min="1" step="1" />
              </div>
            </div>

            {/* Leverage Selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 font-medium text-sm">Leverage</label>
                <span className="text-xs text-gray-500">Risk: {userData ? (parseFloat(betAmount) || 0).toFixed(2) : '0'} points</span>
              </div>
              <div className="flex gap-2 mb-2 flex-wrap">
                {['1','2','5','10','25','50','100'].map(x => (
                  <button key={x} onClick={() => setLeverage(x)} className={`px-3 py-1.5 rounded text-xs transition-colors ${leverage === x ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{x}x</button>
                ))}
                <input type="number" value={leverage} onChange={(e) => setLeverage(e.target.value)} className="w-16 px-2 py-1.5 bg-gray-50 border border-gray-300 rounded text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Custom" min="1" max="100" step="0.1" />
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Potential Win: <span className="text-green-600 font-semibold">+{userData ? (parseFloat(betAmount) * (parseFloat(leverage) - 1) || 0).toFixed(2) : '0'}</span></span>
                <span className="text-gray-500">Potential Loss: <span className="text-red-600 font-semibold">-{userData ? (parseFloat(betAmount) || 0).toFixed(2) : '0'}</span></span>
              </div>
            </div>

            {/* Side Selection */}
            <div className="mb-8">
              <div className="text-gray-700 font-medium mb-4 text-center">Choose Your Side</div>
              <div className="flex gap-4">
                <button onClick={() => handleBetPlace('heads')} disabled={!isConnected || coinState === 'flipping' || coinState === 'result' || isLoading} className={`flex-1 py-6 rounded-2xl font-bold text-2xl transition-all transform hover:scale-105 ${selectedSide === 'heads' ? 'bg-yellow-400 text-gray-900 shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${!isConnected || coinState !== 'idle' || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>🟡 Heads</button>
                <button onClick={() => handleBetPlace('tails')} disabled={!isConnected || coinState === 'flipping' || coinState === 'result' || isLoading} className={`flex-1 py-6 rounded-2xl font-bold text-2xl transition-all transform hover:scale-105 ${selectedSide === 'tails' ? 'bg-gray-300 text-gray-900 shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${!isConnected || coinState !== 'idle' || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>⚪️ Tails</button>
              </div>
            </div>

            {/* Flip Button */}
            <button onClick={handleFlip} disabled={!selectedSide || coinState === 'flipping' || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > points || !isConnected || isLoading || parseFloat(leverage) < 1 || parseFloat(leverage) > 100} className={`w-full py-4 rounded-2xl font-bold text-xl transition-all ${selectedSide && parseFloat(betAmount) > 0 && parseFloat(betAmount) <= points && parseFloat(leverage) >= 1 && parseFloat(leverage) <= 100 && coinState === 'idle' && isConnected && !isLoading ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              {coinState === 'flipping' ? '🔄 Flipping...' : '🚀 Flip Coin!'}
            </button>

            {/* Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Total Flips</div>
                  <div className="text-2xl font-bold text-gray-900">{totalFlips}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Wins</div>
                  <div className="text-2xl font-bold text-green-600">{totalWins}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Losses</div>
                  <div className="text-2xl font-bold text-red-600">{totalLosses}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-gray-500 text-xs">
              💡 Choose your leverage (1x-100x) to multiply your wins and losses.
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg mb-4">Connect your wallet to play</div>
          </div>
        )}
      </div>
    </main>
  );
}
