"use client";

import { useEffect, useState } from "react";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface DashboardData {
  income: number;
  expenses: number;
  profit: number;
  transactionCount: number;
  trends: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("=== FETCHING DASHBOARD DATA ===");

      const response = await fetch("/api/dashboard/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });

      console.log("Dashboard API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Dashboard API error response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Dashboard API response:", result);

      if (result.success && result.data) {
        setData(result.data);
        console.log("Dashboard data successfully set:", result.data);
      } else {
        if (result.data) {
          console.warn(
            "API returned non-success but has data, using it anyway"
          );
          setData(result.data);
        } else {
          const errorMessage = result.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล";
          console.error("API error:", errorMessage);
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลได้";
      console.error("Error fetching dashboard data:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const safeData = data || {
    income: 0,
    expenses: 0,
    profit: 0,
    transactionCount: 0,
    trends: [],
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="space-y-8 p-6">
          {/* Modern Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 rounded-2xl blur-3xl"></div>
            <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-white dark:via-purple-100 dark:to-white bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="mt-2 text-slate-600 dark:text-slate-300 text-lg">
                    ภาพรวมรายได้และรายจ่ายของ TimeWorkshop
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-12 w-12 rounded-xl flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Error State */}
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center max-w-md">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-red-200 dark:border-red-800/30 rounded-2xl p-8 shadow-2xl">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 h-16 w-16 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2">
                    เกิดข้อผิดพลาด
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    {error}
                  </p>
                  <button
                    onClick={fetchDashboardData}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>กำลังโหลด...</span>
                      </div>
                    ) : (
                      "ลองใหม่"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions Fallback */}
          <div className="grid gap-6">
            <div className="max-w-2xl mx-auto w-full">
              <RecentTransactions limit={5} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6">
        {/* Modern Header with Glassmorphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-white dark:via-purple-100 dark:to-white bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300 text-lg">
                  ภาพรวมรายได้และรายจ่ายของ TimeWorkshop
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-12 w-12 rounded-xl flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <StatsCards data={safeData} isLoading={isLoading} />

        {/* Charts and Recent Transactions with Enhanced Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TrendChart
              data={safeData.trends}
              isLoading={isLoading}
              currentMonthData={{
                income: safeData.income,
                expenses: safeData.expenses,
                profit: safeData.profit,
                transactionCount: safeData.transactionCount,
              }}
            />
          </div>
          <div className="lg:col-span-1">
            <RecentTransactions limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}
