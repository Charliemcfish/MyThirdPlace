import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal
} from 'react-native';
import { colors } from '../../styles/theme';

const emojiCategories = {
  'Places': ['🏢', '🏠', '🏪', '🏬', '🏛️', '🏗️', '🏘️', '🏞️', '🌆', '🌇'],
  'Food & Drink': ['☕', '🍽️', '🍺', '🍷', '🥂', '🍻', '🥃', '🧊', '🍴', '🥄'],
  'Activities': ['💪', '🏃', '🧘', '🏊', '🚴', '⛹️', '🏋️', '🤸', '🧗', '🏸'],
  'Culture': ['📚', '📖', '🎨', '🎭', '🎪', '🎬', '🎵', '🎼', '🎹', '🎸'],
  'Work': ['💼', '💻', '🖥️', '📊', '📋', '✏️', '🖊️', '📝', '📄', '📎'],
  'Nature': ['🌳', '🌲', '🌿', '🌱', '🌸', '🌺', '🌻', '🌹', '🌷', '🌼'],
  'Transport': ['🚗', '🚕', '🚌', '🚎', '🚐', '🚚', '🚛', '🚜', '🚲', '🛵'],
  'Health': ['🧖', '💆', '🧘', '🏥', '⚕️', '💊', '🩺', '🧴', '🧼', '🧽'],
  'Social': ['👥', '👫', '👬', '👭', '🤝', '👋', '🤗', '🎉', '🎊', '🥳'],
  'General': ['📍', '⭐', '💫', '✨', '🔥', '💎', '🎯', '🎪', '🎡', '🎢']
};

const EmojiPicker = ({
  visible,
  onClose,
  onEmojiSelect,
  selectedEmoji = '',
  title = 'Choose an emoji'
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Places');

  const handleEmojiSelect = (emoji) => {
    onEmojiSelect(emoji);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {selectedEmoji && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedLabel}>Selected:</Text>
            <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
          </View>
        )}

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
          {Object.keys(emojiCategories).map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.activeCategoryTab
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category && styles.activeCategoryTabText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Emoji Grid */}
        <ScrollView style={styles.emojiContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.emojiGrid}>
            {emojiCategories[selectedCategory].map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emojiButton,
                  selectedEmoji === emoji && styles.selectedEmojiButton
                ]}
                onPress={() => handleEmojiSelect(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  selectedLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 12,
  },
  selectedEmoji: {
    fontSize: 24,
  },
  categoryTabs: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    maxHeight: 50,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  activeCategoryTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  emojiContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  emojiButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedEmojiButton: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.1 }],
  },
  emoji: {
    fontSize: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
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
});

export default EmojiPicker;