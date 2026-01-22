import React from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const Button = ({ onPress, style, textStyle, children, disabled, ...props }) => {
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
    
    // Use HTML button for web with valid CSS properties only
    const buttonStyle = {
      backgroundColor: '#006548',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px 0',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      width: '100%',
      minHeight: '48px',
      fontSize: '16px',
      fontWeight: '600',
      color: '#FFFFFF',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...flattenedStyle,
    };

    const flattenedTextStyle = flattenStyle(textStyle);
    
    const textStyleWeb = {
      color: '#FFFFFF',
      fontSize: '16px',
      fontWeight: '600',
      margin: '0',
      padding: '0',
      ...flattenedTextStyle,
    };

    return (
      <button
        onClick={disabled ? undefined : onPress}
        style={buttonStyle}
        disabled={disabled}
        {...props}
      >
        <span style={textStyleWeb}>{children}</span>
      </button>
    );
  }

  // Use TouchableOpacity for native
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[globalStyles.button, style]}
      disabled={disabled}
      {...props}
    >
      <Text style={[globalStyles.buttonText, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};

export default Button;