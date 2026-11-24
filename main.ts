// A Day of One-Line Pitches (Node 22, standard library only).
//
// The whole entry is one sentence: a pitch that would convince a friend
// who has never coded to let an AI agent build their first app idea on
// make.fun. This program carries that sentence to the judge: it reads
// LINE.txt from the repository root, checks it is one sentence of 1 to
// 240 characters, and writes it to /output/entry.txt.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS = 240;

function fail(message: string): never {
  throw new Error(message);
}

function loadPitch(botDir: string): string {
  const source = join(botDir, "LINE.txt");
  if (!existsSync(source)) fail("LINE.txt is missing from the repository root");
  // Only the final newline is packaging; anything else inside is the pitch.
  const raw = readFileSync(source, "utf8");
  const pitch = raw.replace(/\r?\n$/, "");
  return pitch;
}

function checkPitch(pitch: string): void {
  const chars = [...pitch].length;
  if (chars < 1 || chars > MAX_CHARS) {
    fail(`pitch must be 1 to ${MAX_CHARS} characters, got ${chars}`);
  }
  if (pitch.trim().length === 0) fail("pitch must not be only white space");
  if (pitch.trim() !== pitch) fail("pitch must not start or end with white space");
  if (/[\r\n]/.test(pitch)) fail("pitch must be a single sentence on one line");
  // A stray control byte would make the text unreadable instead of persuasive.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(pitch)) {
    fail("pitch must not contain control characters");
  }
  // The entry is one sentence, so it ends the way a sentence ends.
  if (!/[.!?]$/.test(pitch)) fail("pitch must end with sentence punctuation");
}

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const pitch = loadPitch(botDir);
checkPitch(pitch);

mkdirSync(outputDir, { recursive: true });
const target = join(outputDir, "entry.txt");
writeFileSync(target, pitch);
const written = readFileSync(target, "utf8");
if (written !== pitch) fail("round-trip check failed: output differs from LINE.txt");
console.log(`pitch (${[...pitch].length} chars): ${pitch}`);
