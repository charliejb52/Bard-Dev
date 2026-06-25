import * as Tone from 'tone';
import { loadMidiIntoTone } from './utils/loadMidiIntoTone';

const SOUNDFONT_URL =
  'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_guitar_nylon-mp3.js';

let samplerPromise: Promise<Tone.Sampler> | null = null;

async function fetchSoundFont(): Promise<Record<string, string>> {
  const text = await fetch(SOUNDFONT_URL).then((r) => {
    if (!r.ok) throw new Error(`SoundFont fetch failed: ${r.status}`);
    return r.text();
  });
  // The file is: MIDI.Soundfont.xxx = { "A0": "data:...", ... }
  // The header also contains `var MIDI = {}` so indexOf('{') grabs the wrong brace.
  // Anchor on the last `= {` to find the actual note-map object.
  const eqIdx = text.lastIndexOf('= {');
  if (eqIdx === -1) throw new Error('Unexpected SoundFont format — could not find note map');
  const start = text.indexOf('{', eqIdx);
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('Could not extract note map from SoundFont');
  // JS allows trailing commas in object literals; JSON.parse does not.
  // Base64 strings never contain '}' so this replacement is safe.
  const json = text.slice(start, end + 1).replace(/,(\s*})/g, '$1');
  return JSON.parse(json);
}

export function loadSampler(): Promise<Tone.Sampler> {
  if (!samplerPromise) {
    samplerPromise = fetchSoundFont()
      .then(
        (noteMap) =>
          new Promise<Tone.Sampler>((resolve, reject) => {
            const s = new Tone.Sampler({
              urls: noteMap,
              onload: () => resolve(s),
            }).toDestination();
            setTimeout(() => reject(new Error('Sampler load timed out')), 30_000);
          }),
      )
      .catch((err) => {
        samplerPromise = null; // clear so the next call retries
        throw err;
      });
  }
  return samplerPromise;
}

export async function scheduleNotes(midiBytes: ArrayBuffer): Promise<void> {
  const blob = new Blob([midiBytes], { type: 'audio/midi' });
  await loadMidiIntoTone(blob, 0, false);
}

export function transportStart(): void {
  Tone.getTransport().start();
}

export function transportPause(): void {
  Tone.getTransport().pause();
}

export function transportStop(): void {
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
}

export function transportSeek(seconds: number): void {
  Tone.getTransport().seconds = seconds;
}

export function getTransportSeconds(): number {
  return Tone.getTransport().seconds;
}

// Must be called inside a user-gesture handler before any audio plays.
export async function resumeAudio(): Promise<void> {
  await Tone.start();
}
