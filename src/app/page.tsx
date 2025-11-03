"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@reown/appkit/react";
import Dashboard from "@/components/Dashboard";

type BetSide = "heads" | "tails" | null;
type CoinState = "idle" | "flipping" | "result";
type ViewMode = "dashboard" | "play";

interface UserData {
  walletAddress: string;
  points: number;
  totalWins: number;
  totalLosses: number;
  totalFlips: number;
}

export default function Home() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard"); // Dashboard is default
  const [betAmount, setBetAmount] = useState<string>("10");
  const [selectedSide, setSelectedSide] = useState<BetSide>(null);
  const [coinState, setCoinState] = useState<CoinState>("idle");
  const [result, setResult] = useState<BetSide>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isWinner, setIsWinner] = useState<boolean | null>(null);
  const [pointsChange, setPointsChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUserData = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/user?walletAddress=${address}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Failed to load user data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Fetch or create user when wallet connects
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

    if (!selectedSide || coinState === "flipping" || !userData) return;

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > userData.points) {
      alert("Invalid bet amount or insufficient points");
      return;
    }

    setCoinState("flipping");
    setResult(null);
    setIsWinner(null);
    setPointsChange(0);

    try {
      // Call API to process coin flip
      const response = await fetch("/api/user/flip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          betAmount: amount,
          selectedSide,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process flip");
      }

      const data = await response.json();

      // Update UI with result
      setResult(data.result);
      setIsWinner(data.isWinner);
      setPointsChange(data.pointsChange);
      setUserData(data.user);

      setCoinState("result");

      // Refresh dashboard if on dashboard view
      if (viewMode === "dashboard") {
        // Trigger dashboard refresh by setting a key change
        window.dispatchEvent(new Event("dashboard-refresh"));
      }

      // Reset after showing result
      setTimeout(() => {
        setCoinState("idle");
        setSelectedSide(null);
        setPointsChange(0);
      }, 3000);
    } catch (error) {
      console.error("Error processing flip:", error);
      alert(
        error instanceof Error ? error.message : "Failed to process coin flip"
      );
      setCoinState("idle");
    }
  };

  const getCoinIcon = () => {
    if (coinState === "flipping") {
      return <div className="text-8xl animate-spin duration-1000">🪙</div>;
    }

    if (result) {
      return (
        <div
          className={`text-8xl ${
            coinState === "result" ? "animate-bounce" : ""
          }`}
        >
          {result === "heads" ? "🟡" : "⚪️"}
        </div>
      );
    }

    return <div className="text-8xl opacity-50">🪙</div>;
  };

  const points = userData?.points || 0;
  const totalFlips = userData?.totalFlips || 0;
  const totalWins = userData?.totalWins || 0;
  const totalLosses = userData?.totalLosses || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🪙 Coin Flip Betting
          </h1>
          <p className="text-white/70 text-lg">
            Bet on heads or tails and win points instantly!
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
                    <div className="text-white/90 text-xs font-medium mb-1">
                      Connected Wallet
                    </div>
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
                    <div className="text-white/90 text-xs font-medium mb-1">
                      Not Connected
                    </div>
                    <div className="text-white text-sm">
                      Connect your wallet to play
                    </div>
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

        {/* Tab Navigation */}
        {isConnected && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setViewMode("dashboard")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                viewMode === "dashboard"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setViewMode("play")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                viewMode === "play"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              🎮 Play
            </button>
          </div>
        )}

        {/* Dashboard View */}
        {viewMode === "dashboard" && <Dashboard walletAddress={address} />}

        {/* Play View */}
        {viewMode === "play" && (
          <>
            {/* Points Balance */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 mb-8 text-center shadow-lg">
              <div className="text-white/90 text-sm font-medium mb-1">
                Your Points
              </div>
              <div className="text-4xl font-bold text-white">
                {isLoading ? "Loading..." : points.toLocaleString()}
              </div>
              {pointsChange !== 0 && (
                <div
                  className={`text-lg font-semibold mt-2 ${
                    pointsChange > 0 ? "text-green-200" : "text-red-200"
                  }`}
                >
                  {pointsChange > 0 ? "+" : ""}
                  {pointsChange} points
                </div>
              )}
              {!isConnected && (
                <div className="text-white/70 text-xs mt-2">
                  Connect wallet to start with 1,000 points
                </div>
              )}
            </div>

            {/* Coin Display */}
            <div className="flex justify-center items-center mb-8">
              <div className="bg-white/20 rounded-full p-12 shadow-2xl border-4 border-white/30">
                {getCoinIcon()}
              </div>
            </div>

            {/* Result Display */}
            {coinState === "result" && result && (
              <div
                className={`text-center mb-6 p-4 rounded-2xl ${
                  isWinner
                    ? "bg-green-500/20 border-2 border-green-400"
                    : "bg-red-500/20 border-2 border-red-400"
                }`}
              >
                <div className="text-3xl font-bold mb-2">
                  {isWinner ? "🎉 You Won! 🎉" : "😔 You Lost"}
                </div>
                <div className="text-lg font-medium text-white">
                  Result: <span className="uppercase font-bold">{result}</span>
                </div>
                <div className="text-sm text-white/70 mt-1">
                  {isWinner
                    ? `+${parseFloat(betAmount)} points`
                    : `-${parseFloat(betAmount)} points`}
                </div>
                {isWinner && (
                  <div className="text-xs text-green-300 mt-2 font-semibold">
                    ⚡ Instant Payout! Your points have been updated.
                  </div>
                )}
              </div>
            )}

            {/* Bet Amount Input */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-2 text-center">
                Bet Amount (Points)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBetAmount("10")}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                >
                  10
                </button>
                <button
                  onClick={() => setBetAmount("50")}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                >
                  50
                </button>
                <button
                  onClick={() => setBetAmount("100")}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                >
                  100
                </button>
                <button
                  onClick={() => setBetAmount("500")}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                >
                  500
                </button>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Custom amount"
                  min="1"
                  step="1"
                />
              </div>
            </div>

            {/* Side Selection */}
            <div className="mb-8">
              <div className="text-white font-medium mb-4 text-center">
                Choose Your Side
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleBetPlace("heads")}
                  disabled={
                    !isConnected ||
                    coinState === "flipping" ||
                    coinState === "result" ||
                    isLoading
                  }
                  className={`flex-1 py-6 rounded-2xl font-bold text-2xl transition-all transform hover:scale-105 ${
                    selectedSide === "heads"
                      ? "bg-yellow-500 text-white shadow-2xl scale-105"
                      : "bg-white/20 text-white hover:bg-white/30"
                  } ${
                    !isConnected || coinState !== "idle" || isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  🟡 Heads
                </button>
                <button
                  onClick={() => handleBetPlace("tails")}
                  disabled={
                    !isConnected ||
                    coinState === "flipping" ||
                    coinState === "result" ||
                    isLoading
                  }
                  className={`flex-1 py-6 rounded-2xl font-bold text-2xl transition-all transform hover:scale-105 ${
                    selectedSide === "tails"
                      ? "bg-gray-200 text-gray-900 shadow-2xl scale-105"
                      : "bg-white/20 text-white hover:bg-white/30"
                  } ${
                    !isConnected || coinState !== "idle" || isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  ⚪️ Tails
                </button>
              </div>
            </div>

            {/* Flip Button */}
            <button
              onClick={handleFlip}
              disabled={
                !selectedSide ||
                coinState === "flipping" ||
                parseFloat(betAmount) <= 0 ||
                parseFloat(betAmount) > points ||
                !isConnected ||
                isLoading
              }
              className={`w-full py-4 rounded-2xl font-bold text-xl transition-all ${
                selectedSide &&
                parseFloat(betAmount) > 0 &&
                parseFloat(betAmount) <= points &&
                coinState === "idle" &&
                isConnected &&
                !isLoading
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-2xl transform hover:scale-105"
                  : "bg-gray-500/50 text-gray-300 cursor-not-allowed"
              }`}
            >
              {coinState === "flipping" ? "🔄 Flipping..." : "🚀 Flip Coin!"}
            </button>

            {/* Stats */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/70 text-sm mb-1">Total Flips</div>
                  <div className="text-2xl font-bold text-white">
                    {totalFlips}
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/70 text-sm mb-1">Wins</div>
                  <div className="text-2xl font-bold text-green-400">
                    {totalWins}
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/70 text-sm mb-1">Losses</div>
                  <div className="text-2xl font-bold text-red-400">
                    {totalLosses}
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 text-center text-white/60 text-xs">
              💡 Winners get 2x their bet instantly! Connect wallet to start
              playing.
            </div>
          </>
        )}

        {/* Show message when not connected */}
        {!isConnected && (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg mb-4">
              Connect your wallet to view dashboard and play
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
