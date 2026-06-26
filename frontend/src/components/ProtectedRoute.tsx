import { Navigate } from 'react-router-dom';
import { useStore } from '../store';

const C = { bg: '#0D0D0D', border: '#2E2E2E', accent: '#E8C547' };

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((s) => s.user);
  const authLoading = useStore((s) => s.authLoading);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes bard-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 28,
          height: 28,
          border: `2px solid ${C.border}`,
          borderTopColor: C.accent,
          borderRadius: '50%',
          animation: 'bard-spin 0.65s linear infinite',
        }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}
