-- Bard: initial schema
-- Run against your Supabase project via the SQL editor or `supabase db push`.

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS songs (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    artist      text,
    tempo       integer,
    duration    float,
    track_count integer,
    created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tracks (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id     uuid        NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    track_index integer     NOT NULL,
    name        text,
    tuning      integer[],
    note_data   jsonb
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_tracks_song_id ON tracks(song_id);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE songs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth required yet)
CREATE POLICY "public read songs"
    ON songs FOR SELECT USING (true);

CREATE POLICY "public read tracks"
    ON tracks FOR SELECT USING (true);

-- Service-role writes (backend uses the anon key with RLS bypass via service key,
-- or swap SUPABASE_KEY for the service_role key to allow inserts without a policy)
CREATE POLICY "service insert songs"
    ON songs FOR INSERT WITH CHECK (true);

CREATE POLICY "service insert tracks"
    ON tracks FOR INSERT WITH CHECK (true);
