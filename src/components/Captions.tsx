import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { useDelayRender } from "remotion";
import { parseSrt, createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption, TikTokPage } from "@remotion/captions";

const SWITCH_CAPTIONS_EVERY_MS = 900;

const SegmentCaption: React.FC<{
  text: string;
  fontSize: number;
  highlightColor: string;
}> = ({ text, fontSize, highlightColor }) => {
  return (
    <div
      style={{
        fontSize,
        fontWeight: "bold",
        color: highlightColor,
        textAlign: "center",
        textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        padding: "0 40px",
        maxWidth: "90%",
        wordBreak: "auto-phrase",
        overflowWrap: "break-word",
      }}
    >
      {text}
    </div>
  );
};

const WordHighlightCaption: React.FC<{
  page: TikTokPage;
  fontSize: number;
  highlightColor: string;
}> = ({ page, fontSize, highlightColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentTimeMs = (frame / fps) * 1000;
  const absoluteTimeMs = page.startMs + currentTimeMs;

  return (
    <div
      style={{
        fontSize,
        fontWeight: "bold",
        textAlign: "center",
        textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        padding: "0 40px",
        maxWidth: "90%",
        wordBreak: "auto-phrase",
        overflowWrap: "break-word",
      }}
    >
      {page.tokens.map((token) => {
        const isActive = token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;

        return (
          <span key={token.fromMs} style={{ color: isActive ? highlightColor : "white" }}>
            {token.text}
          </span>
        );
      })}
    </div>
  );
};

export const Captions: React.FC<{
  captionsSrc: string;
  fontSize: number;
  highlightColor: string;
  position: "top" | "center" | "bottom";
}> = ({ captionsSrc, fontSize, highlightColor, position }) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  const isWordLevel = captionsSrc.endsWith(".json");

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile(captionsSrc));
      if (isWordLevel) {
        const data: Caption[] = await response.json();
        setCaptions(data);
      } else {
        const text = await response.text();
        const { captions: parsed } = parseSrt({ input: text });
        setCaptions(parsed);
      }
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [captionsSrc, isWordLevel, continueRender, cancelRender, handle]);

  useEffect(() => {
    void fetchCaptions();
  }, [fetchCaptions]);

  const pages = useMemo(() => {
    if (!captions || !isWordLevel) return [];
    const { pages: p } = createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
    });
    return p;
  }, [captions, isWordLevel]);

  if (!captions) {
    return null;
  }

  const justifyContent =
    position === "top" ? "flex-start" : position === "center" ? "center" : "flex-end";

  const paddingTop = position === "top" ? 80 : 0;
  const paddingBottom = position === "bottom" ? 120 : 0;

  if (isWordLevel) {
    return (
      <AbsoluteFill style={{ justifyContent, alignItems: "center", paddingTop, paddingBottom }}>
        {pages.map((page, index) => {
          const nextPage = pages[index + 1] ?? null;
          const lastToken = page.tokens[page.tokens.length - 1];
          const startFrame = (page.startMs / 1000) * fps;
          const pageEndFrame = lastToken ? (lastToken.toMs / 1000) * fps : startFrame;
          const endFrame = nextPage
            ? Math.min((nextPage.startMs / 1000) * fps, pageEndFrame)
            : pageEndFrame;
          const durationInFrames = Math.round(endFrame - startFrame);

          if (durationInFrames <= 0) {
            return null;
          }

          return (
            <Sequence key={index} from={Math.round(startFrame)} durationInFrames={durationInFrames}>
              <AbsoluteFill style={{ justifyContent, alignItems: "center" }}>
                <WordHighlightCaption
                  page={page}
                  fontSize={fontSize}
                  highlightColor={highlightColor}
                />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ justifyContent, alignItems: "center", paddingTop, paddingBottom }}>
      {captions.map((caption, index) => {
        const startFrame = Math.round((caption.startMs / 1000) * fps);
        const endFrame = Math.round((caption.endMs / 1000) * fps);
        const durationInFrames = endFrame - startFrame;

        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>
            <AbsoluteFill style={{ justifyContent, alignItems: "center" }}>
              <SegmentCaption
                text={caption.text}
                fontSize={fontSize}
                highlightColor={highlightColor}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
