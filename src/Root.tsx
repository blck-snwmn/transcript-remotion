import React from "react";
import { Composition } from "remotion";
import { TranscriptVideo } from "./components/TranscriptVideo.tsx";
import { TranscriptAudio } from "./components/TranscriptAudio.tsx";
import { transcriptVideoSchema, transcriptAudioSchema } from "./schema.ts";
import { calculateVideoMetadata, calculateAudioMetadata } from "./lib/media.ts";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TranscriptVideo"
        component={TranscriptVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        schema={transcriptVideoSchema}
        defaultProps={{
          mediaSrc: "video.mp4",
          captionsSrc: "video.srt",
          fontSize: 80,
          highlightColor: "#39E508",
          captionPosition: "bottom" as const,
        }}
        calculateMetadata={calculateVideoMetadata}
      />
      <Composition
        id="TranscriptAudio"
        component={TranscriptAudio}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        schema={transcriptAudioSchema}
        defaultProps={{
          mediaSrc: "audio.mp3",
          captionsSrc: "audio.srt",
          fontSize: 80,
          highlightColor: "#39E508",
          backgroundColor: "#000000",
        }}
        calculateMetadata={calculateAudioMetadata}
      />
    </>
  );
};
