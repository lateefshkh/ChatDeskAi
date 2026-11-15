// src/lib/ingestion/parsers/sheet.ts
import * as XLSX from "xlsx";

/**
 * Parse Excel (.xlsx, .xls) ya CSV (.csv) file se text extract karta hai.
 * Har row ko "col1: value1 | col2: value2" format mein convert karta hai,
 * taaki AI samajh sake.
 */
export async function extractTextFromSheet(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });

    let fullText = "";
    let totalRows = 0;

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      // Sheet ko JSON array mein convert karo (headers ke saath)
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
        defval: "",
        raw: false,
      });

      if (rows.length === 0) continue;

      fullText += `\n\n=== Sheet: ${sheetName} ===\n`;
      const headers = Object.keys(rows[0]);

      // Header row
      fullText += `Columns: ${headers.join(" | ")}\n\n`;

      // Data rows
      for (const row of rows) {
        const rowText = headers
          .map((h) => {
            const val = row[h];
            if (val === null || val === undefined || val === "") return null;
            return `${h}: ${val}`;
          })
          .filter(Boolean)
          .join(" | ");

        if (rowText) {
          fullText += `${rowText}\n`;
          totalRows++;
        }
      }
    }

    if (!fullText.trim()) {
      throw new Error("Spreadsheet mein koi data nahi mila.");
    }

    console.log(
      `[sheet-parser] ${fileName}: ${workbook.SheetNames.length} sheets, ${totalRows} rows, ${fullText.length} chars`
    );

    return fullText.trim();
  } catch (error: any) {
    console.error("[sheet-parser] Error:", error.message);
    throw new Error(`Spreadsheet parsing failed: ${error.message}`);
  }
}