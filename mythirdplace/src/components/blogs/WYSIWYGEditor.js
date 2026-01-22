import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import {
  RichEditor,
  RichToolbar,
  actions
} from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../styles/theme';
import { uploadImageToFirebase } from '../../services/storage';

const WYSIWYGEditor = ({
  value,
  onChangeText,
  placeholder = "Start writing your blog post...",
  autoFocus = false,
  minHeight = 300,
  showWordCount = true,
  maxWords = 10000
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const richText = useRef();
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  useEffect(() => {
    if (richText.current && value) {
      richText.current.setContentHTML(value);
    }
  }, []);

  const getWordCount = () => {
    if (!value) return 0;
    // Strip HTML tags and count words
    const plainText = value.replace(/<[^>]*>/g, '').trim();
    return plainText.split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleChange = (text) => {
    onChangeText(text);
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

          // Insert image into editor
          richText.current?.insertImage(imageUrl, 'alt="Uploaded image"');

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

  const insertLink = () => {
    Alert.prompt(
      'Insert Link',
      'Enter the URL:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Insert',
          onPress: (url) => {
            if (url) {
              richText.current?.insertLink(url, url);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const wordCount = getWordCount();
  const isOverWordLimit = wordCount > maxWords;

  return (
    <View style={styles.container}>
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

      <RichToolbar
        editor={richText}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,
          actions.heading1,
          actions.heading2,
          actions.heading3,
          actions.setParagraph,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.blockquote,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.code,
          actions.line,
          'insertLink',
          'insertImage',
        ]}
        iconMap={{
          [actions.setBold]: () => <Text style={styles.toolbarIcon}>B</Text>,
          [actions.setItalic]: () => <Text style={[styles.toolbarIcon, styles.italic]}>I</Text>,
          [actions.setUnderline]: () => <Text style={[styles.toolbarIcon, styles.underline]}>U</Text>,
          [actions.setStrikethrough]: () => <Text style={[styles.toolbarIcon, styles.strikethrough]}>S</Text>,
          [actions.heading1]: () => <Text style={styles.toolbarIcon}>H1</Text>,
          [actions.heading2]: () => <Text style={styles.toolbarIcon}>H2</Text>,
          [actions.heading3]: () => <Text style={styles.toolbarIcon}>H3</Text>,
          [actions.setParagraph]: () => <Text style={styles.toolbarIcon}>P</Text>,
          [actions.insertBulletsList]: () => <Text style={styles.toolbarIcon}>•</Text>,
          [actions.insertOrderedList]: () => <Text style={styles.toolbarIcon}>1.</Text>,
          [actions.blockquote]: () => <Text style={styles.toolbarIcon}>"</Text>,
          [actions.alignLeft]: () => <Text style={styles.toolbarIcon}>⬅</Text>,
          [actions.alignCenter]: () => <Text style={styles.toolbarIcon}>⬌</Text>,
          [actions.alignRight]: () => <Text style={styles.toolbarIcon}>➡</Text>,
          [actions.code]: () => <Text style={styles.toolbarIcon}>&lt;/&gt;</Text>,
          [actions.line]: () => <Text style={styles.toolbarIcon}>---</Text>,
          insertLink: () => <Text style={styles.toolbarIcon}>🔗</Text>,
          insertImage: () => uploadingImage ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.toolbarIcon}>📷</Text>
          ),
        }}
        insertLink={insertLink}
        insertImage={handleImageUpload}
        style={styles.toolbar}
        flatContainerStyle={styles.toolbarContainer}
        selectedButtonStyle={styles.selectedButton}
        disabledButtonStyle={uploadingImage ? styles.disabledButton : undefined}
        disabled={uploadingImage}
      />

      <RichEditor
        ref={richText}
        onChange={handleChange}
        placeholder={placeholder}
        initialContentHTML={value}
        style={[styles.editor, { minHeight: minHeight }]}
        initialHeight={minHeight}
        useContainer={true}
        containerStyle={styles.editorContainer}
        editorStyle={{
          backgroundColor: '#fff',
          color: '#333',
          fontSize: '16px',
          lineHeight: '24px',
          fontFamily: Platform.OS === 'web' ? 'system-ui, -apple-system, sans-serif' : undefined,
          padding: '16px',
        }}
        pasteAsPlainText={false}
        focusOn={autoFocus}
      />

      {showWordCount && (
        <View style={styles.wordCountContainer}>
          <Text style={[
            styles.wordCountText,
            isOverWordLimit && styles.wordCountError
          ]}>
            {wordCount.toLocaleString()} / {maxWords.toLocaleString()} words
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
  },
  toolbar: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toolbarContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toolbarIcon: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  selectedButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  editor: {
    flex: 1,
  },
  editorContainer: {
    backgroundColor: '#fff',
  },
  uploadProgressContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  wordCountContainer: {
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
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffeaea',
  },
});

export default WYSIWYGEditor;