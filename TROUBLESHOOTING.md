# Troubleshooting Guide

Comprehensive troubleshooting guide for common issues with the Audio Transcription App.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Model Issues](#model-issues)
- [Audio Recording Issues](#audio-recording-issues)
- [Transcription Issues](#transcription-issues)
- [Performance Issues](#performance-issues)
- [Build Issues](#build-issues)
- [Platform-Specific Issues](#platform-specific-issues)
- [Debug Tools](#debug-tools)

## Installation Issues

### npm install fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. Clear npm cache:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. Use legacy peer deps:
```bash
npm install --legacy-peer-deps
```

3. Update npm:
```bash
npm install -g npm@latest
```

### Pod install fails (iOS)

**Symptoms:**
```
[!] CocoaPods could not find compatible versions for pod "executorch"
```

**Solutions:**

1. Update CocoaPods:
```bash
sudo gem install cocoapods
pod repo update
```

2. Clean and reinstall:
```bash
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install
cd ..
```

3. Specify pod version:
```ruby
# In Podfile
pod 'executorch', '~> 0.1.0'
```

## Model Issues

### Model fails to load

**Symptoms:**
```
Error: Failed to load model at ./models/whisper_tiny.pte
```

**Solutions:**

1. Check file exists:
```bash
ls -lh models/whisper_tiny.pte
file models/whisper_tiny.pte
```

2. Verify model format:
```bash
npm run validate:model models/whisper_tiny.pte
```

3. Re-download model:
```bash
rm models/whisper_tiny.pte
npm run download:models
```

4. Check permissions:
```bash
chmod 644 models/whisper_tiny.pte
```

### Model is corrupted

**Symptoms:**
```
Error: Invalid model format
Error: Model verification failed
```

**Solutions:**

1. Verify checksum:
```bash
# Download checksum file
curl -O https://example.com/whisper_tiny.pte.sha256
sha256sum -c whisper_tiny.pte.sha256
```

2. Re-export model from PyTorch:
```python
import torch
from executorch.exir import to_edge

# Re-export model
model = load_your_model()
edge_program = to_edge(torch.export.export(model, (example_input,)))
with open("whisper_tiny.pte", "wb") as f:
    edge_program.to_executorch().write(f)
```

### Model inference is slow

**Symptoms:**
- Transcription takes longer than expected
- App becomes unresponsive

**Solutions:**

1. Use smaller model:
```typescript
// Switch from base to tiny
const transcriber = new AudioTranscriber({
  modelPath: './models/whisper_tiny.pte',  // Instead of base
  language: 'en'
});
```

2. Enable quantization:
```python
# When exporting model
import torch.quantization
quantized_model = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)
```

3. Enable hardware acceleration:
```typescript
// In config
const config = {
  modelPath: './models/whisper_tiny.pte',
  useHardwareAcceleration: true,  // Enable Metal/NNAPI
  language: 'en'
};
```

## Audio Recording Issues

### Microphone permission denied

**Symptoms:**
```
Error: Microphone permission denied
App crashes when trying to record
```

**Solutions:**

**iOS:**
1. Add to `Info.plist`:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for audio transcription</string>
```

2. Reset permissions:
```bash
# On simulator
xcrun simctl privacy booted reset microphone com.yourapp.bundleid
```

**Android:**
1. Add to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

2. Request at runtime:
```typescript
import { PermissionsAndroid } from 'react-native';

const granted = await PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
);
```

### No audio is recorded

**Symptoms:**
- Recording starts but no audio data
- Audio level shows 0

**Solutions:**

1. Check microphone access:
```typescript
import { check, PERMISSIONS } from 'react-native-permissions';

const status = await check(PERMISSIONS.IOS.MICROPHONE);
console.log('Permission status:', status);
```

2. Test with different audio source:
```typescript
const recorder = new AudioRecorder({
  audioSource: 'DEFAULT',  // Try VOICE_RECOGNITION, MIC, etc.
  sampleRate: 16000
});
```

3. Check audio session (iOS):
```objc
// In native code
AVAudioSession *session = [AVAudioSession sharedInstance];
[session setCategory:AVAudioSessionCategoryRecord error:nil];
[session setActive:YES error:nil];
```

### Audio quality is poor

**Symptoms:**
- Transcription accuracy is low
- Audio sounds distorted

**Solutions:**

1. Increase sample rate:
```typescript
const recorder = new AudioRecorder({
  sampleRate: 44100,  // Instead of 16000
  channels: 1,
  bitsPerSample: 16
});
```

2. Enable noise cancellation:
```typescript
const recorder = new AudioRecorder({
  noiseCancellation: true,
  echoCancellation: true
});
```

3. Adjust gain:
```typescript
await recorder.setGain(1.5);  // Increase by 50%
```

## Transcription Issues

### Poor transcription accuracy

**Symptoms:**
- Wrong words in transcription
- Gibberish output

**Solutions:**

1. Use larger model:
```typescript
// Use base or small instead of tiny
const transcriber = new AudioTranscriber({
  modelPath: './models/whisper_base.pte',
  language: 'en'
});
```

2. Ensure correct language:
```typescript
transcriber.setLanguage('en');  // Set correct language
```

3. Improve audio quality:
- Use quiet environment
- Speak clearly and at normal pace
- Position microphone closer to source

4. Adjust VAD threshold:
```typescript
const transcriber = new AudioTranscriber({
  modelPath: './models/whisper_tiny.pte',
  language: 'en',
  vadThreshold: 0.3  // Lower = more sensitive
});
```

### Transcription is empty

**Symptoms:**
```
result.text: ""
No transcription generated
```

**Solutions:**

1. Check audio duration:
```typescript
if (audioData.duration < 0.5) {
  console.log('Audio too short');
}
```

2. Verify audio format:
```typescript
console.log('Sample rate:', audioData.sampleRate);
console.log('Channels:', audioData.channels);
// Should be 16000 Hz, mono
```

3. Check audio level:
```typescript
const level = recorder.getAudioLevel();
if (level < 10) {
  console.log('Audio level too low');
}
```

### Transcription hangs

**Symptoms:**
- App freezes during transcription
- Progress callback never called

**Solutions:**

1. Add timeout:
```typescript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout')), 30000)
);

const result = await Promise.race([
  transcriber.transcribeFile(filePath),
  timeoutPromise
]);
```

2. Process in chunks:
```typescript
const result = await transcriber.transcribeFile(filePath, {
  chunkSize: 30,  // Process in 30-second chunks
  onProgress: (progress) => {
    console.log(`Progress: ${progress}%`);
  }
});
```

3. Check memory:
```typescript
// Free up memory before transcription
await transcriber.clearCache();
```

## Performance Issues

### High memory usage

**Symptoms:**
```
App killed by OS
Memory warning in logs
```

**Solutions:**

1. Unload unused models:
```typescript
await modelManager.unloadModel('whisper-base');
```

2. Clear cache:
```typescript
await TranscriptionStorage.clearCache();
```

3. Reduce buffer size:
```typescript
const recorder = new AudioRecorder({
  bufferSize: 1024  // Smaller buffer
});
```

4. Use smaller model:
```typescript
// whisper-tiny uses ~150MB vs ~950MB for small
const transcriber = new AudioTranscriber({
  modelPath: './models/whisper_tiny.pte'
});
```

### App crashes on low-end devices

**Symptoms:**
- Works on high-end phones but crashes on older devices
- Out of memory errors

**Solutions:**

1. Check device capabilities:
```typescript
import DeviceInfo from 'react-native-device-info';

const totalMemory = await DeviceInfo.getTotalMemory();
if (totalMemory < 2000000000) {  // Less than 2GB
  // Use tiny model only
  config.modelPath = './models/whisper_tiny.pte';
}
```

2. Implement adaptive quality:
```typescript
const getModelForDevice = async () => {
  const memory = await DeviceInfo.getTotalMemory();
  if (memory > 6000000000) return 'whisper-base';
  if (memory > 3000000000) return 'whisper-tiny';
  return null;  // Don't load model on very low-end devices
};
```

### Battery drain

**Symptoms:**
- App uses significant battery
- Device gets hot

**Solutions:**

1. Optimize inference frequency:
```typescript
// Process every 5 seconds instead of continuously
const transcriber = new AudioTranscriber({
  inferenceInterval: 5000
});
```

2. Use background mode wisely:
```typescript
// Stop transcription when app backgrounds
AppState.addEventListener('change', (state) => {
  if (state === 'background') {
    transcriber.pause();
  }
});
```

3. Reduce wake locks:
```typescript
// Allow device to sleep between chunks
await transcriber.setKeepAwake(false);
```

## Build Issues

### iOS build fails

**Symptoms:**
```
error: Building for iOS, but the linked library '...' was built for iOS Simulator
```

**Solutions:**

1. Clean build:
```bash
cd ios
rm -rf build
xcodebuild clean
cd ..
```

2. Reset derived data:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

3. Check architecture:
```bash
# In Xcode build settings
EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64
```

### Android build fails

**Symptoms:**
```
error: Execution failed for task ':app:mergeDebugNativeLibs'
```

**Solutions:**

1. Clean Gradle:
```bash
cd android
./gradlew clean
cd ..
```

2. Check NDK version:
```gradle
// In android/app/build.gradle
android {
    ndkVersion "23.1.7779620"
}
```

3. Fix ABI filters:
```gradle
ndk {
    abiFilters 'armeabi-v7a', 'arm64-v8a'
}
```

### Metro bundler issues

**Symptoms:**
```
error: Unable to resolve module ...
```

**Solutions:**

1. Clear Metro cache:
```bash
npm start -- --reset-cache
```

2. Clear watchman:
```bash
watchman watch-del-all
```

3. Delete node_modules:
```bash
rm -rf node_modules
npm install
```

## Platform-Specific Issues

### iOS Specific

#### Issue: App Store rejection

**Reason:** Privacy description missing

**Solution:** Add all required privacy descriptions:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for audio transcription</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to import audio files</string>
```

#### Issue: Simulator vs Device behavior differs

**Solution:** Test on actual device for performance testing:
```bash
npm run ios -- --device "Your iPhone Name"
```

### Android Specific

#### Issue: ProGuard/R8 issues in release build

**Solution:** Add ProGuard rules:
```proguard
# In android/app/proguard-rules.pro
-keep class org.pytorch.** { *; }
-keep class executorch.** { *; }
```

#### Issue: APK size too large

**Solutions:**

1. Enable APK splits:
```gradle
splits {
    abi {
        enable true
        reset()
        include 'armeabi-v7a', 'arm64-v8a'
        universalApk false
    }
}
```

2. Use Android App Bundle:
```bash
cd android
./gradlew bundleRelease
```

## Debug Tools

### Enable Debug Mode

```typescript
import { enableDebugMode } from './services/transcriber';

enableDebugMode(true);
```

### Check ExecuTorch Info

```typescript
import { getExecuTorchInfo } from './services/executorch-loader';

const info = await getExecuTorchInfo();
console.log('Version:', info.version);
console.log('Backends:', info.backends);
console.log('Hardware acceleration:', info.hardwareAcceleration);
```

### Log Audio Stats

```typescript
const recorder = new AudioRecorder();
await recorder.start({
  onData: (data) => {
    console.log('Chunk size:', data.length);
    console.log('Audio level:', recorder.getAudioLevel());
    console.log('Duration:', recorder.getDuration());
  }
});
```

### Profile Performance

```typescript
import { performance } from 'react-native-performance';

const start = performance.now();
const result = await transcriber.transcribeFile(filePath);
const duration = performance.now() - start;
console.log(`Transcription took ${duration}ms`);
```

### Memory Profiling

```typescript
import { getMemoryInfo } from './utils/memory';

const before = await getMemoryInfo();
await transcriber.transcribeFile(filePath);
const after = await getMemoryInfo();
console.log('Memory used:', after.used - before.used);
```

## Getting More Help

If you're still experiencing issues:

1. **Enable verbose logging:**
```bash
# iOS
npm run log:ios -- --verbose

# Android
npm run log:android -- --verbose
```

2. **Capture logs:**
```bash
# iOS
xcrun simctl spawn booted log stream > ios.log

# Android
adb logcat > android.log
```

3. **Create issue with:**
   - Device information
   - OS version
   - App version
   - Steps to reproduce
   - Logs
   - Screenshots if applicable

4. **Check existing issues:**
   - [GitHub Issues](https://github.com/mdhamed238/audio-transcription-app/issues)
   - [Discussions](https://github.com/mdhamed238/audio-transcription-app/discussions)

## Diagnostic Commands

```bash
# System info
npm run diagnose

# Check model integrity
npm run validate:model models/whisper_tiny.pte

# Test audio recording
npm run test:audio

# Test model inference
npm run test:inference

# Full diagnostic report
npm run diagnostic:full > diagnostic-report.txt
```

---

**Still need help?** Open an issue at [GitHub Issues](https://github.com/mdhamed238/audio-transcription-app/issues) with your diagnostic report.
