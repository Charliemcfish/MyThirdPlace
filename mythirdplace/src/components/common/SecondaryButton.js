import React from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const SecondaryButton = ({ onPress, style, textStyle, children, disabled, ...props }) => {
  if (Platform.OS === 'web') {
    // Convert React Native style to web-compatible style
    const flattenStyle = (styleArray) => {
      if (!styleArray) return {};
      if (Array.isArray(styleArray)) {
        return Object.assign({}, ...styleArray.filter(Boolean));
      }
      return styleArray;
    };

    const flattenedStyle = flattenStyle(style);
    const flattenedTextStyle = flattenStyle(textStyle);
    
    // Use HTML button for web with valid CSS properties only
    const buttonStyle = {
      backgroundColor: '#FFFFFF',
      border: '1px solid #006548',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px 0',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      width: '100%',
      minHeight: '48px',
      fontSize: '16px',
      fontWeight: '600',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#006548', // Default text color
      ...flattenedStyle,
    };

    // Apply text color from textStyle to button if provided
    if (flattenedTextStyle.color) {
      buttonStyle.color = flattenedTextStyle.color;
    }
    if (flattenedTextStyle.fontWeight) {
      buttonStyle.fontWeight = flattenedTextStyle.fontWeight;
    }

    return (
      <button
        onClick={disabled ? undefined : onPress}
        style={buttonStyle}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }

  // Use TouchableOpacity for native
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[globalStyles.buttonSecondary, style]}
      disabled={disabled}
      {...props}
    >
      <Text style={[globalStyles.buttonTextSecondary, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};

export default SecondaryButton;