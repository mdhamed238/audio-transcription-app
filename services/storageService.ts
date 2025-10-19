/**
 * Storage Service
 * Handles local storage of transcriptions using AsyncStorage
 * Provides CRUD operations and export functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { EXPORT_FORMATS } from '../constants/config';
import {
  ExportOptions,
  STORAGE_KEYS,
  StorageInfo,
  StorageServiceInterface,
  TranscriptionItem
} from '../types';

class StorageService implements StorageServiceInterface {
  /**
   * Save a new transcription to storage
   * @param item - Transcription item to save
   */
  async saveTranscription(item: TranscriptionItem): Promise<void> {
    try {
      const existingTranscriptions = await this.getTranscriptions();
      
      // Add the new transcription to the beginning of the array
      const updatedTranscriptions = [item, ...existingTranscriptions];
      
      // Limit to maximum number of items to prevent storage bloat
      const MAX_ITEMS = 1000;
      if (updatedTranscriptions.length > MAX_ITEMS) {
        updatedTranscriptions.splice(MAX_ITEMS);
      }
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSCRIPTIONS,
        JSON.stringify(updatedTranscriptions)
      );
      
      console.log('Transcription saved successfully:', item.id);
    } catch (error) {
      console.error('Failed to save transcription:', error);
      throw new Error('Failed to save transcription');
    }
  }

  /**
   * Get all transcriptions from storage
   * @returns Promise<TranscriptionItem[]> - Array of transcription items
   */
  async getTranscriptions(): Promise<TranscriptionItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSCRIPTIONS);
      
      if (!data) {
        return [];
      }
      
      const transcriptions = JSON.parse(data);
      
      // Convert createdAt strings back to Date objects
      return transcriptions.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
    } catch (error) {
      console.error('Failed to get transcriptions:', error);
      return [];
    }
  }

  /**
   * Update an existing transcription
   * @param id - ID of the transcription to update
   * @param updates - Partial transcription data to update
   */
  async updateTranscription(id: string, updates: Partial<TranscriptionItem>): Promise<void> {
    try {
      const transcriptions = await this.getTranscriptions();
      const index = transcriptions.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error('Transcription not found');
      }
      
      // Update the transcription
      transcriptions[index] = {
        ...transcriptions[index],
        ...updates,
        // Preserve the original createdAt if not being updated
        createdAt: updates.createdAt || transcriptions[index].createdAt,
      };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSCRIPTIONS,
        JSON.stringify(transcriptions)
      );
      
      console.log('Transcription updated successfully:', id);
    } catch (error) {
      console.error('Failed to update transcription:', error);
      throw new Error('Failed to update transcription');
    }
  }

  /**
   * Delete a transcription
   * @param id - ID of the transcription to delete
   */
  async deleteTranscription(id: string): Promise<void> {
    try {
      const transcriptions = await this.getTranscriptions();
      const filteredTranscriptions = transcriptions.filter(item => item.id !== id);
      
      if (filteredTranscriptions.length === transcriptions.length) {
        throw new Error('Transcription not found');
      }
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSCRIPTIONS,
        JSON.stringify(filteredTranscriptions)
      );
      
      // Also delete the associated audio file
      const transcription = transcriptions.find(item => item.id === id);
      if (transcription?.audioUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(transcription.audioUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(transcription.audioUri);
          }
        } catch (fileError) {
          console.warn('Failed to delete audio file:', fileError);
        }
      }
      
      console.log('Transcription deleted successfully:', id);
    } catch (error) {
      console.error('Failed to delete transcription:', error);
      throw new Error('Failed to delete transcription');
    }
  }

  /**
   * Export transcription in specified format
   * @param id - ID of the transcription to export
   * @param options - Export options (format, metadata, timestamps)
   * @returns Promise<string> - Path to exported file
   */
  async exportTranscription(id: string, options: ExportOptions): Promise<string> {
    try {
      const transcriptions = await this.getTranscriptions();
      const transcription = transcriptions.find(item => item.id === id);
      
      if (!transcription) {
        throw new Error('Transcription not found');
      }
      
      let content = '';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `transcription-${timestamp}`;
      
      switch (options.format) {
        case EXPORT_FORMATS.TXT:
          content = this.generateTextExport(transcription, options);
          break;
        case EXPORT_FORMATS.JSON:
          content = this.generateJsonExport(transcription, options);
          break;
        case EXPORT_FORMATS.SRT:
          content = this.generateSrtExport(transcription, options);
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      // Create export directory if it doesn't exist
      const exportDir = `${FileSystem.documentDirectory}exports/`;
      const dirInfo = await FileSystem.getInfoAsync(exportDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });
      }
      
      // Write file
      const fileUri = `${exportDir}${fileName}.${options.format}`;
      await FileSystem.writeAsStringAsync(fileUri, content);
      
      console.log('Transcription exported successfully:', fileUri);
      return fileUri;
    } catch (error) {
      console.error('Failed to export transcription:', error);
      throw new Error('Failed to export transcription');
    }
  }

  /**
   * Share exported transcription file
   * @param fileUri - URI of the file to share
   */
  async shareExportedFile(fileUri: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }
      
      await Sharing.shareAsync(fileUri);
      console.log('File shared successfully');
    } catch (error) {
      console.error('Failed to share file:', error);
      throw new Error('Failed to share file');
    }
  }

  /**
   * Get storage information
   * @returns Promise<StorageInfo> - Storage usage information
   */
  async getStorageInfo(): Promise<StorageInfo> {
    try {
      const transcriptions = await this.getTranscriptions();
      let usedSpace = 0;
      
      // Calculate used space by checking file sizes
      for (const transcription of transcriptions) {
        if (transcription.audioUri) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(transcription.audioUri);
            if (fileInfo.exists && 'size' in fileInfo && fileInfo.size) {
              usedSpace += fileInfo.size;
            }
          } catch (error) {
            console.warn('Failed to get file size for:', transcription.audioUri);
          }
        }
      }
      
      // Get available space (this is an approximation)
      const documentDirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory!);
      const availableSpace = ('size' in documentDirInfo ? documentDirInfo.size : 0) || 0;
      
      return {
        totalTranscriptions: transcriptions.length,
        usedSpace,
        availableSpace: availableSpace - usedSpace,
        lastCleanup: await this.getLastCleanupDate(),
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        totalTranscriptions: 0,
        usedSpace: 0,
        availableSpace: 0,
      };
    }
  }

  /**
   * Clear all transcription data
   */
  async clearAllData(): Promise<void> {
    try {
      // Get all transcriptions to delete their audio files
      const transcriptions = await this.getTranscriptions();
      
      // Delete audio files
      for (const transcription of transcriptions) {
        if (transcription.audioUri) {
          try {
            const fileInfo = await FileSystem.getInfoAsync(transcription.audioUri);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(transcription.audioUri);
            }
          } catch (error) {
            console.warn('Failed to delete audio file:', error);
          }
        }
      }
      
      // Clear transcriptions from storage
      await AsyncStorage.removeItem(STORAGE_KEYS.TRANSCRIPTIONS);
      
      // Clear exports directory
      const exportDir = `${FileSystem.documentDirectory}exports/`;
      const dirInfo = await FileSystem.getInfoAsync(exportDir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(exportDir);
      }
      
      // Record cleanup date
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSCRIPTIONS,
        JSON.stringify({ lastCleanup: new Date().toISOString() })
      );
      
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  /**
   * Generate text export content
   */
  private generateTextExport(transcription: TranscriptionItem, options: ExportOptions): string {
    let content = transcription.transcription;
    
    if (options.includeMetadata) {
      const metadata = [
        `Created: ${transcription.createdAt.toLocaleString()}`,
        `Duration: ${transcription.duration}s`,
        `Confidence: ${transcription.confidence || 'N/A'}`,
      ].join('\n');
      content = `${metadata}\n\n${content}`;
    }
    
    return content;
  }

  /**
   * Generate JSON export content
   */
  private generateJsonExport(transcription: TranscriptionItem, options: ExportOptions): string {
    const exportData: any = {
      transcription: transcription.transcription,
      duration: transcription.duration,
      createdAt: transcription.createdAt.toISOString(),
    };
    
    if (options.includeMetadata) {
      exportData.confidence = transcription.confidence;
      exportData.id = transcription.id;
    }
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Generate SRT subtitle export content
   */
  private generateSrtExport(transcription: TranscriptionItem, options: ExportOptions): string {
    // Simple SRT format - in a real app, you'd want proper subtitle timing
    const startTime = '00:00:00,000';
    const endTime = `00:00:${transcription.duration.toString().padStart(2, '0')},000`;
    
    return `1\n${startTime} --> ${endTime}\n${transcription.transcription}\n\n`;
  }

  /**
   * Get last cleanup date from storage
   */
  private async getLastCleanupDate(): Promise<Date | undefined> {
    try {
      const data = await AsyncStorage.getItem('last_cleanup');
      return data ? new Date(data) : undefined;
    } catch (error) {
      return undefined;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
