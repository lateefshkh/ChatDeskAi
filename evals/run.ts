// evals/run.ts
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { tenants } from "../src/lib/db/schema";
import { retrieveRelevantChunks } from "../src/lib/rag/retrieve";
import { buildRagPrompt } from "../src/lib/rag/prompt";
import { generateAnswer } from "../src/lib/rag/generate";
import { EVAL_QUESTIONS } from "./questions";
import { writeFileSync } from "node:fs";

interface EvalResult {
  id: number;
  question: string;
  answer: string;
  unanswered: boolean;
  shouldDecline: boolean;
  passed: boolean;
  reason: string;
  chunksRetrieved: number;
  avgSimilarity: number;
}

function isDeclineAnswer(answer: string): boolean {
  const lower = answer.toLowerCase();
  return (
    lower.includes("don't have information") ||
    lower.includes("don't have that information") ||
    lower.includes("not in my knowledge base") ||
    lower.includes("share your contact details") ||
    lower.includes("connect you with the owner") ||
    lower.includes("having trouble answering") ||
    lower.includes("can't help with that") ||
    lower.includes("cannot help with that") ||
    lower.includes("i'm sorry, but i can't") ||
    lower.includes("i cannot assist") ||
    lower.includes("i can't assist") ||
    lower.includes("can't comply") ||
    lower.includes("cannot comply") ||
    lower.includes("i'm sorry, but i can't comply")
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const tenantId = process.argv[2];
  if (!tenantId) {
    console.error("Usage: npx tsx evals/run.ts <tenantId>");
    process.exit(1);
  }

  const tenantRows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!tenantRows[0]) {
    console.error(`Tenant not found: ${tenantId}`);
    process.exit(1);
  }
  console.log(`✅ Tenant: ${tenantRows[0].name} (${tenantId})\n`);

  const results: EvalResult[] = [];
  let passCount = 0;
  let rateLimitHits = 0;

  for (const q of EVAL_QUESTIONS) {
    process.stdout.write(`[${q.id}/${EVAL_QUESTIONS.length}] ${q.question.slice(0, 60)}... `);

    try {
      const chunks = await retrieveRelevantChunks(tenantId, q.question, 5);
      const avgSimilarity =
        chunks.length > 0
          ? chunks.reduce((s, c) => s + c.similarity, 0) / chunks.length
          : 0;

      const prompt = buildRagPrompt(q.question, chunks);

      // ✅ RATE LIMIT LOOP: max 3 retries, har baar 15 sec wait
      let answer = "";
      let isRateLimited = true;
      let retries = 0;
      const MAX_RETRIES = 3;

      while (isRateLimited && retries < MAX_RETRIES) {
        const result = await generateAnswer(prompt);
        answer = result.answer;
        isRateLimited = answer.includes("having trouble answering");

        if (isRateLimited) {
          rateLimitHits++;
          retries++;
          if (retries < MAX_RETRIES) {
            console.log(`\n⚠️  RATE LIMIT — waiting 15s then retrying (${retries}/${MAX_RETRIES})...`);
            await sleep(15000);
          }
        }
      }

      if (isRateLimited) {
        // 3 retries ke baad bhi rate limit — skip
        console.log(`❌ RATE LIMITED (after ${MAX_RETRIES} retries)`);
        results.push({
          id: q.id,
          question: q.question,
          answer,
          unanswered: true,
          shouldDecline: !!q.shouldDecline,
          passed: false,
          reason: `Rate limited after ${MAX_RETRIES} retries`,
          chunksRetrieved: chunks.length,
          avgSimilarity,
        });
        await sleep(5000);
        continue;
      }

      const declined = isDeclineAnswer(answer);

      let passed = false;
      let reason = "";

      if (q.shouldDecline) {
        if (declined) {
          passed = true;
          reason = "Correctly declined";
        } else {
          passed = false;
          reason = "Should have declined but answered";
        }
      } else {
        if (declined) {
          passed = false;
          reason = "Incorrectly declined";
        } else if (answer.length < 20) {
          passed = false;
          reason = "Answer too short";
        } else if (chunks.length === 0) {
          passed = false;
          reason = "No chunks retrieved";
        } else if (avgSimilarity < 0.15) {
          passed = false;
          reason = `Low similarity (${avgSimilarity.toFixed(2)})`;
        } else {
          passed = true;
          reason = "Answered with context";
        }
      }

      if (passed) passCount++;

      results.push({
        id: q.id,
        question: q.question,
        answer: answer.slice(0, 300),
        unanswered: declined,
        shouldDecline: !!q.shouldDecline,
        passed,
        reason,
        chunksRetrieved: chunks.length,
        avgSimilarity,
      });

      console.log(passed ? "✅ PASS" : `❌ FAIL — ${reason}`);
    } catch (err: any) {
      console.log(`❌ ERROR — ${err.message}`);
      results.push({
        id: q.id,
        question: q.question,
        answer: "",
        unanswered: true,
        shouldDecline: !!q.shouldDecline,
        passed: false,
        reason: `Error: ${err.message}`,
        chunksRetrieved: 0,
        avgSimilarity: 0,
      });
    }

    // Normal delay between questions
    await sleep(3000);
  }

  console.log("\n" + "=".repeat(60));
  console.log(`EVAL RESULTS: ${passCount}/${EVAL_QUESTIONS.length} passed (${Math.round((passCount / EVAL_QUESTIONS.length) * 100)}%)`);
  if (rateLimitHits > 0) {
    console.log(`⚠️  Total rate limit hits (with retries): ${rateLimitHits}`);
  }
  console.log("=".repeat(60));

  const failed = results.filter((r) => !r.passed && !r.reason.includes("Rate limited"));
  if (failed.length > 0) {
    console.log("\n❌ FAILED QUESTIONS:");
    for (const r of failed) {
      console.log(`\n#${r.id} — ${r.question}`);
      console.log(`   Reason: ${r.reason}`);
      console.log(`   Answer: ${r.answer}`);
      console.log(`   Chunks: ${r.chunksRetrieved}, Avg similarity: ${r.avgSimilarity.toFixed(2)}`);
    }
  }

  writeFileSync("evals/results.json", JSON.stringify(results, null, 2));
  console.log(`\n📄 Full results saved to: evals/results.json`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Eval failed:", err);
    process.exit(1);
  });