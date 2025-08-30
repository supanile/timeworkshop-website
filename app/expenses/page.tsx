"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSonner } from "@/hooks/use-sonner";
import { TransactionForm } from "@/components/forms/TransactionForm";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  TrendingDown,
  CreditCard,
  Calendar,
  ArrowDownRight,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Transaction {
  id: string;
  title: string;
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

export default function ExpensesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // สร้าง unique categories จาก transactions สำหรับ dropdown
  const transactionCategories = Array.from(
    new Map(
      transactions
        .filter((t) => t.category_id && t.category_name)
        .map((t) => [t.category_id, { id: t.category_id, name: t.category_name }])
    ).values()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useSonner();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch transactions and categories in parallel
      const [transactionsRes, categoriesRes] = await Promise.all([
        fetch("/api/transactions?type=expense"),
        fetch("/api/categories"),
      ]);

      const transactionsResult = await transactionsRes.json();
      const categoriesResult = await categoriesRes.json();

      if (transactionsResult.success) {
        setTransactions(
          transactionsResult.data.sort(
            (a: Transaction, b: Transaction) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
      }

      if (categoriesResult.success) {
        setCategories(
          categoriesResult.data.filter(
            (cat: Category) => cat.type === "expense"
          )
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    try {
      console.log("=== FRONTEND DELETE CALLED ===");
      console.log("Transaction to delete:", {
        id: transaction.id,
        transaction_id: transaction.transaction_id,
        description: transaction.description,
        amount: transaction.amount,
      });

      // ใช้ transaction.id เป็นหลัก (Grist record ID)
      const idToDelete = transaction.id;

      if (!idToDelete) {
        throw new Error("Transaction ID is missing");
      }

      console.log(`Sending DELETE request for ID: ${idToDelete}`);

      const response = await fetch(
        `/api/transactions?id=${encodeURIComponent(idToDelete)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("DELETE response status:", response.status);
      console.log(
        "DELETE response headers:",
        Object.fromEntries(response.headers.entries())
      );

      // ตรวจสอบว่าได้ response หรือไม่
      const contentType = response.headers.get("content-type");
      let result;

      try {
        const responseText = await response.text();
        console.log("DELETE response text:", responseText);

        // ถ้ามี response text และเป็น JSON
        if (responseText && contentType?.includes("application/json")) {
          result = JSON.parse(responseText);
        } else {
          // ถ้าไม่มี response text แต่ status ok
          result = response.ok
            ? { success: true }
            : { success: false, error: `HTTP ${response.status}` };
        }
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        // ถ้า parse ไม่ได้ แต่ status ok ให้ถือว่าสำเร็จ
        result = response.ok
          ? { success: true }
          : { success: false, error: "Invalid response from server" };
      }

      console.log("DELETE response data:", result);

      // ตรวจสอบความสำเร็จ
      if (result.success || response.ok) {
        // ลบจาก state โดยใช้ transaction.id
        setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));

        toast({
          title: "สำเร็จ",
          description: "ลบรายการเรียบร้อย",
          variant: "success",
        });
      } else {
        // ถ้าไม่สำเร็จ ให้แสดงข้อผิดพลาดที่ชัดเจน
        const errorMsg =
          result.error ||
          result.details ||
          `เซิร์ฟเวอร์ตอบกลับด้วย status ${response.status}`;
        throw new Error(errorMsg);
      }
    } catch (error: unknown) {
      console.error("Frontend delete error:", error);

      // แสดงข้อผิดพลาดที่ชัดเจนขึ้น
      let errorMessage = "ไม่สามารถลบรายการได้";

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
      ) {
        const message = (error as { message: string }).message;
        if (
          message.includes("404") ||
          message.includes("not found")
        ) {
          errorMessage = "ไม่พบรายการที่ต้องการลบ";
        } else if (message.includes("500")) {
          errorMessage = "เกิดข้อผิดพลาดในเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง";
        } else if (
          message.includes("403") ||
          message.includes("permission")
        ) {
          errorMessage = "ไม่มีสิทธิ์ในการลบรายการนี้";
        } else if (message !== "ไม่สามารถลบรายการได้") {
          errorMessage = message;
        }
      }

      toast({
        title: "ข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSuccess = () => {
    fetchData();
    setShowAddDialog(false);
    setEditTransaction(null);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (transaction.notes || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      transaction.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Get category info for display
  const getCategoryInfo = (categoryId: string) => {
    // หาใน transactionCategories ก่อน
    const found = transactionCategories.find((cat) => cat.id === categoryId);
    if (found) {
      return {
        name: found.name,
        color: "#6B7280", // สี default
      };
    }
    // หาใน categories (API) เผื่อมีสี
    const apiCat = categories.find((cat) => cat.id === categoryId);
    if (apiCat) {
      return {
        name: apiCat.name,
        color: apiCat.color,
      };
    }
    // fallback
    return {
      name: "หมวดหมู่ไม่ระบุ",
      color: "#6B7280",
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="space-y-8 p-6">
          {/* Loading Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-rose-600/10 to-pink-600/10 rounded-2xl blur-3xl animate-pulse"></div>
            <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-10 w-60 bg-gradient-to-r from-slate-300/60 to-slate-200/60 dark:from-slate-600/60 dark:to-slate-700/60 rounded-xl animate-pulse"></div>
                  <div className="h-6 w-40 bg-gradient-to-r from-slate-200/60 to-slate-300/60 dark:from-slate-700/60 dark:to-slate-600/60 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-12 w-40 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Loading Cards */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-200/50 via-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50 rounded-2xl animate-pulse"></div>
                <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-slate-300/60 dark:bg-slate-600/60 rounded-xl animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 bg-slate-300/60 dark:bg-slate-600/60 rounded animate-pulse"></div>
                      <div className="h-4 w-1/2 bg-slate-200/60 dark:bg-slate-700/60 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-24 bg-slate-300/60 dark:bg-slate-600/60 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6">
        {/* Modern Header with Glassmorphism */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-rose-600/10 to-pink-600/10 rounded-2xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-50/30 via-rose-50/20 to-pink-50/30 dark:from-red-950/10 dark:via-rose-950/5 dark:to-pink-950/10 rounded-2xl"></div>

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-red-500 to-rose-600 h-16 w-16 rounded-2xl flex items-center justify-center shadow-xl">
                  <TrendingDown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 via-rose-700 to-red-600 bg-clip-text text-transparent">
                    จัดการรายจ่าย
                  </h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                      รายจ่ายทั้งหมด:{" "}
                      <span className="font-bold text-red-600">
                        ฿{totalExpenses.toLocaleString()}
                      </span>
                    </p>
                    <div className="flex items-center space-x-2 bg-red-50/80 dark:bg-red-950/20 px-3 py-1 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                        {filteredTransactions.length} รายการ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-6 text-lg rounded-xl">
                    <Plus className="h-5 w-5 mr-2" />
                    เพิ่มรายจ่าย
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800/20 shadow-2xl rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                      เพิ่มรายจ่ายใหม่
                    </DialogTitle>
                  </DialogHeader>
                  <TransactionForm
                    onSuccess={handleSuccess}
                    defaultType="expense"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Modern Filters */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-teal-600/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl shadow-xl">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  ตัวกรองและค้นหา
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Enhanced Search */}
                <div className="relative group/search">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5 transition-colors duration-300 group-focus-within/search:text-blue-500" />
                    <Input
                      placeholder="ค้นหารายการ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20 dark:border-slate-700/20 rounded-xl focus:bg-white/80 dark:focus:bg-slate-800/80 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Enhanced Category Filter */}
                <div className="relative">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20 dark:border-slate-700/20 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <SelectValue placeholder="หมวดหมู่" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800/20 shadow-2xl rounded-xl">
                      <SelectItem
                        value="all"
                        className="focus:bg-slate-50 dark:focus:bg-slate-800/50"
                      >
                        ทุกหมวดหมู่
                      </SelectItem>
                      {transactionCategories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          className="focus:bg-slate-50 dark:focus:bg-slate-800/50"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-gray-500/5 rounded-2xl blur-xl"></div>
            <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl shadow-xl">
              <div className="p-12 text-center">
                <div className="bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 h-20 w-20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <CreditCard className="h-10 w-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {searchTerm || selectedCategory !== "all"
                    ? "ไม่พบรายการที่ตรงกับการค้นหา"
                    : "ยังไม่มีรายการรายจ่าย"}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {searchTerm || selectedCategory !== "all"
                    ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองเพื่อดูรายการอื่น"
                    : "เริ่มต้นการจัดการรายจ่ายของคุณวันนี้"}
                </p>
                {!searchTerm && selectedCategory === "all" && (
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มรายจ่ายแรก
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTransactions.map((transaction, index) => {
              const category = getCategoryInfo(transaction.category_id);

              return (
                <div key={transaction.id} className="relative group">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-rose-600/10 to-pink-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Main card */}
                  <div
                    className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 via-rose-50/10 to-pink-50/20 dark:from-red-950/5 dark:via-rose-950/3 dark:to-pink-950/5 rounded-2xl"></div>

                    <div className="relative p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Enhanced Icon */}
                          <div className="relative p-3 rounded-xl shadow-lg bg-gradient-to-br from-red-500 to-rose-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                            <div className="absolute inset-0 rounded-xl bg-white/20 backdrop-blur-sm"></div>
                            <ArrowDownRight className="relative h-6 w-6 text-white drop-shadow-sm" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                {transaction.description}
                              </h3>
                              <div className="flex items-center space-x-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20 dark:border-slate-700/20">
                                <div
                                  className="w-2 h-2 rounded-full shadow-sm"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {category.name}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(
                                    new Date(transaction.date),
                                    "dd MMM yyyy",
                                    { locale: th }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CreditCard className="h-3 w-3" />
                                <span>{transaction.payment_method}</span>
                              </div>
                              {transaction.quantity > 1 && (
                                <>
                                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                  <span>จำนวน: {transaction.quantity}</span>
                                </>
                              )}
                              {transaction.notes && (
                                <>
                                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                  <span className="truncate">
                                    {transaction.notes}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-4">
                          {/* Enhanced Amount */}
                          <div className="text-right">
                            <div className="bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-950/30 dark:to-rose-950/30 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800/30">
                              <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">
                                -฿{transaction.amount.toLocaleString()}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {transaction.status}
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Actions */}
                          <div className="flex items-center space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setEditTransaction(transaction)
                                  }
                                  className="h-10 w-10 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 hover:text-blue-700 transition-all duration-300 group/btn"
                                >
                                  <Edit className="h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800/20 shadow-2xl rounded-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    แก้ไขรายจ่าย
                                  </DialogTitle>
                                </DialogHeader>
                                <TransactionForm
                                  transaction={editTransaction || undefined}
                                  onSuccess={handleSuccess}
                                />
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 hover:text-red-700 transition-all duration-300 group/btn"
                                >
                                  <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover/btn:scale-110" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800/20 shadow-2xl rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                    ยืนยันการลบ
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-600 dark:text-slate-300">
                                    คุณแน่ใจหรือไม่ที่จะลบรายการ "
                                    {transaction.description}"
                                    การดำเนินการนี้ไม่สามารถย้อนกลับได้
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                                    ยกเลิก
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(transaction)} // ส่ง transaction object แทน ID
                                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                                  >
                                    ลบ
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating decorative elements */}
                    <div className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-br from-red-400/10 to-rose-400/10 rounded-full blur-lg"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 bg-gradient-to-br from-pink-400/10 to-red-400/10 rounded-full blur-md"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
