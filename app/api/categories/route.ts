import { grist } from "@/lib/grist";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await grist.fetchTable("Categories");

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200 }
      );
    }

    // Define the Category type
    interface Category {
      id: number | string;
      category_name: string;
      category_type?: string;
      color?: string;
      description?: string;
      is_active?: boolean;
      created_date?: number | string;
    }

    // Transform categories to match expected format
    const transformedCategories = categories.map((category: Category) => ({
      id: category.id.toString(),
      category_name: category.category_name,
      category_type: category.category_type?.toLowerCase() === "expense" ? "expense" : "income",
      color: category.color || "#10B981", // Default color if not set
      description: category.description || "",
      is_active: category.is_active !== false, // Default to true if not set
      created_date: category.created_date
    }));

    return NextResponse.json({ success: true, data: transformedCategories }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    if (
      error instanceof Error &&
      error.message.includes("Network connection failed")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Network connection failed. Please check your internet connection and Grist API configuration.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
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
          success: false,
          error: "Grist API configuration missing. Please set GRIST_API_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log("Received category data:", body);

    // Validate required fields
    const requiredFields = ["name", "type"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate category type
    const validTypes = ["income", "expense"];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category type: ${body.type}. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Prepare data for Grist with proper field mapping
    const categoryData = {
      category_name: body.name,
      category_type: body.type === "income" ? "Income" : "Expense",
      description: body.description || "",
      color: body.color || "#10B981",
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_date: Math.floor(Date.now() / 1000),
    };

    console.log("Prepared category data for Grist:", categoryData);

    const result = await grist.addRecords("Categories", [categoryData]);
    console.log("Grist response:", result);

    return NextResponse.json(
      { success: true, message: "Category added successfully", data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add category - Full error:", error);

    let errorMessage = "Failed to add category";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: "Failed to add category", details: errorMessage },
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
        { success: false, error: "Category ID is required for update" },
        { status: 400 }
      );
    }

    // Validate category type if provided
    if (updateData.type) {
      const validTypes = ["income", "expense"];
      if (!validTypes.includes(updateData.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid category type: ${updateData.type}. Must be one of: ${validTypes.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data with proper field mapping
    interface CategoryUpdateData {
      category_name?: string;
      category_type?: "Income" | "Expense";
      description?: string;
      color?: string;
      is_active?: boolean;
    }
    const finalUpdateData: CategoryUpdateData = {};
    
    if (updateData.name) {
      finalUpdateData.category_name = updateData.name;
    }
    if (updateData.type) {
      finalUpdateData.category_type = updateData.type === "income" ? "Income" : "Expense";
    }
    if (updateData.description !== undefined) {
      finalUpdateData.description = updateData.description;
    }
    if (updateData.color) {
      finalUpdateData.color = updateData.color;
    }
    if (updateData.is_active !== undefined) {
      finalUpdateData.is_active = updateData.is_active;
    }

    console.log("Final update data:", finalUpdateData);

    const result = await grist.updateRecords("Categories", [
      { id: parseInt(id), ...finalUpdateData },
    ]);

    return NextResponse.json(
      { success: true, message: "Category updated successfully", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category",
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

    console.log("=== DELETE CATEGORY API CALLED ===");
    console.log("Category ID:", id);

    if (!id) {
      console.error("No category ID provided");
      return NextResponse.json(
        { success: false, error: "Category ID is required for deletion" },
        { status: 400 }
      );
    }

    if (!process.env.GRIST_API_KEY) {
      console.error("Grist API Key not configured");
      return NextResponse.json(
        { success: false, error: "Grist API configuration missing" },
        { status: 500 }
      );
    }

    // Check if category is being used in transactions
    try {
      const transactions = await grist.fetchTable("Transactions");
      interface Transaction {
        id: number | string;
        category_name: string;
        // Add other fields as needed
      }

      const categoryInUse = (transactions as Transaction[]).some(
        (t) => String(t.category_name) === String(id)
      );

      if (categoryInUse) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot delete category",
            details: "This category is being used in existing transactions. Please update or delete those transactions first.",
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error checking category usage:", error);
    }

    // Verify category exists before deletion
    try {
      console.log(`Checking if category ${id} exists...`);
      const categories = await grist.fetchTable("Categories");
      interface Category {
        id: number | string;
        category_name: string;
        category_type?: string;
        color?: string;
        description?: string;
        is_active?: boolean;
        created_date?: number | string;
      }
      const categoryExists: Category | undefined = (categories as Category[]).find(
        (c: Category) => String(c.id) === String(id)
      );

      if (!categoryExists) {
        console.log(`Category ${id} not found in database`);
        return NextResponse.json(
          {
            success: false,
            error: "Category not found",
            details: "The category doesn't exist in the database",
          },
          { status: 404 }
        );
      }

      console.log(`Category ${id} found:`, categoryExists.category_name);
    } catch (fetchError) {
      console.error("Failed to verify category existence:", fetchError);
    }

    // Delete the category
    console.log(`Attempting to delete category ${id} from Grist...`);
    const result = await grist.deleteRecords("Categories", [parseInt(id)]);

    console.log("Delete operation successful:", result);

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully",
        deletedId: id,
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
    console.error("❌ DELETE CATEGORY API Error:", error);

    let errorMessage = "Failed to delete category";
    let statusCode = 500;

    if (error instanceof Error) {
      if (
        error.message.includes("404") ||
        error.message.includes("not found")
      ) {
        errorMessage = "Category not found or already deleted";
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
        errorMessage = "Invalid category ID format";
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
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
        categoryId: new URL(request.url).searchParams.get("id"),
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