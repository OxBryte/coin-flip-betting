"use client";

import { useAccount } from "wagmi";
import DailyBonus from "@/components/DailyBonus";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Your performance, history and analytics</p>
        </div>

        {isConnected ? (
          <>
            <DailyBonus
              walletAddress={address}
              onBonusClaimed={() => {
                window.dispatchEvent(new Event("dashboard-refresh"));
              }}
            />
            <Dashboard walletAddress={address} />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg mb-2">Connect your wallet to view your dashboard</div>
          </div>
        )}
      </div>
    </main>
  );
}
