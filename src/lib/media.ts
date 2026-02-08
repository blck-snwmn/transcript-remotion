import type { CalculateMetadataFunction } from "remotion";
import { staticFile } from "remotion";
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";
import type { TranscriptVideoProps, TranscriptAudioProps } from "../schema.ts";

const FPS = 30;

async function getMediaDuration(src: string): Promise<number> {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src, {
      getRetryDelay: () => null,
    }),
  });
  return input.computeDuration();
}

export const calculateVideoMetadata: CalculateMetadataFunction<TranscriptVideoProps> = async ({
  props,
}) => {
  const mediaUrl = staticFile(props.mediaSrc);
  const durationInSeconds = await getMediaDuration(mediaUrl);

  return {
    durationInFrames: Math.ceil(durationInSeconds * FPS),
    fps: FPS,
  };
};

export const calculateAudioMetadata: CalculateMetadataFunction<TranscriptAudioProps> = async ({
  props,
}) => {
  const mediaUrl = staticFile(props.mediaSrc);
  const durationInSeconds = await getMediaDuration(mediaUrl);

  return {
    durationInFrames: Math.ceil(durationInSeconds * FPS),
    fps: FPS,
    width: 1080,
    height: 1920,
  };
};
