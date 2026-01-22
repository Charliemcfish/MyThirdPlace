import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, useWindowDimensions, Image } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors } from '../../styles/theme';

// Add AGGRESSIVE CSS for web to force center captions
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    /* Target React Native Web generated classes specifically */
    .markdown-preview .r-textAlign-fdjqy7,
    .markdown-preview .r-textAlign-q4m81j,
    .markdown-preview .r-justifyContent-1h0z5md,
    .markdown-preview [class*="r-textAlign"],
    .markdown-preview [class*="r-justifyContent"] {
      text-align: center !important;
      justify-content: center !important;
      align-items: center !important;
      margin: 0 auto !important;
      display: block !important;
      width: 100% !important;
    }

    /* ONLY target image captions specifically */
    .markdown-preview .image-caption,
    .markdown-preview [data-test="caption"] {
      text-align: center !important;
      margin-left: auto !important;
      margin-right: auto !important;
      display: block !important;
      width: 100% !important;
      justify-content: center !important;
      align-items: center !important;
    }

    /* Force parent containers of captions to center content */
    .markdown-preview .image-container {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
    }

    /* Left align all content EXCEPT captions */
    .markdown-preview h1,
    .markdown-preview h2,
    .markdown-preview h3,
    .markdown-preview h4,
    .markdown-preview h5,
    .markdown-preview h6,
    .markdown-preview p,
    .markdown-preview div,
    .markdown-preview span {
      text-align: left !important;
    }

    /* Override React Native Web classes to be left-aligned */
    .markdown-preview [class*="r-textAlign"]:not(.image-caption):not([data-test="caption"]) {
      text-align: left !important;
    }

    /* Force ALL text content to be left aligned except captions */
    .markdown-preview * {
      text-align: left !important;
    }

    /* Override any React Native Web generated classes */
    .markdown-preview .r-textAlign-q4m81j:not(.image-caption):not([data-test="caption"]),
    .markdown-preview .r-textAlign-fdjqy7:not(.image-caption):not([data-test="caption"]) {
      text-align: left !important;
    }

    /* Exception for caption containers - keep them centered */
    .markdown-preview .image-caption,
    .markdown-preview [data-test="caption"],
    .markdown-preview .image-container .image-caption,
    .markdown-preview .image-container [data-test="caption"] {
      text-align: center !important;
    }

    /* Only center captions - target specific caption classes */
    .r-textAlign-fdjqy7.image-caption,
    .r-textAlign-fdjqy7[data-test="caption"],
    .r-textAlign-q4m81j.image-caption,
    .r-textAlign-q4m81j[data-test="caption"] {
      text-align: center !important;
    }

    .r-justifyContent-1h0z5md {
      justify-content: center !important;
    }

    /* Force white-space handling for React Native Web classes */
    .css-146c3p1.r-fdjqy7 {
      white-space: unset !important;
    }
  `;
  if (document.head && !document.querySelector('.markdown-caption-styles')) {
    style.className = 'markdown-caption-styles';
    document.head.appendChild(style);
  }
}

const MarkdownPreview = ({ content, style, scrollEnabled = true }) => {
  const { width } = useWindowDimensions();

  const markdownStyles = {
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: '#333',
      fontFamily: Platform.OS === 'web' ? 'system-ui, -apple-system, sans-serif' : undefined,
    },
    heading1: {
      fontSize: 28,
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: 16,
      marginTop: 24,
      textAlign: 'left',
    },
    heading2: {
      fontSize: 24,
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: 12,
      marginTop: 20,
      textAlign: 'left',
    },
    heading3: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1a1a1a',
      marginBottom: 8,
      marginTop: 16,
      textAlign: 'left',
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
      // marginBottom: 12,
      color: '#333',
      textAlign: 'left',
    },
    strong: {
      fontWeight: '700',
    },
    em: {
      fontStyle: 'italic',
      color: '#333',
      textAlign: 'left',
    },
    s: {
      textDecorationLine: 'line-through',
    },
    blockquote: {
      backgroundColor: '#f8f9fa',
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      paddingLeft: 16,
      paddingVertical: 12,
      marginVertical: 12,
      fontStyle: 'italic',
    },
    code_inline: {
      backgroundColor: '#f1f3f4',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
      fontSize: 14,
      fontFamily: Platform.OS === 'web' ? 'Monaco, Consolas, monospace' : 'monospace',
    },
    code_block: {
      backgroundColor: '#f8f8f8',
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    fence: {
      backgroundColor: '#f8f8f8',
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    bullet_list: {
      marginVertical: 8,
      alignSelf: 'flex-start',
      paddingLeft: 16,
    },
    ordered_list: {
      marginVertical: 8,
      alignSelf: 'flex-start',
      paddingLeft: 16,
    },
    list_item: {
      marginBottom: 4,
      textAlign: 'left',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    bullet_list_icon: {
      color: colors.primary,
      marginRight: 8,
      textAlign: 'left',
    },
    ordered_list_icon: {
      color: colors.primary,
      marginRight: 8,
      textAlign: 'left',
    },
    link: {
      color: colors.primary,
      textDecorationLine: 'underline',
      textAlign: 'left',
    },
    image: {
      width: Math.min(800, width - 40),
      maxWidth: 800,
      resizeMode: 'contain',
      // marginVertical: 24,
      paddingVertical: 16,
      borderRadius: 8,
      alignSelf: 'center',
      display: 'block',
    },
    text: {
      textAlign: 'left',
    },
    textgroup: {
      textAlign: 'left',
    },
    hr: {
      backgroundColor: '#e0e0e0',
      height: 1,
      marginVertical: 16,
    },
  };

  const Container = scrollEnabled ? ScrollView : View;

  // Custom image renderer with forced centering
  const renderImage = (node, children, parent, styles) => {
    const { src, alt } = node.attributes;
    const altText = alt && alt !== 'Image' && alt.trim() !== '' ? alt : null;

    const imageContainerStyle = {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      //marginVertical: 24,
      //paddingVertical: 16,
      marginTop: 24,
      flexDirection: 'column',
      display: 'flex',
      textAlign: 'center',
      ...(Platform.OS === 'web' && {
        textAlign: 'center !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
      })
    };

    const captionContainerStyle = {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 0,
      marginBottom: 48,
      textAlign: 'center',
      ...(Platform.OS === 'web' && {
        textAlign: 'center !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
      })
    };

    const captionTextStyle = {
      textAlign: 'center',
      color: '#666',
      fontSize: 14,
      fontStyle: 'italic',
      paddingHorizontal: 20,
      width: '100%',
      ...(Platform.OS === 'web' && {
        textAlign: 'center !important',
        margin: '0 auto',
        display: 'block !important',
        width: '100% !important',
      })
    };

    return (
      <View style={imageContainerStyle}>
        <Image
          source={{ uri: src }}
          style={{
            width: Math.min(800, width - 40),
            maxWidth: 800,
            height: 600,
            borderRadius: 8,
            alignSelf: 'center',
          }}
          resizeMode="contain"
        />
        {altText && (
          <View style={captionContainerStyle}>
            {Platform.OS === 'web' ? (
              <div
                style={{
                  textAlign: 'center',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                className="image-caption"
                data-test="caption"
              >
                <span
                  style={{
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    display: 'block',
                    width: '100%',
                    margin: '0 auto'
                  }}
                >
                  {altText}
                </span>
              </div>
            ) : (
              <Text
                style={captionTextStyle}
                className="image-caption"
                data-test="caption"
              >
                {altText}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const rendererRules = {
    image: renderImage,
  };

  return (
    <Container
      style={[styles.container, style]}
      contentContainerStyle={scrollEnabled ? styles.contentContainer : undefined}
      showsVerticalScrollIndicator={scrollEnabled}
      nestedScrollEnabled={scrollEnabled}
      className="markdown-preview"
    >
      <Markdown
        style={markdownStyles}
        rules={rendererRules}
      >
        {content || 'Start writing to see your preview...'}
      </Markdown>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
});

export default MarkdownPreview;