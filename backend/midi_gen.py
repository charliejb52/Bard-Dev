import io

import guitarpro
import mido

from parser import _build_tempo_map, _compute_ql, _read_bpm

TICKS_PER_BEAT = 480
DEFAULT_VELOCITY = 80
DEFAULT_CHANNEL = 0


def generate_midi_from_song_data(measures: list, tempo_bpm: int) -> bytes:
    """
    Generate MIDI bytes from stored note_data (seconds-based timing).

    measures: the note_data array for one track as stored in the DB
    tempo_bpm: the song's base tempo, used to convert seconds → ticks
    """
    def secs_to_ticks(secs: float) -> int:
        return int(round(secs * tempo_bpm / 60.0 * TICKS_PER_BEAT))

    events: list[tuple[int, str, int]] = []
    for measure in measures:
        for beat in measure.get("beats", []):
            t0 = secs_to_ticks(beat["time"])
            t1 = secs_to_ticks(beat["time"] + max(beat["duration"], 60.0 / tempo_bpm / 16))
            for note in beat.get("notes", []):
                pitch = note["midi"]
                events.append((t0, "on", pitch))
                events.append((t1, "off", pitch))

    events.sort(key=lambda e: (e[0], 0 if e[1] == "off" else 1))

    mid = mido.MidiFile(ticks_per_beat=TICKS_PER_BEAT, type=0)
    note_track = mido.MidiTrack()
    mid.tracks.append(note_track)
    note_track.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(tempo_bpm), time=0))

    prev_tick = 0
    for abs_tick, evt_type, pitch in events:
        delta = abs_tick - prev_tick
        if evt_type == "on":
            note_track.append(
                mido.Message("note_on", channel=DEFAULT_CHANNEL, note=pitch,
                             velocity=DEFAULT_VELOCITY, time=delta)
            )
        else:
            note_track.append(
                mido.Message("note_off", channel=DEFAULT_CHANNEL, note=pitch,
                             velocity=0, time=delta)
            )
        prev_tick = abs_tick

    note_track.append(mido.MetaMessage("end_of_track", time=0))
    buf = io.BytesIO()
    mid.save(file=buf)
    return buf.getvalue()


def _to_ticks(offset_ql: float) -> int:
    return int(round(offset_ql * TICKS_PER_BEAT))


def generate_midi_bytes(path: str, track_index: int = 0) -> bytes:
    try:
        song = guitarpro.parse(path)
    except Exception as exc:
        raise ValueError(f"Failed to parse Guitar Pro file: {exc}") from exc

    guitar_tracks = [t for t in song.tracks if not t.isPercussionTrack and t.strings]
    if not guitar_tracks:
        raise ValueError("No guitar track found.")

    # Tempo map always derives from the first guitar track (authoritative reference)
    first_track = guitar_tracks[0]
    # Note collection uses the requested track, clamped to available range
    target_track = guitar_tracks[min(track_index, len(guitar_tracks) - 1)]

    tempo_changes = _build_tempo_map(song, first_track)

    strings_sorted = sorted(target_track.strings, key=lambda gs: gs.number)
    raw_notes: list[tuple[float, float, int]] = []
    measure_offset = 0.0

    for header, measure in zip(song.measureHeaders, target_track.measures):
        ts = header.timeSignature
        measure_ql = ts.numerator * (4.0 / ts.denominator.value)
        beat_offset = 0.0

        for beat in measure.voices[0].beats:
            ql = _compute_ql(beat.duration)
            beat_ql = round(measure_offset + beat_offset, 6)
            for gp_note in beat.notes:
                midi_pitch = strings_sorted[gp_note.string - 1].value + gp_note.value
                raw_notes.append((beat_ql, max(ql, 0.0625), midi_pitch))
            beat_offset += ql

        measure_offset += measure_ql

    mid = mido.MidiFile(ticks_per_beat=TICKS_PER_BEAT, type=1)

    # Track 0: tempo map
    tempo_track = mido.MidiTrack()
    mid.tracks.append(tempo_track)
    prev_tick = 0
    for offset_ql, bpm in tempo_changes:
        tick = _to_ticks(offset_ql)
        tempo_track.append(
            mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(bpm), time=tick - prev_tick)
        )
        prev_tick = tick
    tempo_track.append(mido.MetaMessage("end_of_track", time=0))

    # Track 1: note events
    note_track = mido.MidiTrack()
    mid.tracks.append(note_track)

    events: list[tuple[int, str, int]] = []
    for start_ql, dur_ql, pitch in raw_notes:
        events.append((_to_ticks(start_ql), "on", pitch))
        events.append((_to_ticks(start_ql + dur_ql), "off", pitch))

    events.sort(key=lambda e: (e[0], 0 if e[1] == "off" else 1))

    prev_tick = 0
    for abs_tick, evt_type, pitch in events:
        delta = abs_tick - prev_tick
        if evt_type == "on":
            note_track.append(
                mido.Message("note_on", channel=DEFAULT_CHANNEL, note=pitch,
                             velocity=DEFAULT_VELOCITY, time=delta)
            )
        else:
            note_track.append(
                mido.Message("note_off", channel=DEFAULT_CHANNEL, note=pitch,
                             velocity=0, time=delta)
            )
        prev_tick = abs_tick

    note_track.append(mido.MetaMessage("end_of_track", time=0))

    buf = io.BytesIO()
    mid.save(file=buf)
    return buf.getvalue()
