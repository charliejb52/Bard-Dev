import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { loadSampler } from '../tone';
import { loadMidiIntoTone } from '../utils/loadMidiIntoTone';

/**
 * Watches activeTrackIndex and swaps Tone.js notes whenever the track
 * changes. Implements a session-scoped MIDI cache so each track is only
 * fetched once per song.
 *
 * Call this hook once inside SongPage. Returns { isLoadingMidi } so the
 * UI can disable the TrackSelector while a fetch is in flight.
 */
export function useMidiTrack() {
  const activeTrackIndex = useStore((s) => s.activeTrackIndex);
  const gpFile = useStore((s) => s.gpFile);
  const songId = useStore((s) => s.songId);
  const midiCache = useStore((s) => s.midiCache);
  const setMidiCache = useStore((s) => s.setMidiCache);

  const [isLoadingMidi, setIsLoadingMidi] = useState(false);

  // Skip the effect on initial mount — MIDI for track 0 is already scheduled
  // by useFileUpload / handleRowClick before we arrive here.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Snapshot playback state at the moment the track changes.
    // We intentionally do NOT include currentTime/isPlaying in the deps array
    // because they change every animation frame — we only want to react to
    // activeTrackIndex.
    const { currentTime, isPlaying } = useStore.getState();

    let cancelled = false;

    async function switchTrack() {
      setIsLoadingMidi(true);
      try {
        let blob = midiCache[activeTrackIndex];

        if (!blob) {
          let res: Response;
          if (gpFile) {
            const form = new FormData();
            form.append('file', gpFile);
            res = await fetch(
              `http://localhost:8000/midi?track_index=${activeTrackIndex}`,
              { method: 'POST', body: form },
            );
          } else if (songId) {
            res = await fetch(
              `http://localhost:8000/songs/${songId}/midi?track=${activeTrackIndex}`,
            );
          } else {
            return;
          }
          if (!res.ok) throw new Error(`MIDI fetch failed: HTTP ${res.status}`);
          blob = await res.blob();

          if (cancelled) return;
          setMidiCache(activeTrackIndex, blob);
        }

        await loadSampler();
        if (cancelled) return;
        await loadMidiIntoTone(blob, currentTime, isPlaying);
      } catch (err) {
        if (!cancelled) console.error('[useMidiTrack] failed to switch track audio:', err);
      } finally {
        if (!cancelled) setIsLoadingMidi(false);
      }
    }

    switchTrack();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrackIndex]);

  return { isLoadingMidi };
}
