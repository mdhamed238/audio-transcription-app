# Audio Transcription App - Project Document

## Executive Summary
Build a React Native audio transcription app using Expo that leverages on-device AI models for privacy-focused, offline transcription capabilities.

## Key Assumptions & Validation

### Technical Assumptions
1. **ExecuTorch Integration**: Using ExecuTorch for on-device AI model execution (as per Expo's blog)
2. **Model Choice**: Whisper Tiny or Small models (~40-150MB) for reasonable performance on mobile
3. **Expo SDK**: Minimum SDK 51+ for best AI/ML support
4. **Audio Format**: WAV format required for most transcription models
5. **Performance**: 30-60 seconds processing time for 1-minute audio on mid-range devices
6. **Storage**: 200-500MB total app size including model

### User Assumptions
- Users want offline capability for privacy/connectivity
- Users accept slower processing vs cloud APIs
- Primary use: voice notes, meeting recordings, interviews
- Target devices: iPhone 12+ / Android flagship from 2021+

## Technical Architecture

### Core Components

```
┌─────────────────────────────────────┐
│         User Interface              │
│  (Recording, Playback, Display)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Audio Processing Layer         │
│  - Record audio                     │
│  - Convert to required format       │
│  - Normalize audio data             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    ExecuTorch / Model Layer         │
│  - Load Whisper model               │
│  - Run inference                    │
│  - Return transcription             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Storage & Export               │
│  - Save transcriptions              │
│  - Export options                   │
└─────────────────────────────────────┘
```

## Technology Stack

### Required Dependencies
```json
{
  "expo": "^52.0.0",
  "expo-av": "~14.0.0",
  "expo-file-system": "~17.0.0",
  "react-native-executorch": "latest",
  "@react-native-async-storage/async-storage": "^2.0.0",
  "expo-sharing": "~12.0.0"
}
```

### Key Libraries
- **expo-av**: Audio recording and playback
- **react-native-executorch**: On-device AI model execution
- **expo-file-system**: File management for audio/models
- **AsyncStorage**: Save transcription history

## Implementation Phases

### Phase 1: Basic Audio Recording (Week 1)
**Goal**: Record and playback audio

**Tasks**:
- [ ] Set up Expo project with TypeScript
- [ ] Implement audio recording with expo-av
- [ ] Add playback functionality
- [ ] Design basic UI for record/stop/play
- [ ] Test on both iOS and Android

**Deliverable**: Working audio recorder app

### Phase 2: ExecuTorch Integration (Week 2-3)
**Goal**: Integrate AI model for transcription

**Tasks**:
- [ ] Install and configure react-native-executorch
- [ ] Download/convert Whisper model to ExecuTorch format
- [ ] Bundle model with app or download on first launch
- [ ] Create audio preprocessing pipeline (convert to WAV, proper sample rate)
- [ ] Implement model inference wrapper

**Deliverable**: App can transcribe audio (even if slow)

### Phase 3: UI/UX Polish (Week 4)
**Goal**: Production-ready interface

**Tasks**:
- [ ] Design transcription results display
- [ ] Add loading states and progress indicators
- [ ] Implement transcription history
- [ ] Add edit/copy/share functionality
- [ ] Error handling and user feedback

**Deliverable**: Polished, user-friendly app

### Phase 4: Optimization & Features (Week 5-6)
**Goal**: Performance and additional features

**Tasks**:
- [ ] Optimize model loading (lazy load, caching)
- [ ] Add background processing support
- [ ] Implement file import (transcribe existing audio)
- [ ] Add export options (txt, JSON)
- [ ] Performance testing on various devices

**Deliverable**: Optimized app with advanced features

## Project Structure

```
audio-transcription-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Record screen
│   │   ├── history.tsx        # Transcription history
│   │   └── settings.tsx       # App settings
│   └── _layout.tsx
├── components/
│   ├── AudioRecorder.tsx      # Recording component
│   ├── AudioPlayer.tsx        # Playback component
│   ├── TranscriptionCard.tsx  # Display results
│   └── LoadingIndicator.tsx   # Processing state
├── services/
│   ├── audioService.ts        # Audio recording/processing
│   ├── transcriptionService.ts # ExecuTorch integration
│   ├── storageService.ts      # AsyncStorage wrapper
│   └── modelManager.ts        # Model loading/caching
├── models/
│   └── whisper-tiny.ptl       # ExecuTorch model
├── types/
│   └── index.ts               # TypeScript definitions
└── constants/
    └── config.ts              # App configuration
```

## Critical Implementation Details

### Audio Format Requirements
```typescript
const AUDIO_CONFIG = {
  sampleRate: 16000,        // Whisper expects 16kHz
  numberOfChannels: 1,       // Mono audio
  bitDepthHint: 16,
  extension: '.wav',
  outputFormat: 'wav'
};
```

### Model Selection Trade-offs

| Model | Size | Speed | Quality | Recommendation |
|-------|------|-------|---------|----------------|
| Whisper Tiny | ~40MB | Fast | Good | ✅ Start here |
| Whisper Base | ~75MB | Medium | Better | For v2 |
| Whisper Small | ~150MB | Slow | Best | Power users |

### Performance Expectations

**Whisper Tiny on typical devices:**
- iPhone 13: ~2-3x realtime (1 min audio = 2-3 min processing)
- Pixel 6: ~3-4x realtime
- Older devices: ~5-10x realtime

## Risks & Mitigations

### Risk 1: Poor Performance on Older Devices
**Mitigation**: 
- Set minimum device requirements
- Offer cloud transcription as fallback
- Implement queue system for background processing

### Risk 2: Large App Size
**Mitigation**:
- Download model on first launch (not bundled)
- Offer model size options in settings
- Implement on-demand model downloads

### Risk 3: Accuracy Issues
**Mitigation**:
- Allow users to edit transcriptions
- Provide confidence scores
- Support multiple languages with appropriate models

### Risk 4: ExecuTorch Integration Complexity
**Mitigation**:
- Start with official Expo examples
- Have cloud API backup plan (Whisper API, AssemblyAI)
- Comprehensive error handling

## Alternative Approaches

### Option A: Hybrid Approach (Recommended)
- On-device for short clips (<1 min)
- Cloud API for longer recordings
- User can choose in settings

### Option B: Cloud-First
- Use OpenAI Whisper API or AssemblyAI
- Faster, more accurate
- Requires internet, privacy concerns

### Option C: Web Assembly
- Use Whisper.cpp compiled to WASM
- Run in WebView
- Cross-platform but may have performance issues

## Success Metrics

### MVP Success Criteria
- [ ] Record audio up to 5 minutes
- [ ] Transcribe with >80% accuracy for clear speech
- [ ] Process 1-minute audio in <3 minutes
- [ ] App size under 300MB
- [ ] Works offline

### User Satisfaction
- App store rating >4.0
- Transcription accuracy >85%
- Crash rate <1%
- User retention >40% at 7 days

## Budget & Resources

### Development Time: 6 weeks
- 1 senior developer (full-time)
- Optional: 1 designer (part-time)

### Infrastructure Costs
- **MVP**: $0 (on-device only)
- **With cloud fallback**: ~$50-200/month (depending on usage)
- **App store fees**: $99/year (iOS) + $25 one-time (Android)

### Model Costs
- Whisper models: Free (MIT license)
- ExecuTorch: Free (open source)

## Next Steps

1. **Day 1-2**: Set up Expo project, implement basic recording
2. **Day 3-5**: Research ExecuTorch integration, test model conversion
3. **Week 2**: Build transcription pipeline
4. **Week 3**: Integration testing and debugging
5. **Week 4**: UI/UX implementation
6. **Week 5-6**: Testing, optimization, beta release

## Additional Resources

- ExecuTorch Documentation: https://pytorch.org/executorch/
- Expo AV Docs: https://docs.expo.dev/versions/latest/sdk/av/
- Whisper Models: https://github.com/openai/whisper
- React Native ExecuTorch: https://github.com/pytorch/executorch

## Open Questions

1. Should we bundle the model or download on first launch?
2. What's the minimum supported device spec?
3. Do we need cloud backup/sync for transcriptions?
4. Should we support multiple languages at launch?
5. Real-time transcription or batch processing only?

---

**Document Version**: 1.0  
**Last Updated**: October 19, 2025  
**Status**: Ready for Development
