import { parseArgs } from "util";
import { basename, join, extname } from "path";
import { transcribeSrt, transcribeWordLevel } from "./openai-transcriber.ts";
import { transcribeWithGemini } from "./gemini-transcriber.ts";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    input: { type: "string" },
    provider: { type: "string", default: "openai" },
    granularity: { type: "string", default: "segment" },
  },
  strict: true,
});

if (!values.input) {
  console.error(
    "Usage: bun run scripts/transcribe.ts --input <file> --provider <openai|gemini> --granularity <segment|word>",
  );
  process.exit(1);
}

const inputPath = values.input;
const provider = values.provider ?? "openai";
const granularity = values.granularity ?? "segment";
const baseName = basename(inputPath, extname(inputPath));
const publicDir = join(import.meta.dir, "..", "public");

console.log(`Transcribing ${inputPath} with ${provider} (granularity: ${granularity})...`);

let captionsSrc: string;

if (granularity === "word" && provider === "openai") {
  const captions = await transcribeWordLevel(inputPath);
  const jsonPath = join(publicDir, `${baseName}.json`);
  await Bun.write(jsonPath, JSON.stringify(captions, null, 2));
  console.log(`Captions JSON saved to ${jsonPath}`);
  captionsSrc = `${baseName}.json`;
} else {
  let srt: string;
  if (provider === "gemini") {
    srt = await transcribeWithGemini(inputPath);
  } else {
    srt = await transcribeSrt(inputPath);
  }
  const srtPath = join(publicDir, `${baseName}.srt`);
  await Bun.write(srtPath, srt);
  console.log(`SRT saved to ${srtPath}`);
  captionsSrc = `${baseName}.srt`;
}

// Copy media file to public/
const destPath = join(publicDir, basename(inputPath));
const sourceFile = Bun.file(inputPath);
await Bun.write(destPath, sourceFile);
console.log(`Media copied to ${destPath}`);

// Write props.json for render commands
const propsPath = join(publicDir, "props.json");
await Bun.write(propsPath, JSON.stringify({ mediaSrc: basename(inputPath), captionsSrc }, null, 2));
console.log(`Props saved to ${propsPath}`);

console.log("Done!");
