import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import WYSIWYGBlogEditor from './WYSIWYGBlogEditor';

const BlogEditModal = ({ visible, onClose, blog, onSave }) => {
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    content: '',
    tags: [],
    isFeatured: false,
  });
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  // Initialize form when blog changes
  useEffect(() => {
    if (blog) {
      setEditForm({
        title: blog.title || '',
        category: blog.category || '',
        content: blog.content || '',
        tags: blog.tags || [],
        isFeatured: blog.isFeatured || false,
      });
      setTagsInput((blog.tags || []).join(', '));
    }
  }, [blog]);

  const handleSave = async () => {
    // Validation
    if (!editForm.title.trim()) {
      Alert.alert('Error', 'Blog title is required');
      return;
    }

    if (!editForm.category.trim()) {
      Alert.alert('Error', 'Blog category is required');
      return;
    }

    if (!editForm.content.trim()) {
      Alert.alert('Error', 'Blog content is required');
      return;
    }

    setSaving(true);
    try {
      // Parse tags from comma-separated input
      const tagsArray = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const updatedData = {
        ...editForm,
        tags: tagsArray,
      };

      await onSave(updatedData);
      Alert.alert('Success', 'Blog updated successfully');
      onClose();
    } catch (error) {
      console.error('Error saving blog:', error);
      Alert.alert('Error', 'Failed to update blog. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return; // Prevent closing while saving
    onClose();
  };

  if (!blog) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Blog Post</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              disabled={saving}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
            {/* Title Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={editForm.title}
                onChangeText={(text) => setEditForm({ ...editForm, title: text })}
                placeholder="Enter blog title"
                placeholderTextColor="#999"
              />
            </View>

            {/* Category Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Category *</Text>
              <TextInput
                style={styles.input}
                value={editForm.category}
                onChangeText={(text) => setEditForm({ ...editForm, category: text })}
                placeholder="Enter category"
                placeholderTextColor="#999"
              />
            </View>

            {/* Tags Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Tags</Text>
              <TextInput
                style={styles.input}
                value={tagsInput}
                onChangeText={setTagsInput}
                placeholder="Enter tags separated by commas (e.g., food, drinks, events)"
                placeholderTextColor="#999"
              />
            </View>

            {/* Featured Toggle */}
            <View style={styles.fieldContainer}>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setEditForm({ ...editForm, isFeatured: !editForm.isFeatured })}
                >
                  {editForm.isFeatured && <View style={styles.checkboxChecked} />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Featured Post</Text>
              </View>
            </View>

            {/* Content Editor */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Content *</Text>
              <View style={styles.editorContainer}>
                <WYSIWYGBlogEditor
                  value={editForm.content}
                  onChangeText={(text) => setEditForm({ ...editForm, content: text })}
                  placeholder="Write your blog content here..."
                  minHeight={400}
                  showWordCount={true}
                  maxWords={10000}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '95%',
    maxWidth: 1200,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#4285f4',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    backgroundColor: '#4285f4',
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  editorContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4285f4',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
};

export default BlogEditModal;
