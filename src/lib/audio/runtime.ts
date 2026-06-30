/**
 * AudioRuntimeManager — single shared AudioContext for the entire interview session.
 *
 * One AudioContext is created at interview start and reused for:
 * - Microphone input analysis (AnalyserNode → VAD → waveform)
 * - AI audio playback (GainNode → AnalyserNode → speaker visualization)
 * - Voice Activity Detection (real RMS from frequency data)
 *
 * Lifecycle: start() → running → stop() → cleanup
 */

export type VADState = 'silence' | 'low' | 'speaking' | 'loud';
export type SpeakerState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted';

export interface AudioLevels {
  mic: { rms: number; peak: number; vad: VADState };
  speaker: { rms: number; peak: number; active: boolean };
}

type LevelCallback = (levels: AudioLevels) => void;
type VADCallback = (state: VADState) => void;

const SMOOTHING = 0.85; // Exponential moving average factor
const SILENCE_THRESHOLD = 0.005; // RMS below this = silence
const LOW_THRESHOLD = 0.02; // RMS below this = low speech
const LOUD_THRESHOLD = 0.15; // RMS above this = loud

export class AudioRuntimeManager {
  private ctx: AudioContext | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private speakerAnalyser: AnalyserNode | null = null;
  private speakerGain: GainNode | null = null;
  private animFrame = 0;
  private micStream: MediaStream | null = null;
  private levelCallbacks: LevelCallback[] = [];
  private vadCallbacks: VADCallback[] = [];
  private prevMicRms = 0;
  private prevSpeakerRms = 0;
  private prevVad: VADState = 'silence';
  private running = false;
  private micFreqData: Uint8Array = new Uint8Array(0);
  private speakerFreqData: Uint8Array = new Uint8Array(0);

  /** Initialize the audio runtime with the microphone stream. */
  async start(stream: MediaStream): Promise<void> {
    if (this.running) return;

    this.ctx = new AudioContext({ sampleRate: 16000 });
    this.micStream = stream;

    // ── Microphone input chain ──
    this.micSource = this.ctx.createMediaStreamSource(stream);
    this.micAnalyser = this.ctx.createAnalyser();
    this.micAnalyser.fftSize = 256;
    this.micAnalyser.smoothingTimeConstant = 0.4;
    this.micSource.connect(this.micAnalyser);
    this.micFreqData = new Uint8Array(this.micAnalyser.frequencyBinCount);

    // ── Speaker output chain (for AI audio visualization) ──
    this.speakerGain = this.ctx.createGain();
    this.speakerGain.gain.value = 1;
    this.speakerAnalyser = this.ctx.createAnalyser();
    this.speakerAnalyser.fftSize = 256;
    this.speakerAnalyser.smoothingTimeConstant = 0.5;
    this.speakerGain.connect(this.speakerAnalyser);
    this.speakerAnalyser.connect(this.ctx.destination); // AI audio plays through speakers
    this.speakerFreqData = new Uint8Array(this.speakerAnalyser.frequencyBinCount);

    this.running = true;
    this.tick();
  }

  /** Get the gain node for AI audio output. Connect AudioBufferSourceNodes here. */
  getSpeakerGain(): GainNode | null {
    return this.speakerGain;
  }

  /** Get the AudioContext (shared across mic + speaker). */
  getContext(): AudioContext | null {
    return this.ctx;
  }

  /** Subscribe to real-time audio levels (60fps). */
  onLevel(cb: LevelCallback): () => void {
    this.levelCallbacks.push(cb);
    return () => { this.levelCallbacks = this.levelCallbacks.filter(c => c !== cb); };
  }

  /** Subscribe to VAD state changes. */
  onVAD(cb: VADCallback): () => void {
    this.vadCallbacks.push(cb);
    return () => { this.vadCallbacks = this.vadCallbacks.filter(c => c !== cb); };
  }

  /** Get current raw frequency data for waveform visualization. */
  getMicFrequencies(): Uint8Array<ArrayBufferLike> {
    return new Uint8Array(this.micFreqData);
  }

  getSpeakerFrequencies(): Uint8Array<ArrayBufferLike> {
    return new Uint8Array(this.speakerFreqData);
  }

  /** Clean shutdown — stops everything, releases mic, closes context. */
  async stop(): Promise<void> {
    this.running = false;
    cancelAnimationFrame(this.animFrame);

    try {
      this.micSource?.disconnect();
    } catch { /* already disconnected */ }
    try {
      this.micAnalyser?.disconnect();
    } catch { /* already disconnected */ }
    try {
      this.speakerAnalyser?.disconnect();
    } catch { /* already disconnected */ }
    try {
      this.speakerGain?.disconnect();
    } catch { /* already disconnected */ }

    // Stop all mic tracks
    this.micStream?.getTracks().forEach(t => t.stop());
    this.micStream = null;

    // Close AudioContext
    await this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.micSource = null;
    this.micAnalyser = null;
    this.speakerAnalyser = null;
    this.speakerGain = null;
    this.levelCallbacks = [];
    this.vadCallbacks = [];
  }

  /** 60fps analysis loop */
  private tick = (): void => {
    if (!this.running) return;

    // ── Mic analysis ──
    const micRms = this.computeRMS(this.micAnalyser!, this.micFreqData);
    const smoothedMic = this.prevMicRms * SMOOTHING + micRms * (1 - SMOOTHING);
    this.prevMicRms = smoothedMic;

    let vad: VADState;
    if (smoothedMic < SILENCE_THRESHOLD) vad = 'silence';
    else if (smoothedMic < LOW_THRESHOLD) vad = 'low';
    else if (smoothedMic > LOUD_THRESHOLD) vad = 'loud';
    else vad = 'speaking';

    if (vad !== this.prevVad) {
      this.prevVad = vad;
      for (const cb of this.vadCallbacks) cb(vad);
    }

    // ── Speaker analysis ──
    const speakerRms = this.computeRMS(this.speakerAnalyser!, this.speakerFreqData);
    const smoothedSpeaker = this.prevSpeakerRms * SMOOTHING + speakerRms * (1 - SMOOTHING);
    this.prevSpeakerRms = smoothedSpeaker;

    const levels: AudioLevels = {
      mic: { rms: smoothedMic, peak: micRms, vad },
      speaker: { rms: smoothedSpeaker, peak: speakerRms, active: smoothedSpeaker > 0.003 },
    };

    for (const cb of this.levelCallbacks) cb(levels);

    this.animFrame = requestAnimationFrame(this.tick);
  };

  /** Compute RMS (Root Mean Square) from frequency data. */
  private computeRMS(analyser: AnalyserNode, data: Uint8Array<ArrayBufferLike>): number {
    analyser.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const normalized = data[i]! / 255;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / data.length);
  }
}

/** Singleton instance for the interview session. */
export const audioRuntime = new AudioRuntimeManager();
