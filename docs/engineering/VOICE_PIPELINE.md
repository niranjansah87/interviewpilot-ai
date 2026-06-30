# Voice Pipeline Architecture

## Overview

InterviewPilot AI uses ElevenLabs Conversational AI for real-time voice interviews. The audio pipeline handles microphone capture, WebSocket streaming, AI response playback, and interruption (barge-in).

## Architecture

```
Browser Microphone
      ↓
getUserMedia({ audio: true })
      ↓
AudioContext (16kHz mono)
      ↓
ScriptProcessorNode (4096 samples)
      ↓
Float32 → Int16 PCM → Base64
      ↓
WebSocket → ElevenLabs ConvAI
      ↓
GPT-4o processes response
      ↓
ElevenLabs TTS (eleven_v3_conversational)
      ↓
WebSocket → Browser (base64 PCM audio events)
      ↓
Int16 → Float32 → AudioBuffer → Speakers
```

## Audio Runtime

Single shared `AudioRuntimeManager` for entire session:

- **One AudioContext** reused for mic input AND speaker output
- **AnalyserNode** (FFT 256) on mic input for real-time VAD + waveform
- **AnalyserNode** on speaker output for AI audio visualization
- **RMS computed at 60fps** via `requestAnimationFrame()`
- **VAD states**: silence (<0.01), low (<0.04), speaking (<0.07), loud (>0.20)

## Barge-In (Interruption)

When candidate speaks while AI is talking:

1. Local VAD detects speech (speaking/loud state) within ~16ms
2. `activateBargeIn()` called — sets `bargeInUntil = now + 1000ms` cooldown
3. Current `AudioBufferSourceNode` stopped immediately
4. Speaker GainNode muted to 0
5. `{ type: 'interrupt' }` sent to ElevenLabs
6. All incoming audio chunks discarded during cooldown (`playPCM16` gate)
7. New `agent_response` event clears cooldown, restores gain

## ElevenLabs WebSocket Protocol

- **Client → Server**: `user_audio_chunk` (base64 PCM), `interrupt`, `conversation_initiation_client_data`, `pong`
- **Server → Client**: `audio_event` (base64 PCM), `agent_response`, `user_transcript`, `agent_transcript`, `interruption`, `ping`
- **Contextual updates**: Candidate profile sent via `contextual_update` event

## File Reference

| File | Purpose |
|------|---------|
| `src/lib/audio/runtime.ts` | Shared AudioContext, AnalyserNodes, VAD |
| `src/hooks/use-audio-analyzer.ts` | React hook consuming runtime at 60fps |
| `src/hooks/use-interview-session.ts` | WebSocket connection, audio capture/playback, barge-in |
| `src/components/features/interview/voice-interface.tsx` | Voice UI with waveforms, avatars, transcript |
| `src/components/features/interview/waveform.tsx` | Waveform + PulseRing components |
| `src/lib/ai/elevenlabs-conversational.ts` | ElevenLabs ConvAI adapter |
| `src/app/api/v1/voice/connect/route.ts` | Signed URL endpoint |

## Known Limitations

- Uses deprecated `ScriptProcessorNode` (AudioWorklet recommended for production)
- No browser-side VAD beyond RMS — relies on server VAD as backup
- ElevenLabs ConvAI requires paid tier with `convai_write` permission
