import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SongPage } from './pages/SongPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/song" element={<SongPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
