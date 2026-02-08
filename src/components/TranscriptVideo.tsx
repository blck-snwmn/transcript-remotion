import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { Captions } from "./Captions.tsx";
import type { TranscriptVideoProps } from "../schema.ts";

export const TranscriptVideo: React.FC<TranscriptVideoProps> = ({
  mediaSrc,
  captionsSrc,
  fontSize,
  highlightColor,
  captionPosition,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Video
        src={staticFile(mediaSrc)}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      <Captions
        captionsSrc={captionsSrc}
        fontSize={fontSize}
        highlightColor={highlightColor}
        position={captionPosition}
      />
    </AbsoluteFill>
  );
};
