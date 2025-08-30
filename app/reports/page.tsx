"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { ExpensesPieChart } from "@/components/reports/ExpensesPieChart";
import { MonthlyReportTable } from "@/components/reports/MonthlyReportTable";
import { CalendarDays, Download, FileText, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Activity } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  date: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  description?: string;
}

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  interface DashboardTrend {
    date: string;
    income: number;
    expense: number;
  }

  interface DashboardData {
    trends: DashboardTrend[];
    // Add other fields if needed
  }

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("12months");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [transactionsRes, categoriesRes, dashboardRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories"),
        fetch("/api/dashboard/stats"),
      ]);

      const transactionsResult = await transactionsRes.json();
      const categoriesResult = await categoriesRes.json();
      const dashboardResult = await dashboardRes.json();

      if (transactionsResult.success) {
        setTransactions(transactionsResult.data);
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }

      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("ข้อผิดพลาด", {
        description: "ไม่สามารถโหลดข้อมูลได้",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    toast("กำลังเตรียมรายงาน", {
      description: "ฟีเจอร์การส่งออกจะพร้อมใช้งานเร็วๆ นี้",
    });
  };

  // Calculate summary stats
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  // Filter transactions based on selected period
  const getFilteredTransactions = () => {
    const now = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case "1month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "12months":
      default:
        startDate.setMonth(now.getMonth() - 12);
        break;
    }

    return transactions.filter((t) => new Date(t.date) >= startDate);
  };

  const filteredTransactions = getFilteredTransactions();

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6">
        {/* Header Skeleton */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-10 w-64 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl animate-pulse"></div>
                <div className="h-6 w-96 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg animate-pulse"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-40 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl animate-pulse"></div>
                <div className="h-10 w-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl p-6 h-32 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 w-24 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded"></div>
                  <div className="h-8 w-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded"></div>
                  <div className="h-3 w-20 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-8 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl p-6 h-80 animate-pulse">
                <div className="h-6 w-32 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded mb-4"></div>
                <div className="h-64 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6">
        {/* Modern Header with Glassmorphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  รายงานและสถิติ
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300 text-lg">
                  วิเคราะห์รายได้-รายจ่ายของคุณ
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur"></div>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="relative w-48 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                      <CalendarDays className="h-4 w-4 mr-2 text-blue-500" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-white/20 dark:border-slate-800/20">
                      <SelectItem value="1month">1 เดือน</SelectItem>
                      <SelectItem value="3months">3 เดือน</SelectItem>
                      <SelectItem value="6months">6 เดือน</SelectItem>
                      <SelectItem value="12months">12 เดือน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur"></div>
                  <Button 
                    variant="outline" 
                    onClick={handleExportReport}
                    className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all duration-300"
                  >
                    <Download className="h-4 w-4 mr-2 text-emerald-500" />
                    ส่งออก
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Income Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
            <Card className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20 dark:border-slate-800/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">รายได้รวม</CardTitle>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ฿{totalIncome.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  {transactions.filter((t) => t.type === "income").length} รายการ
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Expenses Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
            <Card className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20 dark:border-slate-800/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">รายจ่ายรวม</CardTitle>
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  ฿{totalExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  {transactions.filter((t) => t.type === "expense").length} รายการ
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Net Profit Card */}
          <div className="relative group">
            <div className={`absolute inset-0 ${netProfit >= 0 ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20' : 'bg-gradient-to-r from-orange-500/20 to-red-500/20'} rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500`}></div>
            <Card className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20 dark:border-slate-800/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  กำไร/ขาดทุนสุทธิ
                </CardTitle>
                <div className={`${netProfit >= 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-orange-500 to-red-500'} h-10 w-10 rounded-xl flex items-center justify-center shadow-lg`}>
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${netProfit >= 0 ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-orange-600 to-red-600'} bg-clip-text text-transparent`}>
                  {netProfit >= 0 ? "+" : ""}฿{netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {netProfit >= 0 ? "กำไร" : "ขาดทุน"}{" "}
                  {Math.abs((netProfit / totalIncome) * 100 || 0).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modern Charts Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Trend Chart */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl p-1 hover:shadow-2xl transition-all duration-500">
              <TrendChart
                data={
                  (dashboardData?.trends || []).map((trend) => ({
                    month: trend.date,
                    income: trend.income,
                    expenses: trend.expense,
                    profit: trend.income - trend.expense,
                  }))
                }
                isLoading={false}
              />
            </div>
          </div>

          {/* Expenses Pie Chart */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl p-1 hover:shadow-2xl transition-all duration-500">
              <ExpensesPieChart
                transactions={filteredTransactions}
                categories={categories}
                isLoading={false}
              />
            </div>
          </div>
        </div>

        {/* Monthly Report Table */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 via-gray-600/20 to-zinc-600/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl p-1 hover:shadow-2xl transition-all duration-500">
            <MonthlyReportTable transactions={transactions} isLoading={false} />
          </div>
        </div>

        {/* Modern Insights Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Top Expense Category */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
            <Card className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20 dark:border-slate-800/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  หมวดหมู่รายจ่ายสูงสุด
                </CardTitle>
                <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const expensesByCategory = filteredTransactions
                    .filter((t) => t.type === "expense")
                    .reduce((acc, t) => {
                      const category = categories.find(
                        (c) => c.id === t.category_id
                      );
                      const categoryName = category?.name || "ไม่ระบุ";
                      acc[categoryName] = (acc[categoryName] || 0) + t.amount;
                      return acc;
                    }, {} as Record<string, number>);

                  const topCategory = Object.entries(expensesByCategory).sort(
                    ([, a], [, b]) => b - a
                  )[0];

                  if (!topCategory) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-slate-500 dark:text-slate-400">ไม่มีข้อมูลรายจ่าย</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-xl p-4 border border-rose-100 dark:border-rose-800/30">
                        <p className="text-xl font-bold text-rose-700 dark:text-rose-300 mb-1">
                          {topCategory[0]}
                        </p>
                        <p className="text-2xl font-mono font-bold text-rose-800 dark:text-rose-200">
                          ฿{topCategory[1].toLocaleString()}
                        </p>
                        <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">
                          {((topCategory[1] / totalExpenses) * 100).toFixed(1)}%
                          ของรายจ่ายทั้งหมด
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Average Daily Spending */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
            <Card className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20 dark:border-slate-800/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  เฉลี่ยรายจ่ายต่อวัน
                </CardTitle>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const expenseTransactions = filteredTransactions.filter(
                    (t) => t.type === "expense"
                  );
                  const days =
                    selectedPeriod === "1month"
                      ? 30
                      : selectedPeriod === "3months"
                      ? 90
                      : selectedPeriod === "6months"
                      ? 180
                      : 365;

                  const avgPerDay =
                    expenseTransactions.length > 0 ? totalExpenses / days : 0;

                  return (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                        <p className="text-2xl font-mono font-bold text-blue-800 dark:text-blue-200 mb-2">
                          ฿{avgPerDay.toFixed(0)}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          จากรายจ่าย {expenseTransactions.length} รายการ
                        </p>
                        <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                          ในช่วง {days} วันที่ผ่านมา
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modern Export Notice */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
          <Card className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-white/20 dark:border-slate-800/20 hover:shadow-2xl transition-all duration-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-12 w-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-lg">
                    ต้องการข้อมูลเพิ่มเติม?
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    คุณสามารถส่งออกรายงานเป็นไฟล์ PDF หรือ Excel
                    เพื่อการวิเคราะห์เพิ่มเติม
                  </p>
                </div>
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-xl blur"></div>
                  <Button
                    variant="outline"
                    onClick={handleExportReport}
                    className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-white/30 dark:border-slate-700/30 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all duration-300 transform hover:scale-105"
                  >
                    <Download className="h-4 w-4 mr-2 text-amber-600" />
                    ส่งออกรายงาน
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}