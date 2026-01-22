import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import { venueCategories, loadDynamicCategories } from '../../services/venue';
import CustomCategoryCreator from './CustomCategoryCreator';

const CategorySelector = ({
  selectedCategory,
  onCategorySelect,
  error = null,
  style = {},
  showAllOption = false,
  showCreateOption = false,
  layout = 'horizontal' // 'horizontal' or 'vertical'
}) => {
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      await loadDynamicCategories();
      setDynamicCategories([]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const allCategories = venueCategories();
  const categories = showAllOption
    ? [{ id: 'all', name: 'All Categories', icon: '🏠' }, ...allCategories]
    : allCategories;

  const handleCustomCategoryCreated = (newCategory) => {
    setShowCustomCreator(false);
    onCategorySelect(newCategory.id);
    loadCategories();
  };

  if (layout === 'vertical') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.verticalContainer}>
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <CategoryItem
                key={category.id}
                category={category}
                isSelected={isSelected}
                onPress={() => onCategorySelect(category.id)}
                style={styles.verticalItem}
              />
            );
          })}

          {showCreateOption && (
            <TouchableOpacity
              style={[styles.categoryItem, styles.verticalItem, styles.createCustomItem]}
              onPress={() => setShowCustomCreator(true)}
            >
              <Text style={[styles.categoryIcon, { marginRight: 12 }]}>➕</Text>
              <Text style={[styles.categoryName, styles.createCustomText]}>
                Create Custom Category
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <Text style={globalStyles.errorText}>{error}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.horizontalGrid}>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <CategoryItem
              key={category.id}
              category={category}
              isSelected={isSelected}
              onPress={() => onCategorySelect(category.id)}
              style={styles.horizontalItem}
            />
          );
        })}

        {showCreateOption && (
          <TouchableOpacity
            style={[styles.categoryItem, styles.horizontalItem, styles.createCustomItem]}
            onPress={() => setShowCustomCreator(true)}
          >
            <Text style={styles.categoryIcon}>➕</Text>
            <Text style={[styles.categoryName, styles.createCustomText]}>
              Create Custom
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={globalStyles.errorText}>{error}</Text>
      )}

      <CustomCategoryCreator
        visible={showCustomCreator}
        onClose={() => setShowCustomCreator(false)}
        onCategoryCreated={handleCustomCategoryCreated}
      />
    </View>
  );
};

const CategoryItem = ({ category, isSelected, onPress, style }) => {
  const isVertical = style === styles.verticalItem;

  return (
    <Pressable
      style={[
        styles.categoryItem,
        isSelected && styles.selectedItem,
        style
      ]}
      onPress={onPress}
      android_ripple={{ color: colors.lightGrey }}
    >
      <Text style={[
        styles.categoryIcon,
        isSelected && styles.selectedIcon,
        isVertical && { marginBottom: 0, marginRight: 12 }
      ]}>
        {category.icon}
      </Text>
      <Text style={[
        styles.categoryName,
        isSelected && styles.selectedName,
        isVertical && { textAlign: 'left', fontSize: 14 }
      ]}>
        {category.name}
      </Text>
    </Pressable>
  );
};

const styles = {
  container: {
    marginVertical: 8
  },
  horizontalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
  },
  verticalContainer: {
    flexDirection: 'column',
    gap: 8
  },
  categoryItem: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 2,
    borderColor: colors.lightGrey,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    minWidth: 90
  },
  selectedItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  horizontalItem: {
    marginBottom: 8
  },
  verticalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 50,
    minWidth: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  selectedIcon: {
    fontSize: 20
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center'
  },
  selectedName: {
    color: colors.white,
    fontWeight: 'bold'
  },
  createCustomItem: {
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: '#f8f9fa',
  },
  createCustomText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  }
};


export default CategorySelector;