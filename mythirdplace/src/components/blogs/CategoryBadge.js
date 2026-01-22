import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../styles/theme';

const CategoryBadge = ({ 
  category, 
  categoryName, 
  onPress, 
  isSelected = false, 
  size = 'medium',
  showCount = false,
  count = 0
}) => {
  const styles = createStyles(size, isSelected);
  
  return (
    <TouchableOpacity
      style={[styles.badge, isSelected && styles.selectedBadge]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[styles.badgeText, isSelected && styles.selectedBadgeText]}>
        {categoryName}
        {showCount && count > 0 && (
          <Text style={styles.countText}> ({count})</Text>
        )}
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = (size, isSelected) => {
  const sizeConfig = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 12,
    },
    medium: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 14,
    },
    large: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 16,
    }
  };
  
  const config = sizeConfig[size] || sizeConfig.medium;
  
  return StyleSheet.create({
    badge: {
      backgroundColor: isSelected ? colors.primary : '#f5f5f5',
      paddingHorizontal: config.paddingHorizontal,
      paddingVertical: config.paddingVertical,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isSelected ? colors.primary : '#e0e0e0',
    },
    selectedBadge: {
      backgroundColor: colors.primary,
    },
    badgeText: {
      color: isSelected ? 'white' : '#666',
      fontSize: config.fontSize,
      fontWeight: '500',
    },
    selectedBadgeText: {
      color: 'white',
    },
    countText: {
      fontSize: config.fontSize - 1,
      opacity: 0.8,
    }
  });
};

export default CategoryBadge;