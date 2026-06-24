import guitarpro


def _compute_ql(duration) -> float:
    """Convert a pyguitarpro Duration to quarter lengths."""
    ql = 4.0 / duration.value
    if getattr(duration, "isDoubleDotted", False):
        ql *= 1.75
    elif getattr(duration, "isDotted", False):
        ql *= 1.5
    tuplet = getattr(duration, "tuplet", None)
    if tuplet and getattr(tuplet, "enters", 1) != 1:
        ql *= tuplet.times / tuplet.enters
    return ql


def _read_bpm(raw) -> int | None:
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        v = int(raw)
    elif hasattr(raw, "value"):
        v = int(raw.value)
    else:
        return None
    return v if v > 0 else None


def _build_tempo_map(song, first_track) -> list[tuple[float, int]]:
    """
    Build a global tempo map as a sorted list of (offset_ql, bpm) tuples.
    Captures both measure-header tempo changes and per-beat mix-change events
    (sourced from the first non-percussion track, which is the authoritative
    source for beat-level tempo events in GP files).
    """
    base_tempo = int(song.tempo)
    tempo_map: list[tuple[float, int]] = [(0.0, base_tempo)]
    current_bpm = base_tempo
    measure_offset = 0.0

    for header, measure in zip(song.measureHeaders, first_track.measures):
        ts = header.timeSignature
        measure_ql = ts.numerator * (4.0 / ts.denominator.value)

        header_bpm = _read_bpm(getattr(header, "tempo", None))
        if header_bpm is not None and header_bpm != current_bpm:
            current_bpm = header_bpm
            tempo_map.append((round(measure_offset, 6), current_bpm))

        beat_offset = 0.0
        for beat in measure.voices[0].beats:
            ql = _compute_ql(beat.duration)
            beat_ql = round(measure_offset + beat_offset, 6)
            mc = getattr(beat, "mix_change", None) or getattr(beat, "mixChange", None)
            if mc is not None:
                mc_bpm = _read_bpm(getattr(mc, "tempo", None))
                if mc_bpm is not None and mc_bpm != current_bpm:
                    current_bpm = mc_bpm
                    tempo_map.append((beat_ql, current_bpm))
            beat_offset += ql

        measure_offset += measure_ql

    return tempo_map


def _ql_to_seconds(ql: float, tempo_map: list[tuple[float, int]]) -> float:
    """Convert a quarter-length offset to absolute seconds via the tempo map."""
    t = 0.0
    prev_offset, prev_bpm = tempo_map[0]

    for offset, bpm in tempo_map[1:]:
        if offset >= ql:
            break
        t += (offset - prev_offset) * (60.0 / prev_bpm)
        prev_offset = offset
        prev_bpm = bpm

    t += (ql - prev_offset) * (60.0 / prev_bpm)
    return round(t, 6)


def parse_gp(path: str) -> dict:
    try:
        song = guitarpro.parse(path)
    except Exception as exc:
        raise ValueError(f"Failed to parse Guitar Pro file: {exc}") from exc

    first_track = next(
        (t for t in song.tracks if not t.isPercussionTrack and t.strings),
        None,
    )
    if first_track is None:
        raise ValueError("No guitar track found in the file.")

    tempo_map = _build_tempo_map(song, first_track)
    base_tempo = int(song.tempo)

    tracks_out = []
    for track_idx, track in enumerate(song.tracks):
        if track.isPercussionTrack or not track.strings:
            continue

        strings_sorted = sorted(track.strings, key=lambda gs: gs.number)
        tuning = [gs.value for gs in strings_sorted]

        measures_out = []
        measure_offset = 0.0

        for measure_idx, (header, measure) in enumerate(
            zip(song.measureHeaders, track.measures)
        ):
            ts = header.timeSignature
            measure_ql = ts.numerator * (4.0 / ts.denominator.value)

            beats_out = []
            beat_offset = 0.0

            for beat in measure.voices[0].beats:
                ql = _compute_ql(beat.duration)
                beat_ql = round(measure_offset + beat_offset, 6)

                beat_time = _ql_to_seconds(beat_ql, tempo_map)
                beat_duration = _ql_to_seconds(beat_ql + ql, tempo_map) - beat_time

                notes_out = []
                for gp_note in beat.notes:
                    midi_pitch = strings_sorted[gp_note.string - 1].value + gp_note.value
                    notes_out.append({
                        "string": gp_note.string,
                        "fret": gp_note.value,
                        "midi": midi_pitch,
                    })

                if notes_out:
                    beats_out.append({
                        "time": round(beat_time, 6),
                        "duration": round(beat_duration, 6),
                        "notes": notes_out,
                    })

                beat_offset += ql

            measures_out.append({
                "index": measure_idx,
                "beats": beats_out,
            })

            measure_offset += measure_ql

        tracks_out.append({
            "id": track_idx,
            "name": track.name,
            "tuning": tuning,
            "measures": measures_out,
        })

    return {
        "title": song.title or "Untitled",
        "tempo": base_tempo,
        "tracks": tracks_out,
    }
