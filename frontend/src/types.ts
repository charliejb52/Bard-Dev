export interface Note {
  string: number;
  fret: number;
  midi: number;
}

export interface Beat {
  time: number;
  duration: number;
  notes: Note[];
}

export interface Measure {
  index: number;
  beats: Beat[];
}

export interface Track {
  id: number;
  name: string;
  tuning: number[];
  measures: Measure[];
}

export interface SongData {
  title: string;
  tempo: number;
  tracks: Track[];
}
