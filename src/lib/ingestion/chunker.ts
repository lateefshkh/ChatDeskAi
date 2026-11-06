// src/lib/ingestion/chunker.ts

export interface TextChunk {
  text: string;
  position: number;
}

/**
 * Simple paragraph-based chunker with overlap.
 * ~800 characters per chunk (approx 200 tokens).
 */
export function chunkText(text: string): TextChunk[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const chunkSize = 800;
  const overlap = 100;
  
  const chunks: TextChunk[] = [];
  let position = 0;
  let index = 0;

  while (position < cleaned.length) {
    let end = position + chunkSize;
    // Try to break at a space to avoid splitting words
    if (end < cleaned.length) {
      const lastSpace = cleaned.lastIndexOf(" ", end);
      if (lastSpace > position) end = lastSpace;
    }

    const chunkText = cleaned.slice(position, end).trim();
    if (chunkText.length > 20) { // Ignore tiny chunks
      chunks.push({ text: chunkText, position: index++ });
    }

    position = end - overlap;
    if (position <= 0) position = end; // Avoid infinite loop
  }

  return chunks;
}