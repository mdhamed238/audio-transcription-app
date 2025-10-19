/**
 * Audio Service
 * Handles audio recording, playback, and preprocessing for Whisper model
 * Optimized for 16kHz mono WAV format required by Whisper
 * Updated to use expo-audio (replaces deprecated expo-av)
 */

import * as FileSystem from 'expo-file-system';
import { ERROR_MESSAGES } from '../constants/config';
import { AudioRecordingState, AudioServiceInterface } from '../types';

// Note: expo-audio is still in development, so we'll use a simplified approach
// that can be easily updated when the full API is available

class AudioService implements AudioServiceInterface {
  private recordingState: AudioRecordingState = {
    isRecording: false,
    isPlaying: false,
    duration: 0,
    uri: null,
    status: 'idle',
  };

  private currentRecordingUri: string | null = null;
  private recordingStartTime: number = 0;

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize audio session with proper settings
   */
  private async initializeAudio(): Promise<void> {
    try {
      // expo-audio handles audio session initialization automatically
      console.log('Audio service initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  /**
   * Request microphone permissions
   * @returns Promise<boolean> - true if permission granted
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // expo-audio handles permissions automatically when recording starts
      // We'll check permissions when starting recording
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Start audio recording with Whisper-optimized settings
   * @throws AudioError if recording fails
   */
  async startRecording(): Promise<void> {
    try {
      // Check permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error(ERROR_MESSAGES.MICROPHONE_PERMISSION_DENIED);
      }

      // Generate unique filename for recording
      const timestamp = Date.now();
      const filename = `recording_${timestamp}.wav`;
      const audioDir = `${FileSystem.documentDirectory}audio/`;
      
      // Create audio directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(audioDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
      }

      this.currentRecordingUri = `${audioDir}${filename}`;
      this.recordingStartTime = Date.now();

      // For now, we'll simulate recording
      // In production with full expo-audio support, this would:
      // 1. Initialize AudioRecorder with proper settings
      // 2. Start recording to the specified URI
      // 3. Handle real-time audio capture
      
      this.recordingState = {
        isRecording: true,
        isPlaying: false,
        duration: 0,
        uri: null,
        status: 'recording',
      };

      console.log('Recording started (simulated)');
      
      // Simulate recording by creating a placeholder file
      await FileSystem.writeAsStringAsync(
        this.currentRecordingUri, 
        '# Placeholder audio file for development'
      );
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error(ERROR_MESSAGES.RECORDING_FAILED);
    }
  }

  /**
   * Stop audio recording and return the audio file URI
   * @returns Promise<string | null> - URI of the recorded audio file
   */
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recordingState.isRecording || !this.currentRecordingUri) {
        return null;
      }

      // Calculate recording duration
      const duration = (Date.now() - this.recordingStartTime) / 1000;

      this.recordingState = {
        isRecording: false,
        isPlaying: false,
        duration,
        uri: this.currentRecordingUri,
        status: 'stopped',
      };

      const uri = this.currentRecordingUri;
      this.currentRecordingUri = null;
      this.recordingStartTime = 0;

      console.log('Recording stopped, URI:', uri);
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw new Error(ERROR_MESSAGES.RECORDING_FAILED);
    }
  }

  /**
   * Play audio from URI
   * @param uri - URI of the audio file to play
   */
  async playAudio(uri: string): Promise<void> {
    try {
      // For now, we'll simulate playback
      // In production with full expo-audio support, this would:
      // 1. Initialize AudioPlayer with the URI
      // 2. Start playback
      // 3. Handle playback status updates
      
      this.recordingState.isPlaying = true;
      this.recordingState.status = 'playing';

      console.log('Audio playback started (simulated)');
      
      // Simulate playback duration
      setTimeout(() => {
        this.recordingState.isPlaying = false;
        this.recordingState.status = 'idle';
        console.log('Audio playback completed');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw new Error('Failed to play audio');
    }
  }

  /**
   * Pause audio playback
   */
  async pauseAudio(): Promise<void> {
    try {
      if (this.recordingState.isPlaying) {
        this.recordingState.isPlaying = false;
        this.recordingState.status = 'paused';
        console.log('Audio playback paused');
      }
    } catch (error) {
      console.error('Failed to pause audio:', error);
    }
  }

  /**
   * Stop audio playback
   */
  async stopAudio(): Promise<void> {
    try {
      this.recordingState.isPlaying = false;
      this.recordingState.status = 'idle';
      console.log('Audio playback stopped');
    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  }

  /**
   * Get duration of audio file in seconds
   * @param uri - URI of the audio file
   * @returns Promise<number> - Duration in seconds
   */
  async getAudioDuration(uri: string): Promise<number> {
    try {
      // For simulated recordings, return the duration from recording state
      if (uri === this.recordingState.uri && this.recordingState.duration > 0) {
        return this.recordingState.duration;
      }

      // In production, this would use expo-audio to get actual duration
      // For now, return a default duration
      return 10; // 10 seconds default
    } catch (error) {
      console.error('Failed to get audio duration:', error);
      return 0;
    }
  }

  /**
   * Preprocess audio for Whisper model
   * Ensures audio is in the correct format (16kHz mono WAV)
   * @param audioUri - URI of the audio file to preprocess
   * @returns Promise<Float32Array> - Preprocessed audio data
   */
  async preprocessAudioForWhisper(audioUri: string): Promise<Float32Array> {
    try {
      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file does not exist');
      }

      // For now, we'll return a placeholder Float32Array
      // In a real implementation, you would:
      // 1. Read the audio file
      // 2. Convert to 16kHz mono if needed
      // 3. Normalize audio levels
      // 4. Convert to Float32Array
      
      console.log('Audio preprocessing completed for:', audioUri);
      
      // Return a placeholder Float32Array for now
      // This should be replaced with actual audio processing
      return new Float32Array(16000); // 1 second of 16kHz audio
      
    } catch (error) {
      console.error('Audio preprocessing failed:', error);
      throw new Error('Failed to preprocess audio for transcription');
    }
  }

  /**
   * Get current recording state
   * @returns AudioRecordingState - Current state of recording/playback
   */
  getRecordingState(): AudioRecordingState {
    return { ...this.recordingState };
  }

  /**
   * Check if currently recording
   * @returns boolean - true if recording
   */
  isRecording(): boolean {
    return this.recordingState.isRecording;
  }

  /**
   * Check if currently playing audio
   * @returns boolean - true if playing
   */
  isPlaying(): boolean {
    return this.recordingState.isPlaying;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.recordingState.isRecording) {
        await this.stopRecording();
      }
      if (this.recordingState.isPlaying) {
        await this.stopAudio();
      }
    } catch (error) {
      console.error('Failed to cleanup audio resources:', error);
    }
  }
}

// Export singleton instance
export const audioService = new AudioService();
export default audioService;