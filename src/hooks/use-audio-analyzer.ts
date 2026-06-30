'use client';

import { useEffect, useState } from 'react';
import { audioRuntime, type VADState, type AudioLevels } from '@/lib/audio/runtime';

export interface AnalyzerData {
  micLevel: number;
  speakerLevel: number;
  micActive: boolean;
  speakerActive: boolean;
  vad: VADState;
  micFrequencies: Uint8Array<ArrayBufferLike>;
  speakerFrequencies: Uint8Array<ArrayBufferLike>;
}

/** Hook into the shared AudioRuntimeManager. Call start() to initialize with a mic stream. */
export function useAudioAnalyzer() {
  const [data, setData] = useState<AnalyzerData>({
    micLevel: 0,
    speakerLevel: 0,
    micActive: false,
    speakerActive: false,
    vad: 'silence' as VADState,
    micFrequencies: new Uint8Array(128),
    speakerFrequencies: new Uint8Array(128),
  });

  useEffect(() => {
    const unsub = audioRuntime.onLevel((levels: AudioLevels) => {
      setData({
        micLevel: levels.mic.rms,
        speakerLevel: levels.speaker.rms,
        micActive: levels.mic.vad !== 'silence',
        speakerActive: levels.speaker.active,
        vad: levels.mic.vad,
        micFrequencies: audioRuntime.getMicFrequencies(),
        speakerFrequencies: audioRuntime.getSpeakerFrequencies(),
      });
    });

    return unsub;
  }, []);

  return data;
}
