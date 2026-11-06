// src/lib/ingestion/embedder.ts
import { pipeline, env } from "@huggingface/transformers";

// Models ko local cache mein rakhein (default ~/.cache/huggingface)
// Ya aap isko customize kar sakte hain
env.cacheDir = "./.cache/transformers";

// Singleton pipeline — pehli baar load hoga, phir memory mein rahega
let embedderPipeline: any = null;

async function getEmbedder() {
  if (!embedderPipeline) {
    console.log("[embedder] Loading local model (first time only)...");
    embedderPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2" // 384 dimensions, same as our DB schema
    );
    console.log("[embedder] Model loaded.");
  }
  return embedderPipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embedder = await getEmbedder();
    
    // Generate embedding with mean pooling + normalize
    const output = await embedder(text, { 
      pooling: "mean", 
      normalize: true 
    });
    
    // Tensor ko array mein convert karein
    const embedding = Array.from(output.data as Float32Array);
    
    if (embedding.length !== 384) {
      throw new Error(`Expected 384 dimensions, got ${embedding.length}`);
    }
    
    return embedding;
  } catch (error: any) {
    console.error("[embedder] Failed:", error.message);
    throw error;
  }
}