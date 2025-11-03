"use client";

import { useAccount } from "wagmi";
import DailyBonus from "@/components/DailyBonus";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-xs">Your performance, history and analytics</p>
          </div>
        </div>

        {isConnected ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <Dashboard walletAddress={address} />
            </div>
            <div className="space-y-4">
              <DailyBonus
                walletAddress={address}
                onBonusClaimed={() => {
                  window.dispatchEvent(new Event("dashboard-refresh"));
                }}
              />
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-700 font-medium text-sm mb-2">Quick Tips</div>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Higher leverage increases profit potential and risk.</li>
                  <li>Your daily bonus scales with win streaks.</li>
                  <li>Leaderboard ranks by points, wins, streaks or earnings.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-gray-600 text-sm mb-2">Connect your wallet to view your dashboard</div>
          </div>
        )}
      </div>
    </main>
  );
}
