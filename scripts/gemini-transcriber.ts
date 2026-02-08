import { GoogleGenAI } from "@google/genai";
import { buildSrtFromSegments, type TranscriptSegment } from "./srt.ts";

const client = new GoogleGenAI({
  apiKey: process.env["GEMINI_API_KEY"],
});

export async function transcribeWithGemini(filePath: string): Promise<string> {
  const file = Bun.file(filePath);
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const ext = filePath.split(".").pop()?.toLowerCase() ?? "mp3";
  const mimeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    wav: "audio/wav",
    m4a: "audio/mp4",
    webm: "audio/webm",
  };
  const mimeType = mimeMap[ext] ?? "audio/mpeg";

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType,
            },
          },
          {
            text: `Transcribe this audio/video file with accurate timestamps.
Return ONLY a JSON array of objects, each with:
- "start": start time in milliseconds (number)
- "end": end time in milliseconds (number)
- "text": the transcribed text (string)

Example: [{"start": 0, "end": 2500, "text": "Hello world"}, ...]

Do not include any explanation, just the JSON array.`,
          },
        ],
      },
    ],
  });

  const text = response.text ?? "";
  // Extract JSON from possible markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, text];
  const jsonStr = (jsonMatch[1] ?? text).trim();

  const segments: TranscriptSegment[] = JSON.parse(jsonStr);
  return buildSrtFromSegments(segments);
}
