# Voice Pipeline Architecture

```mermaid
sequenceDiagram
    participant Mic as Microphone
    participant AudioCtx as Shared AudioContext\n(16kHz)
    participant Analyser as Mic AnalyserNode\n(FFT 256)
    participant VAD as Voice Activity\nDetection (RMS)
    participant Encoder as PCM16 Encoder\n(Float32→Int16→Base64)
    participant WS as WebSocket\n(ElevenLabs ConvAI)
    participant ElevenLabs as ElevenLabs\nAgent + GPT-4o
    participant Decoder as PCM16 Decoder\n(Base64→Int16→Float32)
    participant Speaker as Speaker\n(GainNode→Analyser→Output)
    participant Waveform as Waveform UI\n(60fps Animation)

    Mic->>AudioCtx: getUserMedia({audio:true})
    AudioCtx->>Analyser: MediaStreamSource→Analyser
    Analyser->>VAD: getByteFrequencyData() @60fps
    VAD-->>Waveform: Mic frequencies + RMS level

    Mic->>AudioCtx: Audio samples (Float32)
    AudioCtx->>Encoder: ScriptProcessor (4096 samples)
    Encoder->>WS: {user_audio_chunk: base64}
    WS->>ElevenLabs: PCM16 audio stream

    ElevenLabs-->>WS: {audio_event: base64}
    WS-->>Decoder: Base64 PCM16 chunks
    Decoder-->>Speaker: AudioBuffer → speakers
    Speaker-->>Waveform: Speaker frequencies @60fps

    ElevenLabs-->>WS: {agent_response: text}
    ElevenLabs-->>WS: {user_transcript: text}

    VAD-->>Encoder: if(speaking) → mute check
    VAD-->>WS: if(speaking while AI) → {type:interrupt}

    Note over Mic,Speaker: One AudioContext reused for entire session
```

## Barge-In Flow

```mermaid
graph LR
    A[AI Speaking] -->|Local VAD detects speech| B[activateBargeIn]
    B --> C[bargeInUntil = now + 1000ms]
    C --> D[Stop AudioBufferSourceNode]
    D --> E[Mute GainNode to 0]
    E --> F[Send interrupt to ElevenLabs]
    F --> G[Discard all incoming audio]
    G --> H[Wait for new agent_response]
    H --> I[Clear bargeInUntil, restore gain]
    I --> J[Play new response]

    style B fill:#ef4444,color:#fff
    style G fill:#f59e0b,color:#000
    style J fill:#10b981,color:#fff
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/audio/runtime.ts` | Shared AudioContext, AnalyserNodes, VAD, lifecycle |
| `src/hooks/use-audio-analyzer.ts` | React hook — 60fps subscription to runtime |
| `src/hooks/use-interview-session.ts` | WebSocket, audio capture/playback, barge-in |
| `src/components/features/interview/voice-interface.tsx` | Voice UI with waveforms, avatars, transcript |
