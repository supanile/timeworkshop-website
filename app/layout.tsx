import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const kanit = Prompt({ 
  subsets: ["latin", "thai"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-kanit"
});

export const metadata: Metadata = {
  title: "TimeWorkshop Dashboard",
  description: "ระบบจัดการรายได้-รายจ่ายสำหรับธุรกิจ",
  keywords: ["dashboard", "finance", "income", "expense", "management"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${kanit.variable} ${kanit.className}`}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <div className="container mx-auto p-4 md:p-6">{children}</div>
            </main>
          </SidebarInset>
        </SidebarProvider>

        {/* Toast notifications */}
        <Toaster />
      </body>
    </html>
  );
}