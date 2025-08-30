import { grist } from "@/lib/grist";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== DASHBOARD STATS API CALLED ===");

    // Fetch data from all necessary tables
    const [transactions, categories, monthlySummaries] = await Promise.all([
      grist.fetchTable("Transactions").catch((err) => {
        console.error("Failed to fetch transactions:", err);
        return [];
      }),
      grist.fetchTable("Categories").catch((err) => {
        console.error("Failed to fetch categories:", err);
        return [];
      }),
      grist.fetchTable("Mouthly_Summary").catch((err) => {
        console.error("Failed to fetch monthly summaries:", err);
        return [];
      }),
    ]);

    console.log("Fetched raw data:", {
      transactionsCount: transactions?.length || 0,
      categoriesCount: categories?.length || 0,
      monthlySummariesCount: monthlySummaries?.length || 0,
      sampleTransaction: transactions?.[0],
      sampleSummary: monthlySummaries?.[0],
    });

    // Initialize default values
    let currentMonthIncome = 0;
    let currentMonthExpenses = 0;
    let currentMonthProfit = 0;
    let transactionCount = 0;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    console.log("Current year/month:", currentYear, currentMonth);

    // Function to convert Unix timestamp to Date
    const parseDate = (dateValue: string | number | null | undefined): Date | null => {
      if (!dateValue) return null;

      // If it's already a string date, try to parse it
      if (typeof dateValue === "string") {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      }

      // If it's a Unix timestamp (number)
      if (typeof dateValue === "number") {
        // Check if it's in seconds (typical Unix timestamp) or milliseconds
        const date =
          dateValue > 1000000000000
            ? new Date(dateValue) // Already in milliseconds
            : new Date(dateValue * 1000); // Convert from seconds to milliseconds

        return isNaN(date.getTime()) ? null : date;
      }

      return null;
    };

    // Calculate current month totals from transactions if available
    if (transactions && transactions.length > 0) {
      console.log("Processing transactions...");

      const currentMonthTransactions = transactions.filter((t) => {
        const transactionDate = parseDate(t.transaction_date);
        if (!transactionDate) {
          console.warn("Invalid transaction date:", t.transaction_date);
          return false;
        }

        const isCurrentMonth =
          transactionDate.getFullYear() === currentYear &&
          transactionDate.getMonth() + 1 === currentMonth;

        if (isCurrentMonth) {
          console.log("Found current month transaction:", {
            id: t._id || t.transaction_id,
            date: transactionDate,
            amount: t.amount,
            type: t.transaction_type,
          });
        }

        return isCurrentMonth;
      });

      console.log(
        "Current month transactions count:",
        currentMonthTransactions.length
      );

      // Calculate income (case-insensitive check)
      currentMonthIncome = currentMonthTransactions
        .filter((t) => {
          const type = (t.transaction_type || t.type || "").toLowerCase();
          return type === "income";
        })
        .reduce((sum, t) => {
          const amount = parseFloat(t.amount) || 0;
          console.log("Adding income:", amount);
          return sum + amount;
        }, 0);

      // Calculate expenses (case-insensitive check)
      currentMonthExpenses = currentMonthTransactions
        .filter((t) => {
          const type = (t.transaction_type || t.type || "").toLowerCase();
          return type === "expense";
        })
        .reduce((sum, t) => {
          const amount = parseFloat(t.amount) || 0;
          console.log("Adding expense:", amount);
          return sum + amount;
        }, 0);

      currentMonthProfit = currentMonthIncome - currentMonthExpenses;
      transactionCount = currentMonthTransactions.length;

      console.log("Calculated current month stats:", {
        income: currentMonthIncome,
        expenses: currentMonthExpenses,
        profit: currentMonthProfit,
        count: transactionCount,
      });
    }

    // If we have monthly summaries, try to get current month data from there too
    if (monthlySummaries && monthlySummaries.length > 0) {
      const currentSummary = monthlySummaries.find(
        (ms) =>
          parseInt(ms.year) === currentYear &&
          parseInt(ms.month) === currentMonth
      );

      if (currentSummary) {
        console.log("Found current month summary:", currentSummary);
        // Use summary data if available and transactions calculation is 0
        if (currentMonthIncome === 0 && currentMonthExpenses === 0) {
          currentMonthIncome = parseFloat(currentSummary.total_income) || 0;
          currentMonthExpenses = parseFloat(currentSummary.total_expense) || 0;
          currentMonthProfit = parseFloat(currentSummary.net_profit) || 0;
          transactionCount = parseInt(currentSummary.transaction_count) || 0;

          console.log("Using summary data:", {
            income: currentMonthIncome,
            expenses: currentMonthExpenses,
            profit: currentMonthProfit,
            count: transactionCount,
          });
        }
      }
    }

    // Get 6 months trend data (แก้ไขจาก 12 เดือนเป็น 6 เดือน)
    const trends = [];
    // แก้ไข monthNames ให้ครบ 12 เดือน
    const monthNames = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];

    // เปลี่ยนจาก 12 เป็น 6 เดือนย้อนหลัง
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      let monthIncome = 0;
      let monthExpenses = 0;
      let monthProfit = 0;

      // Try to get from monthly summary first
      const monthData = monthlySummaries?.find(
        (ms) => parseInt(ms.year) === year && parseInt(ms.month) === month
      );

      if (monthData) {
        monthIncome = parseFloat(monthData.total_income) || 0;
        monthExpenses = parseFloat(monthData.total_expense) || 0;
        monthProfit = parseFloat(monthData.net_profit) || 0;
      } else if (transactions && transactions.length > 0) {
        // Calculate from transactions if no monthly summary exists
        const monthTransactions = transactions.filter((t) => {
          const transactionDate = parseDate(t.transaction_date);
          return (
            transactionDate &&
            transactionDate.getFullYear() === year &&
            transactionDate.getMonth() + 1 === month
          );
        });

        monthIncome = monthTransactions
          .filter((t) => {
            const type = (t.transaction_type || t.type || "").toLowerCase();
            return type === "income";
          })
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        monthExpenses = monthTransactions
          .filter((t) => {
            const type = (t.transaction_type || t.type || "").toLowerCase();
            return type === "expense";
          })
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        monthProfit = monthIncome - monthExpenses;
      }

      trends.push({
        month: `${monthNames[month - 1]} ${year}`,
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthProfit,
      });
    }

    console.log("Final trends data:", trends);

    const responseData = {
      success: true,
      data: {
        income: currentMonthIncome,
        expenses: currentMonthExpenses,
        profit: currentMonthProfit,
        transactionCount: transactionCount,
        trends: trends,
      },
    };

    console.log("Final response data:", responseData);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("=== DASHBOARD STATS API ERROR ===");
    console.error("Full error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้",
        details: error instanceof Error ? error.message : "Unknown error",
        data: {
          income: 0,
          expenses: 0,
          profit: 0,
          transactionCount: 0,
          trends: [],
        },
      },
      { status: 500 }
    );
  }
}
