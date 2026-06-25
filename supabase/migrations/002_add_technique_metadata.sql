ALTER TABLE songs
  ADD COLUMN bends integer DEFAULT 0,
  ADD COLUMN hammer_ons integer DEFAULT 0,
  ADD COLUMN pull_offs integer DEFAULT 0,
  ADD COLUMN slides integer DEFAULT 0,
  ADD COLUMN vibratos integer DEFAULT 0,
  ADD COLUMN palm_mutes integer DEFAULT 0,
  ADD COLUMN barre_chords integer DEFAULT 0,
  ADD COLUMN open_chords integer DEFAULT 0;

CREATE INDEX ON songs(bends);
CREATE INDEX ON songs(hammer_ons);
CREATE INDEX ON songs(pull_offs);
CREATE INDEX ON songs(slides);
CREATE INDEX ON songs(vibratos);
CREATE INDEX ON songs(palm_mutes);
CREATE INDEX ON songs(barre_chords);
CREATE INDEX ON songs(open_chords);
