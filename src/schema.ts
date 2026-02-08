import { z } from "zod";

export const transcriptVideoSchema = z.object({
  mediaSrc: z.string(),
  captionsSrc: z.string(),
  fontSize: z.number().default(80),
  highlightColor: z.string().default("#39E508"),
  captionPosition: z.enum(["top", "center", "bottom"]).default("bottom"),
});

export const transcriptAudioSchema = z.object({
  mediaSrc: z.string(),
  captionsSrc: z.string(),
  fontSize: z.number().default(80),
  highlightColor: z.string().default("#39E508"),
  backgroundColor: z.string().default("#000000"),
});

export type TranscriptVideoProps = z.infer<typeof transcriptVideoSchema>;

export type TranscriptAudioProps = z.infer<typeof transcriptAudioSchema>;
