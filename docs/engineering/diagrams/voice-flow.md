# Voice Conversation Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant OpenAI as OpenAI Realtime API
    participant App as Next.js App

    Note over User,App: 1. User clicks "Start Interview"

    User->>Browser: Click "Start Interview"
    Browser->>App: POST /api/interviews/start
    App->>OpenAI: Create realtime session
    OpenAI-->>App: sessionId + token
    App-->>Browser: { sessionId, token }
    Browser->>Browser: Establish WebRTC connection
    Browser->>OpenAI: Connect with token

    Note over User,OpenAI: 2. Interview Conversation Loop

    loop Each turn
        User->>Browser: Speak
        Browser->>Browser: MediaRecorder captures audio
        Browser->>OpenAI: send([audioChunk])
        OpenAI->>OpenAI: transcribe + infer + TTS
        OpenAI-->>Browser: audioResponse (streamed)
        Browser->>Browser: Play audio via WebRTC
        Browser->>App: sendTranscriptEntry()
        App->>App: Persist incrementally
    end

    Note over User,App: 3. Interview Ends

    User->>Browser: Click "End Interview"
    Browser->>OpenAI: close session
    Browser->>App: POST /api/interviews/:id/complete
    App->>App: Generate feedback report
    App-->>Browser: Report
    Browser-->>User: Show feedback
```

---

## WebRTC Audio Pipeline

```mermaid
flowchart LR
    subgraph Browser
        Mic["Microphone<br/>(getUserMedia)"]
        Rec["MediaRecorder<br/>(audio/webm)"]
        Buffer["Audio Buffer<br/>(chunked)"]
        RTC["RTCPeerConnection<br/>(WebRTC)"]
        AudioOut["Speaker<br/>(audio element)"]
    end

    subgraph OpenAI["OpenAI Realtime API"]
        WS["WebSocket<br/>(realtime v1)"]
        STT["Speech → Text"]
        LLM["GPT-4<br/>(contextual推理)"]
        TTS["Text → Speech"]
    end

    Mic -->|"raw audio"| Rec
    Rec -->|"webm chunks"| Buffer
    Buffer -->|"stream"| WS
    WS -->|"audio stream"| RTC
    RTC -->|"play"| AudioOut

    WS <-->|"transcription<br/>events"| STT
    STT --> LLM
    LLM --> TTS
    TTS -->|"audio response"| WS

    style OpenAI fill:#10A37F,stroke:#fff,color:#fff
    style Mic fill:#3B82F6,stroke:#fff,color:#fff
```

---

## Audio State Timeline

```mermaid
gantt
    title Interview Audio State Over Time
    dateFormat X
    axisFormat %s

    section Idle
    Microphone inactive         :0, 0

    section Active
    Candidate speaking           :10, 25
    AI processing               :25, 30
    AI responding               :30, 45
    Candidate speaking          :45, 65
    AI processing               :65, 70
    AI responding               :70, 85
    Candidate speaking          :85, 100

    section States
    listening                   :10, 25
    processing                  :25, 30
    speaking                    :30, 45
    listening                   :45, 65
    processing                  :65, 70
    speaking                    :70, 85
    listening                   :85, 100
    completed                   :100, 100
```

---

## Voice Quality Optimizations

| Stage | Technique | Benefit |
|-------|-----------|---------|
| Capture | `audio/webm; codecs=opus` | Wide browser support, good compression |
| Chunking | 100ms chunks | Balance between latency and overhead |
| Buffering | Adaptive jitter buffer | Smooth audio despite network jitter |
| Playback | Pre-decode next chunk | Reduce gap between AI responses |
| Network | WebRTC FEC + NACK | Resilience against packet loss |

---

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 80+ | ✅ Full | Preferred platform |
| Edge 80+ | ✅ Full | Chromium-based, same as Chrome |
| Firefox 78+ | ✅ Full | Slightly higher latency |
| Safari 14+ | ⚠️ Partial | WebRTC support exists, some quirks |
| Mobile Safari | ⚠️ Partial | Background audio issues |
| Others | ❌ Unsupported | Graceful degradation message |
