"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  Wallet,
  Calendar,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";

// ใช้ interface เดียวกับเมนูรายจ่าย/รายรับ
interface Transaction {
  id: string;
  title?: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  transaction_type: "income" | "expense";
  category_id: string;
  category_name?: string;
  date: string;
  transaction_date: number;
  payment_method: string;
  quantity: number;
  unit_price?: number;
  notes: string;
  status: string;
  created_by: string;
  created_date: number;
  updated_date: number;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  description?: string;
}

interface RecentTransactionsProps {
  limit?: number;
}

export function RecentTransactions({ limit = 8 }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching recent transactions...");

      // Fetch ทั้ง transactions และ categories เหมือนกับเมนูรายจ่าย/รายรับ
      const [transactionsRes, categoriesRes] = await Promise.all([
        fetch("/api/transactions"), // ไม่ใส่ type filter เพื่อดึงทั้งหมด
        fetch("/api/categories"),
      ]);

      console.log("Transactions API response status:", transactionsRes.status);
      console.log("Categories API response status:", categoriesRes.status);

      if (!transactionsRes.ok) {
        throw new Error(
          `Failed to fetch transactions: ${transactionsRes.status}`
        );
      }

      if (!categoriesRes.ok) {
        throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);
      }

      const transactionsResult = await transactionsRes.json();
      const categoriesResult = await categoriesRes.json();

      console.log("Transactions API raw response:", transactionsResult);
      console.log("Categories API raw response:", categoriesResult);

      // ตั้งค่า categories
      if (categoriesResult.success && Array.isArray(categoriesResult.data)) {
        setCategories(categoriesResult.data);
      }

      // ประมวลผล transactions
      if (
        transactionsResult.success &&
        Array.isArray(transactionsResult.data)
      ) {
        const sorted = transactionsResult.data
          .sort((a: Transaction, b: Transaction) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          })
          .slice(0, limit);

        console.log("Processed recent transactions:", sorted);
        setTransactions(sorted);
      } else {
        console.log("No transactions found or invalid response format");
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      setError(
        error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ใช้ function เดียวกับเมนูรายจ่าย/รายรับ
  const getCategoryInfo = (categoryId: string) => {
    return (
      categories.find((cat) => cat.id === categoryId) || {
        name: "หมวดหมู่ไม่ระบุ",
        color: "#6B7280",
      }
    );
  };

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="w-full">
        {/* Animated gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-xl animate-pulse"></div>

          {/* Glass card */}
          <div className="relative backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800/20 rounded-xl shadow-lg">
            <div className="p-4 sm:p-6 border-b border-white/10 dark:border-slate-800/10">
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-r from-slate-300/60 to-slate-200/60 dark:from-slate-600/60 dark:to-slate-700/60 rounded animate-pulse"></div>
                <div className="h-5 w-32 sm:h-6 sm:w-40 bg-gradient-to-r from-slate-300/60 to-slate-200/60 dark:from-slate-600/60 dark:to-slate-700/60 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 sm:space-x-4 animate-pulse"
                >
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-slate-300/60 to-slate-200/60 dark:from-slate-600/60 dark:to-slate-700/60 rounded-lg sm:rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-3 sm:h-4 bg-gradient-to-r from-slate-300/60 to-slate-200/60 dark:from-slate-600/60 dark:to-slate-700/60 rounded w-3/4"></div>
                    <div className="h-2 sm:h-3 bg-gradient-to-r from-slate-200/60 to-slate-300/60 dark:from-slate-700/60 dark:to-slate-600/60 rounded w-1/2"></div>
                  </div>
                  <div className="h-5 w-16 sm:h-6 sm:w-20 bg-gradient-to-r from-slate-300/60 to-slate-200/60 dark:from-slate-600/60 dark:to-slate-700/60 rounded flex-shrink-0"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        {/* Error gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl blur-xl"></div>

          {/* Glass card */}
          <div className="relative backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800/20 rounded-xl shadow-lg">
            <div className="p-4 sm:p-6 border-b border-white/10 dark:border-slate-800/10">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  รายการธุรกรรมล่าสุด
                </h3>
              </div>
            </div>
            <div className="p-4 sm:p-6 text-center">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <p className="text-red-600 dark:text-red-400 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
                  {error}
                </p>
                <Button
                  onClick={fetchRecentTransactions}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
                >
                  ลองใหม่
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="w-full">
        {/* Empty state gradient */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-gray-500/5 rounded-xl blur-xl"></div>

          {/* Glass card */}
          <div className="relative backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800/20 rounded-xl shadow-lg">
            <div className="p-4 sm:p-6 border-b border-white/10 dark:border-slate-800/10">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-slate-500 to-gray-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  รายการธุรกรรมล่าสุด
                </h3>
              </div>
            </div>
            <div className="p-4 sm:p-6 text-center">
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 rounded-lg sm:rounded-xl p-4 sm:p-8">
                <div className="bg-gradient-to-br from-slate-400 to-gray-500 h-12 w-12 sm:h-16 sm:w-16 rounded-lg sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-3 sm:mb-4 font-medium text-sm sm:text-base">
                  ยังไม่มีรายการธุรกรรม
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    asChild
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm"
                  >
                    <Link href="/income">เพิ่มรายได้</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-sm"
                  >
                    <Link href="/expenses">เพิ่มรายจ่าย</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Animated gradient background */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-600/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Main glass card */}
        <div className="relative backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 dark:border-slate-800/10">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-x-0 top-0 h-16 sm:h-24 bg-gradient-to-b from-indigo-50/20 via-purple-50/10 to-transparent dark:from-indigo-950/5 dark:via-purple-950/3 dark:to-transparent rounded-t-xl"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-100 dark:to-white bg-clip-text text-transparent">
                    รายการธุรกรรมล่าสุด
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {transactions.length} รายการล่าสุด
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions list */}
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {transactions.map((transaction, index) => {
                const isIncome = transaction.type === "income";
                const category = getCategoryInfo(transaction.category_id);

                return (
                  <div
                    key={transaction.id}
                    className="relative group"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Card background */}
                    <div
                      className={`group/item flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] hover:shadow-md border border-white/20 dark:border-slate-700/20 ${
                        isIncome
                          ? "bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/10 dark:to-emerald-950/10 hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20"
                          : "bg-gradient-to-r from-red-50/50 to-rose-50/50 dark:from-red-950/10 dark:to-rose-950/10 hover:from-red-50 hover:to-rose-50 dark:hover:from-red-950/20 dark:hover:to-rose-950/20"
                      }`}
                    >
                      {/* Top section - Icon, content, and amount */}
                      <div className="flex items-center justify-between sm:flex-1 sm:min-w-0">
                        {/* Left side - Icon and content */}
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          {/* Enhanced Icon */}
                          <div
                            className={`relative p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-6 flex-shrink-0 ${
                              isIncome
                                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                : "bg-gradient-to-br from-red-500 to-rose-600"
                            }`}
                          >
                            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm"></div>
                            {isIncome ? (
                              <ArrowUpRight className="relative h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-sm" />
                            ) : (
                              <ArrowDownRight className="relative h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-sm" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1 sm:mb-2">
                              <h3 className="text-sm sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {transaction.description}
                              </h3>
                              {category && (
                                <div className="flex items-center space-x-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded-md sm:rounded-lg border border-white/20 dark:border-slate-700/20 self-start sm:self-auto">
                                  <div
                                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                                    {category.name}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                  {format(
                                    new Date(transaction.date),
                                    "dd MMM yyyy",
                                    { locale: th }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CreditCard className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate max-w-20 sm:max-w-none">{transaction.payment_method}</span>
                              </div>
                              <span
                                className={`font-medium whitespace-nowrap ${
                                  isIncome
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {isIncome ? "รายได้" : "รายจ่าย"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right side - Amount */}
                        <div className="text-right ml-3 sm:ml-4 flex-shrink-0">
                          <div
                            className={`inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-mono text-xs sm:text-sm font-bold transition-all duration-300 group-hover/item:scale-105 ${
                              isIncome
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                                : "bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-950/30 dark:to-rose-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                            }`}
                          >
                            <span className="whitespace-nowrap">
                              {isIncome ? "+" : "-"}฿{formatAmount(transaction.amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating decorative elements */}
                    <div
                      className={`absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full blur-lg ${
                        isIncome
                          ? "bg-gradient-to-br from-green-400/10 to-emerald-400/10"
                          : "bg-gradient-to-br from-red-400/10 to-rose-400/10"
                      }`}
                    ></div>
                  </div>
                );
              })}
            </div>

            {/* View all button */}
            <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10 dark:border-slate-800/10">
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" size="sm" asChild className="group/btn">
                  <Link
                    href="/income"
                    className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-950/30 dark:hover:to-emerald-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 transition-all duration-300 text-xs sm:text-sm"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2 transition-transform duration-300 group-hover/btn:scale-110" />
                    <span>ดูรายได้ทั้งหมด</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="group/btn">
                  <Link
                    href="/expenses"
                    className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 hover:from-red-100 hover:to-rose-100 dark:hover:from-red-950/30 dark:hover:to-rose-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 transition-all duration-300 text-xs sm:text-sm"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2 transition-transform duration-300 group-hover/btn:scale-110" />
                    <span>ดูรายจ่ายทั้งหมด</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-md"></div>
        </div>
      </div>
    </div>
  );
}