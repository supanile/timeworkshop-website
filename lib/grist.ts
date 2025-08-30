// lib/grist.ts
class GristAPI {
  private apiKey: string;
  private docId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GRIST_API_KEY || "";
    this.docId = process.env.GRIST_DOC_ID || "";
    this.baseUrl = process.env.GRIST_BASE_URL || "https://docs.getgrist.com";

    if (!this.apiKey) {
      console.warn("GRIST_API_KEY not found in environment variables");
    }
    if (!this.docId) {
      console.warn("GRIST_DOC_ID not found in environment variables");
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async fetchTable(tableName: string) {
    try {
      const url = `${this.baseUrl}/api/docs/${this.docId}/tables/${tableName}/records`;
      console.log(`Fetching from: ${url}`);

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      type GristRecord = {
        id: number;
        fields: Record<string, unknown>;
      };

      return (
        data.records?.map((record: GristRecord) => ({
          id: record.id,
          ...record.fields,
        })) || []
      );
    } catch (error) {
      console.error(`Error fetching table ${tableName}:`, error);
      throw error;
    }
  }

  async addRecords(tableName: string, records: Record<string, unknown>[]) {
    try {
      const url = `${this.baseUrl}/api/docs/${this.docId}/tables/${tableName}/records`;
      console.log(`Adding records to: ${url}`);

      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          records: records.map((record) => ({ fields: record })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error adding records to ${tableName}:`, error);
      throw error;
    }
  }

  // แทนที่ฟังก์ชัน deleteRecords ใน grist.ts (บรรทัดที่ 88-162)
  // แทนที่ฟังก์ชัน deleteRecords ใน grist.ts (บรรทัดที่ 88-162)
  async deleteRecords(tableName: string, recordIds: number[]) {
    try {
      console.log(`🗑️ Deleting records from table: ${tableName}`);
      console.log("🎯 Record IDs to delete:", recordIds);

      // ลองใช้ API v1 แทน
      const url = `${this.baseUrl}/api/docs/${this.docId}/tables/${tableName}/data/delete`;
      console.log(`🗑️ Delete URL: ${url}`);

      const response = await fetch(url, {
        method: "POST", // ใช้ POST แทน DELETE สำหรับ Grist v1
        headers: this.getHeaders(),
        body: JSON.stringify(recordIds), // ส่ง array ของ record IDs
      });

      console.log(`📊 Delete response status:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Delete failed: ${response.status} - ${errorText}`);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      let responseData;
      try {
        const responseText = await response.text();
        console.log(`📄 Delete response body:`, responseText);

        if (responseText) {
          JSON.parse(responseText);
        } else {
          // No response body, assume success
        }
      } catch {
        // ถ้า parse ไม่ได้แต่ status ok ให้ถือว่าสำเร็จ
        console.log("📝 Response is not JSON, but delete was successful");
      }

      console.log("✅ Records deleted successfully!");
      return {
        success: true,
        deleted: recordIds.length,
        failed: 0,
        results: recordIds.map((id) => ({ id, success: true })),
      };
    } catch (error) {
      console.error(`❌ Error in deleteRecords:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
export const grist = new GristAPI();

// Also export the class if needed
export default grist;
