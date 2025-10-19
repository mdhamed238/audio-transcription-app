# Architecture Documentation

This document provides a detailed overview of the Audio Transcription App's architecture, design decisions, and implementation details.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Layers](#architecture-layers)
- [Component Design](#component-design)
- [Data Flow](#data-flow)
- [ExecuTorch Integration](#executorch-integration)
- [Native Modules](#native-modules)
- [Performance Considerations](#performance-considerations)
- [Security Architecture](#security-architecture)

## System Overview

The Audio Transcription App is built using a layered architecture that separates concerns and enables efficient on-device machine learning inference using PyTorch's ExecuTorch runtime.

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│              (React Native UI Components)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Business Logic Layer                      │
│          (TypeScript Services & State Management)            │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Native Bridge Layer                        │
│          (React Native Native Modules - Java/ObjC++)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   ExecuTorch Runtime                         │
│           (On-Device ML Inference Engine)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    ML Models Layer                           │
│         (Optimized .pte Model Files - Whisper ASR)          │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Layers

### 1. Presentation Layer

**Responsibility**: User interface and user interaction

**Technologies**:
- React Native
- TypeScript/JavaScript
- React Hooks
- React Navigation

**Key Components**:
```typescript
src/
├── components/
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Main screen
│   │   ├── TranscriptionScreen.tsx  # Real-time transcription
│   │   ├── FileImportScreen.tsx     # File import interface
│   │   └── SettingsScreen.tsx       # App settings
│   ├── common/
│   │   ├── Button.tsx               # Reusable button component
│   │   ├── AudioWaveform.tsx        # Audio visualization
│   │   ├── TranscriptionText.tsx    # Transcription display
│   │   └── LanguageSelector.tsx     # Language selection
│   └── layouts/
│       └── MainLayout.tsx           # App layout wrapper
```

**Design Patterns**:
- Component composition
- Hooks for state management
- Context API for global state
- Custom hooks for reusable logic

### 2. Business Logic Layer

**Responsibility**: Application logic, state management, and service orchestration

**Technologies**:
- TypeScript
- RxJS (for reactive streams)
- AsyncStorage (for persistence)

**Key Services**:
```typescript
src/services/
├── transcription/
│   ├── AudioTranscriber.ts          # Main transcription service
│   ├── ModelManager.ts              # Model loading and management
│   └── TranscriptionQueue.ts        # Queue management
├── audio/
│   ├── AudioRecorder.ts             # Audio recording service
│   ├── AudioProcessor.ts            # Audio preprocessing
│   └── AudioFileHandler.ts          # File import handling
├── storage/
│   ├── TranscriptionStorage.ts      # Save/load transcriptions
│   └── CacheManager.ts              # Cache management
└── utils/
    ├── AudioConverter.ts            # Format conversion
    └── ErrorHandler.ts              # Error handling
```

**State Management**:
```typescript
// Using React Context + Hooks
interface AppState {
  isRecording: boolean;
  currentTranscription: string;
  selectedModel: ModelType;
  selectedLanguage: string;
  transcriptionHistory: TranscriptionResult[];
}

// Context Provider
const AppContext = React.createContext<AppState>();
```

### 3. Native Bridge Layer

**Responsibility**: Bridge between JavaScript and native code

**iOS Implementation** (Objective-C++):
```objective-c
// ExecuTorchModule.h
@interface ExecuTorchModule : NSObject <RCTBridgeModule>
- (void)loadModel:(NSString *)path 
         resolver:(RCTPromiseResolveBlock)resolve
         rejecter:(RCTPromiseRejectBlock)reject;
- (void)runInference:(NSArray *)input
            resolver:(RCTPromiseResolveBlock)resolve
            rejecter:(RCTPromiseRejectBlock)reject;
@end
```

**Android Implementation** (Kotlin):
```kotlin
// ExecuTorchModule.kt
class ExecuTorchModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    @ReactMethod
    fun loadModel(path: String, promise: Promise)
    
    @ReactMethod
    fun runInference(input: ReadableArray, promise: Promise)
}
```

### 4. ExecuTorch Runtime Layer

**Responsibility**: Efficient ML model execution on mobile devices

**Key Features**:
- AOT (Ahead-of-Time) compilation
- Memory-efficient execution
- Hardware acceleration support
- Minimal runtime overhead

**Runtime Configuration**:
```cpp
// ExecuTorch runtime initialization
executorch::runtime::Runtime runtime;
executorch::runtime::MemoryAllocator allocator;
executorch::runtime::Method method = program.load_method("forward");
```

### 5. Models Layer

**Responsibility**: Optimized ML models for speech recognition

**Model Pipeline**:
```
PyTorch Model (.pt)
       ↓
Export to TorchScript
       ↓
Convert to ExecuTorch IR
       ↓
Apply Optimizations (Quantization, Partitioning)
       ↓
ExecuTorch Model (.pte)
```

**Supported Models**:
- Whisper Tiny (39M params, ~150MB)
- Whisper Base (74M params, ~290MB)
- Whisper Small (244M params, ~950MB)

## Component Design

### Audio Recording Flow

```
┌─────────────┐
│   User      │
│  Action     │
└──────┬──────┘
       │ Start Recording
       ▼
┌─────────────────────┐
│  AudioRecorder      │
│  Service            │
└──────┬──────────────┘
       │ Audio Chunks
       ▼
┌─────────────────────┐
│  AudioProcessor     │
│  (Preprocessing)    │
└──────┬──────────────┘
       │ Mel Spectrogram
       ▼
┌─────────────────────┐
│  AudioTranscriber   │
│  (ExecuTorch)       │
└──────┬──────────────┘
       │ Transcription
       ▼
┌─────────────────────┐
│  UI Update          │
└─────────────────────┘
```

### Model Loading Sequence

```
┌─────────────┐
│ App Start   │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ Check Model Exists   │
└──────┬───────────────┘
       │
       ▼ Yes
┌──────────────────────┐
│ Load Model Metadata  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Initialize ExecuTorch│
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Load Model to Memory │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Ready for Inference  │
└─────────────────────-┘
```

## Data Flow

### Real-Time Transcription Data Flow

```
Microphone → Audio Buffer → Preprocessing → Model Inference → Text Output → UI
     ↓             ↓              ↓               ↓              ↓         ↓
  (PCM Data)  (Chunks)    (Mel Spectrogram)  (Tokens)      (String)  (Display)
```

### File Transcription Data Flow

```
File System → Load Audio → Decode → Preprocessing → Batch Inference → Results
     ↓            ↓          ↓           ↓                ↓             ↓
 (Audio File) (Buffer)   (PCM)   (Mel Spectrograms)  (Text Segments) (Save/Display)
```

## ExecuTorch Integration

### Integration Architecture

```
┌──────────────────────────────────────────────┐
│        React Native JavaScript               │
└───────────────┬──────────────────────────────┘
                │ Native Module Bridge
┌───────────────▼──────────────────────────────┐
│        Native Code (C++/ObjC++/Java)         │
│  ┌────────────────────────────────────────┐  │
│  │   ExecuTorch Runtime Wrapper           │  │
│  └────────────┬───────────────────────────┘  │
│               │                               │
│  ┌────────────▼───────────────────────────┐  │
│  │   ExecuTorch C++ Runtime               │  │
│  │   - Memory Management                  │  │
│  │   - Kernel Execution                   │  │
│  │   - Hardware Acceleration              │  │
│  └────────────┬───────────────────────────┘  │
└───────────────┼──────────────────────────────┘
                │
┌───────────────▼──────────────────────────────┐
│        Hardware Accelerators                 │
│  - iOS: Metal Performance Shaders            │
│  - Android: Neural Networks API              │
└──────────────────────────────────────────────┘
```

### ExecuTorch Runtime Lifecycle

```typescript
class ExecuTorchManager {
  private runtime: ExecuTorchRuntime | null = null;
  private model: Model | null = null;
  
  // Initialization
  async initialize(modelPath: string): Promise<void> {
    this.runtime = await ExecuTorchRuntime.create();
    this.model = await this.runtime.loadModel(modelPath);
  }
  
  // Inference
  async infer(input: Tensor): Promise<Tensor> {
    if (!this.model) throw new Error('Model not loaded');
    return await this.model.forward(input);
  }
  
  // Cleanup
  async cleanup(): Promise<void> {
    await this.model?.unload();
    await this.runtime?.destroy();
    this.model = null;
    this.runtime = null;
  }
}
```

## Native Modules

### iOS Native Module Structure

```
ios/
├── ExecuTorchModule/
│   ├── ExecuTorchModule.h           # Header file
│   ├── ExecuTorchModule.mm          # Implementation (Obj-C++)
│   ├── ExecuTorchBridge.h           # Bridge utilities
│   └── ExecuTorchBridge.mm          # Bridge implementation
├── Frameworks/
│   └── executorch.framework         # ExecuTorch binary
└── Resources/
    └── models/                      # Bundled models
```

**Key Implementation Details**:
- Uses Objective-C++ for C++ interop
- Thread-safe implementation
- Memory management with ARC
- Error handling with NSError

### Android Native Module Structure

```
android/
├── app/src/main/
│   ├── java/com/audiotranscription/
│   │   ├── ExecuTorchModule.kt      # Main module
│   │   ├── ExecuTorchPackage.kt     # Package registration
│   │   └── ModelManager.kt          # Model management
│   ├── cpp/
│   │   ├── executorch_jni.cpp       # JNI bridge
│   │   └── CMakeLists.txt           # Build configuration
│   └── jniLibs/                     # Native libraries
│       ├── arm64-v8a/
│       ├── armeabi-v7a/
│       ├── x86/
│       └── x86_64/
```

**Key Implementation Details**:
- JNI for C++ interop
- Kotlin for modern Android development
- Thread safety with Kotlin coroutines
- Memory management with proper lifecycle

## Performance Considerations

### Memory Management

**Strategies**:
1. **Lazy Loading**: Load models only when needed
2. **Memory Pooling**: Reuse buffers for audio processing
3. **Unload Unused Models**: Free memory when switching models
4. **Streaming Processing**: Process audio in chunks

**Memory Profile**:
```
Component               Memory Usage
─────────────────────────────────────
App Base                ~50 MB
Whisper Tiny Model      ~150 MB
Audio Buffers           ~10 MB
React Native Runtime    ~80 MB
─────────────────────────────────────
Total (Typical)         ~290 MB
```

### CPU/GPU Optimization

**Techniques**:
1. **Quantization**: INT8 quantization for 4x speedup
2. **Hardware Acceleration**: Metal (iOS) and NNAPI (Android)
3. **Operator Fusion**: Combine operations to reduce overhead
4. **Memory Layout**: Optimize tensor layouts for cache efficiency

### Threading Model

```
Main Thread (UI)
       ↓
JavaScript Thread (React Native)
       ↓
Native Queue (Background)
       ↓
ExecuTorch Thread Pool
       ↓
Hardware Accelerator
```

## Security Architecture

### Data Security

**Principles**:
1. **On-Device Processing**: No data leaves the device
2. **Encrypted Storage**: Transcriptions stored encrypted
3. **No Network Access**: Audio never transmitted
4. **Secure Key Management**: User data encrypted with device keys

### Privacy Architecture

```
┌─────────────────────────────────────┐
│  User Audio Input                   │
└───────────┬─────────────────────────┘
            │ (Stays on device)
            ▼
┌─────────────────────────────────────┐
│  On-Device Processing               │
│  - Audio Recording                  │
│  - ML Inference                     │
│  - Transcription                    │
└───────────┬─────────────────────────┘
            │ (No network)
            ▼
┌─────────────────────────────────────┐
│  Local Storage (Encrypted)          │
└─────────────────────────────────────┘
```

### Permissions

**iOS (Info.plist)**:
- NSMicrophoneUsageDescription
- NSPhotoLibraryUsageDescription (for file import)

**Android (AndroidManifest.xml)**:
- RECORD_AUDIO
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

## Scalability Considerations

### Model Versioning

```
models/
├── v1/
│   ├── whisper-tiny.pte
│   └── metadata.json
├── v2/
│   ├── whisper-tiny.pte
│   └── metadata.json
└── current -> v2/
```

### Feature Flags

```typescript
interface FeatureFlags {
  enableRealTimeTranscription: boolean;
  enableFileImport: boolean;
  enableBackgroundProcessing: boolean;
  enableMultiLanguage: boolean;
  enableCloudSync: boolean;
}
```

## Design Decisions

### Why ExecuTorch?

1. **Performance**: Optimized for mobile inference
2. **Size**: Minimal runtime overhead
3. **Flexibility**: Support for custom operators
4. **Integration**: Seamless PyTorch workflow

### Why React Native?

1. **Cross-Platform**: Single codebase for iOS and Android
2. **Developer Experience**: Hot reload, debugging tools
3. **Community**: Large ecosystem of libraries
4. **Native Performance**: Native modules for ML inference

### Model Selection

**Trade-offs**:
- **Tiny**: Fast, lower accuracy, ~150MB
- **Base**: Balanced, good accuracy, ~290MB
- **Small**: Best accuracy, slower, ~950MB

Default: **Base model** for optimal balance

## Future Architecture Enhancements

### Planned Improvements

1. **Model Quantization Pipeline**: Automated INT8/INT4 quantization
2. **Dynamic Model Loading**: Load models based on device capability
3. **Streaming Inference**: Continuous transcription without chunking
4. **Multi-Model Support**: Parallel model execution
5. **Cloud Model Updates**: Over-the-air model updates

### Architecture Evolution

```
Current: Monolithic Native Module
         ↓
Next: Pluggable Backend Architecture
         ↓
Future: Federated Learning Support
```

---

This architecture is designed to be:
- **Scalable**: Easy to add new features
- **Maintainable**: Clear separation of concerns
- **Performant**: Optimized for mobile devices
- **Secure**: Privacy-first design
- **Extensible**: Plugin architecture for new capabilities
