"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
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
  const { open } = useAppKit();
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
    <div className={`min-h-screen bg-gray-50 flex ${viewMode === "dashboard" ? "items-start py-8" : "items-center justify-center"} p-4`}>
      <div className={`${viewMode === "dashboard" ? "max-w-7xl" : "max-w-2xl"} w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-200`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            🪙 Coin Flip Betting
          </h1>
          <p className="text-gray-600 text-lg">
            Bet on heads or tails and win points instantly!
          </p>
        </div>

        {/* Wallet Connection Status */}
        <div className="mb-6">
          {isConnected ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <div className="text-gray-900 text-xs font-medium mb-1">
                      Connected Wallet
                    </div>
                    <div className="text-gray-700 text-sm font-mono">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <div className="text-gray-900 text-xs font-medium mb-1">
                      Not Connected
                    </div>
                    <div className="text-gray-700 text-sm">
                      Connect your wallet to play
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => open()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
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
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setViewMode("play")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                viewMode === "play"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8 text-center shadow-sm">
              <div className="text-gray-700 text-sm font-medium mb-1">
                Your Points
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {isLoading ? "Loading..." : points.toLocaleString()}
              </div>
              {pointsChange !== 0 && (
                <div
                  className={`text-lg font-semibold mt-2 ${
                    pointsChange > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {pointsChange > 0 ? "+" : ""}
                  {pointsChange} points
                </div>
              )}
              {!isConnected && (
                <div className="text-gray-600 text-xs mt-2">
                  Connect wallet to start with 1,000 points
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
            {coinState === "result" && result && (
              <div
                className={`text-center mb-6 p-4 rounded-2xl ${
                  isWinner
                    ? "bg-green-50 border-2 border-green-300"
                    : "bg-red-50 border-2 border-red-300"
                }`}
              >
                <div className="text-3xl font-bold mb-2 text-gray-900">
                  {isWinner ? "🎉 You Won! 🎉" : "😔 You Lost"}
                </div>
                <div className="text-lg font-medium text-gray-800">
                  Result: <span className="uppercase font-bold">{result}</span>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  {isWinner
                    ? `+${parseFloat(betAmount)} points`
                    : `-${parseFloat(betAmount)} points`}
                </div>
                {isWinner && (
                  <div className="text-xs text-green-600 mt-2 font-semibold">
                    ⚡ Instant Payout! Your points have been updated.
                  </div>
                )}
              </div>
            )}

            {/* Bet Amount Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2 text-center">
                Bet Amount (Points)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBetAmount("10")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  10
                </button>
                <button
                  onClick={() => setBetAmount("50")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  50
                </button>
                <button
                  onClick={() => setBetAmount("100")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  100
                </button>
                <button
                  onClick={() => setBetAmount("500")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  500
                </button>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Custom amount"
                  min="1"
                  step="1"
                />
              </div>
            </div>

            {/* Side Selection */}
            <div className="mb-8">
              <div className="text-gray-700 font-medium mb-4 text-center">
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
                      ? "bg-yellow-400 text-gray-900 shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                      ? "bg-gray-300 text-gray-900 shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {coinState === "flipping" ? "🔄 Flipping..." : "🚀 Flip Coin!"}
            </button>

            {/* Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Total Flips</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalFlips}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Wins</div>
                  <div className="text-2xl font-bold text-green-600">
                    {totalWins}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-600 text-sm mb-1">Losses</div>
                  <div className="text-2xl font-bold text-red-600">
                    {totalLosses}
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 text-center text-gray-500 text-xs">
              💡 Winners get 2x their bet instantly! Connect wallet to start
              playing.
            </div>
          </>
        )}

        {/* Show message when not connected */}
        {!isConnected && (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg mb-4">
              Connect your wallet to view dashboard and play
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
