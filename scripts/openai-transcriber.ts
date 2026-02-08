import OpenAI from "openai";
import type { Caption } from "@remotion/captions";

const client = new OpenAI();

function createFileFromPath(file: ReturnType<typeof Bun.file>): File {
  return new File([file], file.name ?? "audio.mp3", {
    type: file.type,
  });
}

export async function transcribeSrt(filePath: string): Promise<string> {
  const file = Bun.file(filePath);
  const fileObj = createFileFromPath(file);

  const response = await client.audio.transcriptions.create({
    model: "whisper-1",
    file: fileObj,
    response_format: "srt",
  });

  return response as unknown as string;
}

export async function transcribeWordLevel(filePath: string): Promise<Caption[]> {
  const file = Bun.file(filePath);
  const fileObj = createFileFromPath(file);

  const response = await client.audio.transcriptions.create({
    model: "whisper-1",
    file: fileObj,
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
  });

  return (response.words ?? []).map((word) => ({
    text: word.word,
    startMs: word.start * 1000,
    endMs: word.end * 1000,
    timestampMs: null,
    confidence: null,
  }));
}
