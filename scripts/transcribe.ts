import { parseArgs } from "util";
import { basename, join, extname } from "path";
import { mkdir, unlink } from "node:fs/promises";
import { transcribeSrt, transcribeWordLevel } from "./openai-transcriber.ts";
import { transcribeWithGemini } from "./gemini-transcriber.ts";

const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm", ".mkv", ".avi"]);

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
const ext = extname(inputPath).toLowerCase();
const isVideo = VIDEO_EXTENSIONS.has(ext);

// Extract audio from video files using ffmpeg
let audioPath = inputPath;
let tmpAudioPath: string | null = null;

if (isVideo) {
  const tmpDir = join(import.meta.dir, "..", ".tmp");
  await mkdir(tmpDir, { recursive: true });
  const randomId = crypto.randomUUID().slice(0, 8);
  tmpAudioPath = join(tmpDir, `audio-${randomId}.m4a`);

  console.log(`Extracting audio from video: ${inputPath}`);
  await Bun.$`ffmpeg -i ${inputPath} -vn -acodec aac -y ${tmpAudioPath}`;
  console.log(`Audio extracted to ${tmpAudioPath}`);
  audioPath = tmpAudioPath;
}

console.log(`Transcribing ${inputPath} with ${provider} (granularity: ${granularity})...`);

let captionsSrc: string;

try {
  if (granularity === "word" && provider === "openai") {
    const captions = await transcribeWordLevel(audioPath);
    const jsonPath = join(publicDir, `${baseName}.json`);
    await Bun.write(jsonPath, JSON.stringify(captions, null, 2));
    console.log(`Captions JSON saved to ${jsonPath}`);
    captionsSrc = `${baseName}.json`;
  } else {
    let srt: string;
    if (provider === "gemini") {
      srt = await transcribeWithGemini(audioPath);
    } else {
      srt = await transcribeSrt(audioPath);
    }
    const srtPath = join(publicDir, `${baseName}.srt`);
    await Bun.write(srtPath, srt);
    console.log(`SRT saved to ${srtPath}`);
    captionsSrc = `${baseName}.srt`;
  }
} finally {
  if (tmpAudioPath) {
    await unlink(tmpAudioPath).catch(() => {});
    console.log(`Temporary audio file removed: ${tmpAudioPath}`);
  }
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
