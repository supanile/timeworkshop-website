import { grist } from "@/lib/grist";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const monthlySummaries = await grist.fetchTable("Mouthly_Summary");

    if (!monthlySummaries || monthlySummaries.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Transform the data to match the expected format
    const transformedSummaries = monthlySummaries.map((summary) => ({
      _id: summary.id,
      summary_id: summary.summary_id,
      year: summary.year,
      month: summary.month,
      total_income: summary.total_income || 0,
      total_expense: summary.total_expense || 0,
      net_profit: summary.net_profit || 0,
      transaction_count: summary.transaction_count || 0,
      created_date: summary.created_date,
    }));

    return NextResponse.json(transformedSummaries, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch monthly summaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly summaries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.GRIST_API_KEY) {
      console.error("Grist API Key not configured");
      return NextResponse.json(
        {
          error:
            "Grist API configuration missing. Please set GRIST_API_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log("Received monthly summary data:", body);

    // Validate required fields
    const requiredFields = ["year", "month"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate month (1-12)
    const month = parseInt(body.month);
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Month must be between 1 and 12" },
        { status: 400 }
      );
    }

    // Validate year
    const year = parseInt(body.year);
    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 10) {
      return NextResponse.json(
        { error: `Year must be between 2000 and ${currentYear + 10}` },
        { status: 400 }
      );
    }

    // Calculate net profit
    const totalIncome = body.total_income ? parseFloat(body.total_income) : 0;
    const totalExpense = body.total_expense
      ? parseFloat(body.total_expense)
      : 0;
    const netProfit = totalIncome - totalExpense;

    // Prepare data for Grist
    const summaryData = {
      year: year,
      month: month,
      total_income: totalIncome,
      total_expense: totalExpense,
      net_profit: netProfit,
      transaction_count: body.transaction_count
        ? parseInt(body.transaction_count)
        : 0,
      created_date: new Date().toISOString(),
    };

    console.log("Prepared monthly summary data for Grist:", summaryData);

    const result = await grist.addRecords("Mouthly_Summary", [summaryData]);
    console.log("Grist response:", result);

    return NextResponse.json(
      { message: "Monthly summary added successfully", data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add monthly summary - Full error:", error);

    let errorMessage = "Failed to add monthly summary";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: "Failed to add monthly summary", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Summary ID is required for update" },
        { status: 400 }
      );
    }

    // Validate month if provided
    if (updateData.month) {
      const month = parseInt(updateData.month);
      if (month < 1 || month > 12) {
        return NextResponse.json(
          { error: "Month must be between 1 and 12" },
          { status: 400 }
        );
      }
    }

    // Validate year if provided
    if (updateData.year) {
      const year = parseInt(updateData.year);
      const currentYear = new Date().getFullYear();
      if (year < 2000 || year > currentYear + 10) {
        return NextResponse.json(
          { error: `Year must be between 2000 and ${currentYear + 10}` },
          { status: 400 }
        );
      }
    }

    // Parse numeric fields if provided
    const finalUpdateData = { ...updateData };

    if (finalUpdateData.year) {
      finalUpdateData.year = parseInt(finalUpdateData.year);
    }
    if (finalUpdateData.month) {
      finalUpdateData.month = parseInt(finalUpdateData.month);
    }
    if (finalUpdateData.total_income !== undefined) {
      finalUpdateData.total_income = parseFloat(finalUpdateData.total_income);
    }
    if (finalUpdateData.total_expense !== undefined) {
      finalUpdateData.total_expense = parseFloat(finalUpdateData.total_expense);
    }
    if (finalUpdateData.transaction_count !== undefined) {
      finalUpdateData.transaction_count = parseInt(
        finalUpdateData.transaction_count
      );
    }

    // Recalculate net profit if income or expense is being updated
    if (
      finalUpdateData.total_income !== undefined ||
      finalUpdateData.total_expense !== undefined
    ) {
      // Get current summary data to calculate net profit
      try {
        const summaries = await grist.fetchTable("Mouthly_Summary");
        const currentSummary = summaries.find((s) => s.id === id);

        if (currentSummary) {
          const totalIncome =
            finalUpdateData.total_income !== undefined
              ? finalUpdateData.total_income
              : currentSummary.total_income || 0;
          const totalExpense =
            finalUpdateData.total_expense !== undefined
              ? finalUpdateData.total_expense
              : currentSummary.total_expense || 0;

          finalUpdateData.net_profit = totalIncome - totalExpense;
        }
      } catch (error) {
        console.warn(
          "Could not fetch current summary for net profit calculation:",
          error
        );
      }
    }

    console.log("Final update data:", finalUpdateData);

    const result = await grist.updateRecords("Mouthly_Summary", [
      { id, ...finalUpdateData },
    ]);

    return NextResponse.json(
      { message: "Monthly summary updated successfully", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update monthly summary:", error);
    return NextResponse.json(
      {
        error: "Failed to update monthly summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    console.log("=== DELETE MONTHLY SUMMARY API CALLED ===");
    console.log("Summary ID:", id);

    if (!id) {
      console.error("No summary ID provided");
      return NextResponse.json(
        { error: "Summary ID is required for deletion" },
        { status: 400 }
      );
    }

    if (!process.env.GRIST_API_KEY) {
      console.error("Grist API Key not configured");
      return NextResponse.json(
        { error: "Grist API configuration missing" },
        { status: 500 }
      );
    }

    // Verify summary exists before deletion
    try {
      console.log(`Checking if summary ${id} exists...`);
      const summaries = await grist.fetchTable("Mouthly_Summary");
      const summaryExists = summaries.find((s) => String(s.id) === String(id));

      if (!summaryExists) {
        console.log(`Summary ${id} not found in database`);
        return NextResponse.json(
          {
            error: "Summary not found",
            details: "The summary doesn't exist in the database",
          },
          { status: 404 }
        );
      }

      console.log(
        `Summary ${id} found for ${summaryExists.year}/${summaryExists.month}`
      );
    } catch (fetchError) {
      console.error("Failed to verify summary existence:", fetchError);
    }

    // Delete the summary
    console.log(`Attempting to delete summary ${id} from Grist...`);
    const result = await grist.deleteRecords("Mouthly_Summary", [parseInt(id)]);

    console.log("Delete operation successful:", result);

    return NextResponse.json(
      {
        message: "Monthly summary deleted successfully",
        deletedId: id,
        success: true,
        data: result,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ DELETE MONTHLY SUMMARY API Error:", error);

    let errorMessage = "Failed to delete monthly summary";
    let statusCode = 500;

    if (error instanceof Error) {
      if (
        error.message.includes("404") ||
        error.message.includes("not found")
      ) {
        errorMessage = "Monthly summary not found or already deleted";
        statusCode = 404;
      } else if (
        error.message.includes("403") ||
        error.message.includes("permission")
      ) {
        errorMessage = "Permission denied - insufficient privileges";
        statusCode = 403;
      } else if (
        error.message.includes("400") ||
        error.message.includes("invalid")
      ) {
        errorMessage = "Invalid summary ID format";
        statusCode = 400;
      } else if (
        error.message.includes("network") ||
        error.message.includes("connection")
      ) {
        errorMessage = "Network connection failed";
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
        summaryId: new URL(request.url).searchParams.get("id"),
        success: false,
        timestamp: new Date().toISOString(),
      },
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}