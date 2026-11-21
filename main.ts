// Twin Worlds — the entrypoint make.fun runs (`node main.ts`, Node 22, no
// build, no install): copies game/ and screenshots/ into the output directory
// and writes dossier.json from them with the kit's own library, so the dossier
// the scorer rebuilds from the output is the dossier this program wrote.
//
// The output directory is $MAKEFUN_OUTPUT_DIR when set, else /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_DIR = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The bounty's caps, from its gate: the dossier text cap, four screenshots of
// at most 256 KiB each, and the game tree caps.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyTree(from: string, to: string): void {
  if (!existsSync(from)) throw new Error(`Twin Worlds: ${from} is missing from the repository`);
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function main(): void {
  copyTree(join(REPO_DIR, 'game'), join(OUTPUT_DIR, 'game'));
  copyTree(join(REPO_DIR, 'screenshots'), join(OUTPUT_DIR, 'screenshots'));
  const dossier = buildDossier(OUTPUT_DIR, CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
  console.log(`Twin Worlds packaged into ${OUTPUT_DIR}: dossier.json is ${dossier.length} bytes.`);
}

main();
