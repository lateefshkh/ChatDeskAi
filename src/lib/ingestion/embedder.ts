// src/lib/ingestion/embedder.ts
import { pipeline, env } from "@huggingface/transformers";

// Vercel/Serverless ke liye ZAROORI:
// Native ONNX binary load karne se rokta hai
env.allowLocalModels = false;

// Serverless mein memory exhaustion se bachne ke liye single thread
(env.backends.onnx.wasm as any).numThreads = 1;

// Model cache path (agar aap remote model use kar rahe hain to yeh optional hai)
env.cacheDir = "./.cache/transformers";

// Singleton pipeline - pehli baar load hoga, phir memory mein rahega
let embedderPipeline: any = null;

async function getEmbedder() {
  if (!embedderPipeline) {
    console.log("[embedder] Loading model with WASM backend (Vercel-safe)...");
    embedderPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2", // 384 dimensions
      { device: "cpu" }           // "cpu" + allowLocalModels=false = WASM
    );
    console.log("[embedder] Model loaded successfully.");
  }
  return embedderPipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embedder = await getEmbedder();

    // Generate embedding with mean pooling + normalize
    const output = await embedder(text, {
      pooling: "mean",
      normalize: true,
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