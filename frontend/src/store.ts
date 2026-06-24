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

  setSongData: (data: SongData) => void;
  clearSong: () => void;
  _setCurrentTime: (t: number) => void;
  play: () => void;
  pause: () => void;
  seek: (t: number) => void;
}

export const useStore = create<PlayerState>((set) => ({
  songData: null,
  currentTime: 0,
  isPlaying: false,
  duration: 0,

  setSongData: (data) =>
    set({ songData: data, duration: computeDuration(data), currentTime: 0, isPlaying: false }),

  clearSong: () =>
    set({ songData: null, currentTime: 0, isPlaying: false, duration: 0 }),

  _setCurrentTime: (t) => set({ currentTime: t }),

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  // Updates the scrubber position; callers are responsible for also calling
  // transportSeek() so the Tone.Transport clock stays in sync.
  seek: (t) => set({ currentTime: t }),
}));
