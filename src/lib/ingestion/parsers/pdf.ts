// src/lib/ingestion/parsers/pdf.ts
import { extractText, getDocumentProxy } from "unpdf";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: true });

    if (!text || text.trim().length === 0) {
      throw new Error("PDF mein koi text nahi mila. Scanned image PDF ho sakta hai.");
    }

    console.log(`[pdf-parser] Extracted ${totalPages} pages, ${text.length} chars`);
    return text;
  } catch (error: any) {
    console.error("[pdf-parser] Error:", error.message);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}