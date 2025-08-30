"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CategoryForm } from "@/components/forms/CategoryForm";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Settings,
  Database,
} from "lucide-react";

// Type definitions - แก้ไขให้ตรงกับ API response
interface Category {
  id: string;
  category_name: string;
  category_type: "income" | "expense";
  color: string;
  description?: string;
  is_active?: boolean;
  created_date?: number;
}

// Helper type สำหรับแสดงผล
interface DisplayCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  description?: string;
}

// Transaction type definition
interface Transaction {
  id: string;
  category_id: string;
  transaction_type: "income" | "expense";
  // Add other fields as needed, e.g. amount, date, etc.
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editCategory, setEditCategory] = useState<DisplayCategory | null>(
    null
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories");
      const result = await response.json();

      if (result.success) {
        console.log("Categories data:", result.data);
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("ข้อผิดพลาด", {
        description: "ไม่สามารถโหลดหมวดหมู่ได้",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast.success("สำเร็จ", {
          description: "ลบหมวดหมู่เรียบร้อย",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      let errorMessage = "ไม่สามารถลบหมวดหมู่ได้";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error("ข้อผิดพลาด", {
        description: errorMessage,
      });
    }
  };
  // ดึง transactions เพื่อดูว่าแต่ละ category ถูกใช้เป็นรายได้หรือรายจ่าย
  const [transactions, setTransactions] = useState<Transaction[]>([]);
    fetchCategories();
    setShowAddDialog(false);
    setEditCategory(null);
  };


  // ดึง transactions เพื่อดูว่าแต่ละ category ถูกใช้เป็นรายได้หรือรายจ่าย
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      const result = await response.json();
      if (result.success) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // สร้าง lookup ว่า category ไหนถูกใช้เป็น income/expense
  const categoryTypeMap: Record<string, Set<string>> = {};
  transactions.forEach((t) => {
    if (!categoryTypeMap[t.category_id]) categoryTypeMap[t.category_id] = new Set();
    categoryTypeMap[t.category_id].add(t.transaction_type);
  });

  // income: category ถูกใช้ใน transaction_type = income
  const incomeCategories: DisplayCategory[] = categories
    .filter((c) => categoryTypeMap[c.id]?.has("income"))
    .map((c) => ({
      id: c.id,
      name: c.category_name,
      type: "income" as const,
      color: c.color,
      description: c.description,
    }));

  // expense: category ถูกใช้ใน transaction_type = expense
  const expenseCategories: DisplayCategory[] = categories
    .filter((c) => categoryTypeMap[c.id]?.has("expense"))
    .map((c) => ({
      id: c.id,
      name: c.category_name,
      type: "expense" as const,
      color: c.color,
      description: c.description,
    }));

  // Debug logs
  console.log("All categories:", categories);
  console.log("Income categories:", incomeCategories);
  console.log("Expense categories:", expenseCategories);

  const handleExportData = () => {
    toast("กำลังเตรียมข้อมูล", {
      description: "ฟีเจอร์การส่งออกข้อมูลจะพร้อมใช้งานเร็วๆ นี้",
    });
  };

  const handleImportData = () => {
    toast("กำลังเตรียมฟีเจอร์", {
      description: "ฟีเจอร์การนำเข้าข้อมูลจะพร้อมใช้งานเร็วๆ นี้",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="space-y-8 p-6">
          {/* Loading Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 rounded-2xl blur-3xl"></div>
            <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-10 w-48 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 animate-pulse rounded-xl"></div>
                  <div className="mt-2 h-6 w-64 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg"></div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 h-12 w-12 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 via-purple-600/5 to-teal-600/5 rounded-2xl blur-xl"></div>
                <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl p-6">
                  <div className="h-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl"></div>
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
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10 rounded-2xl blur-3xl"></div>
          <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-white dark:via-purple-100 dark:to-white bg-clip-text text-transparent">
                  ตั้งค่าระบบ
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300 text-lg">
                  จัดการหมวดหมู่และการตั้งค่าต่างๆ ของระบบ
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-12 w-12 rounded-xl flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <Tabs defaultValue="categories" className="space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 via-purple-600/5 to-teal-600/5 rounded-2xl blur-xl"></div>
            <div className="relative backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 border border-white/20 dark:border-slate-800/20 rounded-2xl p-2">
              <TabsList className="grid w-full grid-cols-2 bg-transparent">
                <TabsTrigger
                  value="categories"
                  className="data-[state=active]:bg-white/80 data-[state=active]:dark:bg-slate-800/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-sm transition-all duration-300"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  หมวดหมู่
                </TabsTrigger>
                <TabsTrigger
                  value="data"
                  className="data-[state=active]:bg-white/80 data-[state=active]:dark:bg-slate-800/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-sm transition-all duration-300"
                >
                  <Database className="h-4 w-4 mr-2" />
                  ข้อมูล
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-8">
            {/* Section Header */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-teal-600/5 to-cyan-600/5 rounded-2xl blur-xl"></div>
              <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      จัดการหมวดหมู่
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      เพิ่ม แก้ไข หรือลบหมวดหมู่รายได้และรายจ่าย
                    </p>
                  </div>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มหมวดหมู่
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border border-white/20 dark:border-slate-800/20">
                      <DialogHeader>
                        <DialogTitle className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          เพิ่มหมวดหมู่ใหม่
                        </DialogTitle>
                      </DialogHeader>
                      <CategoryForm onSuccess={handleSuccess} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Income Categories */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-emerald-600/5 to-teal-600/5 rounded-2xl blur-xl"></div>
              <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 px-6 py-4 border-b border-green-200/50 dark:border-green-800/30">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-10 w-10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                        หมวดหมู่รายได้
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {incomeCategories.length} หมวดหมู่
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {incomeCategories.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <TrendingUp className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        ยังไม่มีหมวดหมู่รายได้
                      </p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        เพิ่มหมวดหมู่รายได้เพื่อเริ่มต้นใช้งาน
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {incomeCategories.map((category) => (
                        <div key={category.id} className="group relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-between p-4 border border-green-200/50 dark:border-green-800/30 rounded-xl hover:border-green-300/70 dark:hover:border-green-700/50 transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className="w-5 h-5 rounded-lg flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: category.color }}
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">
                                  {category.name}
                                </p>
                                {category.description && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                    {category.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-green-100 dark:hover:bg-green-900/30"
                                    onClick={() => setEditCategory(category)}
                                  >
                                    <Edit className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border border-white/20 dark:border-slate-800/20">
                                  <DialogHeader>
                                    <DialogTitle className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                      แก้ไขหมวดหมู่
                                    </DialogTitle>
                                  </DialogHeader>
                                  <CategoryForm
                                    category={editCategory || undefined}
                                    onSuccess={handleSuccess}
                                  />
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border border-white/20 dark:border-slate-800/20">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-red-600 dark:text-red-400">
                                      ยืนยันการลบ
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ &quot;
                                      {category.name}&quot;
                                      การดำเนินการนี้จะส่งผลต่อรายการที่เชื่อมโยงอยู่
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      ยกเลิก
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteCategory(category.id)
                                      }
                                      className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      ลบ
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-rose-600/5 to-pink-600/5 rounded-2xl blur-xl"></div>
              <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 px-6 py-4 border-b border-red-200/50 dark:border-red-800/30">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-red-500 to-rose-500 h-10 w-10 rounded-xl flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                        หมวดหมู่รายจ่าย
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {expenseCategories.length} หมวดหมู่
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {expenseCategories.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <TrendingDown className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        ยังไม่มีหมวดหมู่รายจ่าย
                      </p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        เพิ่มหมวดหมู่รายจ่ายเพื่อเริ่มต้นใช้งาน
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {expenseCategories.map((category) => (
                        <div key={category.id} className="group relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-rose-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center justify-between p-4 border border-red-200/50 dark:border-red-800/30 rounded-xl hover:border-red-300/70 dark:hover:border-red-700/50 transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className="w-5 h-5 rounded-lg flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: category.color }}
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">
                                  {category.name}
                                </p>
                                {category.description && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                    {category.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                                    onClick={() => setEditCategory(category)}
                                  >
                                    <Edit className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border border-white/20 dark:border-slate-800/20">
                                  <DialogHeader>
                                    <DialogTitle className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                                      แก้ไขหมวดหมู่
                                    </DialogTitle>
                                  </DialogHeader>
                                  <CategoryForm
                                    category={editCategory || undefined}
                                    onSuccess={handleSuccess}
                                  />
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border border-white/20 dark:border-slate-800/20">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-red-600 dark:text-red-400">
                                      ยืนยันการลบ
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ &quot;
                                      {category.name}&quot;
                                      การดำเนินการนี้จะส่งผลต่อรายการที่เชื่อมโยงอยู่
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      ยกเลิก
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteCategory(category.id)
                                      }
                                      className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      ลบ
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-8">
            {/* Section Header */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-cyan-600/5 to-sky-600/5 rounded-2xl blur-xl"></div>
              <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-10 w-10 rounded-xl flex items-center justify-center">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      จัดการข้อมูล
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                      นำเข้าและส่งออกข้อมูลของคุณ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Export/Import Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Export Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-teal-600/5 rounded-2xl blur-xl"></div>
                <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 px-6 py-4 border-b border-emerald-200/50 dark:border-emerald-800/30">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-10 w-10 rounded-xl flex items-center justify-center">
                        <Download className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                          ส่งออกข้อมูล
                        </h3>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                          บันทึกข้อมูลเป็นไฟล์
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      ดาวน์โหลดข้อมูลทั้งหมดเป็นไฟล์ CSV หรือ JSON
                    </p>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300"
                        onClick={handleExportData}
                      >
                        <Download className="h-4 w-4 mr-2 text-emerald-600" />
                        ส่งออกเป็น CSV
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300"
                        onClick={handleExportData}
                      >
                        <Download className="h-4 w-4 mr-2 text-emerald-600" />
                        ส่งออกเป็น JSON
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Import Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-2xl blur-xl"></div>
                <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-800/20 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 px-6 py-4 border-b border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-10 w-10 rounded-xl flex items-center justify-center">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                          นำเข้าข้อมูล
                        </h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          อัพโหลดไฟล์จากแหล่งอื่น
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      อัพโหลดไฟล์ข้อมูลจากแหล่งอื่น
                    </p>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
                        onClick={handleImportData}
                      >
                        <Upload className="h-4 w-4 mr-2 text-blue-600" />
                        นำเข้าจาก CSV
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
                        onClick={handleImportData}
                      >
                        <Upload className="h-4 w-4 mr-2 text-blue-600" />
                        นำเข้าจาก Excel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
