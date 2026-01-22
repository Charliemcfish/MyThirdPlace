import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { colors } from '../../styles/theme';

const LinkInsertModal = ({ visible, onClose, onInsert, selectedText = '' }) => {
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (visible) {
      setLinkText(selectedText || '');
      setLinkUrl('');
    }
  }, [visible, selectedText]);

  const handleInsert = () => {
    if (!linkText.trim()) {
      Alert.alert('Error', 'Please enter the text to display for the link');
      return;
    }

    if (!linkUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    // Validate URL format
    let validUrl = linkUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://') && !validUrl.startsWith('mailto:')) {
      validUrl = 'https://' + validUrl;
    }

    try {
      new URL(validUrl);
    } catch {
      Alert.alert('Error', 'Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    onInsert(linkText.trim(), validUrl);
    handleClose();
  };

  const handleClose = () => {
    setLinkText('');
    setLinkUrl('');
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
              <Text style={styles.modalTitle}>Insert Link</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Display Text</Text>
                <TextInput
                  style={styles.textInput}
                  value={linkText}
                  onChangeText={setLinkText}
                  placeholder="Enter the text to display"
                  placeholderTextColor="#999"
                  autoFocus={!selectedText}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={linkUrl}
                  onChangeText={setLinkUrl}
                  placeholder="https://example.com"
                  placeholderTextColor="#999"
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={!!selectedText}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.insertButton]}
                  onPress={handleInsert}
                >
                  <Text style={styles.insertButtonText}>Insert Link</Text>
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
    maxWidth: 400,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  insertButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  insertButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default LinkInsertModal;