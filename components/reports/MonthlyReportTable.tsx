"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";
import { th } from "date-fns/locale";
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3 
} from "lucide-react";

interface Transaction {
  date: string;
  amount: number;
  type: "income" | "expense";
}

interface MonthlyReportTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
  transactionCount: number;
}

export function MonthlyReportTable({
  transactions,
  isLoading,
}: MonthlyReportTableProps) {
  if (isLoading) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 rounded-2xl blur-xl animate-pulse"></div>
        
        <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl shadow-xl">
          <div className="p-6 border-b border-white/10 dark:border-slate-800/10">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 bg-gradient-to-r from-slate-300/60 to-slate-200/60 dark:from-slate-600/60 dark:to-slate-700/60 rounded animate-pulse"></div>
              <div className="h-6 w-48 bg-gradient-to-r from-slate-300/60 to-slate-200/60 dark:from-slate-600/60 dark:to-slate-700/60 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-gradient-to-r from-slate-200/60 to-slate-300/60 dark:from-slate-700/60 dark:to-slate-600/60 animate-pulse rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Generate last 12 months
  const now = new Date();
  const months = eachMonthOfInterval({
    start: startOfMonth(subMonths(now, 11)),
    end: endOfMonth(now),
  });

  // Calculate monthly data
  const monthlyData: MonthlyData[] = months
    .map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, "MMM yyyy", { locale: th }),
        income,
        expenses,
        profit: income - expenses,
        transactionCount: monthTransactions.length,
      };
    })
    .reverse(); // Most recent first

  const totals = monthlyData.reduce(
    (acc, data) => ({
      income: acc.income + data.income,
      expenses: acc.expenses + data.expenses,
      profit: acc.profit + data.profit,
      transactionCount: acc.transactionCount + data.transactionCount,
    }),
    { income: 0, expenses: 0, profit: 0, transactionCount: 0 }
  );

  return (
    <div className="relative group">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Main glass card */}
      <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 dark:border-slate-800/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/20 to-teal-50/30 dark:from-blue-950/10 dark:via-purple-950/5 dark:to-teal-950/10 rounded-t-2xl"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent">
                    รายงานรายเดือน
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    12 เดือนย้อนหลัง • วิเคราะห์แนวโน้มรายได้-รายจ่าย
                  </p>
                </div>
              </div>
              
              {/* Summary cards */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="bg-green-50/80 dark:bg-green-950/20 px-4 py-2 rounded-lg border border-green-200/50 dark:border-green-800/30">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      ฿{totals.income.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-red-50/80 dark:bg-red-950/20 px-4 py-2 rounded-lg border border-red-200/50 dark:border-red-800/30">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                      ฿{totals.expenses.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6">
          <div className="overflow-hidden rounded-xl border border-white/20 dark:border-slate-800/20">
            <Table>
              <TableHeader className="bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-900/80">
                <TableRow className="hover:bg-transparent border-b border-white/10 dark:border-slate-800/10">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>เดือน</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-end space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span>รายได้</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-end space-x-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span>รายจ่าย</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-end space-x-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span>กำไร/ขาดทุน</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>รายการ</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((data, index) => (
                  <TableRow 
                    key={index} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors duration-200 border-b border-white/5 dark:border-slate-800/5"
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-white py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                        <span>{data.month}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          ฿{data.income.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          ฿{data.expenses.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Badge
                        variant={data.profit >= 0 ? "default" : "destructive"}
                        className={`font-mono text-sm px-3 py-1 ${
                          data.profit >= 0
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                            : "bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-950/30 dark:to-rose-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                        }`}
                      >
                        {data.profit >= 0 ? "+" : ""}฿{data.profit.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <Badge 
                        variant="outline" 
                        className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      >
                        {data.transactionCount}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Totals Row */}
                <TableRow className="border-t-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-900/80 font-semibold hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                      <span className="text-slate-900 dark:text-white font-bold">รวมทั้งหมด</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                        ฿{totals.income.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                        ฿{totals.expenses.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <Badge
                      variant={totals.profit >= 0 ? "default" : "destructive"}
                      className={`font-mono text-base px-4 py-2 ${
                        totals.profit >= 0
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                          : "bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-950/30 dark:to-rose-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                      }`}
                    >
                      {totals.profit >= 0 ? "+" : ""}฿{totals.profit.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <Badge 
                      variant="outline" 
                      className="bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 px-3 py-1 font-bold"
                    >
                      {totals.transactionCount}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Empty state */}
          {monthlyData.every((data) => data.transactionCount === 0) && (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="bg-gradient-to-br from-slate-400 to-gray-500 h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  ไม่มีข้อมูลในช่วงเวลาที่เลือก
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  เริ่มต้นเพิ่มรายการธุรกรรมเพื่อดูรายงาน
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-teal-400/10 to-green-400/10 rounded-full blur-lg"></div>
      </div>
    </div>
  );
}