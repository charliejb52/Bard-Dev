-- Add user ownership to songs
ALTER TABLE songs
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX ON songs(user_id);

-- Clean slate: remove all previously public songs
DELETE FROM songs;

-- ── Songs RLS ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read access" ON songs;
DROP POLICY IF EXISTS "Service insert" ON songs;

CREATE POLICY "Users read own songs"
  ON songs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own songs"
  ON songs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own songs"
  ON songs FOR DELETE
  USING (auth.uid() = user_id);

-- ── Tracks RLS ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read access" ON tracks;
DROP POLICY IF EXISTS "Service insert" ON tracks;

CREATE POLICY "Users read own tracks"
  ON tracks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM songs
      WHERE songs.id = tracks.song_id
        AND songs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert own tracks"
  ON tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM songs
      WHERE songs.id = tracks.song_id
        AND songs.user_id = auth.uid()
    )
  );
