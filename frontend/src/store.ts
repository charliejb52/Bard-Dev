import { create } from 'zustand';
import type { SongData } from './types';

function computeDuration(song: SongData): number {
  let max = 0;
  for (const track of song.tracks) {
    for (const measure of track.measures) {
      for (const beat of measure.beats) {
        const end = beat.time + beat.duration;
        if (end > max) max = end;
      }
    }
  }
  return max;
}

interface PlayerState {
  songData: SongData | null;
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  activeTrackIndex: number;
  gpFile: File | null;
  midiCache: Record<number, Blob>;
  songId: string | null;

  setSongData: (data: SongData) => void;
  clearSong: () => void;
  _setCurrentTime: (t: number) => void;
  play: () => void;
  pause: () => void;
  seek: (t: number) => void;
  setActiveTrack: (index: number) => void;
  setGpFile: (file: File | null) => void;
  setMidiCache: (index: number, blob: Blob) => void;
  setSongId: (id: string | null) => void;
}

export const useStore = create<PlayerState>((set) => ({
  songData: null,
  currentTime: 0,
  isPlaying: false,
  duration: 0,
  activeTrackIndex: 0,
  gpFile: null,
  midiCache: {},
  songId: null,

  // gpFile, midiCache, and songId are intentionally NOT reset here — they are
  // set by useFileUpload / handleRowClick before navigate() fires, and must
  // survive until useMidiTrack needs them on the next page.
  setSongData: (data) =>
    set({ songData: data, duration: computeDuration(data), currentTime: 0, isPlaying: false, activeTrackIndex: 0 }),

  clearSong: () =>
    set({ songData: null, currentTime: 0, isPlaying: false, duration: 0, activeTrackIndex: 0, gpFile: null, midiCache: {}, songId: null }),

  _setCurrentTime: (t) => set({ currentTime: t }),

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  // Updates the scrubber position; callers are responsible for also calling
  // transportSeek() so the Tone.Transport clock stays in sync.
  seek: (t) => set({ currentTime: t }),

  setActiveTrack: (index) => set({ activeTrackIndex: index }),

  setGpFile: (file) => set({ gpFile: file }),

  setMidiCache: (index, blob) =>
    set((state) => ({ midiCache: { ...state.midiCache, [index]: blob } })),

  setSongId: (id) => set({ songId: id }),
}));
