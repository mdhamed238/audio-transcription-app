/**
 * History Screen
 * Displays list of saved transcriptions with playback and management options
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SUCCESS_MESSAGES } from '../../constants/config';
import { storageService } from '../../services/storageService';
import { TranscriptionItem } from '../../types';

export default function HistoryScreen() {
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTranscriptions();
  }, []);

  /**
   * Load transcriptions from storage
   */
  const loadTranscriptions = async () => {
    try {
      setLoading(true);
      const items = await storageService.getTranscriptions();
      setTranscriptions(items);
    } catch (error) {
      console.error('Failed to load transcriptions:', error);
      Alert.alert('Error', 'Failed to load transcription history');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Format duration for display
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Handle delete transcription
   */
  const handleDeleteTranscription = async (id: string) => {
    Alert.alert(
      'Delete Transcription',
      'Are you sure you want to delete this transcription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteTranscription(id);
              await loadTranscriptions(); // Reload list
              Alert.alert('Success', SUCCESS_MESSAGES.TRANSCRIPTION_DELETED);
            } catch (error) {
              console.error('Failed to delete transcription:', error);
              Alert.alert('Error', 'Failed to delete transcription');
            }
          },
        },
      ]
    );
  };

  /**
   * Handle export transcription
   */
  const handleExportTranscription = async (transcription: TranscriptionItem) => {
    try {
      const fileUri = await storageService.exportTranscription(transcription.id, {
        format: 'txt',
        includeMetadata: true,
        includeTimestamps: false,
      });
      
      // Share the exported file
      await storageService.shareExportedFile(fileUri);
    } catch (error) {
      console.error('Failed to export transcription:', error);
      Alert.alert('Error', 'Failed to export transcription');
    }
  };

  /**
   * Render transcription item
   */
  const renderTranscriptionItem = ({ item }: { item: TranscriptionItem }) => (
    <View style={styles.transcriptionItem}>
      <View style={styles.transcriptionContent}>
        <Text style={styles.transcriptionText} numberOfLines={3}>
          {item.transcription || 'No transcription text'}
        </Text>
        <View style={styles.transcriptionMeta}>
          <Text style={styles.metaText}>
            {formatDuration(item.duration)} • {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
      
      <View style={styles.transcriptionActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleExportTranscription(item)}
        >
          <Ionicons name="share-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteTranscription(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Transcriptions Yet</Text>
      <Text style={styles.emptyStateText}>
        Record and transcribe your first audio to see it here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading transcriptions...</Text>
          </View>
        ) : (
          <FlatList
            data={transcriptions}
            keyExtractor={(item) => item.id}
            renderItem={renderTranscriptionItem}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={transcriptions.length === 0 ? styles.emptyContainer : styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transcriptionItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  transcriptionContent: {
    flex: 1,
    marginRight: 12,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  transcriptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  transcriptionActions: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginVertical: 2,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});