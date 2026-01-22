import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
  PanResponder
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../styles/theme';
import { uploadImageToFirebase } from '../../services/storage';
import MarkdownPreview from './MarkdownPreview';
import LinkInsertModal from './LinkInsertModal';

const RichTextEditor = ({
  value,
  onChangeText,
  placeholder = "Start writing your blog post...",
  autoFocus = false,
  minHeight = 500,
  showWordCount = true,
  maxWords = 10000
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [viewMode, setViewMode] = useState('live'); // 'edit', 'live'
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const textInputRef = useRef(null);
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;



  const getWordCount = () => {
    if (!value) return 0;
    return value.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = () => {
    return value ? value.length : 0;
  };

  const saveToUndoStack = (currentValue) => {
    setUndoStack(prev => [...prev.slice(-19), currentValue]); // Keep last 20 states
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [value, ...prev]);
      setUndoStack(prev => prev.slice(0, -1));
      onChangeText(lastState);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setUndoStack(prev => [...prev, value]);
      setRedoStack(prev => prev.slice(1));
      onChangeText(nextState);
    }
  };

  const handleTextChange = (newText) => {
    if (newText !== value) {
      saveToUndoStack(value);
      onChangeText(newText);
    }
  };

  const insertText = (beforeText, afterText = '') => {
    if (Platform.OS === 'web') {
      const newText = value.slice(0, selectionStart) + beforeText + value.slice(selectionStart, selectionEnd) + afterText + value.slice(selectionEnd);
      handleTextChange(newText);

      setTimeout(() => {
        if (textInputRef.current) {
          const newPosition = selectionStart + beforeText.length;
          textInputRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    } else {
      const selectedContent = value.slice(selectionStart, selectionEnd);
      const newText = value.slice(0, selectionStart) + beforeText + selectedContent + afterText + value.slice(selectionEnd);
      handleTextChange(newText);

      setTimeout(() => {
        if (textInputRef.current) {
          const newStart = selectionStart + beforeText.length;
          const newEnd = newStart + selectedContent.length;
          textInputRef.current.setNativeProps({
            selection: { start: newStart, end: newEnd }
          });
        }
      }, 0);
    }
  };

  const formatText = (format) => {
    const hasSelection = selectionStart !== selectionEnd;
    const selectedContent = hasSelection ? value.slice(selectionStart, selectionEnd) : '';

    switch (format) {
      case 'bold':
        if (hasSelection) {
          insertText('**', '**');
        } else {
          insertText('**bold text**', '');
        }
        break;
      case 'italic':
        if (hasSelection) {
          insertText('*', '*');
        } else {
          insertText('*italic text*', '');
        }
        break;
      case 'heading1':
        insertText('\n# ', hasSelection ? '\n' : ' Heading 1\n');
        break;
      case 'heading2':
        insertText('\n## ', hasSelection ? '\n' : ' Heading 2\n');
        break;
      case 'heading3':
        insertText('\n### ', hasSelection ? '\n' : ' Heading 3\n');
        break;
      case 'bulletList':
        insertText('\n• ', hasSelection ? '' : 'List item');
        break;
      case 'numberedList':
        insertText('\n1. ', hasSelection ? '' : 'List item');
        break;
      case 'quote':
        insertText('\n> ', hasSelection ? '\n' : ' Quote text\n');
        break;
      case 'link':
        if (hasSelection) {
          setSelectedText(selectedContent);
          setShowLinkModal(true);
        } else {
          setSelectedText('');
          setShowLinkModal(true);
        }
        break;
      case 'strikethrough':
        if (hasSelection) {
          insertText('~~', '~~');
        } else {
          insertText('~~strikethrough text~~', '');
        }
        break;
      case 'code':
        if (hasSelection) {
          insertText('`', '`');
        } else {
          insertText('`code`', '');
        }
        break;
      case 'codeBlock':
        insertText('\n```\n', hasSelection ? '\n```\n' : 'code block\n```\n');
        break;
      case 'horizontalRule':
        insertText('\n---\n', '');
        break;
      default:
        break;
    }
  };

  const handleLinkInsert = (linkText, linkUrl) => {
    const linkMarkdown = `[${linkText}](${linkUrl})`;
    if (selectedText) {
      // Replace selected text with link
      const newText = value.slice(0, selectionStart) + linkMarkdown + value.slice(selectionEnd);
      handleTextChange(newText);
      // Position cursor after link
      setTimeout(() => {
        if (textInputRef.current) {
          const newPosition = selectionStart + linkMarkdown.length;
          if (Platform.OS === 'web') {
            textInputRef.current.setSelectionRange(newPosition, newPosition);
          } else {
            textInputRef.current.setNativeProps({
              selection: { start: newPosition, end: newPosition }
            });
          }
        }
      }, 0);
    } else {
      // Insert at cursor position
      insertText(linkMarkdown, '');
    }
  };

  const handleImageUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        setImageUploadProgress(0);

        try {
          const response = await fetch(result.assets[0].uri);
          const blob = await response.blob();

          const imageUrl = await uploadImageToFirebase(
            blob,
            'blog-images',
            (progress) => setImageUploadProgress(progress)
          );

          // Insert markdown image syntax with automatic caption placeholder
          const imageMarkdown = `\n![Image](${imageUrl})\n*Type a caption for your image here*\n`;
          insertText(imageMarkdown, '');

        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
        } finally {
          setUploadingImage(false);
          setImageUploadProgress(0);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const onSelectionChange = (event) => {
    if (event.nativeEvent) {
      setSelectionStart(event.nativeEvent.selection.start);
      setSelectionEnd(event.nativeEvent.selection.end);

      // Update selected text for formatting
      const start = event.nativeEvent.selection.start;
      const end = event.nativeEvent.selection.end;
      setSelectedText(value.slice(start, end));
    }
  };

  const renderViewModeButtons = () => (
    <View style={styles.viewModeContainer}>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'live' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('live')}
      >
        <Text style={[styles.viewModeButtonText, viewMode === 'live' && styles.viewModeButtonTextActive]}>Live Preview</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'edit' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('edit')}
      >
        <Text style={[styles.viewModeButtonText, viewMode === 'edit' && styles.viewModeButtonTextActive]}>Raw Markdown</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLiveEditor = () => (
    <View style={styles.editorSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolbarButton, selectionStart !== selectionEnd && styles.toolbarButtonHighlight]}
          onPress={() => formatText('bold')}
        >
          <Text style={styles.toolbarButtonText}>B</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolbarButton, selectionStart !== selectionEnd && styles.toolbarButtonHighlight]}
          onPress={() => formatText('italic')}
        >
          <Text style={[styles.toolbarButtonText, styles.italic]}>I</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('heading1')}
        >
          <Text style={styles.toolbarButtonText}>H1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('heading2')}
        >
          <Text style={styles.toolbarButtonText}>H2</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('heading3')}
        >
          <Text style={styles.toolbarButtonText}>H3</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('bulletList')}
        >
          <Text style={styles.toolbarButtonText}>•</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('numberedList')}
        >
          <Text style={styles.toolbarButtonText}>1.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('quote')}
        >
          <Text style={styles.toolbarButtonText}>"</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('link')}
        >
          <Text style={styles.toolbarButtonText}>🔗</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolbarButton, selectionStart !== selectionEnd && styles.toolbarButtonHighlight]}
          onPress={() => formatText('strikethrough')}
        >
          <Text style={[styles.toolbarButtonText, styles.strikethrough]}>S</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolbarButton, selectionStart !== selectionEnd && styles.toolbarButtonHighlight]}
          onPress={() => formatText('code')}
        >
          <Text style={styles.toolbarButtonText}>&lt;/&gt;</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('codeBlock')}
        >
          <Text style={styles.toolbarButtonText}>{ }</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('horizontalRule')}
        >
          <Text style={styles.toolbarButtonText}>---</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity
          style={[styles.toolbarButton, undoStack.length === 0 && styles.toolbarButtonDisabled]}
          onPress={handleUndo}
          disabled={undoStack.length === 0}
        >
          <Text style={styles.toolbarButtonText}>↶</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolbarButton, redoStack.length === 0 && styles.toolbarButtonDisabled]}
          onPress={handleRedo}
          disabled={redoStack.length === 0}
        >
          <Text style={styles.toolbarButtonText}>↷</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity
          style={[styles.toolbarButton, uploadingImage && styles.toolbarButtonDisabled]}
          onPress={handleImageUpload}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.toolbarButtonText}>📷</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {uploadingImage && (
        <View style={styles.uploadProgressContainer}>
          <Text style={styles.uploadProgressText}>
            Uploading image... {Math.round(imageUploadProgress)}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${imageUploadProgress}%` }
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.liveEditorContainer}>
        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            styles.liveTextInput,
            { minHeight: minHeight },
            isFocused && styles.textInputFocused,
            isOverWordLimit && styles.textInputError
          ]}
          multiline
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSelectionChange={onSelectionChange}
          autoFocus={autoFocus}
          textAlignVertical="top"
          selectionColor={colors.primary}
          scrollEnabled={false}
        />
        <View style={[styles.previewOverlay, { minHeight: minHeight }]} pointerEvents="none">
          <MarkdownPreview
            content={value}
            style={{ minHeight: minHeight }}
            scrollEnabled={false}
          />
        </View>
      </View>
    </View>
  );

  const renderRawEditor = () => (
    <View style={styles.editorSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolbarButton, selectionStart !== selectionEnd && styles.toolbarButtonHighlight]}
          onPress={() => formatText('bold')}
        >
          <Text style={styles.toolbarButtonText}>B</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolbarButton, selectionStart !== selectionEnd && styles.toolbarButtonHighlight]}
          onPress={() => formatText('italic')}
        >
          <Text style={[styles.toolbarButtonText, styles.italic]}>I</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('heading1')}
        >
          <Text style={styles.toolbarButtonText}>H1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('heading2')}
        >
          <Text style={styles.toolbarButtonText}>H2</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('heading3')}
        >
          <Text style={styles.toolbarButtonText}>H3</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('bulletList')}
        >
          <Text style={styles.toolbarButtonText}>•</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('numberedList')}
        >
          <Text style={styles.toolbarButtonText}>1.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('quote')}
        >
          <Text style={styles.toolbarButtonText}>"</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('link')}
        >
          <Text style={styles.toolbarButtonText}>🔗</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolbarButton, selectionStart !== selectionEnd && styles.toolbarButtonHighlight]}
          onPress={() => formatText('strikethrough')}
        >
          <Text style={[styles.toolbarButtonText, styles.strikethrough]}>S</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolbarButton, selectionStart !== selectionEnd && styles.toolbarButtonHighlight]}
          onPress={() => formatText('code')}
        >
          <Text style={styles.toolbarButtonText}>&lt;/&gt;</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('codeBlock')}
        >
          <Text style={styles.toolbarButtonText}>{ }</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => formatText('horizontalRule')}
        >
          <Text style={styles.toolbarButtonText}>---</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity
          style={[styles.toolbarButton, undoStack.length === 0 && styles.toolbarButtonDisabled]}
          onPress={handleUndo}
          disabled={undoStack.length === 0}
        >
          <Text style={styles.toolbarButtonText}>↶</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolbarButton, redoStack.length === 0 && styles.toolbarButtonDisabled]}
          onPress={handleRedo}
          disabled={redoStack.length === 0}
        >
          <Text style={styles.toolbarButtonText}>↷</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity
          style={[styles.toolbarButton, uploadingImage && styles.toolbarButtonDisabled]}
          onPress={handleImageUpload}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.toolbarButtonText}>📷</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {uploadingImage && (
        <View style={styles.uploadProgressContainer}>
          <Text style={styles.uploadProgressText}>
            Uploading image... {Math.round(imageUploadProgress)}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${imageUploadProgress}%` }
              ]}
            />
          </View>
        </View>
      )}

      <TextInput
        ref={textInputRef}
        style={[
          styles.textInput,
          { minHeight: minHeight },
          isFocused && styles.textInputFocused,
          isOverWordLimit && styles.textInputError
        ]}
        multiline
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSelectionChange={onSelectionChange}
        autoFocus={autoFocus}
        textAlignVertical="top"
        selectionColor={colors.primary}
        scrollEnabled={false}
      />
    </View>
  );


  const wordCount = getWordCount();
  const characterCount = getCharacterCount();
  const isOverWordLimit = wordCount > maxWords;

  return (
    <View style={styles.container}>
      {renderViewModeButtons()}

      <View style={styles.editorContainer}>
        {viewMode === 'live' && renderLiveEditor()}
        {viewMode === 'edit' && renderRawEditor()}
      </View>

      <LinkInsertModal
        visible={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onInsert={handleLinkInsert}
        selectedText={selectedText}
      />



      {showWordCount && (
        <View style={styles.wordCountContainer}>
          <Text style={[
            styles.wordCountText,
            isOverWordLimit && styles.wordCountError
          ]}>
            {wordCount.toLocaleString()} / {maxWords.toLocaleString()} words
          </Text>
          <Text style={styles.characterCountText}>
            {characterCount.toLocaleString()} characters
          </Text>
        </View>
      )}

      {isOverWordLimit && (
        <Text style={styles.errorText}>
          Your blog post exceeds the maximum word limit of {maxWords.toLocaleString()} words.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary,
  },
  viewModeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  viewModeButtonTextActive: {
    color: '#fff',
  },
  editorContainer: {
    flex: 1,
  },
  liveEditorContainer: {
    position: 'relative',
    flex: 1,
  },
  liveTextInput: {
    color: 'rgba(0, 0, 0, 0.15)', // Very light but visible for cursor and selection
    backgroundColor: 'transparent',
    zIndex: 2, // Above the preview overlay
  },
  previewOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    zIndex: 1, // Behind the text input
  },
  editorSection: {
    flex: 1,
  },
  toolbar: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 50,
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarButtonHighlight: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  italic: {
    fontStyle: 'italic',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  toolbarButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  toolbarSeparator: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  textInput: {
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    backgroundColor: '#fff',
    fontFamily: Platform.OS === 'web' ? 'system-ui, -apple-system, sans-serif' : undefined,
  },
  textInputFocused: {
    borderColor: colors.primary,
  },
  textInputError: {
    borderColor: '#e74c3c',
  },
  wordCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  wordCountText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  wordCountError: {
    color: '#e74c3c',
  },
  characterCountText: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffeaea',
  },
  uploadProgressContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  uploadProgressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});

export default RichTextEditor;