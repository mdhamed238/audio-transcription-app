# Quick Start Guide

Get up and running with the Audio Transcription App in under 10 minutes!

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js version (should be >= 18.x)
node --version

# Check npm version
npm --version

# Check React Native CLI
npx react-native --version
```

For iOS development (macOS only):
```bash
# Check Xcode
xcodebuild -version

# Check CocoaPods
pod --version
```

For Android development:
```bash
# Check Java
java -version

# Check Android SDK
$ANDROID_HOME/tools/bin/sdkmanager --list | head
```

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/mdhamed238/audio-transcription-app.git
cd audio-transcription-app

# Install dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

## Step 2: Download Models (3 minutes)

```bash
# Create models directory
mkdir -p models

# Download the default model (whisper-tiny)
npm run download:models

# Or manually download from:
# https://github.com/pytorch/executorch/releases
```

Expected output:
```
Downloading whisper-tiny model...
Progress: 100%
Model saved to: ./models/whisper_tiny.pte
```

## Step 3: Configure Environment (1 minute)

Create a `.env` file in the root directory:

```bash
# Model settings
MODEL_PATH=./models/whisper_tiny.pte
DEFAULT_LANGUAGE=en
SAMPLE_RATE=16000

# Feature flags
ENABLE_REAL_TIME=true
ENABLE_FILE_IMPORT=true
```

## Step 4: Run the App (2 minutes)

### iOS (macOS only)

```bash
# Run on simulator
npm run ios

# Or specify a device
npm run ios -- --simulator="iPhone 14 Pro"
```

### Android

```bash
# Start Metro bundler in one terminal
npm start

# In another terminal, run on emulator/device
npm run android

# Or specify a device
adb devices  # List devices
npm run android -- --deviceId=DEVICE_ID
```

## Step 5: Test Basic Functionality (2 minutes)

### Test Audio Recording

1. Open the app
2. Grant microphone permission when prompted
3. Tap the "Record" button
4. Speak clearly: "Hello, this is a test."
5. Tap "Stop"
6. View the transcription

### Test File Import

1. Tap "Import Audio File"
2. Select a test audio file
3. Wait for transcription to complete
4. View the results

## Basic Usage Examples

### Example 1: Simple Recording

```typescript
import { AudioTranscriber } from './services/transcriber';

const transcriber = new AudioTranscriber({
  modelPath: './models/whisper_tiny.pte',
  language: 'en'
});

// Initialize
await transcriber.initialize();

// Start recording
await transcriber.startRecording({
  onTranscription: (text) => {
    console.log('Transcription:', text);
  }
});

// Stop recording
const result = await transcriber.stopRecording();
console.log('Final result:', result.text);
```

### Example 2: Transcribe a File

```typescript
import { transcribeAudioFile } from './services/transcriber';

const result = await transcribeAudioFile({
  filePath: '/path/to/audio.mp3',
  language: 'en',
  onProgress: (progress) => {
    console.log(`Progress: ${progress}%`);
  }
});

console.log('Transcription:', result.text);
console.log('Duration:', result.duration, 'seconds');
```

### Example 3: Using React Hook

```typescript
import React from 'react';
import { View, Button, Text } from 'react-native';
import { useTranscriber } from './hooks/useTranscriber';

const TranscriptionScreen = () => {
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
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />
      <Text>{transcription}</Text>
    </View>
  );
};
```

## Common First-Time Issues

### Issue: "Model not found"

**Solution:**
```bash
# Verify model file exists
ls -lh models/whisper_tiny.pte

# Re-download if needed
npm run download:models
```

### Issue: "Permission denied" (iOS)

**Solution:** Add to `ios/AudioTranscriptionApp/Info.plist`:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for audio transcription</string>
```

### Issue: "Permission denied" (Android)

**Solution:** Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### Issue: Build fails on iOS

**Solution:**
```bash
# Clean build
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

### Issue: Build fails on Android

**Solution:**
```bash
# Clean build
cd android
./gradlew clean
cd ..
npm run android
```

## Next Steps

Now that you have the app running:

1. **Explore the Features**: Try different languages and models
2. **Read the Docs**: Check out [API.md](API.md) for detailed API reference
3. **Customize**: Modify the app to fit your needs
4. **Contribute**: See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Performance Tips

### For Better Accuracy
- Use a quiet environment
- Speak clearly and at a normal pace
- Use `whisper-base` or `whisper-small` models

### For Better Performance
- Use `whisper-tiny` model for faster transcription
- Enable Voice Activity Detection (VAD)
- Reduce chunk size for real-time transcription

### For Lower Memory Usage
- Unload models when not in use
- Clear transcription cache regularly
- Use quantized models

## Useful Commands

```bash
# Development
npm start                 # Start Metro bundler
npm run ios               # Run on iOS
npm run android          # Run on Android

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run linter
npm run lint:fix         # Fix linting errors
npm run format           # Format code with Prettier
npm run type-check       # Check TypeScript types

# Building
npm run build:ios        # Build iOS app
npm run build:android    # Build Android app

# Models
npm run download:models  # Download default models
npm run validate:model   # Validate model format

# Debugging
npm run log:ios          # View iOS logs
npm run log:android      # View Android logs
```

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Search [GitHub Issues](https://github.com/mdhamed238/audio-transcription-app/issues)
3. Read the [FAQ](FAQ.md)
4. Ask in [GitHub Discussions](https://github.com/mdhamed238/audio-transcription-app/discussions)

## Resources

- [Full Documentation](README.md)
- [API Reference](API.md)
- [Architecture](ARCHITECTURE.md)
- [Contributing Guide](CONTRIBUTING.md)
- [ExecuTorch Docs](https://pytorch.org/executorch/)
- [React Native Docs](https://reactnative.dev/)

---

**Congratulations!** You're now ready to build amazing transcription features with the Audio Transcription App! 🎉
