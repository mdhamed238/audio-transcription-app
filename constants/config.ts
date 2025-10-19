/**
 * App configuration constants
 * Centralized configuration for the Audio Transcription App
 */

import { AppSettings, AudioConfig } from '../types';

// Audio recording configuration optimized for Whisper model
export const AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000, // Whisper expects 16kHz
  numberOfChannels: 1, // Mono audio
  bitDepthHint: 16,
  extension: '.wav',
  outputFormat: 'wav',
  bitRate: 128000,
};

// Default app settings
export const DEFAULT_SETTINGS: AppSettings = {
  maxRecordingDuration: 300, // 5 minutes in seconds
  autoSaveTranscriptions: true,
  modelVersion: 'whisper-tiny-v1',
  modelDownloaded: false,
  hapticFeedback: true,
};

// Model configuration
export const MODEL_CONFIG = {
  NAME: 'whisper-tiny',
  VERSION: 'v1',
  SIZE_MB: 40,
  // Note: This is a placeholder URL. In production, you'd host the model on a CDN
  URL: 'https://huggingface.co/microsoft/whisper-tiny/resolve/main/model.ptl',
  LOCAL_PATH: 'models/whisper-tiny.ptl',
  EXPECTED_FORMAT: '.ptl', // ExecuTorch format
} as const;

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  TRANSCRIPTIONS: 'transcriptions',
  SETTINGS: 'app_settings',
  MODEL_DOWNLOADED: 'model_downloaded',
  FIRST_LAUNCH: 'first_launch',
  MODEL_INFO: 'model_info',
} as const;

// Recording limits and constraints
export const RECORDING_LIMITS = {
  MIN_DURATION: 1, // Minimum 1 second
  MAX_DURATION: 600, // Maximum 10 minutes
  DEFAULT_DURATION: 300, // Default 5 minutes
  CHUNK_SIZE: 1024, // For audio processing chunks
} as const;

// Transcription settings
export const TRANSCRIPTION_CONFIG = {
  LANGUAGE: 'en', // English by default
  TASK: 'transcribe', // or 'translate'
  TIMEOUT_MS: 300000, // 5 minutes timeout
  MAX_AUDIO_LENGTH: 30, // Maximum 30 seconds per chunk for Whisper
  CONFIDENCE_THRESHOLD: 0.7, // Minimum confidence score
} as const;

// UI configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 2000, // 2 seconds for auto-save
  PROGRESS_UPDATE_INTERVAL: 100, // Update progress every 100ms
  MAX_HISTORY_ITEMS: 1000, // Maximum transcriptions to keep
  SEARCH_DEBOUNCE: 500, // Search debounce delay
} as const;

// Error messages
export const ERROR_MESSAGES = {
  MICROPHONE_PERMISSION_DENIED: 'Microphone permission is required to record audio. Please enable it in Settings.',
  MODEL_NOT_FOUND: 'AI model not found. Please download it from Settings.',
  MODEL_DOWNLOAD_FAILED: 'Failed to download AI model. Please check your internet connection and try again.',
  RECORDING_FAILED: 'Failed to start recording. Please try again.',
  TRANSCRIPTION_FAILED: 'Transcription failed. Please try with a shorter audio clip.',
  STORAGE_FULL: 'Storage is full. Please delete some transcriptions and try again.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  RECORDING_STARTED: 'Recording started',
  RECORDING_STOPPED: 'Recording stopped',
  TRANSCRIPTION_COMPLETE: 'Transcription completed successfully',
  MODEL_DOWNLOADED: 'AI model downloaded successfully',
  TRANSCRIPTION_SAVED: 'Transcription saved',
  TRANSCRIPTION_DELETED: 'Transcription deleted',
  SETTINGS_UPDATED: 'Settings updated',
} as const;

// File paths and directories
export const FILE_PATHS = {
  MODELS_DIR: 'models',
  AUDIO_DIR: 'audio',
  EXPORTS_DIR: 'exports',
  TEMP_DIR: 'temp',
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  MAX_MEMORY_USAGE_MB: 500, // Maximum memory usage for transcription
  MAX_PROCESSING_TIME_MS: 300000, // Maximum processing time (5 minutes)
  MIN_FREE_SPACE_MB: 100, // Minimum free space required
  LOW_MEMORY_THRESHOLD_MB: 200, // Low memory warning threshold
} as const;

// Export formats and options
export const EXPORT_FORMATS = {
  TXT: 'txt',
  JSON: 'json',
  SRT: 'srt', // SubRip subtitle format
} as const;

// App metadata
export const APP_INFO = {
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  SUPPORTED_LANGUAGES: ['en'], // Supported languages for transcription
  MIN_IOS_VERSION: '16.0',
  MIN_ANDROID_VERSION: '13',
  REQUIRED_RAM_MB: 2048, // Minimum 2GB RAM recommended
} as const;

// Debug and development settings
export const DEBUG_CONFIG = {
  ENABLE_LOGGING: __DEV__,
  LOG_LEVEL: __DEV__ ? 'debug' : 'error',
  ENABLE_PERFORMANCE_MONITORING: __DEV__,
  MOCK_TRANSCRIPTION: false, // For testing without model
} as const;
