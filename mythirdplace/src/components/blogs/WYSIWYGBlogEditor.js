import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../styles/theme';
import { uploadImageToFirebase } from '../../services/storage';
import ImageCaptionModal from './ImageCaptionModal';

// Import alignment icons
const leftAlignIcon = require('../../../assets/left.png');
const centerAlignIcon = require('../../../assets/center.png');
const rightAlignIcon = require('../../../assets/right.png');

const WYSIWYGBlogEditor = ({
  value = '',
  onChangeText,
  placeholder = "Start writing your blog post...",
  minHeight = 500,
  showWordCount = true,
  maxWords = 10000
}) => {
  const [editorContent, setEditorContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState('');
  const [editingCaption, setEditingCaption] = useState(null);
  const [currentCaptionText, setCurrentCaptionText] = useState('');

  const editorRef = useRef(null);

  // Initialize editor content from markdown
  useEffect(() => {
    console.log('WYSIWYGBlogEditor value changed:', value?.length || 0, 'chars');

    // Always update if value is different from markdownContent, or if not yet initialized
    if (value !== markdownContent || !initialized) {
      const newMarkdownContent = value || '';
      const newHtmlContent = markdownToHtml(newMarkdownContent);

      setMarkdownContent(newMarkdownContent);
      setEditorContent(newHtmlContent);
      setInitialized(true);

      console.log('Setting new content - HTML length:', newHtmlContent?.length || 0);
    }
  }, [value, initialized]);

  // Separate effect to update DOM when editorContent changes
  useEffect(() => {
    if (editorRef.current && editorContent !== undefined) {
      // Don't update if the user is currently typing
      if (!document.activeElement || !editorRef.current.contains(document.activeElement)) {
        if (editorRef.current.innerHTML !== editorContent) {
          console.log('Updating editor DOM with content:', editorContent?.length || 0, 'chars');
          editorRef.current.innerHTML = editorContent || '';

          // Add click handlers to all captions
          const captions = editorRef.current.querySelectorAll('.image-caption');
          captions.forEach(caption => {
            caption.style.cursor = 'pointer';
            caption.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditingCaption(caption);
              setCurrentCaptionText(caption.textContent);
              setShowCaptionModal(true);
            });
          });
        }
      }
    }
  }, [editorContent]);

  // Convert markdown to HTML for display
  const markdownToHtml = (markdown) => {
    if (!markdown) return '';

    let html = markdown
      // Headings
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Bold and Italic (but be careful not to interfere with quotes)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<s>$1</s>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Images with captions
      .replace(/!\[([^\]]*)\]\(([^)]+)\)\n\*([^*]+)\*/g, '<div class="image-container" style="text-align: center; width: 100%;"><img src="$2" alt="$1" style="max-width: 600px; width: 100%; height: auto; display: block; margin: 12px auto; border-radius: 8px;" /><p class="image-caption" style="color: #666; font-size: 14px; font-style: italic; text-align: center; margin-top: 8px; width: 100%;">$3</p></div>')
      // Images without captions
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="image-container" style="text-align: center; width: 100%;"><img src="$2" alt="$1" style="max-width: 600px; width: 100%; height: auto; display: block; margin: 12px auto; border-radius: 8px;" /></div>')
      // Incomplete image markdown (missing URL) - show as warning
      .replace(/!\[([^\]]*)\](?!\()/g, '<div style="background-color: #fff3cd; border: 2px dashed #856404; padding: 12px; margin: 12px 0; border-radius: 8px; color: #856404; text-align: center;"><strong>⚠️ Broken Image</strong><br/>Missing image URL. Please re-upload the image using the image button above.</div>')
      // Standalone !Image text
      .replace(/^!Image$/gm, '<div style="background-color: #fff3cd; border: 2px dashed #856404; padding: 12px; margin: 12px 0; border-radius: 8px; color: #856404; text-align: center;"><strong>⚠️ Broken Image</strong><br/>Missing image URL. Please re-upload the image using the image button above.</div>')
      // Lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
      // Line breaks - only convert actual line breaks, preserve quotes
      .replace(/\n(?!\s*$)/g, '<br>');

    // Wrap consecutive list items
    html = html.replace(/(<li>.*?<\/li>)(\s*<br>)*(\s*<li>)/g, '$1$3');
    html = html.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Unescape escaped markdown characters
    html = html.replace(/\\\\/g, '\\'); // Unescape backslashes
    html = html.replace(/\\\*/g, '*'); // Unescape asterisks
    html = html.replace(/\\#/g, '#'); // Unescape hash symbols

    return html;
  };

  // Convert HTML back to markdown
  const htmlToMarkdown = (html) => {
    if (!html) return '';

    // Create a temporary div to safely parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    let markdown = '';

    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent;
        // Escape markdown special characters to prevent stray # or * from being interpreted as formatting
        text = text.replace(/\\/g, '\\\\'); // Escape backslashes first
        text = text.replace(/\*/g, '\\*'); // Escape asterisks
        text = text.replace(/#/g, '\\#'); // Escape hash symbols
        return text;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        const children = Array.from(node.childNodes).map(processNode).join('');

        switch (tagName) {
          case 'h1':
            return `# ${children}\n\n`;
          case 'h2':
            return `## ${children}\n\n`;
          case 'h3':
            return `### ${children}\n\n`;
          case 'strong':
          case 'b':
            return children ? `**${children.trim()}**` : '';
          case 'em':
          case 'i':
            return children ? `*${children.trim()}*` : '';
          case 's':
            return children ? `~~${children.trim()}~~` : '';
          case 'a':
            const href = node.getAttribute('href');
            return `[${children}](${href})`;
          case 'ul':
            return children + '\n';
          case 'ol':
            return children + '\n';
          case 'li':
            return `* ${children}\n`;
          case 'br':
            // Only convert <br> to newline if it's truly a line break, not a quote artifact
            return '\n';
          case 'p':
            const pAlignment = node.style.textAlign;
            if (pAlignment && pAlignment !== 'left' && pAlignment !== '' && pAlignment !== 'start') {
              return `<div style="text-align: ${pAlignment}">${children}</div>\n\n`;
            }
            return children + '\n\n';
          case 'div':
            if (node.className === 'image-container') {
              const img = node.querySelector('img');
              const caption = node.querySelector('.image-caption');
              if (img && caption) {
                const src = img.getAttribute('src');
                const alt = img.getAttribute('alt') || 'Image';
                const captionText = caption.textContent;
                return `![${alt}](${src})\n*${captionText}*\n\n`;
              }
            }
            const divAlignment = node.style.textAlign;
            if (divAlignment && divAlignment !== 'left' && divAlignment !== '' && divAlignment !== 'start') {
              return `<div style="text-align: ${divAlignment}">${children}</div>\n\n`;
            }
            return children;
          case 'img':
            const src = node.getAttribute('src');
            const alt = node.getAttribute('alt') || 'Image';
            return `![${alt}](${src})\n\n`;
          default:
            return children;
        }
      }

      return '';
    };

    markdown = Array.from(tempDiv.childNodes).map(processNode).join('');

    // Clean up excessive line breaks, but preserve intentional ones
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

    return markdown;
  };

  // Save current state for undo
  const saveState = () => {
    setUndoStack(prev => [...prev.slice(-19), markdownContent]);
    setRedoStack([]);
  };

  // Handle content changes - debounced to prevent interference
  const handleContentChange = (newContent) => {
    setEditorContent(newContent);

    // Clean up any stray formatting that might have been inherited
    if (editorRef.current) {
      // Remove any inline styles from direct children that aren't special elements
      const children = editorRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child.classList.contains('image-container') && child.tagName !== 'A') {
          // Reset text formatting for regular paragraphs
          if (child.tagName === 'P' || child.tagName === 'DIV') {
            child.style.color = '#333';
            child.style.fontSize = '16px';
            child.style.fontStyle = 'normal';
            child.style.textAlign = 'left';
          }
        }
      }
    }

    // Debounce markdown conversion to prevent text reversal and preserve quotes
    // Use longer timeout to prevent text reversal issues
    setTimeout(() => {
      const newMarkdown = htmlToMarkdown(newContent);
      setMarkdownContent(newMarkdown);
      onChangeText(newMarkdown);
    }, 300);
  };

  // Formatting functions
  const execCommand = (command, value = null) => {
    if (!editorRef.current) return;

    saveState();
    document.execCommand(command, false, value);

    // Get updated content without triggering re-render loop
    // Use longer timeout to prevent conflicts with other updates
    setTimeout(() => {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        const newMarkdown = htmlToMarkdown(newContent);
        setMarkdownContent(newMarkdown);
        onChangeText(newMarkdown);
        setEditorContent(newContent);
      }
    }, 150);
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleStrikethrough = () => execCommand('strikethrough');
  const handleUnderline = () => execCommand('underline');

  // Helper function to update editor content
  const updateEditorContent = () => {
    setTimeout(() => {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setEditorContent(newContent);
        const newMarkdown = htmlToMarkdown(newContent);
        setMarkdownContent(newMarkdown);
        onChangeText(newMarkdown);
      }
    }, 100);
  };

  const handleHeading = (level) => {
    if (!editorRef.current) return;

    saveState();

    // Ensure editor is focused
    editorRef.current.focus();

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      // No selection - create heading at end
      const heading = document.createElement(`h${level}`);
      heading.innerHTML = 'Heading text';
      editorRef.current.appendChild(heading);

      // Select the text
      const range = document.createRange();
      range.selectNodeContents(heading);
      selection.removeAllRanges();
      selection.addRange(range);

      updateEditorContent();
      return;
    }

    const range = selection.getRangeAt(0);

    if (selection.toString().length === 0) {
      // Collapsed cursor - convert current block to heading
      let currentNode = range.startContainer;

      // Find the parent block element
      let blockElement = currentNode.nodeType === Node.TEXT_NODE
        ? currentNode.parentElement
        : currentNode;

      // Traverse up to find a block-level element
      while (blockElement && blockElement !== editorRef.current) {
        if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(blockElement.tagName)) {
          break;
        }
        blockElement = blockElement.parentElement;
      }

      if (blockElement && blockElement !== editorRef.current) {
        // Create new heading with the block's content
        const heading = document.createElement(`h${level}`);
        heading.innerHTML = blockElement.innerHTML || '<br>';

        // Replace the block with the heading
        blockElement.parentNode.replaceChild(heading, blockElement);

        // Position cursor at end of heading
        const newRange = document.createRange();
        newRange.selectNodeContents(heading);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

    } else {
      // Text is selected - FORCE it to become a heading
      // Extract the selected content
      const fragment = range.extractContents();

      // Create the heading element
      const heading = document.createElement(`h${level}`);

      // Get just the text content to avoid nested formatting issues
      const textContent = fragment.textContent || '';
      heading.textContent = textContent;

      // Insert the heading at the selection point
      range.deleteContents(); // Clear any remaining content
      range.insertNode(heading);

      // Add a line break after the heading for continued typing
      const br = document.createElement('br');
      if (heading.nextSibling) {
        heading.parentNode.insertBefore(br, heading.nextSibling);
      } else {
        heading.parentNode.appendChild(br);
      }

      // Position cursor after the heading
      const newRange = document.createRange();
      newRange.setStartAfter(heading);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    updateEditorContent();
  };

  const handleList = (ordered = false) => {
    saveState();
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  const handleAlignLeft = () => {
    saveState();
    execCommand('justifyLeft');
  };

  const handleAlignCenter = () => {
    saveState();
    execCommand('justifyCenter');
  };

  const handleAlignRight = () => {
    saveState();
    execCommand('justifyRight');
  };


  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [markdownContent, ...prev]);
      setUndoStack(prev => prev.slice(0, -1));
      setMarkdownContent(lastState);

      // Convert markdown to HTML and update editor
      const htmlContent = markdownToHtml(lastState);
      setEditorContent(htmlContent);

      // Update the actual editor DOM if it exists
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }

      onChangeText(lastState);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setUndoStack(prev => [...prev, markdownContent]);
      setRedoStack(prev => prev.slice(1));
      setMarkdownContent(nextState);

      // Convert markdown to HTML and update editor
      const htmlContent = markdownToHtml(nextState);
      setEditorContent(htmlContent);

      // Update the actual editor DOM if it exists
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }

      onChangeText(nextState);
    }
  };

  // Link handling
  const handleLinkInsert = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const selectedText = selection.toString();
      setLinkText(selectedText || 'Link text');
    } else {
      setLinkText('Link text');
    }
    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (linkUrl && linkText && editorRef.current) {
      saveState();

      // Focus the editor to ensure it's active
      editorRef.current.focus();

      // Get current HTML content
      let currentHtml = editorRef.current.innerHTML;

      // Create the link HTML
      const linkHtml = `<a href="${linkUrl}" style="color: ${colors.primary}; text-decoration: underline;">${linkText}</a> `;

      // Get current selection
      const selection = window.getSelection();

      if (selection.rangeCount > 0 && selection.toString()) {
        // Replace selected text with link
        const range = selection.getRangeAt(0);
        const selectedText = selection.toString();
        currentHtml = currentHtml.replace(selectedText, linkHtml);
      } else {
        // Just append link at the end or insert at cursor
        if (currentHtml === '' || currentHtml === '<br>') {
          currentHtml = linkHtml;
        } else {
          currentHtml += linkHtml;
        }
      }

      // Update the editor content directly
      editorRef.current.innerHTML = currentHtml;
      setEditorContent(currentHtml);

      // Convert to markdown and update
      const newMarkdown = htmlToMarkdown(currentHtml);
      setMarkdownContent(newMarkdown);
      onChangeText(newMarkdown);

      // Close modal and reset
      setShowLinkModal(false);
      setLinkText('');
      setLinkUrl('');

      // Place cursor after the link
      setTimeout(() => {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }, 50);
    }
  };

  // Insert image with caption
  const insertImageWithCaption = (imageUrl, captionText) => {
    if (!editorRef.current) {
      console.error('Editor ref not available');
      return;
    }

    saveState();

    // Ensure editor is focused first
    editorRef.current.focus();

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    imageContainer.style.cssText = 'width: 100%; margin: 12px 0; text-align: center;';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Image';
    img.style.cssText = 'max-width: 600px; width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 8px;';

    imageContainer.appendChild(img);

    // Add caption if provided (static, non-editable with click handler)
    if (captionText) {
      const caption = document.createElement('p');
      caption.className = 'image-caption';
      caption.style.cssText = 'color: #666; font-size: 14px; font-style: italic; text-align: center; margin-top: 8px; cursor: pointer;';
      caption.textContent = captionText;

      // Add click handler to open modal for editing
      caption.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingCaption(caption);
        setCurrentCaptionText(caption.textContent);
        setShowCaptionModal(true);
      });

      imageContainer.appendChild(caption);
    }

    // Insert into editor at the end
    editorRef.current.appendChild(imageContainer);

    // Create a new paragraph after the image for continued typing
    const newP = document.createElement('p');
    newP.innerHTML = '<br>';
    newP.style.cssText = 'color: #333; font-size: 16px; font-style: normal; text-align: left;';

    editorRef.current.appendChild(newP);

    // Focus editor and position cursor in new paragraph
    setTimeout(() => {
      editorRef.current.focus();

      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(newP, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }, 50);

    // Update content immediately
    const newContent = editorRef.current.innerHTML;
    setEditorContent(newContent);
    const newMarkdown = htmlToMarkdown(newContent);
    setMarkdownContent(newMarkdown);
    onChangeText(newMarkdown);
  };

  // Image upload
  const handleImageUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
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

          // Upload complete, open caption modal
          setUploadingImage(false);
          setImageUploadProgress(0);
          setPendingImageUrl(imageUrl);
          setShowCaptionModal(true);

        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
          setUploadingImage(false);
          setImageUploadProgress(0);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Word count
  const getWordCount = () => {
    const text = editorRef.current?.textContent || '';
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = getWordCount();
  const isOverWordLimit = wordCount > maxWords;

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleBold}>
          <Text style={[styles.toolbarButtonText, styles.bold]}>B</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleItalic}>
          <Text style={[styles.toolbarButtonText, styles.italic]}>I</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleStrikethrough}>
          <Text style={[styles.toolbarButtonText, styles.strikethrough]}>S</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity style={styles.toolbarButton} onPress={() => handleHeading(1)}>
          <Text style={styles.toolbarButtonText}>H1</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={() => handleHeading(2)}>
          <Text style={styles.toolbarButtonText}>H2</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={() => handleHeading(3)}>
          <Text style={styles.toolbarButtonText}>H3</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity style={styles.toolbarButton} onPress={() => handleList(false)}>
          <Text style={styles.toolbarButtonText}>•</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={() => handleList(true)}>
          <Text style={styles.toolbarButtonText}>1.</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity style={styles.toolbarButton} onPress={handleLinkInsert}>
          <Text style={styles.toolbarButtonText}>🔗</Text>
        </TouchableOpacity>

        <View style={styles.toolbarSeparator} />

        <TouchableOpacity style={styles.toolbarButton} onPress={handleAlignLeft}>
          <Image source={leftAlignIcon} style={styles.toolbarIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleAlignCenter}>
          <Image source={centerAlignIcon} style={styles.toolbarIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={handleAlignRight}>
          <Image source={rightAlignIcon} style={styles.toolbarIcon} />
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

      {/* Upload Progress */}
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

      {/* Editor */}
      <View style={styles.editorContainer}>
        {Platform.OS === 'web' ? (
          <div
            ref={(el) => {
              editorRef.current = el;
            }}
            contentEditable
            suppressContentEditableWarning={true}
            style={{
              minHeight: minHeight,
              padding: 16,
              fontSize: 16,
              lineHeight: '24px',
              color: '#333',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              outline: 'none',
              border: 'none',
              backgroundColor: '#fff',
              overflow: 'auto',
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'normal',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
            onInput={(e) => {
              handleContentChange(e.target.innerHTML);
            }}
            onPaste={(e) => {
              // Prevent default paste behavior
              e.preventDefault();

              // Get plain text from clipboard
              const text = e.clipboardData.getData('text/plain');

              // Insert as plain text without any formatting
              document.execCommand('insertText', false, text);
            }}
            onKeyDown={(e) => {
              // Prevent unwanted formatting on quote character
              if (e.key === '"' || e.key === "'" || e.key === '\u2019') {
                // Let the character be inserted normally without any formatting
                e.stopPropagation();
              }
            }}
            onBlur={(e) => {
              // Force sync on blur to ensure markdown is up to date
              const newMarkdown = htmlToMarkdown(e.target.innerHTML);
              setMarkdownContent(newMarkdown);
              onChangeText(newMarkdown);
            }}
            onClick={(e) => {
              // Reset text styling if clicking outside special elements
              if (e.target === editorRef.current) {
                document.execCommand('removeFormat', false, null);
              }
            }}
            placeholder={placeholder}
          />
        ) : (
          <TextInput
            style={[styles.textInput, { minHeight: minHeight }]}
            multiline
            value={markdownContent}
            onChangeText={(text) => {
              setMarkdownContent(text);
              setEditorContent(markdownToHtml(text));
              onChangeText(text);
            }}
            placeholder={placeholder}
            placeholderTextColor="#999"
            textAlignVertical="top"
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Link Modal */}
      <Modal
        visible={showLinkModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLinkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.linkModal}>
            <Text style={styles.modalTitle}>Insert Link</Text>

            <Text style={styles.inputLabel}>Link Text:</Text>
            <TextInput
              style={styles.modalInput}
              value={linkText}
              onChangeText={setLinkText}
              placeholder="Enter link text"
            />

            <Text style={styles.inputLabel}>URL:</Text>
            <TextInput
              style={styles.modalInput}
              value={linkUrl}
              onChangeText={setLinkUrl}
              placeholder="https://example.com"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowLinkModal(false);
                  setLinkText('');
                  setLinkUrl('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalInsertButton}
                onPress={insertLink}
              >
                <Text style={styles.modalInsertText}>Insert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Caption Modal */}
      <ImageCaptionModal
        visible={showCaptionModal}
        initialCaption={currentCaptionText}
        isEditing={!!editingCaption}
        onClose={() => {
          setShowCaptionModal(false);
          setPendingImageUrl('');
          setEditingCaption(null);
          setCurrentCaptionText('');
        }}
        onInsert={(captionText) => {
          if (editingCaption) {
            // Editing existing caption
            saveState();
            editingCaption.textContent = captionText;
            editingCaption.style.cursor = 'pointer';

            // Update content
            const newContent = editorRef.current.innerHTML;
            setEditorContent(newContent);
            const newMarkdown = htmlToMarkdown(newContent);
            setMarkdownContent(newMarkdown);
            onChangeText(newMarkdown);

            setEditingCaption(null);
          } else {
            // Inserting new image
            insertImageWithCaption(pendingImageUrl, captionText);
            setPendingImageUrl('');
          }
          setShowCaptionModal(false);
          setCurrentCaptionText('');
        }}
        onSkip={() => {
          if (!editingCaption) {
            // Only allow skip for new images
            insertImageWithCaption(pendingImageUrl, '');
            setPendingImageUrl('');
          }
          setShowCaptionModal(false);
          setEditingCaption(null);
          setCurrentCaptionText('');
        }}
      />

      {/* Word Count */}
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
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  toolbarIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
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
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  editorContainer: {
    backgroundColor: '#fff',
  },
  textInput: {
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    backgroundColor: '#fff',
    fontFamily: Platform.OS === 'web' ? 'system-ui, -apple-system, sans-serif' : undefined,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    minWidth: 300,
    maxWidth: 500,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  modalInsertButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  modalInsertText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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

export default WYSIWYGBlogEditor;