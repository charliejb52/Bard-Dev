import { useEffect } from 'react';
import { useStore } from '../store';
import { getTransportSeconds, transportPause } from '../tone';

export function usePlaybackLoop() {
  const isPlaying = useStore((s) => s.isPlaying);
  const duration = useStore((s) => s.duration);
  const _setCurrentTime = useStore((s) => s._setCurrentTime);
  const pause = useStore((s) => s.pause);

  useEffect(() => {
    if (!isPlaying) return;

    let rafId: number;
    let cancelled = false;

    function tick() {
      if (cancelled) return;

      const t = getTransportSeconds();

      if (t >= duration) {
        _setCurrentTime(duration);
        transportPause();
        pause();
        return;
      }

      _setCurrentTime(t);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [isPlaying, duration]);
}
