// Post the Meme, Win the Feed — entry runner.
//
// The meme posted on X is the entry itself; this program only hands the
// post's address to the house. It reads POST.json out of the repository
// root and writes those exact bytes to <output>/POST.json, where the gate
// picks them up. Nothing about the post is scored from anything written
// here — the house reads the post's likes, reposts and quotes from X.
//
// Local run:
//   mkdir -p /tmp/smoke-meme-1 && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=/tmp/smoke-meme-1 node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

// Read the post file and check it is at least shaped like the gate wants:
// a JSON object with a string "url". The raw bytes are returned untouched
// so the copy the gate reads is exactly what the repository holds.
function readPostFile(sourcePath: string): Buffer {
  let raw: Buffer;
  try {
    raw = readFileSync(sourcePath);
  } catch (err) {
    fail(`cannot read ${sourcePath}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw!.toString('utf8'));
  } catch (err) {
    fail(`${sourcePath} is not valid JSON: ${(err as Error).message}`);
  }

  if (typeof parsed !== 'object' || parsed === null || typeof (parsed as { url?: unknown }).url !== 'string') {
    fail(`${sourcePath} must be a JSON object with a string "url" field`);
  }
  return raw!;
}

function main(): void {
  const repoDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

  const sourcePath = resolve(repoDir, 'POST.json');
  const targetPath = resolve(outDir, 'POST.json');

  const raw = readPostFile(sourcePath);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(targetPath, raw);
  console.log(`wrote ${targetPath} (${raw.length} bytes)`);
}

main();
