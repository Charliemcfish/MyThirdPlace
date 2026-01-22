import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { globalStyles } from '../../../styles/globalStyles';
import { colors } from '../../../styles/theme';
import { venueTags, tagCategories, getTagsByCategory } from '../../../data/venueTags.js';

const TagSelector = ({ selectedTags = [], onTagsChange, error, maxSelection = 10 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('amenities');

  const filteredTags = searchQuery 
    ? venueTags.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getTagsByCategory(expandedCategory);

  const handleTagToggle = (tagId) => {
    const isSelected = selectedTags.includes(tagId);
    let newTags;
    
    if (isSelected) {
      newTags = selectedTags.filter(id => id !== tagId);
    } else {
      if (selectedTags.length >= maxSelection) {
        return;
      }
      newTags = [...selectedTags, tagId];
    }
    
    onTagsChange(newTags);
  };

  const renderTagGrid = (tags) => (
    <View style={styles.tagGrid}>
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);
        const isDisabled = !isSelected && selectedTags.length >= maxSelection;
        
        return (
          <Pressable
            key={tag.id}
            style={[
              styles.tagButton,
              isSelected && styles.tagButtonSelected,
              isDisabled && styles.tagButtonDisabled
            ]}
            onPress={() => handleTagToggle(tag.id)}
            disabled={isDisabled}
          >
            <Text style={styles.tagIcon}>{tag.icon}</Text>
            <Text style={[
              styles.tagText,
              isSelected && styles.tagTextSelected,
              isDisabled && styles.tagTextDisabled
            ]}>
              {tag.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.heading4, styles.title]}>
        Amenities & Features
      </Text>
      <Text style={[globalStyles.captionText, styles.subtitle]}>
        Select up to {maxSelection} tags that describe this venue ({selectedTags.length}/{maxSelection})
      </Text>

      {/* Search */}
      <TextInput
        style={[globalStyles.input, styles.searchInput]}
        placeholder="Search tags..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {searchQuery ? (
        // Show search results
        <View style={styles.searchResults}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {renderTagGrid(filteredTags)}
        </View>
      ) : (
        // Show categories
        <View style={styles.categoriesContainer}>
          {/* Category Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {tagCategories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryTab,
                  expandedCategory === category.id && styles.categoryTabActive
                ]}
                onPress={() => setExpandedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  expandedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Tags for Selected Category */}
          <View style={styles.categorySection}>
            {renderTagGrid(filteredTags)}
          </View>
        </View>
      )}

      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          <Text style={styles.selectedTagsTitle}>Selected Tags:</Text>
          <View style={styles.selectedTagsList}>
            {selectedTags.map((tagId) => {
              const tag = venueTags.find(t => t.id === tagId);
              return tag ? (
                <View key={tagId} style={styles.selectedTag}>
                  <Text style={styles.selectedTagIcon}>{tag.icon}</Text>
                  <Text style={styles.selectedTagText}>{tag.name}</Text>
                  <Pressable 
                    style={styles.removeTagButton}
                    onPress={() => handleTagToggle(tagId)}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </Pressable>
                </View>
              ) : null;
            })}
          </View>
        </View>
      )}

      {error && <Text style={globalStyles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = {
  container: {
    marginBottom: 16
  },
  title: {
    marginBottom: 8
  },
  subtitle: {
    color: colors.mediumGrey,
    marginBottom: 16
  },
  searchInput: {
    marginBottom: 16
  },
  searchResults: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12
  },
  categoriesContainer: {
    marginBottom: 16
  },
  categoryTabs: {
    marginBottom: 16
  },
  categoryTabsContent: {
    paddingHorizontal: 4
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGrey,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8
  },
  categoryTabActive: {
    backgroundColor: colors.primary
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6
  },
  categoryText: {
    fontSize: 14,
    color: colors.mediumGrey,
    fontWeight: '500'
  },
  categoryTextActive: {
    color: colors.white
  },
  categorySection: {
    minHeight: 120
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8
  },
  tagButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tagButtonDisabled: {
    opacity: 0.4
  },
  tagIcon: {
    fontSize: 14,
    marginRight: 6
  },
  tagText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500'
  },
  tagTextSelected: {
    color: colors.white
  },
  tagTextDisabled: {
    color: colors.mediumGrey
  },
  selectedTagsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 16
  },
  selectedTagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  selectedTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  selectedTagIcon: {
    fontSize: 12,
    marginRight: 4
  },
  selectedTagText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500'
  },
  removeTagButton: {
    marginLeft: 6,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeTagText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: 'bold'
  }
};

export default TagSelector;