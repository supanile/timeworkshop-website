"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MobileSidebarTrigger } from "./Sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Moon, Sun, Bell, User, Calendar, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // อัปเดตทุก 1 วินาที
    return () => clearInterval(timer);
  }, []);

  // Dark mode toggle - ใช้ in-memory state แทน localStorage
  useEffect(() => {
    // ตรวจสอบ system preference เป็นค่าเริ่มต้น
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const formatCurrentDate = () => {
    return currentTime.toLocaleDateString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-slate-800/20 shadow-lg">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/20 to-teal-50/30 dark:from-blue-950/10 dark:via-purple-950/5 dark:to-teal-950/10"></div>

      <div className="relative flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Mobile menu + Title */}
        <div className="flex items-center gap-4">
          {/* Desktop sidebar toggle */}
          <SidebarTrigger className="hidden md:flex h-9 w-9 rounded-xl hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-300 group border-0 bg-transparent">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="sr-only">Toggle Sidebar</span>
          </SidebarTrigger>

          {/* Mobile sidebar trigger */}
          <MobileSidebarTrigger />

          {/* Brand section for mobile */}
          <div className="md:hidden">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 h-8 w-8 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TimeWorkshop
              </h1>
            </div>
          </div>

          {/* Desktop title section */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 dark:from-white dark:via-purple-100 dark:to-white bg-clip-text text-transparent">
                  Dashboard
                </h2>
                <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatCurrentDate()}</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                    <span className="font-mono">{currentTime.toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="relative h-9 w-9 rounded-xl hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-300 group"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative transition-transform duration-300 group-hover:scale-110">
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </div>
            <span className="sr-only">เปลี่ยนธีม</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-xl hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-300 group"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform duration-300 group-hover:scale-110" />
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
            <span className="sr-only">การแจ้งเตือน</span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-xl hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-300 group"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Avatar className="relative h-7 w-7 transition-transform duration-300 group-hover:scale-110">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-slate-800/20 shadow-xl rounded-xl"
            >
              {/* User info section */}
              <div className="px-3 py-2 border-b border-white/10 dark:border-slate-800/10">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold">
                      TW
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      TimeWorkshop User
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      admin@timeworkshop.com
                    </p>
                  </div>
                </div>
              </div>

              <DropdownMenuItem className="focus:bg-indigo-50 dark:focus:bg-indigo-950/20 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>โปรไฟล์</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="focus:bg-blue-50 dark:focus:bg-blue-950/20 cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                <span>การแจ้งเตือน</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="focus:bg-purple-50 dark:focus:bg-purple-950/20 cursor-pointer">
                <Sparkles className="mr-2 h-4 w-4" />
                <span>ตั้งค่า</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer text-red-600 dark:text-red-400">
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
    </header>
  );
}