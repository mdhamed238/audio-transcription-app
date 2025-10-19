# API Reference

Complete API documentation for the Audio Transcription App.

## Table of Contents

- [AudioTranscriber](#audiotranscriber)
- [ModelManager](#modelmanager)
- [AudioRecorder](#audiorecorder)
- [TranscriptionStorage](#transcriptionstorage)
- [Types](#types)
- [Native Modules](#native-modules)
- [Hooks](#hooks)
- [Utilities](#utilities)

## AudioTranscriber

Main class for handling audio transcription.

### Constructor

```typescript
constructor(config: TranscriberConfig)
```

Creates a new AudioTranscriber instance.

**Parameters:**
- `config` (TranscriberConfig): Configuration object

**Example:**
```typescript
const transcriber = new AudioTranscriber({
  modelPath: './models/whisper_tiny.pte',
  language: 'en',
  sampleRate: 16000,
  enableRealTime: true
});
```

### Methods

#### initialize()

```typescript
async initialize(): Promise<void>
```

Initializes the transcriber and loads the model.

**Throws:**
- `ModelLoadError` if model fails to load

**Example:**
```typescript
await transcriber.initialize();
```

#### startRecording()

```typescript
async startRecording(options: RecordingOptions): Promise<void>
```

Starts audio recording and real-time transcription.

**Parameters:**
- `options.onTranscription` (function): Callback for transcription updates
- `options.onError` (function, optional): Error callback
- `options.vadEnabled` (boolean, optional): Enable Voice Activity Detection
- `options.chunkSize` (number, optional): Audio chunk size in seconds (default: 5)

**Example:**
```typescript
await transcriber.startRecording({
  onTranscription: (text) => {
    console.log('Transcription:', text);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
  vadEnabled: true,
  chunkSize: 5
});
```

#### stopRecording()

```typescript
async stopRecording(): Promise<TranscriptionResult>
```

Stops audio recording and returns the final transcription.

**Returns:** Promise<TranscriptionResult>

**Example:**
```typescript
const result = await transcriber.stopRecording();
console.log('Final transcription:', result.text);
```

#### pauseRecording()

```typescript
async pauseRecording(): Promise<void>
```

Pauses the current recording session.

**Example:**
```typescript
await transcriber.pauseRecording();
```

#### resumeRecording()

```typescript
async resumeRecording(): Promise<void>
```

Resumes a paused recording session.

**Example:**
```typescript
await transcriber.resumeRecording();
```

#### transcribeFile()

```typescript
async transcribeFile(
  filePath: string,
  options?: FileTranscriptionOptions
): Promise<TranscriptionResult>
```

Transcribes an audio file.

**Parameters:**
- `filePath` (string): Path to audio file
- `options.language` (string, optional): Override default language
- `options.onProgress` (function, optional): Progress callback (0-100)
- `options.includeTimestamps` (boolean, optional): Include word timestamps
- `options.maxDuration` (number, optional): Maximum audio duration in seconds

**Returns:** Promise<TranscriptionResult>

**Example:**
```typescript
const result = await transcriber.transcribeFile(
  '/path/to/audio.mp3',
  {
    language: 'en',
    onProgress: (progress) => {
      console.log(`Progress: ${progress}%`);
    },
    includeTimestamps: true
  }
);
```

#### setLanguage()

```typescript
setLanguage(language: string): void
```

Sets the transcription language.

**Parameters:**
- `language` (string): Language code (e.g., 'en', 'es', 'fr')

**Example:**
```typescript
transcriber.setLanguage('es');
```

#### getLanguage()

```typescript
getLanguage(): string
```

Gets the current transcription language.

**Returns:** string

**Example:**
```typescript
const lang = transcriber.getLanguage();
console.log('Current language:', lang);
```

#### isRecording()

```typescript
isRecording(): boolean
```

Checks if currently recording.

**Returns:** boolean

**Example:**
```typescript
if (transcriber.isRecording()) {
  console.log('Currently recording');
}
```

#### dispose()

```typescript
async dispose(): Promise<void>
```

Cleans up resources and unloads the model.

**Example:**
```typescript
await transcriber.dispose();
```

## ModelManager

Manages loading and switching between models.

### Constructor

```typescript
constructor(config?: ModelManagerConfig)
```

**Example:**
```typescript
const manager = new ModelManager({
  modelsPath: './models',
  cacheEnabled: true
});
```

### Methods

#### loadModel()

```typescript
async loadModel(modelName: string): Promise<Model>
```

Loads a model by name.

**Parameters:**
- `modelName` (string): Name of the model to load

**Returns:** Promise<Model>

**Example:**
```typescript
const model = await manager.loadModel('whisper-tiny');
```

#### unloadModel()

```typescript
async unloadModel(modelName: string): Promise<void>
```

Unloads a model from memory.

**Example:**
```typescript
await manager.unloadModel('whisper-tiny');
```

#### listAvailableModels()

```typescript
async listAvailableModels(): Promise<ModelInfo[]>
```

Lists all available models.

**Returns:** Promise<ModelInfo[]>

**Example:**
```typescript
const models = await manager.listAvailableModels();
models.forEach(model => {
  console.log(`${model.name}: ${model.size}MB`);
});
```

#### getCurrentModel()

```typescript
getCurrentModel(): Model | null
```

Gets the currently loaded model.

**Returns:** Model | null

#### downloadModel()

```typescript
async downloadModel(
  modelName: string,
  onProgress?: (progress: number) => void
): Promise<void>
```

Downloads a model from the server.

**Parameters:**
- `modelName` (string): Name of the model
- `onProgress` (function, optional): Download progress callback

**Example:**
```typescript
await manager.downloadModel('whisper-base', (progress) => {
  console.log(`Downloaded: ${progress}%`);
});
```

## AudioRecorder

Handles audio recording functionality.

### Constructor

```typescript
constructor(config?: AudioRecorderConfig)
```

**Example:**
```typescript
const recorder = new AudioRecorder({
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16
});
```

### Methods

#### start()

```typescript
async start(options?: RecordOptions): Promise<void>
```

Starts audio recording.

**Parameters:**
- `options.duration` (number, optional): Maximum recording duration
- `options.onData` (function, optional): Callback for audio data chunks

**Example:**
```typescript
await recorder.start({
  duration: 60,
  onData: (data) => {
    console.log('Audio chunk received:', data.length);
  }
});
```

#### stop()

```typescript
async stop(): Promise<AudioData>
```

Stops recording and returns audio data.

**Returns:** Promise<AudioData>

**Example:**
```typescript
const audioData = await recorder.stop();
console.log('Recorded duration:', audioData.duration);
```

#### pause()

```typescript
async pause(): Promise<void>
```

Pauses recording.

#### resume()

```typescript
async resume(): Promise<void>
```

Resumes recording.

#### getAudioLevel()

```typescript
getAudioLevel(): number
```

Gets the current audio level (0-100).

**Returns:** number

**Example:**
```typescript
const level = recorder.getAudioLevel();
console.log('Audio level:', level);
```

## TranscriptionStorage

Manages storage of transcription results.

### Methods

#### save()

```typescript
async save(
  transcription: TranscriptionResult,
  metadata?: TranscriptionMetadata
): Promise<string>
```

Saves a transcription.

**Parameters:**
- `transcription` (TranscriptionResult): Transcription to save
- `metadata` (TranscriptionMetadata, optional): Additional metadata

**Returns:** Promise<string> - ID of saved transcription

**Example:**
```typescript
const id = await TranscriptionStorage.save(result, {
  title: 'Meeting Notes',
  tags: ['meeting', 'work']
});
```

#### load()

```typescript
async load(id: string): Promise<TranscriptionResult>
```

Loads a transcription by ID.

**Returns:** Promise<TranscriptionResult>

**Example:**
```typescript
const transcription = await TranscriptionStorage.load(id);
```

#### delete()

```typescript
async delete(id: string): Promise<void>
```

Deletes a transcription.

**Example:**
```typescript
await TranscriptionStorage.delete(id);
```

#### list()

```typescript
async list(options?: ListOptions): Promise<TranscriptionResult[]>
```

Lists saved transcriptions.

**Parameters:**
- `options.limit` (number, optional): Maximum number of results
- `options.offset` (number, optional): Pagination offset
- `options.sortBy` (string, optional): Sort field
- `options.order` (string, optional): Sort order ('asc' or 'desc')

**Returns:** Promise<TranscriptionResult[]>

**Example:**
```typescript
const transcriptions = await TranscriptionStorage.list({
  limit: 10,
  sortBy: 'date',
  order: 'desc'
});
```

#### search()

```typescript
async search(query: string): Promise<TranscriptionResult[]>
```

Searches transcriptions by text content.

**Returns:** Promise<TranscriptionResult[]>

**Example:**
```typescript
const results = await TranscriptionStorage.search('meeting');
```

#### export()

```typescript
async export(
  id: string,
  format: ExportFormat
): Promise<string>
```

Exports a transcription to a file.

**Parameters:**
- `id` (string): Transcription ID
- `format` (ExportFormat): Export format ('txt', 'json', 'srt', 'vtt')

**Returns:** Promise<string> - Path to exported file

**Example:**
```typescript
const filePath = await TranscriptionStorage.export(id, 'txt');
console.log('Exported to:', filePath);
```

## Types

### TranscriberConfig

```typescript
interface TranscriberConfig {
  modelPath: string;
  language: string;
  sampleRate?: number;
  enableRealTime?: boolean;
  vadThreshold?: number;
  maxAudioDuration?: number;
}
```

### TranscriptionResult

```typescript
interface TranscriptionResult {
  id?: string;
  text: string;
  segments: TranscriptionSegment[];
  duration: number;
  language: string;
  timestamp: Date;
  metadata?: TranscriptionMetadata;
}
```

### TranscriptionSegment

```typescript
interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  confidence: number;
  words?: WordSegment[];
}
```

### WordSegment

```typescript
interface WordSegment {
  word: string;
  start: number;
  end: number;
  confidence: number;
}
```

### RecordingOptions

```typescript
interface RecordingOptions {
  onTranscription: (text: string) => void;
  onError?: (error: Error) => void;
  vadEnabled?: boolean;
  chunkSize?: number;
}
```

### FileTranscriptionOptions

```typescript
interface FileTranscriptionOptions {
  language?: string;
  onProgress?: (progress: number) => void;
  includeTimestamps?: boolean;
  maxDuration?: number;
}
```

### ModelInfo

```typescript
interface ModelInfo {
  name: string;
  path: string;
  size: number;
  language: string | string[];
  version: string;
  description?: string;
}
```

### AudioData

```typescript
interface AudioData {
  data: Float32Array;
  sampleRate: number;
  channels: number;
  duration: number;
}
```

### TranscriptionMetadata

```typescript
interface TranscriptionMetadata {
  title?: string;
  tags?: string[];
  source?: 'recording' | 'file';
  fileName?: string;
  fileSize?: number;
}
```

## Native Modules

### ExecuTorchModule

Native module for ExecuTorch integration.

#### Methods

##### loadModel()

```typescript
ExecuTorchModule.loadModel(modelPath: string): Promise<void>
```

Loads an ExecuTorch model.

##### runInference()

```typescript
ExecuTorchModule.runInference(input: number[]): Promise<number[]>
```

Runs inference with the loaded model.

##### unloadModel()

```typescript
ExecuTorchModule.unloadModel(): Promise<void>
```

Unloads the current model.

##### getModelInfo()

```typescript
ExecuTorchModule.getModelInfo(): Promise<{
  name: string;
  version: string;
  inputShape: number[];
  outputShape: number[];
}>
```

Gets information about the loaded model.

### AudioModule

Native module for audio functionality.

#### Methods

##### startRecording()

```typescript
AudioModule.startRecording(config: {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
}): Promise<void>
```

##### stopRecording()

```typescript
AudioModule.stopRecording(): Promise<string>
```

Returns the path to the recorded audio file.

##### getAudioLevel()

```typescript
AudioModule.getAudioLevel(): Promise<number>
```

## Hooks

### useTranscriber

Custom hook for transcription functionality.

```typescript
function useTranscriber(config?: TranscriberConfig): {
  transcription: string;
  isRecording: boolean;
  isLoading: boolean;
  error: Error | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  transcribeFile: (path: string) => Promise<void>;
  reset: () => void;
}
```

**Example:**
```typescript
const MyComponent = () => {
  const {
    transcription,
    isRecording,
    startRecording,
    stopRecording
  } = useTranscriber({
    modelPath: './models/whisper_tiny.pte',
    language: 'en'
  });

  return (
    <View>
      <Button
        title={isRecording ? 'Stop' : 'Start'}
        onPress={isRecording ? stopRecording : startRecording}
      />
      <Text>{transcription}</Text>
    </View>
  );
};
```

### useAudioRecorder

Hook for audio recording.

```typescript
function useAudioRecorder(): {
  isRecording: boolean;
  audioLevel: number;
  duration: number;
  start: () => Promise<void>;
  stop: () => Promise<AudioData>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
}
```

### useModelManager

Hook for model management.

```typescript
function useModelManager(): {
  currentModel: Model | null;
  availableModels: ModelInfo[];
  isLoading: boolean;
  loadModel: (name: string) => Promise<void>;
  downloadModel: (name: string) => Promise<void>;
}
```

## Utilities

### AudioConverter

Utility functions for audio format conversion.

#### convertToWav()

```typescript
function convertToWav(
  inputPath: string,
  outputPath: string
): Promise<void>
```

Converts audio to WAV format.

#### resample()

```typescript
function resample(
  audioData: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array
```

Resamples audio data.

#### createMelSpectrogram()

```typescript
function createMelSpectrogram(
  audioData: Float32Array,
  options: {
    sampleRate: number;
    nMels: number;
    nFft: number;
    hopLength: number;
  }
): Float32Array
```

Creates a mel spectrogram from audio data.

### ErrorHandler

Utility for error handling.

#### handleTranscriptionError()

```typescript
function handleTranscriptionError(error: Error): {
  message: string;
  code: string;
  recoverable: boolean;
}
```

Processes transcription errors and provides user-friendly messages.

### PermissionManager

Utility for managing permissions.

#### requestMicrophonePermission()

```typescript
async function requestMicrophonePermission(): Promise<boolean>
```

Requests microphone permission.

**Example:**
```typescript
const granted = await PermissionManager.requestMicrophonePermission();
if (granted) {
  console.log('Permission granted');
}
```

#### checkMicrophonePermission()

```typescript
async function checkMicrophonePermission(): Promise<boolean>
```

Checks if microphone permission is granted.

## Error Codes

| Code | Description | Recoverable |
|------|-------------|-------------|
| `MODEL_LOAD_ERROR` | Failed to load model | Yes |
| `INFERENCE_ERROR` | Inference failed | Yes |
| `AUDIO_RECORDING_ERROR` | Audio recording failed | Yes |
| `PERMISSION_DENIED` | Required permission denied | No |
| `INVALID_AUDIO_FORMAT` | Unsupported audio format | No |
| `INSUFFICIENT_MEMORY` | Not enough memory | No |
| `NETWORK_ERROR` | Network request failed | Yes |

## Events

### TranscriptionEvents

Event emitter for transcription events.

```typescript
import { TranscriptionEvents } from './services/events';

// Listen to events
TranscriptionEvents.on('transcription:start', () => {
  console.log('Transcription started');
});

TranscriptionEvents.on('transcription:progress', (progress) => {
  console.log('Progress:', progress);
});

TranscriptionEvents.on('transcription:complete', (result) => {
  console.log('Complete:', result);
});

TranscriptionEvents.on('transcription:error', (error) => {
  console.error('Error:', error);
});
```

## Best Practices

### Memory Management

```typescript
// Always dispose transcriber when done
const transcriber = new AudioTranscriber(config);
try {
  await transcriber.initialize();
  // Use transcriber
} finally {
  await transcriber.dispose();
}
```

### Error Handling

```typescript
try {
  await transcriber.startRecording({
    onTranscription: (text) => {
      console.log(text);
    },
    onError: (error) => {
      // Handle streaming errors
      console.error('Streaming error:', error);
    }
  });
} catch (error) {
  // Handle initialization errors
  console.error('Failed to start:', error);
}
```

### Performance Optimization

```typescript
// Lazy load model
let transcriber: AudioTranscriber | null = null;

const getTranscriber = async () => {
  if (!transcriber) {
    transcriber = new AudioTranscriber(config);
    await transcriber.initialize();
  }
  return transcriber;
};

// Use transcriber
const t = await getTranscriber();
await t.startRecording(options);
```

---

For more examples and use cases, see the [README](README.md) and [examples directory](./examples).
