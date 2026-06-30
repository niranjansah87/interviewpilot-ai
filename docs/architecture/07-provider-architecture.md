# AI Provider Architecture

```mermaid
graph TB
    subgraph App["Application Layer"]
        CE["Conversation Engine"]
        Voice["Voice Interface"]
        Feedback["Feedback Service"]
    end

    subgraph Interface["Provider Interface (src/lib/ai/provider.ts)"]
        AI["AIProvider Interface"]
        Methods["createRealtimeSession()\nconnectToSession()\ngenerateFeedback()"]
    end

    subgraph Registry["Provider Registry"]
        Select["getActiveProvider()"]
        Env["VOICE_PROVIDER env\nFallback: VOICE_FALLBACK_PROVIDER"]
    end

    subgraph Providers["Provider Implementations"]
        EL["ElevenLabs ConvAI Adapter\n├── createRealtimeSession\n├── connectToSession (WebSocket)\n├── sendAudio (PCM16)\n├── interrupt\n└── generateFeedback → OpenAI"]
        OA["OpenAI Adapter\n├── createRealtimeSession\n├── connectToSession (WebRTC - WIP)\n└── generateFeedback (GPT-4.1-mini)"]
        Mock["Mock Provider\n├── Pre-scripted conversation\n└── Simulated feedback"]
    end

    subgraph External["External Services"]
        ELAPI["ElevenLabs API\n├── ConvAI WebSocket\n├── GPT-4o (LLM)\n└── Eleven TTS v3"]
        OAPI["OpenAI API\n├── GPT-4.1-mini (feedback)\n└── Realtime API (WIP)"]
    end

    CE --> Interface
    Voice --> Interface
    Feedback --> Interface
    Interface --> Registry
    Registry --> EL
    Registry --> OA
    Registry --> Mock
    EL --> ELAPI
    OA --> OAPI

    style Interface fill:#8b5cf6,color:#fff
    style Registry fill:#6366f1,color:#fff
    style EL fill:#10b981,color:#fff
    style OA fill:#f59e0b,color:#000
```

## Provider Selection Logic

```
VOICE_PROVIDER=elevenlabs (default)
        ↓
   Try ElevenLabs
        ↓
   Success? → Use ElevenLabs
   Fail?    → Try VOICE_FALLBACK_PROVIDER
        ↓
   Fallback=openai? → Use OpenAI
   Fallback=mock?   → Use Mock
```

## Why Provider Abstraction?

- **Swap providers** by changing one env var — zero code changes
- **Fallback chain** ensures availability
- **Mock provider** enables development without API keys
- **Future providers** (Google, Anthropic) require only new adapter implementing `AIProvider`
