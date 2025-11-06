/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useDisconnect } from "wagmi";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import DailyBonus from "@/components/DailyBonus";

type BetSide = "heads" | "tails" | null;
type CoinState = "idle" | "flipping" | "result";

export default function PlayPage() {
  const { isConnected, address } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  const [betAmount, setBetAmount] = useState<string>("10");
  const [leverage, setLeverage] = useState<string>("2");
  const [selectedSide, setSelectedSide] = useState<BetSide>(null);
  const [coinState, setCoinState] = useState<CoinState>("idle");
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
      if (!response.ok) throw new Error("Failed to fetch user data");
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
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
    if (!selectedSide || coinState === "flipping" || !userData) return;

    const amount = parseFloat(betAmount);
    const leverageVal = parseFloat(leverage);

    if (
      isNaN(amount) ||
      isNaN(leverageVal) ||
      amount <= 0 ||
      leverageVal < 1 ||
      leverageVal > 100
    ) {
      alert("Invalid bet amount or leverage");
      return;
    }

    if (amount > userData.points) {
      alert("Insufficient points");
      return;
    }

    setCoinState("flipping");
    setResult(null);
    setIsWinner(null);
    setPointsChange(0);

    try {
      const response = await fetch("/api/user/flip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          betAmount: amount,
          selectedSide,
          leverage: leverageVal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process flip");
      }

      const data = await response.json();
      setResult(data.result);
      setIsWinner(data.isWinner);
      setPointsChange(data.pointsChange);
      setUserData(data.user);
      setCoinState("result");

      window.dispatchEvent(new Event("dashboard-refresh"));

      setTimeout(() => {
        setCoinState("idle");
        setSelectedSide(null);
        setPointsChange(0);
      }, 2000);
    } catch (error) {
      console.error("Error processing flip:", error);
      alert(
        error instanceof Error ? error.message : "Failed to process coin flip"
      );
      setCoinState("idle");
    }
  };

  const points = userData?.points || 0;
  const totalFlips = userData?.totalFlips || 0;
  const totalWins = userData?.totalWins || 0;
  const totalLosses = userData?.totalLosses || 0;
  const currentStreak = userData?.currentStreak || 0;

  const getCoinIcon = () => <div className="text-5xl">🪙</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Play</h1>
            <p className="text-gray-500 text-xs">
              Bet on heads or tails and win points instantly
            </p>
          </div>
          <div className="text-xs text-gray-500">Leverage 1x–100x</div>
        </div>

        <div className="mb-4">
          {isConnected ? (
            <div className="bg-green-50 rounded-lg p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xs">✅</div>
                  <div className="text-gray-700 text-xs font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="px-2.5 py-1 bg-white hover:bg-gray-50 rounded text-gray-600 text-xs font-medium transition-colors border border-gray-200"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 rounded-lg p-2.5">
              <div className="flex items-center justify-between">
                <div className="text-gray-700 text-xs">
                  Connect your wallet to play
                </div>
                <button
                  onClick={() => open()}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          )}
        </div>

        {isConnected && (
          <DailyBonus
            walletAddress={address}
            onBonusClaimed={() => {
              fetchUserData();
              window.dispatchEvent(new Event("dashboard-refresh"));
            }}
          />
        )}

        {isConnected ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Flip Interface */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Coin Display */}
                <div className="text-center mb-6">
                  <div
                    className={`inline-block p-8 rounded-full border-2 transition-all ${
                      coinState === "flipping"
                        ? "animate-spin border-blue-400"
                        : coinState === "result" && isWinner
                        ? "border-green-500 bg-green-50"
                        : coinState === "result" && !isWinner
                        ? "border-red-500 bg-red-50"
                        : selectedSide === "heads"
                        ? "border-yellow-400 bg-yellow-50"
                        : selectedSide === "tails"
                        ? "border-gray-400 bg-gray-50"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <div className="text-5xl">{getCoinIcon()}</div>
                  </div>

                  {coinState === "result" && result && (
                    <div className="mt-4">
                      <div
                        className={`text-lg font-semibold mb-1 ${
                          isWinner ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isWinner ? "You Won!" : "You Lost"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Result: <span className="uppercase">{result}</span> •{" "}
                        {isWinner ? "+" : ""}
                        {pointsChange.toFixed(2)} points
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  {/* Bet Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bet Amount
                    </label>
                    <div className="flex gap-2 mb-2">
                      {[10, 50, 100, 500].map((v) => (
                        <button
                          key={v}
                          onClick={() => setBetAmount(String(v))}
                          className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                            betAmount === String(v)
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Custom amount"
                      min="1"
                      step="1"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Max: {points.toLocaleString()} points
                    </div>
                  </div>

                  {/* Leverage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leverage
                    </label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {["1", "2", "5", "10", "25", "50", "100"].map((x) => (
                        <button
                          key={x}
                          onClick={() => setLeverage(x)}
                          className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                            leverage === x
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {x}x
                        </button>
                      ))}
                      <input
                        type="number"
                        value={leverage}
                        onChange={(e) => setLeverage(e.target.value)}
                        className="w-20 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Custom"
                        min="1"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-gray-600">
                      <span>
                        Win:{" "}
                        <span className="font-semibold text-green-600">
                          +
                          {(
                            parseFloat(betAmount) *
                              ((parseFloat(leverage) || 0) - 1) || 0
                          ).toFixed(2)}
                        </span>
                      </span>
                      <span>
                        Loss:{" "}
                        <span className="font-semibold text-red-600">
                          -{(parseFloat(betAmount) || 0).toFixed(2)}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Choose Side */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Side
                    </label>
                    <div className="flex gap-3 mb-3">
                      <button
                        onClick={() => handleBetPlace("heads")}
                        disabled={
                          !isConnected || coinState !== "idle" || isLoading
                        }
                        className={`flex-1 py-3 rounded border-2 transition-colors ${
                          selectedSide === "heads"
                            ? "bg-yellow-100 border-yellow-400 text-gray-900"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        } ${
                          !isConnected || coinState !== "idle" || isLoading
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="font-semibold">🟡 Heads</span>
                      </button>
                      <button
                        onClick={() => handleBetPlace("tails")}
                        disabled={
                          !isConnected || coinState !== "idle" || isLoading
                        }
                        className={`flex-1 py-3 rounded border-2 transition-colors ${
                          selectedSide === "tails"
                            ? "bg-gray-100 border-gray-400 text-gray-900"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        } ${
                          !isConnected || coinState !== "idle" || isLoading
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <span className="font-semibold">⚪️ Tails</span>
                      </button>
                    </div>
                    <button
                      onClick={handleFlip}
                      disabled={
                        !selectedSide ||
                        coinState === "flipping" ||
                        parseFloat(betAmount) <= 0 ||
                        parseFloat(betAmount) > points ||
                        !isConnected ||
                        isLoading ||
                        parseFloat(leverage) < 1 ||
                        parseFloat(leverage) > 100
                      }
                      className={`w-full py-3 rounded font-semibold transition-colors ${
                        selectedSide &&
                        parseFloat(betAmount) > 0 &&
                        parseFloat(betAmount) <= points &&
                        parseFloat(leverage) >= 1 &&
                        parseFloat(leverage) <= 100 &&
                        coinState === "idle" &&
                        isConnected &&
                        !isLoading
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {coinState === "flipping" ? "Flipping..." : "Flip Coin"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary / Stats */}
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <div className="text-gray-700 text-xs font-medium">
                  Your Points
                </div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {isLoading ? "Loading..." : points.toLocaleString()}
                </div>
                {pointsChange !== 0 && (
                  <div
                    className={`text-sm font-semibold mt-2 ${
                      pointsChange > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {pointsChange > 0 ? "+" : ""}
                    {pointsChange} points
                  </div>
                )}
                {currentStreak > 0 && (
                  <div className="text-orange-600 text-xs font-semibold mt-2">
                    🔥 {currentStreak}x Win Streak
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-600 text-xs mb-2">Session Stats</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-[11px] text-gray-500">Flips</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {totalFlips}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-[11px] text-gray-500">Wins</div>
                    <div className="text-lg font-semibold text-green-600">
                      {totalWins}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-[11px] text-gray-500">Losses</div>
                    <div className="text-lg font-semibold text-red-600">
                      {totalLosses}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center text-gray-500 text-[11px]">
                Choose your leverage (1x–100x). Only margin is at risk.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-gray-600 text-sm mb-2">
              Connect your wallet to play
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
