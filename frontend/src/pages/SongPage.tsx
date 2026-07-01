import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { transportStop } from '../tone';
import { usePlaybackLoop } from '../hooks/usePlaybackLoop';
import { useMidiTrack } from '../hooks/useMidiTrack';
import { TabSheet } from '../components/TabSheet';
import { PlaybackBar } from '../components/PlaybackBar';
import { TrackSelector } from '../components/TrackSelector';
import type { SongData } from '../types';

export function SongPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const setSongData = useStore((s) => s.setSongData);
  const setSongId   = useStore((s) => s.setSongId);
  const clearSong   = useStore((s) => s.clearSong);
  const songData    = useStore((s) => s.songData);

  usePlaybackLoop();
  const { isLoadingMidi } = useMidiTrack();

  useEffect(() => {
    const state = location.state as { songData?: SongData; songId?: string } | null;
    if (state?.songData) {
      setSongData(state.songData);
      if (state.songId) setSongId(state.songId);
    } else {
      navigate('/', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!songData) return null;

  return (
    <div
      style={{
        height:     '100vh',
        overflow:   'hidden',
        display:    'flex',
        flexDirection: 'column',
        background: '#0D0D0D',
        color:      '#F0F0F0',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        style={{
          flexShrink: 0,
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding:    '20px 32px',
          borderBottom: '1px solid #2E2E2E',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', system-ui",
                fontSize:   20,
                fontWeight: 700,
                lineHeight: 1.2,
                margin:     0,
              }}
            >
              {songData.title}
            </h1>
            <p style={{ fontSize: 13, color: '#6B6B6B', margin: '3px 0 0' }}>
              {songData.tempo} BPM &middot;{' '}
              {songData.tracks.length} track{songData.tracks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <TrackSelector isLoading={isLoadingMidi} disabled={isLoadingMidi} />
        </div>

        <button
          onClick={() => { transportStop(); clearSong(); navigate('/'); }}
          style={{
            background: 'none',
            border:     'none',
            color:      '#6B6B6B',
            fontSize:   14,
            cursor:     'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#F0F0F0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B6B'; }}
        >
          ← Library
        </button>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main
        style={{
          flex:        1,
          minHeight:   0,
          display:     'flex',
          flexDirection: 'column',
          padding:     '24px 32px 0',
          gap:         20,
        }}
      >
        {/* Tab sheet fills available space and scrolls internally */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <TabSheet />
        </div>

        {/* PlaybackBar pinned to bottom */}
        <div
          style={{
            flexShrink: 0,
            maxWidth:   '80rem',
            width:      '100%',
            margin:     '0 auto',
            paddingBottom: 24,
          }}
        >
          <PlaybackBar />
        </div>
      </main>
    </div>
  );
}
