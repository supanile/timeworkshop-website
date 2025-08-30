"use client";

import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  data: {
    income: number;
    expenses: number;
    profit: number;
    transactionCount: number;
  };
  isLoading?: boolean;
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  const stats = [
    {
      title: "รายได้",
      value: data.income || 0,
      icon: TrendingUp,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient:
        "from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
      textColor: "text-emerald-700 dark:text-emerald-300",
      format: (value: number) => `฿${value.toLocaleString()}`,
      trend: "+12.5%",
    },
    {
      title: "รายจ่าย",
      value: Math.abs(data.expenses) || 0,
      icon: TrendingDown,
      gradient: "from-rose-500 via-red-500 to-pink-500",
      bgGradient:
        "from-rose-50 via-red-50 to-pink-50 dark:from-rose-950/20 dark:via-red-950/20 dark:to-pink-950/20",
      iconBg: "bg-gradient-to-br from-rose-500 to-red-600",
      textColor: "text-rose-700 dark:text-rose-300",
      format: (value: number) => `฿${value.toLocaleString()}`,
      trend: "-3.2%",
    },
    {
      title: "กำไร/ขาดทุน",
      value: data.profit || 0,
      icon: DollarSign,
      gradient:
        (data.profit || 0) >= 0
          ? "from-violet-500 via-purple-500 to-indigo-500"
          : "from-orange-500 via-red-500 to-rose-500",
      bgGradient:
        (data.profit || 0) >= 0
          ? "from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-indigo-950/20"
          : "from-orange-50 via-red-50 to-rose-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-rose-950/20",
      iconBg:
        (data.profit || 0) >= 0
          ? "bg-gradient-to-br from-violet-500 to-purple-600"
          : "bg-gradient-to-br from-orange-500 to-red-600",
      textColor:
        (data.profit || 0) >= 0
          ? "text-violet-700 dark:text-violet-300"
          : "text-orange-700 dark:text-orange-300",
      format: (value: number) => `฿${value.toLocaleString()}`,
      trend: (data.profit || 0) >= 0 ? "+24.8%" : "-8.5%",
    },
    {
      title: "จำนวนรายการ",
      value: data.transactionCount || 0,
      icon: Activity,
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      bgGradient:
        "from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-indigo-950/20",
      iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
      textColor: "text-cyan-700 dark:text-cyan-300",
      format: (value: number) => `${value} รายการ`,
      trend: "+5.7%",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative group">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200/50 via-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50 rounded-2xl animate-pulse"></div>

            {/* Glass card */}
            <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-20 bg-slate-300/60 dark:bg-slate-600/60 rounded-lg animate-pulse"></div>
                <div className="h-12 w-12 bg-slate-300/60 dark:bg-slate-600/60 rounded-xl animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="h-8 w-24 bg-slate-300/60 dark:bg-slate-600/60 rounded-lg animate-pulse"></div>
                <div className="h-3 w-16 bg-slate-300/60 dark:bg-slate-600/60 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.trend.startsWith("+");

        return (
          <div key={stat.title} className="relative group">
            {/* Animated gradient background */}
            <div
              className={cn(
                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
                `bg-gradient-to-r ${stat.gradient}`
              )}
            ></div>

            {/* Main card with glassmorphism */}
            <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
              {/* Subtle gradient overlay */}
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl opacity-10",
                  `bg-gradient-to-br ${stat.bgGradient}`
                )}
              ></div>

              {/* Content */}
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 tracking-wide uppercase">
                      {stat.title}
                    </p>
                    {/* Trend indicator */}
                    <div className="flex items-center space-x-1">
                      <div
                        className={cn(
                          "h-1 w-1 rounded-full",
                          isPositive ? "bg-green-500" : "bg-red-500"
                        )}
                      ></div>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          isPositive
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {stat.trend}
                      </span>
                    </div>
                  </div>

                  {/* Icon with gradient background */}
                  <div
                    className={cn(
                      "relative p-3 rounded-xl shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12",
                      stat.iconBg
                    )}
                  >
                    <div className="absolute inset-0 rounded-xl bg-white/20 backdrop-blur-sm"></div>
                    <Icon className="relative h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                </div>

                {/* Value */}
                <div className="space-y-2">
                  <div
                    className={cn(
                      "text-3xl font-bold tracking-tight",
                      `bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`
                    )}
                  >
                    {stat.format(stat.value)}
                  </div>

                  <p className={cn("text-xs tracking-wide", stat.textColor)}>
                    {stat.title === "กำไร/ขาดทุน"
                      ? (stat.value || 0) >= 0
                        ? "📈 กำไร"
                        : "📉 ขาดทุน"
                      : "เดือนปัจจุบัน"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
