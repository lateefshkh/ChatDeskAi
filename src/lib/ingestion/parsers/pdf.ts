// src/lib/ingestion/parsers/pdf.ts
import { extractText, getDocumentProxy } from "unpdf";

/**
 * Extract text from a PDF buffer.
 * @param buffer - The PDF file as a Buffer
 * @returns Extracted plain text
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // 1. PDF document load karein
    const pdf = await getDocumentProxy(new Uint8Array(buffer));

    // 2. Text extract karein (saare pages)
    const { totalPages, text } = await extractText(pdf, { mergePages: true });

    if (!text || text.trim().length === 0) {
      throw new Error("PDF mein koi text nahi mila. Ho sakta hai yeh scanned image ho.");
    }

    console.log(`[pdf-parser] Extracted ${totalPages} pages, ${text.length} chars`);
    return text;
  } catch (error: any) {
    console.error("[pdf-parser] Error:", error.message);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}