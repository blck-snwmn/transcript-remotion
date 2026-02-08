import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Captions } from "./Captions.tsx";
import type { TranscriptAudioProps } from "../schema.ts";

export const TranscriptAudio: React.FC<TranscriptAudioProps> = ({
  mediaSrc,
  captionsSrc,
  fontSize,
  highlightColor,
  backgroundColor,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <Audio src={staticFile(mediaSrc)} />
      <Captions
        captionsSrc={captionsSrc}
        fontSize={fontSize}
        highlightColor={highlightColor}
        position="center"
      />
    </AbsoluteFill>
  );
};
