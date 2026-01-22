import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../styles/theme';
import { getCategoryById } from '../../services/venue';

const CategoryBadge = ({ 
  categoryId, 
  size = 'medium',
  style = {},
  showIcon = true,
  showName = true 
}) => {
  const category = getCategoryById(categoryId);
  
  if (!category) {
    return null;
  }

  const sizeStyles = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      iconSize: 12,
      textSize: 12
    },
    medium: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      iconSize: 14,
      textSize: 14
    },
    large: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      iconSize: 16,
      textSize: 16
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  const badgeStyle = {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: currentSize.paddingHorizontal,
    paddingVertical: currentSize.paddingVertical,
    borderRadius: currentSize.borderRadius,
    ...style
  };

  const iconStyle = {
    fontSize: currentSize.iconSize,
    marginRight: showName && showIcon ? 6 : 0
  };

  const textStyle = {
    color: colors.white,
    fontSize: currentSize.textSize,
    fontWeight: '600'
  };

  return (
    <View style={badgeStyle}>
      {showIcon && (
        <Text style={iconStyle}>
          {category.icon}
        </Text>
      )}
      {showName && (
        <Text style={textStyle}>
          {category.name}
        </Text>
      )}
    </View>
  );
};

export default CategoryBadge;