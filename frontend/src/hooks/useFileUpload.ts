import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadSampler, scheduleNotes, transportStop } from '../tone';
import type { SongData } from '../types';

export type UploadStatus =
  | { kind: 'idle' }
  | { kind: 'loading'; label: string }
  | { kind: 'error'; stage: string; message: string; hint?: string };

async function readErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.detail ?? body.message ?? res.statusText;
  } catch {
    return res.statusText || `HTTP ${res.status}`;
  }
}

export function useFileUpload() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<UploadStatus>({ kind: 'idle' });

  const upload = useCallback(
    async (file: File) => {
      setStatus({ kind: 'loading', label: 'Parsing file…' });

      const form1 = new FormData();
      form1.append('file', file);
      const form2 = new FormData();
      form2.append('file', file);

      // ── 1. Parse + MIDI in parallel ─────────────────────────────────────
      let parseRes: Response;
      let midiRes: Response;
      try {
        [parseRes, midiRes] = await Promise.all([
          fetch('http://localhost:8000/parse', { method: 'POST', body: form1 }),
          fetch('http://localhost:8000/midi', { method: 'POST', body: form2 }),
        ]);
      } catch (e) {
        setStatus({
          kind: 'error',
          stage: 'Network',
          message: String(e),
          hint: 'Make sure the backend is running: uv run uvicorn main:app --port 8000',
        });
        return;
      }

      if (!parseRes.ok) {
        setStatus({
          kind: 'error',
          stage: `POST /parse → ${parseRes.status}`,
          message: await readErrorDetail(parseRes),
        });
        return;
      }
      if (!midiRes.ok) {
        setStatus({
          kind: 'error',
          stage: `POST /midi → ${midiRes.status}`,
          message: await readErrorDetail(midiRes),
          hint: 'If the error mentions "mido", run: uv sync (in backend/)',
        });
        return;
      }

      // ── 2. Decode ───────────────────────────────────────────────────────
      let songData: SongData;
      let midiBytes: ArrayBuffer;
      try {
        [songData, midiBytes] = await Promise.all([parseRes.json(), midiRes.arrayBuffer()]);
      } catch (e) {
        setStatus({ kind: 'error', stage: 'Decoding response', message: String(e) });
        return;
      }

      // ── 3. SoundFont + schedule ─────────────────────────────────────────
      setStatus({ kind: 'loading', label: 'Loading guitar samples…' });
      try {
        await loadSampler();
      } catch (e) {
        setStatus({
          kind: 'error',
          stage: 'SoundFont',
          message: String(e),
          hint: 'Check your network connection.',
        });
        return;
      }

      try {
        transportStop();
        await scheduleNotes(midiBytes);
      } catch (e) {
        setStatus({ kind: 'error', stage: 'Note scheduling', message: String(e) });
        return;
      }

      // songData travels via router state; SongPage calls setSongData on mount
      navigate('/song', { state: { songData } });
    },
    [navigate],
  );

  return { upload, status };
}
