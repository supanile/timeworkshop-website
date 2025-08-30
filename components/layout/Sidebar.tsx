"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Sparkles,
  PieChart,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "ภาพรวมทั้งหมด",
    gradient: "from-blue-500 to-indigo-600",
    bgGradient:
      "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
  },
  {
    name: "รายได้",
    href: "/income",
    icon: TrendingUp,
    description: "จัดการรายได้",
    gradient: "from-green-500 to-emerald-600",
    bgGradient:
      "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
  },
  {
    name: "รายจ่าย",
    href: "/expenses",
    icon: TrendingDown,
    description: "จัดการรายจ่าย",
    gradient: "from-red-500 to-rose-600",
    bgGradient:
      "from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20",
  },
  {
    name: "รายงาน",
    href: "/reports",
    icon: BarChart3,
    description: "รายงานและสถิติ",
    gradient: "from-purple-500 to-violet-600",
    bgGradient:
      "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
  },
  {
    name: "ตั้งค่า",
    href: "/settings",
    icon: Settings,
    description: "ตั้งค่าระบบ",
    gradient: "from-gray-500 to-slate-600",
    bgGradient:
      "from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Modern background with glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20" />

      <div className="relative backdrop-blur-sm h-full flex flex-col">
        <SidebarHeader
          className={cn(
            "border-b border-white/10 transition-all duration-300",
            open ? "p-4" : "p-2"
          )}
        >
          <div className="relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-lg" />

            <div
              className={cn(
                "relative flex items-center transition-all duration-300",
                open ? "space-x-3" : "justify-center"
              )}
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 h-10 w-10 rounded-xl flex items-center justify-center shadow-xl shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div
                className={cn(
                  "transition-all duration-300 overflow-hidden",
                  open ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
                )}
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent whitespace-nowrap">
                  TimeWorkshop
                </h1>
                <p className="text-xs text-gray-400 whitespace-nowrap">
                  Financial Dashboard
                </p>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent
          className={cn(
            "flex-1 transition-all duration-300",
            open ? "px-3 py-6" : "px-2 py-6"
          )}
        >
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu
                className={cn(
                  "transition-all duration-300",
                  open ? "space-y-2" : "space-y-3"
                )}
              >
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "group relative rounded-xl transition-all duration-300 transform hover:scale-105",
                          open ? "p-3 h-auto" : "p-2 size-12 justify-center",
                          isActive && "scale-105"
                        )}
                        tooltip={!open ? item.name : undefined}
                      >
                        <Link href={item.href}>
                          {/* Active background */}
                          {isActive && (
                            <>
                              <div
                                className={cn(
                                  "absolute inset-0 rounded-xl opacity-20",
                                  `bg-gradient-to-r ${item.gradient}`
                                )}
                              />
                              <div
                                className={cn(
                                  "absolute inset-0 rounded-xl blur-xl opacity-30",
                                  `bg-gradient-to-r ${item.gradient}`
                                )}
                              />
                            </>
                          )}

                          {/* Hover background */}
                          {!isActive && (
                            <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          )}

                          <div
                            className={cn(
                              "relative flex items-center w-full transition-all duration-300",
                              open ? "space-x-3" : "justify-center"
                            )}
                          >
                            {/* Icon */}
                            <div
                              className={cn(
                                "rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center",
                                open ? "p-2" : "p-1.5",
                                isActive
                                  ? `bg-gradient-to-br ${item.gradient} shadow-lg`
                                  : "bg-white/10 group-hover:bg-white/20"
                              )}
                            >
                              <Icon
                                className={cn(
                                  "transition-all duration-300",
                                  open ? "h-5 w-5" : "h-4 w-4",
                                  isActive
                                    ? "text-white"
                                    : "text-gray-300 group-hover:text-white"
                                )}
                              />
                            </div>

                            {/* Content */}
                            <div
                              className={cn(
                                "flex-1 min-w-0 transition-all duration-300 overflow-hidden",
                                open
                                  ? "opacity-100 max-w-xs"
                                  : "opacity-0 max-w-0"
                              )}
                            >
                              <p
                                className={cn(
                                  "font-semibold transition-colors duration-300 text-sm whitespace-nowrap",
                                  isActive
                                    ? "text-white"
                                    : "text-gray-300 group-hover:text-white"
                                )}
                              >
                                {item.name}
                              </p>
                              <p
                                className={cn(
                                  "text-xs transition-colors duration-300 whitespace-nowrap",
                                  isActive
                                    ? "text-gray-200"
                                    : "text-gray-500 group-hover:text-gray-300"
                                )}
                              >
                                {item.description}
                              </p>
                            </div>

                            {/* Active indicator */}
                            {isActive && open && (
                              <div
                                className={cn(
                                  "w-1 h-8 rounded-full shrink-0",
                                  `bg-gradient-to-b ${item.gradient}`
                                )}
                              />
                            )}
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter
          className={cn(
            "transition-all duration-300",
            open ? "p-4 space-y-4" : "p-2 space-y-2"
          )}
        >
          {/* Stats section */}
          <div
            className={cn(
              "bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl border border-white/10 transition-all duration-300 overflow-hidden",
              open ? "p-4 opacity-100 max-h-32" : "opacity-0 max-h-0 p-0"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">สถิติรวม</h3>
              <PieChart className="h-4 w-4 text-gray-300" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">รายการทั้งหมด</span>
                <span className="text-xs font-semibold text-white">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">เดือนนี้</span>
                <span className="text-xs font-semibold text-green-400">
                  +23
                </span>
              </div>
            </div>
          </div>

          {/* User Avatar */}
          <div
            className={cn(
              "bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-lg border border-white/10 transition-all duration-300",
              open ? "p-3" : "p-2"
            )}
          >
            <div
              className={cn(
                "flex items-center transition-all duration-300",
                open ? "space-x-3" : "justify-center"
              )}
            >
              <div
                className={cn(
                  "transition-all duration-300 overflow-hidden",
                  open ? "opacity-100 max-w-xs" : "opacity-0 max-w-0"
                )}
              >
                <p className="text-xs text-gray-400 mb-1 whitespace-nowrap">
                  © 2025 TimeWorkshop
                </p>
                <p className="text-xs text-gray-500 mb-2 whitespace-nowrap">
                  Version 1.0.0
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400 font-medium whitespace-nowrap">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SidebarFooter>

        {/* Decorative elements */}
        <div className="absolute top-20 right-4 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-4 w-12 h-12 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-lg" />
      </div>
    </Sidebar>
  );
}

// Mobile Sidebar Trigger Component
export function MobileSidebarTrigger() {
  return (
    <SidebarTrigger className="md:hidden h-9 w-9 rounded-xl hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-300 group">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="sr-only">เปิดเมนู</span>
    </SidebarTrigger>
  );
}
