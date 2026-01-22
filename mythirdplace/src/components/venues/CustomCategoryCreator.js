import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { colors } from '../../styles/theme';
import EmojiPicker from '../common/EmojiPicker';
import { addCustomCategory } from '../../services/venue';

const CustomCategoryCreator = ({
  visible,
  onClose,
  onCategoryCreated
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (!selectedEmoji) {
      Alert.alert('Error', 'Please select an emoji for your category');
      return;
    }

    setLoading(true);
    try {
      const categoryId = await addCustomCategory({
        name: categoryName.trim(),
        icon: selectedEmoji
      });

      // Reset form
      setCategoryName('');
      setSelectedEmoji('');

      // Notify parent component
      if (onCategoryCreated) {
        onCategoryCreated({
          id: categoryId,
          name: categoryName.trim(),
          icon: selectedEmoji
        });
      }

      Alert.alert(
        'Success',
        'Your custom category has been created and will be available for other users too!',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Error creating custom category:', error);
      Alert.alert('Error', error.message || 'Failed to create custom category');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCategoryName('');
    setSelectedEmoji('');
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Custom Category</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>
              Can't find the right category for your venue? Create a custom one that other users can also use!
            </Text>

            {/* Category Name Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.textInput}
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="e.g., Yoga Studio, Makerspace, Gaming Cafe..."
                placeholderTextColor="#999"
                maxLength={50}
              />
            </View>

            {/* Emoji Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Choose an Emoji</Text>
              <TouchableOpacity
                style={styles.emojiSelector}
                onPress={() => setShowEmojiPicker(true)}
              >
                {selectedEmoji ? (
                  <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
                ) : (
                  <Text style={styles.emojiPlaceholder}>Tap to select emoji</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Preview */}
            {categoryName.trim() && selectedEmoji && (
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Preview:</Text>
                <View style={styles.categoryPreview}>
                  <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
                  <Text style={styles.previewName}>{categoryName.trim()}</Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!categoryName.trim() || !selectedEmoji || loading) && styles.createButtonDisabled
                ]}
                onPress={handleCreateCategory}
                disabled={!categoryName.trim() || !selectedEmoji || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create Category</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <EmojiPicker
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={setSelectedEmoji}
        selectedEmoji={selectedEmoji}
        title="Choose Category Emoji"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  emojiSelector: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  selectedEmoji: {
    fontSize: 24,
  },
  emojiPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  previewSection: {
    marginBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  categoryPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  previewEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  createButton: {
    flex: 2,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default CustomCategoryCreator;