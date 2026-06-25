def extract_techniques(gp_song) -> dict:
    counts = {
        "bends": 0,
        "hammer_ons": 0,
        "pull_offs": 0,
        "slides": 0,
        "vibratos": 0,
        "palm_mutes": 0,
        "barre_chords": 0,
        "open_chords": 0,
    }
    try:
        for track in gp_song.tracks:
            for measure in track.measures:
                for voice in measure.voices:
                    for beat in voice.beats:
                        beat_effect = getattr(beat, "effect", None)
                        if beat_effect and getattr(beat_effect, "palmMute", False):
                            counts["palm_mutes"] += 1

                        for note in beat.notes:
                            effect = getattr(note, "effect", None)
                            if effect is None:
                                continue
                            if getattr(effect, "bend", None) is not None:
                                counts["bends"] += 1
                            if getattr(effect, "hammer", False):
                                counts["hammer_ons"] += 1
                            if getattr(effect, "pullOff", False):
                                counts["pull_offs"] += 1
                            slides = getattr(effect, "slides", None)
                            if slides and len(slides) > 0:
                                counts["slides"] += 1
                            if getattr(effect, "vibrato", False):
                                counts["vibratos"] += 1

        print(
            f"Extracted techniques: {counts['bends']} bends, "
            f"{counts['hammer_ons']} hammer-ons, "
            f"{counts['pull_offs']} pull-offs, "
            f"{counts['slides']} slides, "
            f"{counts['vibratos']} vibratos, "
            f"{counts['palm_mutes']} palm mutes"
        )
    except Exception as exc:
        print(f"Warning: technique extraction failed: {exc}")
        return {k: 0 for k in counts}

    return counts
