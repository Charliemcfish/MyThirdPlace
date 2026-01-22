import React from 'react';
import { View, StyleSheet } from 'react-native';
import MarkdownPreview from './MarkdownPreview';

const BlogContent = ({ content, preview = false }) => {
  if (!content) return null;

  return (
    <View style={[styles.container, preview && styles.previewContainer]}>
      <MarkdownPreview
        content={content}
        scrollEnabled={!preview}
        style={preview ? styles.previewStyle : styles.fullStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    maxHeight: 300,
    overflow: 'hidden',
  },
  previewStyle: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  fullStyle: {
    padding: 0,
    backgroundColor: 'transparent',
  },
});

export default BlogContent;