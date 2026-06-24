# bard-v3 — Frontend

React + Vite + Tailwind interactive guitar visualizer.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Opens at `http://localhost:5173`.

> The backend must be running at `http://localhost:8000` before uploading a file.
> See `../backend/README.md` for backend setup.

## What it does

1. **Upload** — accepts a `.gp`, `.gp3`, `.gp4`, `.gp5`, or `.gpx` file and POSTs it to `POST /parse`
2. **Guitar neck** — SVG fretboard (frets 0–12, 6 strings) highlights active notes in real time
3. **Playback bar** — play/pause button and scrubber; time advances via the Web Audio API clock

## Architecture

| File | Purpose |
|---|---|
| `src/store.ts` | Zustand store: `songData`, `currentTime`, `isPlaying`, `duration` |
| `src/audio.ts` | Singleton `AudioContext` used as a high-precision clock |
| `src/hooks/usePlaybackLoop.ts` | `requestAnimationFrame` loop that writes `currentTime` from the AudioContext |
| `src/components/FileUpload.tsx` | Upload UI and fetch call to the backend |
| `src/components/GuitarNeck.tsx` | SVG fretboard with real-time note highlighting |
| `src/components/PlaybackBar.tsx` | Play/pause + scrubber |
