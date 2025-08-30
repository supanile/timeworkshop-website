"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSonner } from "@/hooks/use-sonner";
import { format } from "date-fns";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Save,
  X,
  CalendarDays,
  FileText,
  Tags,
  Sparkles,
  CreditCard,
  Hash,
  DollarSign,
} from "lucide-react";

const transactionSchema = z.object({
  description: z.string().min(1, "กรุณากรอกรายละเอียด"),
  amount: z.string().min(1, "กรุณากรอกจำนวนเงิน"),
  category_name: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  transaction_date: z.string().min(1, "กรุณาเลือกวันที่"),
  payment_method: z.string().min(1, "กรุณาเลือกวิธีการชำระเงิน"),
  quantity: z.string().min(1, "กรุณากรอกจำนวน"),
  unit_price: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().min(1, "กรุณาเลือกสถานะ"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

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

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultType?: "income" | "expense";
}

const paymentMethods = [
  { value: "เงินสด", label: "เงินสด" },
  { value: "โอน", label: "โอนเงิน" },
  { value: "บัตรเครดิต", label: "บัตรเครดิต" },
  { value: "กระเป๋าเงินดิจิทัล", label: "กระเป๋าเงินดิจิทัล" },
];

const statusOptions = [
  { value: "รอดำเนินการ", label: "รอดำเนินการ" },
  { value: "สำเร็จ", label: "สำเร็จ" },
  { value: "ยกเลิก", label: "ยกเลิก" },
];

export function TransactionForm({
  transaction,
  onSuccess,
  onCancel,
  defaultType = "expense",
}: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast } = useSonner();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: transaction?.description || "",
      amount: transaction?.amount?.toString() || "",
      category_name: transaction?.category_id?.toString() || "",
      transaction_date: transaction?.transaction_date
        ? format(new Date(transaction.transaction_date * 1000), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      payment_method: transaction?.payment_method || "เงินสด",
      quantity: transaction?.quantity?.toString() || "1",
      unit_price: transaction?.unit_price?.toString() || "",
      notes: transaction?.notes || "",
      status: transaction?.status || "สำเร็จ",
    },
  });

  const watchedAmount = form.watch("amount");
  const watchedQuantity = form.watch("quantity");
  const [selectedCategoryType, setSelectedCategoryType] = useState<
    "income" | "expense"
  >(defaultType);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Auto-calculate unit_price when amount or quantity changes
    const amount = parseFloat(watchedAmount || "0");
    const quantity = parseInt(watchedQuantity || "1");
    if (amount > 0 && quantity > 0) {
      const unitPrice = (amount / quantity).toFixed(2);
      form.setValue("unit_price", unitPrice);
    }
  }, [watchedAmount, watchedQuantity, form]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);

        // If editing transaction, set the category type based on the selected category
        if (transaction && transaction.category_id) {
          const selectedCategory = result.data.find(
            (cat: Category) => cat.id === transaction.category_id
          );
          if (selectedCategory) {
            setSelectedCategoryType(selectedCategory.type);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถโหลดหมวดหมู่ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsLoading(true);

      // Convert date to Unix timestamp
      const dateTimestamp = Math.floor(
        new Date(data.transaction_date).getTime() / 1000
      );

      // หาหมวดหมู่ที่เลือกเพื่อกำหนดประเภท
      const selectedCategory = categories.find(
        (cat) => cat.id === data.category_name
      );
      const transactionType = selectedCategory
        ? selectedCategory.type
        : selectedCategoryType;

      const payload = {
        description: data.description,
        amount: parseFloat(data.amount),
        category_name: data.category_name, // This is the category ID
        transaction_date: dateTimestamp,
        payment_method: data.payment_method,
        quantity: parseInt(data.quantity),
        unit_price: data.unit_price
          ? parseFloat(data.unit_price)
          : parseFloat(data.amount),
        notes: data.notes || "",
        status: data.status,
        created_by: "admin",
        // เพิ่มบรรทัดนี้
        transaction_type: transactionType, // เพิ่ม transaction_type
      };

      const url = transaction ? `/api/transactions` : "/api/transactions";

      const method = transaction ? "PUT" : "POST";

      // If updating, include the ID
      if (transaction) {
        payload.id = transaction.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success || response.ok) {
        toast({
          title: "สำเร็จ",
          description: transaction
            ? "แก้ไขรายการเรียบร้อย"
            : "เพิ่มรายการเรียบร้อย",
          variant: "success",
        });

        if (onSuccess) onSuccess();

        if (!transaction) {
          form.reset();
        }
      } else {
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (error: unknown) {
      console.error("Transaction error:", error);
      toast({
        title: "ข้อผิดพลาด",
        description:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาด",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find((cat) => cat.id === categoryId);
    if (selectedCategory) {
      setSelectedCategoryType(selectedCategory.type);
    }
    form.setValue("category_name", categoryId);
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === selectedCategoryType
  );

  const formatPreviewAmount = (amount: string) => {
    const num = parseFloat(amount || "0");
    return isNaN(num) ? "0" : num.toLocaleString();
  };

  return (
    <div className="relative group">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-indigo-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Main glass card */}
      <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 dark:border-slate-800/10">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/30 via-pink-50/20 to-indigo-50/30 dark:from-purple-950/10 dark:via-pink-950/5 dark:to-indigo-950/10 rounded-t-2xl"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-white dark:via-purple-100 dark:to-white bg-clip-text text-transparent">
                  {transaction ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {transaction ? "แก้ไขข้อมูลรายการ" : "สร้างรายการธุรกรรมใหม่"}
                </p>
              </div>
            </div>

            {/* Live preview */}
            {watchedAmount && (
              <div
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  selectedCategoryType === "income"
                    ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300"
                }`}
              >
                {selectedCategoryType === "income" ? "+" : "-"}฿
                {formatPreviewAmount(watchedAmount)}
              </div>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <FileText className="h-4 w-4" />
                      <span>รายละเอียด *</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="เช่น เงินเดือน, ค่าอาหาร, ค่าเดินทาง"
                          className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 h-12 text-base"
                          {...field}
                        />
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 pointer-events-none"></div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Type Selector */}
              <div className="space-y-4">
                <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Tags className="h-4 w-4" />
                  <span>ประเภท *</span>
                </FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryType("income");
                      form.setValue("category_name", "");
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedCategoryType === "income"
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <TrendingUp
                        className={`h-5 w-5 ${
                          selectedCategoryType === "income"
                            ? "text-green-600"
                            : "text-slate-500"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          selectedCategoryType === "income"
                            ? "text-green-700 dark:text-green-300"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        รายได้
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryType("expense");
                      form.setValue("category_name", "");
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedCategoryType === "expense"
                        ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                        : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:border-red-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <TrendingDown
                        className={`h-5 w-5 ${
                          selectedCategoryType === "expense"
                            ? "text-red-600"
                            : "text-slate-500"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          selectedCategoryType === "expense"
                            ? "text-red-700 dark:text-red-300"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        รายจ่าย
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount and Quantity Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <DollarSign className="h-4 w-4" />
                        <span>จำนวนเงินรวม (บาท) *</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 h-12 text-base font-mono pl-8"
                            {...field}
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none font-mono">
                            ฿
                          </div>
                          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quantity */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <Hash className="h-4 w-4" />
                        <span>จำนวน *</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="1"
                            min="1"
                            className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 h-12 text-base"
                            {...field}
                          />
                          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 pointer-events-none"></div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Unit Price (Auto-calculated) */}
              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <Wallet className="h-4 w-4" />
                      <span>ราคาต่อหน่วย (บาท)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 h-12 text-base font-mono pl-8"
                          readOnly
                          {...field}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none font-mono">
                          ฿
                        </div>
                      </div>
                    </FormControl>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      คำนวดอัตโนมัติจากจำนวนเงินรวม ÷ จำนวน
                    </p>
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <Sparkles className="h-4 w-4" />
                      <span>หมวดหมู่ *</span>
                    </FormLabel>
                    <Select
                      onValueChange={handleCategoryChange}
                      value={field.value}
                      disabled={isLoadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 h-12">
                          <SelectValue
                            placeholder={
                              isLoadingCategories
                                ? "กำลังโหลด..."
                                : filteredCategories.length === 0
                                ? `ไม่มีหมวดหมู่${
                                    selectedCategoryType === "income"
                                      ? "รายได้"
                                      : "รายจ่าย"
                                  }`
                                : "เลือกหมวดหมู่"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/20 dark:border-slate-800/20">
                        {filteredCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                            className="focus:bg-slate-50 dark:focus:bg-slate-800/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: category.color }}
                              />
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="transaction_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <CalendarDays className="h-4 w-4" />
                      <span>วันที่ *</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 h-12"
                          {...field}
                        />
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 pointer-events-none"></div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <CreditCard className="h-4 w-4" />
                      <span>วิธีการชำระเงิน *</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 h-12">
                          <SelectValue placeholder="เลือกวิธีการชำระเงิน" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/20 dark:border-slate-800/20">
                        {paymentMethods.map((method) => (
                          <SelectItem
                            key={method.value}
                            value={method.value}
                            className="focus:bg-slate-50 dark:focus:bg-slate-800/50"
                          >
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <Tags className="h-4 w-4" />
                      <span>สถานะ *</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 h-12">
                          <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/20 dark:border-slate-800/20">
                        {statusOptions.map((status) => (
                          <SelectItem
                            key={status.value}
                            value={status.value}
                            className="focus:bg-slate-50 dark:focus:bg-slate-800/50"
                          >
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <FileText className="h-4 w-4" />
                      <span>หมายเหตุ</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                          className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 resize-none min-h-[100px]"
                          rows={4}
                          {...field}
                        />
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 pointer-events-none"></div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t border-white/10 dark:border-slate-800/10">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>กำลังบันทึก...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>
                        {transaction ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
                      </span>
                    </div>
                  )}
                </Button>

                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 h-12 rounded-xl transition-all duration-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    ยกเลิก
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-lg"></div>
      </div>
    </div>
  );
}
