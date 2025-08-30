import { grist } from "@/lib/grist";
import { NextResponse } from "next/server";

// Helper function to get next transaction_id
async function getNextTransactionId(): Promise<number> {
  try {
    const transactions = await grist.fetchTable("Transactions");

    if (!transactions || transactions.length === 0) {
      return 1; // Start from 1 if no transactions exist
    }

    // Find the highest transaction_id
    const maxTransactionId = transactions.reduce((max, transaction) => {
      const transactionId = transaction.transaction_id || transaction.id || 0;
      return Math.max(max, parseInt(transactionId.toString()));
    }, 0);

    return maxTransactionId + 1;
  } catch (error) {
    console.error("Error getting next transaction_id:", error);
    return 1; // Fallback to 1 if there's an error
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // income or expense

    console.log(`🔍 Fetching transactions with type filter: ${type}`);

    // Fetch both transactions and categories
    const [transactions, categories] = await Promise.all([
      grist.fetchTable("Transactions"),
      grist.fetchTable("Categories"),
    ]);

    console.log(`📊 Raw transactions count: ${transactions?.length || 0}`);
    console.log(`📂 Categories count: ${categories?.length || 0}`);

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // Create category lookup map
    const categoryMap = new Map();
    if (categories && categories.length > 0) {
      categories.forEach((cat) => {
        categoryMap.set(cat.id.toString(), {
          name: cat.category_name || `Category ${cat.id}`,
          type:
            cat.category_type?.toLowerCase() === "expense"
              ? "expense"
              : "income",
          color: cat.color || "#6B7280",
        });
      });
    }

    console.log(`🗂️ Category map created with ${categoryMap.size} entries`);

    // Transform the data to match the expected format
    let transformedTransactions = transactions.map((transaction) => {
      const categoryInfo = categoryMap.get(
        transaction.category_name?.toString()
      ) || {
        name: "หมวดหมู่ไม่ระบุ",
        type: "expense", // default fallback
        color: "#6B7280",
      };

      // ใช้ transaction_type จาก database เป็นหลัก
      let finalType = transaction.transaction_type;

      if (!finalType || finalType === null || finalType === undefined) {
        finalType = categoryInfo.type;
      } else {
        finalType = finalType.toString().toLowerCase().trim();
        if (finalType !== "income" && finalType !== "expense") {
          finalType = categoryInfo.type;
        }
      }

      return {
        id: transaction.id.toString(),
        transaction_id: transaction.transaction_id || transaction.id,
        title: transaction.description || transaction.title || "", // เพิ่ม title
        description: transaction.description || "",
        amount: parseFloat(transaction.amount) || 0,
        type: finalType,
        transaction_type: finalType,
        category_id: transaction.category_name?.toString() || "",
        category_name: categoryInfo.name,
        date: transaction.transaction_date
          ? new Date(transaction.transaction_date * 1000)
              .toISOString()
              .split("T")[0]
          : new Date().toISOString().split("T")[0],
        transaction_date: transaction.transaction_date,
        payment_method: transaction.payment_method || "Cash",
        quantity: transaction.quantity || 1,
        unit_price: transaction.unit_price,
        notes: transaction.notes || "",
        status: transaction.status || "Completed",
        created_by: transaction.created_by || "admin",
        created_date: transaction.created_date,
        updated_date: transaction.updated_date,
      };
    });

    console.log(
      `🔄 Transformed ${transformedTransactions.length} transactions`
    );

    // Debug: แสดงประเภทของ transaction ทั้งหมด
    const typeDistribution = transformedTransactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`📈 Transaction type distribution:`, typeDistribution);

    // Filter by type if specified
    if (type) {
      const beforeFilter = transformedTransactions.length;
      transformedTransactions = transformedTransactions.filter(
        (transaction) => transaction.type === type.toLowerCase()
      );
      const afterFilter = transformedTransactions.length;

      console.log(
        `🎯 Filtered by type "${type}": ${beforeFilter} -> ${afterFilter} transactions`
      );

      // Debug: แสดงตัวอย่าง transaction ที่ผ่านการกรอง
      if (transformedTransactions.length > 0) {
        console.log(`✅ Sample filtered transaction:`, {
          id: transformedTransactions[0].id,
          description: transformedTransactions[0].description,
          type: transformedTransactions[0].type,
          transaction_type: transformedTransactions[0].transaction_type,
          amount: transformedTransactions[0].amount,
        });
      }
    }

    return NextResponse.json(
      { success: true, data: transformedTransactions },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to fetch transactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
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
          error:
            "Grist API configuration missing. Please set GRIST_API_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log("Received transaction data:", body);

    // Validate required fields
    const requiredFields = [
      "transaction_date",
      "amount",
      "category_name", // This is now category ID
      "description",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Fetch categories to validate category exists and get type
    const categories = await grist.fetchTable("Categories");
    const selectedCategory = categories.find(
      (cat) => cat.id.toString() === body.category_name.toString()
    );

    if (!selectedCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category selected",
        },
        { status: 400 }
      );
    }

    // ตรวจสอบ transaction_type ให้แน่ใจว่าเป็น "income" หรือ "expense" เท่านั้น
    let transactionType =
      body.transaction_type || selectedCategory.category_type || "expense";
    transactionType = transactionType.toLowerCase().trim();

    if (transactionType !== "income" && transactionType !== "expense") {
      // ใช้ type จาก category เป็นค่า fallback
      transactionType =
        selectedCategory.category_type?.toLowerCase() === "expense"
          ? "expense"
          : "income";
    }

    // Validate payment_method if provided
    if (body.payment_method) {
      const validPaymentMethods = [
        "Cash",
        "เงินสด",
        "โอน",
        "Credit Card",
        "บัตรเครดิต",
        "Bank Transfer",
        "โอนเงิน",
        "Digital Wallet",
        "กระเป๋าเงินดิจิทัล",
      ];
      if (!validPaymentMethods.includes(body.payment_method)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid payment_method: ${
              body.payment_method
            }. Must be one of: ${validPaymentMethods.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = [
        "Pending",
        "รอดำเนินการ",
        "Completed",
        "สำเร็จ",
        "Cancelled",
        "ยกเลิก",
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status: ${
              body.status
            }. Must be one of: ${validStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Get next transaction_id
    const nextTransactionId = await getNextTransactionId();
    console.log("Next transaction_id:", nextTransactionId);

    // Prepare data for Grist
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const transactionData = {
      transaction_id: nextTransactionId,
      notes: body.notes || "",
      transaction_date: body.transaction_date,
      amount: parseFloat(body.amount),
      quantity: body.quantity || 1,
      unit_price: body.unit_price
        ? parseFloat(body.unit_price)
        : parseFloat(body.amount),
      description: body.description,
      category_name: parseInt(body.category_name),
      transaction_type: transactionType, // ใช้ค่าที่ทำความสะอาดแล้ว
      payment_method: body.payment_method || "Cash",
      status: body.status || "สำเร็จ",
      created_by: body.created_by || "admin",
      created_date: currentTimestamp,
      updated_date: currentTimestamp,
    };

    console.log("Prepared transaction data for Grist:", transactionData);

    const result = await grist.addRecords("Transactions", [transactionData]);
    console.log("Grist response:", result);

    return NextResponse.json(
      {
        success: true,
        message: "Transaction added successfully",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add transaction - Full error:", error);

    let errorMessage = "Failed to add transaction";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to add transaction",
        details: errorMessage,
      },
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
        { success: false, error: "Transaction ID is required for update" },
        { status: 400 }
      );
    }

    // If category is being updated, validate it exists
    if (updateData.category_name) {
      const categories = await grist.fetchTable("Categories");
      const selectedCategory = categories.find(
        (cat) => cat.id.toString() === updateData.category_name.toString()
      );

      if (!selectedCategory) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid category selected",
          },
          { status: 400 }
        );
      }

      // อัปเดต transaction_type ตาม category ที่เลือก
      if (selectedCategory.category_type) {
        updateData.transaction_type =
          selectedCategory.category_type.toLowerCase() === "expense"
            ? "expense"
            : "income";
      }
    }

    // ตรวจสอบ transaction_type ที่ส่งมา
    if (updateData.transaction_type) {
      updateData.transaction_type = updateData.transaction_type
        .toLowerCase()
        .trim();
      if (
        updateData.transaction_type !== "income" &&
        updateData.transaction_type !== "expense"
      ) {
        updateData.transaction_type = "expense"; // fallback
      }
    }

    // Validate payment_method if provided
    if (updateData.payment_method) {
      const validPaymentMethods = [
        "Cash",
        "เงินสด",
        "โอน",
        "Credit Card",
        "บัตรเครดิต",
        "Bank Transfer",
        "โอนเงิน",
        "Digital Wallet",
        "กระเป๋าเงินดิจิทัล",
      ];
      if (!validPaymentMethods.includes(updateData.payment_method)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid payment_method: ${
              updateData.payment_method
            }. Must be one of: ${validPaymentMethods.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = [
        "Pending",
        "รอดำเนินการ",
        "Completed",
        "สำเร็จ",
        "Cancelled",
        "ยกเลิก",
      ];
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status: ${
              updateData.status
            }. Must be one of: ${validStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Add updated_date
    const finalUpdateData = {
      ...updateData,
      updated_date: Math.floor(Date.now() / 1000),
    };

    // Parse numeric fields if provided
    if (finalUpdateData.amount) {
      finalUpdateData.amount = parseFloat(finalUpdateData.amount);
    }
    if (finalUpdateData.quantity) {
      finalUpdateData.quantity = parseInt(finalUpdateData.quantity);
    }
    if (finalUpdateData.unit_price) {
      finalUpdateData.unit_price = parseFloat(finalUpdateData.unit_price);
    }
    if (finalUpdateData.category_name) {
      finalUpdateData.category_name = parseInt(finalUpdateData.category_name);
    }

    console.log("Final update data:", finalUpdateData);

    const result = await grist.updateRecords("Transactions", [
      { id: parseInt(id), ...finalUpdateData },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Transaction updated successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update transaction",
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

    console.log("=== DELETE TRANSACTION API CALLED ===");
    console.log("Transaction ID from request:", id);

    if (!id) {
      console.error("No transaction ID provided");
      return NextResponse.json(
        { success: false, error: "Transaction ID is required for deletion" },
        { status: 400 }
      );
    }

    if (!process.env.GRIST_API_KEY) {
      console.error("Grist API Key not configured");
      return NextResponse.json(
        {
          success: false,
          error:
            "Grist API configuration missing. Please set GRIST_API_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    // ตรวจสอบว่า transaction มีอยู่จริงหรือไม่
    console.log("Fetching all transactions to find the record...");
    let transactionToDelete;

    try {
      const transactions = await grist.fetchTable("Transactions");
      console.log("✅ All transactions count:", transactions.length);

      // แก้ไข: ใช้ id ที่ส่งมาจาก frontend ซึ่งเป็น Grist record ID โดยตรง
      transactionToDelete = transactions.find(
        (t) => t.id.toString() === id.toString()
      );

      console.log("🔍 Looking for Grist record ID:", id);
      console.log(
        "🎯 Found transaction:",
        transactionToDelete
          ? {
              id: transactionToDelete.id,
              description: transactionToDelete.description,
              amount: transactionToDelete.amount,
            }
          : null
      );
    } catch (fetchError) {
      console.error("❌ Error fetching transactions:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to verify transaction exists",
          details:
            fetchError instanceof Error
              ? fetchError.message
              : "Unknown fetch error",
        },
        { status: 500 }
      );
    }

    if (!transactionToDelete) {
      console.error(`Transaction with ID ${id} not found`);
      return NextResponse.json(
        {
          success: false,
          error: "Transaction not found",
          details: `No transaction found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // ลบ record โดยใช้ Grist record ID
    console.log(
      "Attempting to delete record with Grist ID:",
      transactionToDelete.id
    );

    try {
      const gristRecordId = parseInt(transactionToDelete.id.toString());
      console.log("Using Grist record ID for deletion:", gristRecordId);

      const deleteResult = await grist.deleteRecords("Transactions", [
        gristRecordId,
      ]);
      console.log("✅ Delete operation successful:", deleteResult);

      return NextResponse.json(
        {
          success: true,
          message: "Transaction deleted successfully",
          deletedId: id,
          gristRecordId: transactionToDelete.id,
          data: deleteResult,
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (deleteError) {
      console.error("❌ Error during delete operation:", deleteError);

      // ส่ง error กลับไปแทนที่จะ treat as success
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete from database",
          details:
            deleteError instanceof Error
              ? deleteError.message
              : "Unknown delete error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("⚠️ DELETE TRANSACTION API Error:", error);

    let errorMessage = "Failed to delete transaction";
    let statusCode = 500;

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes("404") || message.includes("not found")) {
        errorMessage = "Transaction not found";
        statusCode = 404;
      } else if (message.includes("403") || message.includes("unauthorized")) {
        errorMessage = "Permission denied - insufficient privileges";
        statusCode = 403;
      } else if (
        message.includes("network") ||
        message.includes("connection")
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
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
        requestedId: new URL(request.url).searchParams.get("id") || "unknown",
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
