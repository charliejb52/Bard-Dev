import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { usePlaybackLoop } from '../hooks/usePlaybackLoop';
import { GuitarNeck } from '../components/GuitarNeck';
import { TabScroller } from '../components/TabScroller';
import { PlaybackBar } from '../components/PlaybackBar';
import type { Note, SongData } from '../types';

function getActiveNotes(song: SongData, currentTime: number): Note[] {
  const track = song.tracks[0];
  if (!track) return [];
  const active: Note[] = [];
  for (const measure of track.measures) {
    for (const beat of measure.beats) {
      if (beat.time <= currentTime && currentTime < beat.time + beat.duration) {
        active.push(...beat.notes);
      }
    }
  }
  return active;
}

export function SongPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const setSongData = useStore((s) => s.setSongData);
  const clearSong = useStore((s) => s.clearSong);
  const songData = useStore((s) => s.songData);
  const currentTime = useStore((s) => s.currentTime);

  usePlaybackLoop();

  useEffect(() => {
    const state = location.state as { songData?: SongData } | null;
    if (state?.songData) {
      setSongData(state.songData);
    } else {
      navigate('/', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!songData) return null;

  const activeNotes = getActiveNotes(songData, currentTime);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0D0D0D', color: '#F0F0F0' }}>
      <header
        className="px-8 py-5 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid #2E2E2E' }}
      >
        <div>
          <h1
            className="text-xl font-bold leading-tight"
            style={{ fontFamily: "'Space Grotesk', system-ui" }}
          >
            {songData.title}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B6B6B' }}>
            {songData.tempo} BPM &middot;{' '}
            {songData.tracks.length} track{songData.tracks.length !== 1 ? 's' : ''}
            {songData.tracks[0] ? ` · ${songData.tracks[0].name}` : ''}
          </p>
        </div>
        <button
          onClick={() => { clearSong(); navigate('/'); }}
          className="text-sm transition-colors hover:text-white"
          style={{ color: '#6B6B6B' }}
        >
          ← Library
        </button>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-8 py-8">
        <TabScroller />
        <GuitarNeck activeNotes={activeNotes} />
        <div className="max-w-5xl mx-auto w-full">
          <PlaybackBar />
        </div>
      </main>
    </div>
  );
}
