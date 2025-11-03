'use client';

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@reown/appkit/react';

type BetSide = 'heads' | 'tails' | null;
type CoinState = 'idle' | 'flipping' | 'result';

export default function Home() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [betAmount, setBetAmount] = useState<string>('0.1');
  const [selectedSide, setSelectedSide] = useState<BetSide>(null);
  const [coinState, setCoinState] = useState<CoinState>('idle');
  const [result, setResult] = useState<BetSide>(null);
  const [walletBalance, setWalletBalance] = useState<number>(100);
  const [isWinner, setIsWinner] = useState<boolean | null>(null);
  const [flipCount, setFlipCount] = useState<number>(0);

  const handleBetPlace = (side: BetSide) => {
    setSelectedSide(side);
  };

  const handleFlip = () => {
    if (!isConnected) {
      open();
      return;
    }
    
    if (!selectedSide || coinState === 'flipping') return;
    
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > walletBalance) {
      alert('Invalid bet amount');
      return;
    }

    setCoinState('flipping');
    setResult(null);
    setIsWinner(null);

    // Simulate coin flip animation
    setTimeout(() => {
      const randomResult: BetSide = Math.random() > 0.5 ? 'heads' : 'tails';
      setResult(randomResult);
      setFlipCount(prev => prev + 1);

      const won = randomResult === selectedSide;
      setIsWinner(won);

      if (won) {
        setWalletBalance(prev => prev + amount);
      } else {
        setWalletBalance(prev => prev - amount);
      }

      setCoinState('result');

      // Reset after showing result
      setTimeout(() => {
        setCoinState('idle');
        setSelectedSide(null);
      }, 3000);
    }, 2000);
  };

  const getCoinIcon = () => {
    if (coinState === 'flipping') {
      return (
        <div className="text-8xl animate-spin duration-1000">
          🪙
        </div>
      );
    }
    
    if (result) {
      return (
        <div className={`text-8xl ${coinState === 'result' ? 'animate-bounce' : ''}`}>
          {result === 'heads' ? '🟡' : '⚪️'}
        </div>
      );
    }

    return (
      <div className="text-8xl opacity-50">
        🪙
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🪙 Coin Flip Betting
          </h1>
          <p className="text-white/70 text-lg">
            Bet on heads or tails and win crypto!
          </p>
        </div>

        {/* Wallet Connection Status */}
        <div className="mb-6">
          {isConnected ? (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-white text-2xl">✅</div>
                  <div>
                    <div className="text-white/90 text-xs font-medium mb-1">Connected Wallet</div>
                    <div className="text-white text-sm font-mono">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-white text-2xl">⚠️</div>
                  <div>
                    <div className="text-white/90 text-xs font-medium mb-1">Not Connected</div>
                    <div className="text-white text-sm">Connect your wallet to play</div>
                  </div>
                </div>
                <button
                  onClick={() => open()}
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-bold hover:bg-white/90 transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wallet Balance */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 mb-8 text-center shadow-lg">
          <div className="text-white/90 text-sm font-medium mb-1">Balance</div>
          <div className="text-4xl font-bold text-white">
            ${walletBalance.toFixed(2)}
          </div>
        </div>

        {/* Coin Display */}
        <div className="flex justify-center items-center mb-8">
          <div className="bg-white/20 rounded-full p-12 shadow-2xl border-4 border-white/30">
            {getCoinIcon()}
          </div>
        </div>

        {/* Result Display */}
        {coinState === 'result' && result && (
          <div className={`text-center mb-6 p-4 rounded-2xl ${
            isWinner ? 'bg-green-500/20 border-2 border-green-400' : 'bg-red-500/20 border-2 border-red-400'
          }`}>
            <div className="text-3xl font-bold mb-2">
              {isWinner ? '🎉 You Won! 🎉' : '😔 You Lost'}
            </div>
            <div className="text-lg font-medium text-white">
              Result: <span className="uppercase font-bold">{result}</span>
            </div>
            <div className="text-sm text-white/70 mt-1">
              {isWinner ? `+$${parseFloat(betAmount)}` : `-$${parseFloat(betAmount)}`}
            </div>
          </div>
        )}

        {/* Bet Amount Input */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2 text-center">
            Bet Amount (USD)
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setBetAmount('0.1')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            >
              0.1
            </button>
            <button
              onClick={() => setBetAmount('0.5')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            >
              0.5
            </button>
            <button
              onClick={() => setBetAmount('1')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            >
              1
            </button>
            <button
              onClick={() => setBetAmount('5')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            >
              5
            </button>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Custom amount"
              min="0.01"
              step="0.01"
            />
          </div>
        </div>

        {/* Side Selection */}
        <div className="mb-8">
          <div className="text-white font-medium mb-4 text-center">Choose Your Side</div>
          <div className="flex gap-4">
            <button
              onClick={() => handleBetPlace('heads')}
              disabled={!isConnected || coinState === 'flipping' || coinState === 'result'}
              className={`flex-1 py-6 rounded-2xl font-bold text-2xl transition-all transform hover:scale-105 ${
                selectedSide === 'heads'
                  ? 'bg-yellow-500 text-white shadow-2xl scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              } ${!isConnected || coinState !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              🟡 Heads
            </button>
            <button
              onClick={() => handleBetPlace('tails')}
              disabled={!isConnected || coinState === 'flipping' || coinState === 'result'}
              className={`flex-1 py-6 rounded-2xl font-bold text-2xl transition-all transform hover:scale-105 ${
                selectedSide === 'tails'
                  ? 'bg-gray-200 text-gray-900 shadow-2xl scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              } ${!isConnected || coinState !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              ⚪️ Tails
            </button>
          </div>
        </div>

        {/* Flip Button */}
        <button
          onClick={handleFlip}
          disabled={!selectedSide || coinState === 'flipping' || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > walletBalance}
          className={`w-full py-4 rounded-2xl font-bold text-xl transition-all ${
            selectedSide && parseFloat(betAmount) > 0 && parseFloat(betAmount) <= walletBalance && coinState === 'idle'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-2xl transform hover:scale-105'
              : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
          }`}
        >
          {coinState === 'flipping' ? '🔄 Flipping...' : '🚀 Flip Coin!'}
        </button>

        {/* Stats */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-white/70 text-sm mb-1">Total Flips</div>
              <div className="text-2xl font-bold text-white">{flipCount}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-white/70 text-sm mb-1">Current Bet</div>
              <div className="text-2xl font-bold text-white">${betAmount}</div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-6 text-center text-white/50 text-xs">
          ⚠️ This is a demo. No real money or crypto is being wagered.
        </div>
      </div>
    </div>
  );
}
