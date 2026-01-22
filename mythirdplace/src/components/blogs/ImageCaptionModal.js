import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { colors } from '../../styles/theme';

const ImageCaptionModal = ({ visible, onClose, onInsert, onSkip, initialCaption = '', isEditing = false }) => {
  const [captionText, setCaptionText] = useState('');

  useEffect(() => {
    if (visible) {
      setCaptionText(initialCaption);
    }
  }, [visible, initialCaption]);

  const handleInsert = () => {
    onInsert(captionText.trim());
    handleClose();
  };

  const handleSkip = () => {
    onSkip();
    handleClose();
  };

  const handleClose = () => {
    setCaptionText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Image Caption' : 'Add Image Caption'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isEditing
                  ? 'Update the caption for this image'
                  : 'Please enter a caption that will display below your image'
                }
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Caption (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={captionText}
                  onChangeText={setCaptionText}
                  placeholder="Describe this image..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  autoFocus
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                {!isEditing && (
                  <TouchableOpacity
                    style={[styles.button, styles.skipButton]}
                    onPress={handleSkip}
                  >
                    <Text style={styles.skipButtonText}>Skip Caption</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.button, styles.insertButton]}
                  onPress={handleInsert}
                >
                  <Text style={styles.insertButtonText}>
                    {isEditing ? 'Update Caption' : 'Add Caption'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContent: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  skipButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  insertButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  insertButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ImageCaptionModal;
