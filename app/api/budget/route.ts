import { grist } from "@/lib/grist";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const budgets = await grist.fetchTable("Budget");

    if (!budgets || budgets.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Transform the data to match the expected format
    const transformedBudgets = budgets.map((budget) => ({
      _id: budget.id,
      budget_id: budget.budget_id,
      category_id: budget.category_id,
      year: budget.year,
      month: budget.month,
      planned_amount: budget.planned_amount,
      actual_amount: budget.actual_amount || 0,
      variance: budget.variance || 0,
      variance_percentage: budget.variance_percentage || 0,
    }));

    return NextResponse.json(transformedBudgets, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
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
    console.log("Received budget data:", body);

    // Validate required fields
    const requiredFields = ["category_id", "year", "month", "planned_amount"];
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
    const year = parseFloat(body.year);
    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 10) {
      return NextResponse.json(
        { error: `Year must be between 2000 and ${currentYear + 10}` },
        { status: 400 }
      );
    }

    // Calculate variance if actual_amount is provided
    const plannedAmount = parseFloat(body.planned_amount);
    const actualAmount = body.actual_amount
      ? parseFloat(body.actual_amount)
      : 0;
    const variance = actualAmount - plannedAmount;
    const variancePercentage =
      plannedAmount > 0 ? (variance / plannedAmount) * 100 : 0;

    // Prepare data for Grist
    const budgetData = {
      category_id: parseInt(body.category_id),
      year: year,
      month: month,
      planned_amount: plannedAmount,
      actual_amount: actualAmount,
      variance: variance,
      variance_percentage: parseFloat(variancePercentage.toFixed(2)),
    };

    console.log("Prepared budget data for Grist:", budgetData);

    const result = await grist.addRecords("Budget", [budgetData]);
    console.log("Grist response:", result);

    return NextResponse.json(
      { message: "Budget added successfully", data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add budget - Full error:", error);

    let errorMessage = "Failed to add budget";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: "Failed to add budget", details: errorMessage },
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
        { error: "Budget ID is required for update" },
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
      const year = parseFloat(updateData.year);
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

    if (finalUpdateData.category_id) {
      finalUpdateData.category_id = parseInt(finalUpdateData.category_id);
    }
    if (finalUpdateData.year) {
      finalUpdateData.year = parseFloat(finalUpdateData.year);
    }
    if (finalUpdateData.month) {
      finalUpdateData.month = parseInt(finalUpdateData.month);
    }
    if (finalUpdateData.planned_amount !== undefined) {
      finalUpdateData.planned_amount = parseFloat(
        finalUpdateData.planned_amount
      );
    }
    if (finalUpdateData.actual_amount !== undefined) {
      finalUpdateData.actual_amount = parseFloat(finalUpdateData.actual_amount);
    }

    // Recalculate variance if planned_amount or actual_amount is being updated
    if (
      finalUpdateData.planned_amount !== undefined ||
      finalUpdateData.actual_amount !== undefined
    ) {
      // Get current budget data to calculate variance
      try {
        const budgets = await grist.fetchTable("Budget");
        const currentBudget = budgets.find((b) => b.id === id);

        if (currentBudget) {
          const plannedAmount =
            finalUpdateData.planned_amount !== undefined
              ? finalUpdateData.planned_amount
              : currentBudget.planned_amount;
          const actualAmount =
            finalUpdateData.actual_amount !== undefined
              ? finalUpdateData.actual_amount
              : currentBudget.actual_amount || 0;

          const variance = actualAmount - plannedAmount;
          const variancePercentage =
            plannedAmount > 0 ? (variance / plannedAmount) * 100 : 0;

          finalUpdateData.variance = variance;
          finalUpdateData.variance_percentage = parseFloat(
            variancePercentage.toFixed(2)
          );
        }
      } catch (error) {
        console.warn(
          "Could not fetch current budget for variance calculation:",
          error
        );
      }
    }

    console.log("Final update data:", finalUpdateData);

    const result = await grist.updateRecords("Budget", [
      { id, ...finalUpdateData },
    ]);

    return NextResponse.json(
      { message: "Budget updated successfully", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update budget:", error);
    return NextResponse.json(
      {
        error: "Failed to update budget",
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

    console.log("=== DELETE BUDGET API CALLED ===");
    console.log("Budget ID:", id);

    if (!id) {
      console.error("No budget ID provided");
      return NextResponse.json(
        { error: "Budget ID is required for deletion" },
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

    // Verify budget exists before deletion
    try {
      console.log(`Checking if budget ${id} exists...`);
      const budgets = await grist.fetchTable("Budget");
      const budgetExists = budgets.find((b) => String(b.id) === String(id));

      if (!budgetExists) {
        console.log(`Budget ${id} not found in database`);
        return NextResponse.json(
          {
            error: "Budget not found",
            details: "The budget doesn't exist in the database",
          },
          { status: 404 }
        );
      }

      console.log(`Budget ${id} found for category:`, budgetExists.category_id);
    } catch (fetchError) {
      console.error("Failed to verify budget existence:", fetchError);
    }

    // Delete the budget
    console.log(`Attempting to delete budget ${id} from Grist...`);
    const result = await grist.deleteRecords("Budget", [parseInt(id)]);

    console.log("Delete operation successful:", result);

    return NextResponse.json(
      {
        message: "Budget deleted successfully",
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
    console.error("❌ DELETE BUDGET API Error:", error);

    let errorMessage = "Failed to delete budget";
    let statusCode = 500;

    if (error instanceof Error) {
      if (
        error.message.includes("404") ||
        error.message.includes("not found")
      ) {
        errorMessage = "Budget not found or already deleted";
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
        errorMessage = "Invalid budget ID format";
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
        budgetId: new URL(request.url).searchParams.get("id"),
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