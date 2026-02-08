export type TranscriptSegment = {
  start: number; // milliseconds
  end: number; // milliseconds
  text: string;
};

export function formatSrtTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor(ms % 1000);

  return (
    [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":") + `,${String(milliseconds).padStart(3, "0")}`
  );
}

export function buildSrtFromSegments(segments: TranscriptSegment[]): string {
  return (
    segments
      .map((seg, i) => {
        const index = i + 1;
        const start = formatSrtTimestamp(seg.start);
        const end = formatSrtTimestamp(seg.end);
        return `${index}\n${start} --> ${end}\n${seg.text}`;
      })
      .join("\n\n") + "\n"
  );
}
