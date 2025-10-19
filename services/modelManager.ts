/**
 * Model Manager Service
 * Handles downloading, caching, and loading of Whisper model for ExecuTorch
 * Manages model lifecycle and provides progress tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { ERROR_MESSAGES, STORAGE_KEYS } from '../constants/config';
import {
  MODEL_CONFIG,
  ModelInfo,
  ModelManagerInterface
} from '../types';

class ModelManager implements ModelManagerInterface {
  private modelInfo: ModelInfo | null = null;
  private downloadProgress: number = 0;
  private isDownloading: boolean = false;

  constructor() {
    this.initializeModelInfo();
  }

  /**
   * Initialize model information from storage
   */
  private async initializeModelInfo(): Promise<void> {
    try {
      const storedInfo = await AsyncStorage.getItem(STORAGE_KEYS.MODEL_INFO);
      if (storedInfo) {
        this.modelInfo = JSON.parse(storedInfo);
      } else {
        this.modelInfo = {
          name: MODEL_CONFIG.NAME,
          version: MODEL_CONFIG.VERSION,
          size: MODEL_CONFIG.SIZE_MB * 1024 * 1024, // Convert MB to bytes
          path: `${FileSystem.documentDirectory}${MODEL_CONFIG.LOCAL_PATH}`,
          isDownloaded: false,
        };
      }
    } catch (error) {
      console.error('Failed to initialize model info:', error);
      this.modelInfo = {
        name: MODEL_CONFIG.NAME,
        version: MODEL_CONFIG.VERSION,
        size: MODEL_CONFIG.SIZE_MB * 1024 * 1024,
        path: `${FileSystem.documentDirectory}${MODEL_CONFIG.LOCAL_PATH}`,
        isDownloaded: false,
      };
    }
  }

  /**
   * Download the Whisper model with progress tracking
   * @param onProgress - Optional progress callback (0-100)
   */
  async downloadModel(onProgress?: (progress: number) => void): Promise<void> {
    if (this.isDownloading) {
      throw new Error('Download already in progress');
    }

    try {
      this.isDownloading = true;
      this.downloadProgress = 0;

      // Create models directory if it doesn't exist
      const modelsDir = `${FileSystem.documentDirectory}models/`;
      const dirInfo = await FileSystem.getInfoAsync(modelsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(modelsDir, { intermediates: true });
      }

      // For now, we'll simulate the download process
      // In production, you would download from a real CDN
      console.log('Starting model download...');
      
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        this.downloadProgress = i;
        if (onProgress) {
          onProgress(i);
        }
        
        // Simulate download time
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create a placeholder model file
      // In production, this would be the actual .ptl file
      const placeholderContent = `# Whisper Tiny Model Placeholder
# This is a placeholder file for the actual Whisper model.
# In production, this would be replaced with the real .ptl file.
# Size: ${MODEL_CONFIG.SIZE_MB}MB
# Format: ExecuTorch (.ptl)
# Model: ${MODEL_CONFIG.NAME} v${MODEL_CONFIG.VERSION}`;

      await FileSystem.writeAsStringAsync(this.modelInfo!.path, placeholderContent);

      // Update model info
      this.modelInfo = {
        ...this.modelInfo!,
        isDownloaded: true,
        downloadProgress: 100,
      };

      // Save model info to storage
      await AsyncStorage.setItem(STORAGE_KEYS.MODEL_INFO, JSON.stringify(this.modelInfo));
      await AsyncStorage.setItem(STORAGE_KEYS.MODEL_DOWNLOADED, 'true');

      console.log('Model download completed successfully');
    } catch (error) {
      console.error('Model download failed:', error);
      throw new Error(ERROR_MESSAGES.MODEL_DOWNLOAD_FAILED);
    } finally {
      this.isDownloading = false;
      this.downloadProgress = 0;
    }
  }

  /**
   * Check if the model is available locally
   * @returns Promise<boolean> - true if model exists and is valid
   */
  async isModelAvailable(): Promise<boolean> {
    try {
      if (!this.modelInfo) {
        await this.initializeModelInfo();
      }

      const fileInfo = await FileSystem.getInfoAsync(this.modelInfo!.path);
      return fileInfo.exists && ('size' in fileInfo ? fileInfo.size > 0 : false);
    } catch (error) {
      console.error('Failed to check model availability:', error);
      return false;
    }
  }

  /**
   * Load the model for inference
   * This would initialize the ExecuTorch runtime with the model
   */
  async loadModel(): Promise<void> {
    try {
      const isAvailable = await this.isModelAvailable();
      if (!isAvailable) {
        throw new Error(ERROR_MESSAGES.MODEL_NOT_FOUND);
      }

      // In production, this would:
      // 1. Initialize ExecuTorch runtime
      // 2. Load the .ptl model file
      // 3. Prepare the model for inference
      
      console.log('Loading Whisper model...');
      
      // Simulate model loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Failed to load model:', error);
      throw new Error('Failed to load AI model');
    }
  }

  /**
   * Get model information
   * @returns Promise<ModelInfo> - Model information object
   */
  async getModelInfo(): Promise<ModelInfo> {
    if (!this.modelInfo) {
      await this.initializeModelInfo();
    }

    const isAvailable = await this.isModelAvailable();
    return {
      ...this.modelInfo!,
      isDownloaded: isAvailable,
      downloadProgress: this.isDownloading ? this.downloadProgress : (isAvailable ? 100 : 0),
    };
  }

  /**
   * Delete the downloaded model
   */
  async deleteModel(): Promise<void> {
    try {
      if (!this.modelInfo) {
        return;
      }

      const fileInfo = await FileSystem.getInfoAsync(this.modelInfo.path);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(this.modelInfo.path);
      }

      // Update model info
      this.modelInfo = {
        ...this.modelInfo,
        isDownloaded: false,
        downloadProgress: 0,
      };

      // Update storage
      await AsyncStorage.setItem(STORAGE_KEYS.MODEL_INFO, JSON.stringify(this.modelInfo));
      await AsyncStorage.removeItem(STORAGE_KEYS.MODEL_DOWNLOADED);

      console.log('Model deleted successfully');
    } catch (error) {
      console.error('Failed to delete model:', error);
      throw new Error('Failed to delete model');
    }
  }

  /**
   * Get model size in bytes
   * @returns Promise<number> - Model size in bytes
   */
  async getModelSize(): Promise<number> {
    try {
      if (!this.modelInfo) {
        await this.initializeModelInfo();
      }

      const isAvailable = await this.isModelAvailable();
      if (!isAvailable) {
        return this.modelInfo!.size; // Return expected size
      }

      const fileInfo = await FileSystem.getInfoAsync(this.modelInfo!.path);
      return ('size' in fileInfo ? fileInfo.size : 0) || 0;
    } catch (error) {
      console.error('Failed to get model size:', error);
      return 0;
    }
  }

  /**
   * Get download progress (0-100)
   * @returns number - Download progress percentage
   */
  getDownloadProgress(): number {
    return this.downloadProgress;
  }

  /**
   * Check if currently downloading
   * @returns boolean - true if downloading
   */
  isDownloadingModel(): boolean {
    return this.isDownloading;
  }

  /**
   * Get model path
   * @returns string - Path to the model file
   */
  getModelPath(): string {
    return this.modelInfo?.path || `${FileSystem.documentDirectory}${MODEL_CONFIG.LOCAL_PATH}`;
  }

  /**
   * Validate model file integrity
   * @returns Promise<boolean> - true if model is valid
   */
  async validateModel(): Promise<boolean> {
    try {
      const isAvailable = await this.isModelAvailable();
      if (!isAvailable) {
        return false;
      }

      // In production, you would:
      // 1. Check file checksum
      // 2. Verify file format
      // 3. Test model loading
      
      // For now, just check if file exists and has content
      const fileInfo = await FileSystem.getInfoAsync(this.modelInfo!.path);
      return fileInfo.exists && ('size' in fileInfo ? fileInfo.size > 0 : false);
    } catch (error) {
      console.error('Failed to validate model:', error);
      return false;
    }
  }

  /**
   * Get storage space requirements
   * @returns Promise<{required: number, available: number}> - Space requirements
   */
  async getSpaceRequirements(): Promise<{ required: number; available: number }> {
    try {
      const required = this.modelInfo?.size || MODEL_CONFIG.SIZE_MB * 1024 * 1024;
      
      // Get available space (this is an approximation)
      const documentDirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory!);
      const available = ('size' in documentDirInfo ? documentDirInfo.size : 0) || 0;
      
      return { required, available };
    } catch (error) {
      console.error('Failed to get space requirements:', error);
      return { required: MODEL_CONFIG.SIZE_MB * 1024 * 1024, available: 0 };
    }
  }
}

// Export singleton instance
export const modelManager = new ModelManager();
export default modelManager;
