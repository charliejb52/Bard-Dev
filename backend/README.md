# bard-v3 — Guitar Pro Parser API

FastAPI backend that parses Guitar Pro files and returns a full song JSON.

## Setup

```bash
uv sync
```

## Run

```bash
uv run uvicorn main:app --reload --port 8000
```

## Endpoint

### `POST /parse`

Upload a Guitar Pro file and receive structured song JSON.

**Accepted formats:** `.gp`, `.gp3`, `.gp4`, `.gp5`, `.gpx`

```bash
curl -X POST http://localhost:8000/parse \
  -F "file=@song.gp5" | jq .
```

**Response shape:**

```json
{
  "title": "Song Title",
  "tempo": 120,
  "tracks": [
    {
      "id": 0,
      "name": "Guitar",
      "tuning": [64, 59, 55, 50, 45, 40],
      "measures": [
        {
          "index": 0,
          "beats": [
            {
              "time": 0.0,
              "duration": 0.5,
              "notes": [
                { "string": 1, "fret": 5, "midi": 64 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

- `time` and `duration` are in **seconds**, accounting for tempo changes mid-song
- `tuning` is open-string MIDI pitches, index 0 = string 1 (highest/thinnest)
- Percussion tracks are excluded
- Beats with no notes are omitted

## Interactive docs

Swagger UI is available at `http://localhost:8000/docs` when the server is running.
