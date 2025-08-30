"use client";

import { useState } from "react";
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
import { 
  Tags, 
  TrendingUp, 
  TrendingDown, 
  Palette, 
  FileText, 
  Save, 
  X, 
  Sparkles,
  Eye 
} from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อหมวดหมู่"),
  type: z.enum(["income", "expense"], {
    error: "กรุณาเลือกประเภท",
  }),
  color: z.string().min(1, "กรุณาเลือกสี"),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  id?: string;
  name: string;
  type: "income" | "expense";
  color: string;
  description?: string;
}

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const predefinedColors = [
  { name: "เขียวมรกต", value: "#10B981", gradient: "from-emerald-500 to-green-600" },
  { name: "ฟ้าใส", value: "#06B6D4", gradient: "from-cyan-500 to-blue-600" },
  { name: "แดงสด", value: "#EF4444", gradient: "from-red-500 to-rose-600" },
  { name: "เหลืองทอง", value: "#F59E0B", gradient: "from-amber-500 to-yellow-600" },
  { name: "ม่วงลาเวนเดอร์", value: "#8B5CF6", gradient: "from-violet-500 to-purple-600" },
  { name: "ชมพูหวาน", value: "#EC4899", gradient: "from-pink-500 to-rose-600" },
  { name: "ส้มสด", value: "#F97316", gradient: "from-orange-500 to-red-600" },
  { name: "น้ำเงินรอยัล", value: "#3B82F6", gradient: "from-blue-500 to-indigo-600" },
  { name: "เทาสเลท", value: "#6B7280", gradient: "from-gray-500 to-slate-600" },
  { name: "น้ำตาลทอง", value: "#A16207", gradient: "from-yellow-700 to-amber-800" },
];

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useSonner();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || "income",
      color: category?.color || "#10B981",
      description: category?.description || "",
    },
  });

  const selectedColor = form.watch("color");
  const selectedType = form.watch("type");
  const selectedName = form.watch("name");

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);

      const url = category
        ? `/api/categories/${category.id}`
        : "/api/categories";

      const method = category ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: category
            ? "แก้ไขหมวดหมู่เรียบร้อย"
            : "เพิ่มหมวดหมู่เรียบร้อย",
          variant: "success",
        });

        if (onSuccess) onSuccess();

        if (!category) {
          form.reset();
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      let errorMessage = "เกิดข้อผิดพลาด";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "ข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getColorInfo = (colorValue: string) => {
    return predefinedColors.find(c => c.value === colorValue) || 
           { name: "สีกำหนดเอง", value: colorValue, gradient: "from-gray-500 to-slate-600" };
  };

  return (
    <div className="relative group">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Main glass card */}
      <div className="relative backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-800/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 dark:border-slate-800/10">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 via-purple-50/20 to-pink-50/30 dark:from-indigo-950/10 dark:via-purple-950/5 dark:to-pink-950/10 rounded-t-2xl"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Tags className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-100 dark:to-white bg-clip-text text-transparent">
                  {category ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {category ? "แก้ไขข้อมูลหมวดหมู่" : "สร้างหมวดหมู่ใหม่สำหรับจัดระเบียบรายการ"}
                </p>
              </div>
            </div>
            
            {/* Live preview badge */}
            {selectedName && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/20">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: selectedColor }}
                ></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {selectedName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({selectedType === "income" ? "รายได้" : "รายจ่าย"})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <Sparkles className="h-4 w-4" />
                      <span>ชื่อหมวดหมู่ *</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="เช่น เงินเดือน, อาหาร, ค่าเดินทาง"
                          className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 h-12 text-base"
                          {...field}
                        />
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 pointer-events-none"></div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <Tags className="h-4 w-4" />
                      <span>ประเภท *</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 h-12">
                          <SelectValue placeholder="เลือกประเภท" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/20 dark:border-slate-800/20">
                        <SelectItem value="income" className="focus:bg-green-50 dark:focus:bg-green-950/20">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span>รายได้</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="expense" className="focus:bg-red-50 dark:focus:bg-red-950/20">
                          <div className="flex items-center space-x-2">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <span>รายจ่าย</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <Palette className="h-4 w-4" />
                      <span>สี *</span>
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Color preview and custom picker */}
                        <div className="flex items-center space-x-4 p-4 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-white/20 dark:border-slate-700/20">
                          <div
                            className="w-16 h-16 rounded-xl shadow-lg border-4 border-white dark:border-slate-800 transition-all duration-300 hover:scale-105"
                            style={{ backgroundColor: selectedColor }}
                          ></div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {getColorInfo(selectedColor).name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                              {selectedColor.toUpperCase()}
                            </p>
                            <Input
                              type="color"
                              className="w-20 h-8 mt-2 p-0 border-2 border-white dark:border-slate-700 rounded-lg cursor-pointer"
                              {...field}
                            />
                          </div>
                        </div>

                        {/* Predefined color palette */}
                        <div className="grid grid-cols-5 gap-3">
                          {predefinedColors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`relative w-12 h-12 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                                selectedColor === color.value
                                  ? "ring-4 ring-slate-400 dark:ring-slate-500 scale-110"
                                  : "hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600"
                              }`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => field.onChange(color.value)}
                              title={color.name}
                            >
                              {selectedColor === color.value && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <FileText className="h-4 w-4" />
                      <span>คำอธิบาย</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
                          className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 transition-all duration-300 resize-none min-h-[100px]"
                          rows={4}
                          {...field}
                        />
                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 pointer-events-none"></div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview Section */}
              <div className="relative p-6 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/30 dark:to-slate-900/30 rounded-xl border border-white/20 dark:border-slate-700/20">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-50/20 via-purple-50/10 to-pink-50/20 dark:from-indigo-950/10 dark:via-purple-950/5 dark:to-pink-950/10"></div>
                
                <div className="relative">
                  <div className="flex items-center space-x-2 mb-3">
                    <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">ตัวอย่าง:</p>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/30 dark:border-slate-700/30">
                    <div
                      className="w-6 h-6 rounded-full shadow-lg transition-all duration-300"
                      style={{ backgroundColor: selectedColor }}
                    ></div>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedName || "ชื่อหมวดหมู่"}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          selectedType === "income"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        }`}>
                          {selectedType === "income" ? "รายได้" : "รายจ่าย"}
                        </span>
                        {selectedType === "income" ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t border-white/10 dark:border-slate-800/10">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>กำลังบันทึก...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>{category ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}</span>
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
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-lg"></div>
      </div>
    </div>
  );
}