import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../styles/theme';
import { getCategoryById, venueCategories } from '../../services/venue';
import { blogCategories } from '../../services/blog';

/**
 * Unified CategoryBadge component that works for both blogs and venues
 * Maintains consistent styling across the platform
 */
const UnifiedCategoryBadge = ({
  // Category identification
  categoryId,        // For venues: category ID, for blogs: category ID
  categoryName,      // Optional override for category name
  type = 'venue',    // 'venue' or 'blog' to determine which category set to use

  // Appearance
  size = 'medium',   // 'small', 'medium', 'large'
  variant = 'filled', // 'filled', 'outlined', 'minimal'
  showIcon = true,   // Show category icon (venues only)
  showName = true,   // Show category name

  // Interactive
  onPress,          // Make badge touchable
  isSelected = false, // For selection states
  disabled = false,  // Disable interaction

  // Additional data
  showCount = false, // Show count (e.g., "Cafe (12)")
  count = 0,        // Count value

  // Styling
  style = {}        // Custom style overrides
}) => {
  // Get category information based on type
  const getCategoryInfo = () => {
    if (type === 'venue') {
      const category = getCategoryById(categoryId);
      return category ? {
        id: category.id,
        name: category.name,
        icon: category.icon
      } : null;
    } else if (type === 'blog') {
      const category = blogCategories.find(cat => cat.id === categoryId);
      return category ? {
        id: category.id,
        name: category.name,
        icon: null // Blog categories don't have icons
      } : null;
    }
    return null;
  };

  const category = getCategoryInfo();
  const displayName = categoryName || category?.name;

  if (!category && !categoryName) {
    return null;
  }

  // Size configuration
  const sizeConfig = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: 12,
      iconSize: 12
    },
    medium: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      fontSize: 14,
      iconSize: 14
    },
    large: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      fontSize: 16,
      iconSize: 16
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  // Variant styles
  const getVariantStyles = () => {
    const baseStyle = {
      paddingHorizontal: currentSize.paddingHorizontal,
      paddingVertical: currentSize.paddingVertical,
      borderRadius: currentSize.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start'
    };

    const baseTextStyle = {
      fontSize: currentSize.fontSize,
      fontWeight: '600'
    };

    switch (variant) {
      case 'filled':
        return {
          container: {
            ...baseStyle,
            backgroundColor: isSelected ? colors.primary : colors.primary,
            borderWidth: 0
          },
          text: {
            ...baseTextStyle,
            color: colors.white
          }
        };

      case 'outlined':
        return {
          container: {
            ...baseStyle,
            backgroundColor: isSelected ? colors.primary : 'transparent',
            borderWidth: 1,
            borderColor: colors.primary
          },
          text: {
            ...baseTextStyle,
            color: isSelected ? colors.white : colors.primary
          }
        };

      case 'minimal':
        return {
          container: {
            ...baseStyle,
            backgroundColor: isSelected ? colors.primary : '#f5f5f5',
            borderWidth: 1,
            borderColor: isSelected ? colors.primary : '#e0e0e0'
          },
          text: {
            ...baseTextStyle,
            color: isSelected ? colors.white : '#666',
            fontWeight: '500'
          }
        };

      default:
        return {
          container: {
            ...baseStyle,
            backgroundColor: colors.primary
          },
          text: {
            ...baseTextStyle,
            color: colors.white
          }
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle = {
    ...variantStyles.container,
    opacity: disabled ? 0.5 : 1,
    ...style
  };

  const iconStyle = {
    fontSize: currentSize.iconSize,
    marginRight: (showName && showIcon && category?.icon) ? 6 : 0,
    color: variantStyles.text.color
  };

  const textStyle = {
    ...variantStyles.text
  };

  const countStyle = {
    ...textStyle,
    fontSize: currentSize.fontSize - 1,
    opacity: 0.8
  };

  // Render as TouchableOpacity if onPress is provided
  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={() => onPress(category || { id: categoryId, name: displayName })}
        activeOpacity={0.7}
      >
        {showIcon && category?.icon && (
          <Text style={iconStyle}>
            {category.icon}
          </Text>
        )}
        {showName && displayName && (
          <Text style={textStyle}>
            {displayName}
            {showCount && count > 0 && (
              <Text style={countStyle}> ({count})</Text>
            )}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // Render as regular View
  return (
    <View style={containerStyle}>
      {showIcon && category?.icon && (
        <Text style={iconStyle}>
          {category.icon}
        </Text>
      )}
      {showName && displayName && (
        <Text style={textStyle}>
          {displayName}
          {showCount && count > 0 && (
            <Text style={countStyle}> ({count})</Text>
          )}
        </Text>
      )}
    </View>
  );
};

export default UnifiedCategoryBadge;