import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { loadSampler } from '../tone';

/**
 * Replaces the currently scheduled notes with those from `blob`, then
 * positions the transport at `seekTo` and optionally resumes playback.
 *
 * Call instead of transportStop()+scheduleNotes() whenever you want to
 * swap tracks without losing the current playhead position.
 */
export async function loadMidiIntoTone(
  blob: Blob,
  seekTo: number,
  wasPlaying: boolean,
): Promise<void> {
  const sampler = await loadSampler();
  const arrayBuffer = await blob.arrayBuffer();
  const midi = new Midi(arrayBuffer);
  const track = midi.tracks[0];

  // Pause before cancelling so the sampler doesn't receive new triggers
  // while we're clearing the schedule.
  if (wasPlaying) Tone.getTransport().pause();

  Tone.getTransport().cancel();

  if (track) {
    for (const note of track.notes) {
      const noteName = Tone.Frequency(note.midi, 'midi').toNote();
      Tone.getTransport().schedule((audioTime) => {
        sampler.triggerAttackRelease(noteName, note.duration, audioTime, note.velocity);
      }, note.time);
    }
  }

  Tone.getTransport().seconds = seekTo;

  if (wasPlaying) Tone.getTransport().start();
}
