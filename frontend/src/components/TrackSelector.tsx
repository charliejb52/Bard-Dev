import { useStore } from '../store';

interface Props {
  isLoading?: boolean;
  disabled?: boolean;
}

export function TrackSelector({ isLoading = false, disabled = false }: Props) {
  const songData = useStore((s) => s.songData);
  const activeTrackIndex = useStore((s) => s.activeTrackIndex);
  const setActiveTrack = useStore((s) => s.setActiveTrack);

  if (!songData || songData.tracks.length <= 1) return null;

  const isDisabled = disabled || isLoading;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <select
          value={activeTrackIndex}
          disabled={isDisabled}
          onChange={(e) => setActiveTrack(Number(e.target.value))}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            background: '#1A1A1A',
            border: `1px solid ${isDisabled ? '#2E2E2E' : '#2E2E2E'}`,
            borderRadius: '8px',
            color: isDisabled ? '#6B6B6B' : '#F0F0F0',
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            padding: '7px 32px 7px 12px',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            transition: 'border-color 150ms, color 150ms',
            opacity: isDisabled ? 0.6 : 1,
          }}
          onFocus={(e) => {
            if (!isDisabled) e.currentTarget.style.borderColor = '#E8C547';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#2E2E2E';
          }}
        >
          {songData.tracks.map((track, i) => (
            <option key={i} value={i} style={{ background: '#1A1A1A' }}>
              {track.name || `Track ${i + 1}`}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDisabled ? '#3E3E3E' : '#6B6B6B'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: 'absolute', right: 10, pointerEvents: 'none' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <>
          <style>{`@keyframes bard-spin { to { transform: rotate(360deg); } }`}</style>
          <div
            title="Loading audio…"
            style={{
              width: 14,
              height: 14,
              border: '2px solid #2E2E2E',
              borderTopColor: '#E8C547',
              borderRadius: '50%',
              animation: 'bard-spin 0.65s linear infinite',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '12px', color: '#6B6B6B', fontFamily: "'Space Grotesk', system-ui" }}>
            Loading audio…
          </span>
        </>
      )}
    </div>
  );
}
