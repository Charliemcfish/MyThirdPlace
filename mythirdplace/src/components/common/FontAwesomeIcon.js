import React from 'react';
import { Platform, View } from 'react-native';

const FontAwesomeIcon = ({ name, size = 16, color = '#000', style }) => {
  if (Platform.OS !== 'web') {
    // For non-web platforms, return a fallback or empty view
    return <View style={[{ width: size, height: size }, style]} />;
  }

  // For web platform, use FontAwesome CSS classes
  const iconStyle = {
    fontSize: size,
    color: color,
    fontFamily: "'Font Awesome 6 Free', 'Font Awesome 6 Brands'",
    fontWeight: (name.includes('linkedin') || name.includes('instagram') ||
                  name.includes('facebook') || name.includes('twitter') ||
                  name.includes('tiktok')) ? 400 : 900,
    ...style,
  };

  // Handle different icon types
  const getIconClass = (iconName) => {
    // Social media icons are brand icons (fab)
    if (iconName.includes('linkedin') || iconName.includes('instagram') ||
        iconName.includes('facebook') || iconName.includes('twitter') ||
        iconName.includes('tiktok')) {
      return `fab ${iconName}`;
    }
    return `fas ${iconName}`;
  };

  return React.createElement('i', {
    className: getIconClass(name),
    style: iconStyle,
  });
};

export default FontAwesomeIcon;