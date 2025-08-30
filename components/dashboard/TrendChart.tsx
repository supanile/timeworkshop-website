"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface TrendData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

interface TrendChartProps {
  data: TrendData[];
  isLoading?: boolean;
  currentMonthData?: {
    income: number;
    expenses: number;
    profit: number;
    transactionCount: number;
  };
}

export function TrendChart({ data, isLoading, currentMonthData }: TrendChartProps) {
  if (isLoading) {
    return (
      <div className="relative group">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-teal-500/20 rounded-2xl blur-xl animate-pulse"></div>

        {/* Glass card */}
        <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl shadow-xl">
          <div className="p-6 border-b border-white/10 dark:border-slate-800/10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gradient-to-r from-slate-300/60 to-slate-200/60 dark:from-slate-600/60 dark:to-slate-700/60 rounded-lg animate-pulse"></div>
                <div className="h-4 w-32 bg-gradient-to-r from-slate-200/60 to-slate-300/60 dark:from-slate-700/60 dark:to-slate-600/60 rounded animate-pulse"></div>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl animate-pulse"></div>
            </div>
          </div>
          <div className="p-6 h-96 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 w-8 h-8 border-4 border-transparent border-t-purple-500 rounded-full animate-spin animation-delay-75"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                กำลังโหลดข้อมูล...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800/20 rounded-xl shadow-2xl p-4 min-w-[200px]">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {label}
            </p>
          </div>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {entry.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  ฿{entry.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // ใช้ข้อมูลจาก currentMonthData แทนการคำนวณจาก trends
  const currentMonthIncome = currentMonthData?.income || 0;
  const currentMonthExpenses = Math.abs(currentMonthData?.expenses || 0);
  const currentMonthProfit = currentMonthData?.profit || 0;

  return (
    <div className="relative group">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Main glass card */}
      <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Header with gradient overlay */}
        <div className="relative p-6 border-b border-white/10 dark:border-slate-800/10">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-teal-50/30 dark:from-blue-950/10 dark:via-purple-950/10 dark:to-teal-950/10 rounded-t-2xl"></div>

          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent">
                  แนวโน้มรายได้-รายจ่าย
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                6 เดือนย้อนหลัง • วิเคราะห์แนวโน้มการเงิน
              </p>
            </div>

            {/* Summary stats - ใช้ข้อมูลเดือนปัจจุบัน */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50/80 dark:bg-green-950/20 px-3 py-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  ฿{currentMonthIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-red-50/80 dark:bg-red-950/20 px-3 py-2 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                  ฿{currentMonthExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Content */}
        <div className="p-6">
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  {/* Gradient definitions */}
                  <linearGradient
                    id="incomeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="expensesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="profitGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="opacity-20"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-slate-600 dark:text-slate-300"
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-slate-600 dark:text-slate-300"
                  tickFormatter={formatValue}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Area charts for better visual impact */}
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#incomeGradient)"
                  name="รายได้"
                />

                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  strokeWidth={3}
                  fill="url(#expensesGradient)"
                  name="รายจ่าย"
                />

                {/* Profit line overlay */}
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  name="กำไร/ขาดทุน"
                  dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }}
                  activeDot={{
                    r: 8,
                    stroke: "#8B5CF6",
                    strokeWidth: 2,
                    fill: "white",
                  }}
                  strokeDasharray="8 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="mt-6 flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-sm"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                รายได้
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-full shadow-sm"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                รายจ่าย
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full shadow-sm opacity-80"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                กำไร/ขาดทุน
              </span>
            </div>
          </div>

          {/* Bottom summary - แสดงข้อมูลเดือนปัจจุบันแทน */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-4 border border-green-100 dark:border-green-900/20">
              <div className="text-center">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  รายได้เดือนนี้
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  ฿{currentMonthIncome.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 rounded-xl p-4 border border-red-100 dark:border-red-900/20">
              <div className="text-center">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  รายจ่ายเดือนนี้
                </p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  ฿{currentMonthExpenses.toLocaleString()}
                </p>
              </div>
            </div>
            <div
              className={`bg-gradient-to-br rounded-xl p-4 border ${
                currentMonthProfit >= 0
                  ? "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-100 dark:border-purple-900/20"
                  : "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-100 dark:border-orange-900/20"
              }`}
            >
              <div className="text-center">
                <p
                  className={`text-sm font-medium ${
                    currentMonthProfit >= 0
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                >
                  {currentMonthProfit >= 0 ? "กำไรเดือนนี้" : "ขาดทุนเดือนนี้"}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    currentMonthProfit >= 0
                      ? "text-purple-700 dark:text-purple-300"
                      : "text-orange-700 dark:text-orange-300"
                  }`}
                >
                  {currentMonthProfit >= 0 ? "+" : ""}฿{currentMonthProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-teal-400/10 to-green-400/10 rounded-full blur-lg"></div>
      </div>
    </div>
  );
}