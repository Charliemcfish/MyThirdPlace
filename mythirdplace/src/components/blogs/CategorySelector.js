import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import CategoryBadge from './CategoryBadge';
import { blogCategories } from '../../services/blog';
import { colors } from '../../styles/theme';

const CategorySelector = ({ 
  selectedCategory, 
  onCategoryChange, 
  mode = 'dropdown', // 'dropdown' or 'badges'
  showAllOption = false,
  label = "Category",
  required = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const categories = showAllOption 
    ? [{ id: 'all', name: 'All Categories', description: 'Show all blog categories' }, ...blogCategories]
    : blogCategories;

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  if (mode === 'badges') {
    return (
      <View style={styles.container}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgeContainer}
        >
          {categories.map((category) => (
            <CategoryBadge
              key={category.id}
              category={category.id}
              categoryName={category.name}
              isSelected={selectedCategory === category.id}
              onPress={() => onCategoryChange(category.id)}
              size="medium"
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedCategoryData ? selectedCategoryData.name : 'Select a category...'}
          </Text>
          <Text style={styles.dropdownArrow}>
            {isDropdownOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdownList}>
            {!selectedCategory && (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  onCategoryChange('');
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>Select a category...</Text>
              </TouchableOpacity>
            )}
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.dropdownItem,
                  selectedCategory === category.id && styles.selectedDropdownItem,
                  index === categories.length - 1 && styles.lastDropdownItem
                ]}
                onPress={() => {
                  onCategoryChange(category.id);
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  selectedCategory === category.id && styles.selectedDropdownItemText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {selectedCategoryData && selectedCategory !== 'all' && (
        <Text style={styles.description}>
          {selectedCategoryData.description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 10001,
    overflow: 'visible',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 9999,
    overflow: 'visible',
  },
  dropdownButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10000,
    overflow: 'scroll',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownItem: {
    backgroundColor: colors.primary + '10',
  },
  selectedDropdownItemText: {
    color: colors.primary,
    fontWeight: '600',
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  }
});

export default CategorySelector;