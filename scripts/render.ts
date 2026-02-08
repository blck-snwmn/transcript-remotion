import { join } from "path";

const propsPath = join(import.meta.dir, "..", "public", "props.json");
const propsFile = Bun.file(propsPath);

if (!(await propsFile.exists())) {
  console.error("public/props.json not found. Run `bun run transcribe` first.");
  process.exit(1);
}

const props = await propsFile.json();
const mediaSrc: string = props.mediaSrc;

const videoExtensions = [".mp4", ".mov", ".webm", ".mkv", ".avi"];
const ext = mediaSrc.substring(mediaSrc.lastIndexOf(".")).toLowerCase();
const composition = videoExtensions.includes(ext) ? "TranscriptVideo" : "TranscriptAudio";

console.log(`Detected ${ext} → using ${composition}`);

const proc = Bun.spawn(
  ["bunx", "remotion", "render", "src/index.ts", composition, "--props=public/props.json"],
  {
    stdio: ["inherit", "inherit", "inherit"],
    cwd: join(import.meta.dir, ".."),
  },
);

const exitCode = await proc.exited;
process.exit(exitCode);
