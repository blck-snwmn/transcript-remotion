# transcript-remotion

Transcribe video/audio files and generate subtitle-overlaid videos with Remotion.

## Setup

```bash
bun install
```

### Environment Variables

Create a `.env` file at the project root with your API keys.

```env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

## Usage

### 1. Place Input Files

Place your video/audio files in the `asset/` directory.

### 2. Transcribe

```bash
# OpenAI Whisper (segment-level → SRT)
bun run transcribe -- --input ./asset/voice.m4a --provider openai

# OpenAI Whisper (word-level → JSON, TikTok-style captions)
bun run transcribe -- --input ./asset/voice.m4a --provider openai --granularity word

# Gemini (segment-level → SRT)
bun run transcribe -- --input ./asset/voice.m4a --provider gemini
```

After transcription, the following files are automatically generated in `public/`:

- Caption file (`.srt` or `.json`)
- Copy of the media file
- `props.json` (render configuration)

### 3. Preview

```bash
bun run studio
```

Opens Remotion Studio in your browser to preview the video with captions.

### 4. Render

```bash
# For video files
bun run render

# For audio files
bun run render:audio
```

### Caption Modes

| Mode | Format | Description |
|------|--------|-------------|
| `segment` (default) | SRT | Display captions per segment |
| `word` | JSON | TikTok-style captions with per-word highlighting |

## Project Structure

```
transcript-remotion/
├── asset/                        # Input media files
├── scripts/
│   ├── transcribe.ts             # CLI entry point
│   ├── openai-transcriber.ts     # OpenAI Whisper API
│   ├── gemini-transcriber.ts     # Gemini API
│   └── srt.ts                    # SRT format utilities
├── src/
│   ├── index.ts                  # Remotion entry point
│   ├── Root.tsx                  # Composition definitions
│   ├── schema.ts                 # Zod schemas
│   ├── components/
│   │   ├── TranscriptVideo.tsx   # Video + captions
│   │   ├── TranscriptAudio.tsx   # Audio + background + captions
│   │   └── Captions.tsx          # Caption display component
│   └── lib/
│       └── media.ts              # calculateMetadata (duration resolution)
├── public/                       # Generated files (git-ignored)
└── remotion.config.ts
```

## Scripts

| Script | Description |
|--------|-------------|
| `bun run studio` | Start Remotion Studio |
| `bun run render` | Render video |
| `bun run render:audio` | Render audio video |
| `bun run transcribe` | Run transcription |
| `bun run lint` | Run oxlint |
| `bun run lint:fix` | Run oxlint with auto-fix |
| `bun run fmt` | Format code with oxfmt |
| `bun run fmt:check` | Check code formatting |
