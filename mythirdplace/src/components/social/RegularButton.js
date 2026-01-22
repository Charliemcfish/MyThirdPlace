import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, Platform, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser } from '../../services/auth';
import { getUserProfile } from '../../services/user';
import {
  addRegularRelationship,
  removeRegularRelationship,
  isUserRegularAtVenue,
  trackRegularActivity
} from '../../services/userVenueRelationships';

const RegularButton = ({ venue, onStatusChange, style, textStyle, size = 'normal', disabled = false }) => {
  const [isRegular, setIsRegular] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const navigation = useNavigation();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser && venue?.id) {
      checkRegularStatus();
    } else {
      setIsCheckingStatus(false);
    }
  }, [currentUser, venue?.id]);

  const checkRegularStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const status = await isUserRegularAtVenue(currentUser.uid, venue.id);
      setIsRegular(status);
    } catch (error) {
      console.error('Error checking regular status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleRegularToggle = async () => {
    if (!currentUser) {
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }

    if (disabled || isLoading) return;

    try {
      setIsLoading(true);

      if (isRegular) {
        // Remove regular status
        await removeRegularRelationship(currentUser.uid, venue.id);
        setIsRegular(false);
        await trackRegularActivity(currentUser.uid, venue.id, 'remove');
      } else {
        // Add regular status
        const userData = await getUserProfile(currentUser.uid);
        await addRegularRelationship(currentUser.uid, venue.id, userData, venue);
        setIsRegular(true);
        await trackRegularActivity(currentUser.uid, venue.id, 'add');
      }

      // Notify parent component of status change
      if (onStatusChange) {
        onStatusChange(!isRegular);
      }
    } catch (error) {
      console.error('Error toggling regular status:', error);
      // Revert state on error
      setIsRegular(isRegular);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonState = () => {
    if (isCheckingStatus) {
      return 'checking';
    }
    if (isLoading) {
      return 'loading';
    }
    if (!currentUser) {
      return 'unauthenticated';
    }
    if (isRegular) {
      return 'isRegular';
    }
    return 'notRegular';
  };

  const buttonState = getButtonState();

  const getButtonConfig = () => {
    const configs = {
      notRegular: {
        text: 'I am a Regular',
        style: 'outlined',
        icon: '♡',
        disabled: false
      },
      isRegular: {
        text: 'Regular',
        style: 'filled',
        icon: '♥',
        disabled: false
      },
      loading: {
        text: '...',
        style: 'disabled',
        icon: null,
        disabled: true
      },
      checking: {
        text: 'Loading',
        style: 'disabled',
        icon: null,
        disabled: true
      },
      unauthenticated: {
        text: 'Sign in to mark as Regular',
        style: 'outlined',
        icon: '👤',
        disabled: false
      }
    };

    return configs[buttonState] || configs.notRegular;
  };

  const config = getButtonConfig();

  const getButtonStyle = (baseStyle) => {
    const sizeConfig = {
      small: { padding: '8px 12px', fontSize: '14px', minHeight: '32px' },
      normal: { padding: '12px 16px', fontSize: '16px', minHeight: '44px' },
      large: { padding: '16px 20px', fontSize: '18px', minHeight: '52px' }
    };

    const styleConfigs = {
      filled: {
        backgroundColor: '#006548',
        color: '#FFFFFF',
        border: '2px solid #006548',
      },
      outlined: {
        backgroundColor: '#FFFFFF',
        color: '#006548',
        border: '2px solid #006548',
      },
      disabled: {
        backgroundColor: '#F5F5F5',
        color: '#999999',
        border: '2px solid #DDDDDD',
        cursor: 'not-allowed',
      }
    };

    return {
      borderRadius: '8px',
      cursor: config.disabled ? 'not-allowed' : 'pointer',
      fontWeight: '600',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: 'auto',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.2s ease',
      ...sizeConfig[size],
      ...styleConfigs[config.style],
      ...baseStyle,
    };
  };

  if (Platform.OS === 'web') {
    const flattenStyle = (styleArray) => {
      if (!styleArray) return {};
      if (Array.isArray(styleArray)) {
        return Object.assign({}, ...styleArray.filter(Boolean));
      }
      return styleArray;
    };

    const flattenedStyle = flattenStyle(style);
    const buttonStyle = getButtonStyle(flattenedStyle);

    return (
      <button
        onClick={handleRegularToggle}
        disabled={config.disabled || disabled}
        style={buttonStyle}
      >
        {config.icon && <span style={{ fontSize: '16px' }}>{config.icon}</span>}
        {(isLoading || isCheckingStatus) && (
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: '2px solid currentColor',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
        <span>{config.text}</span>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </button>
    );
  }

  // React Native implementation
  const buttonStyleRN = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    borderWidth: 2,
    backgroundColor: config.style === 'filled' ? '#006548' : '#FFFFFF',
    borderColor: config.style === 'disabled' ? '#DDDDDD' : '#006548',
    opacity: disabled ? 0.6 : 1,
    gap: 8
  };

  const textStyleRN = {
    fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
    fontWeight: '600',
    color: config.style === 'filled' ? '#FFFFFF' :
           config.style === 'disabled' ? '#999999' : '#006548'
  };

  return (
    <TouchableOpacity
      onPress={handleRegularToggle}
      disabled={config.disabled || disabled}
      style={[buttonStyleRN, style]}
    >
      {config.icon && (
        <Text style={{ fontSize: 16 }}>{config.icon}</Text>
      )}
      {(isLoading || isCheckingStatus) && (
        <ActivityIndicator
          size="small"
          color={config.style === 'filled' ? '#FFFFFF' : '#006548'}
        />
      )}
      <Text style={[textStyleRN, textStyle]}>{config.text}</Text>
    </TouchableOpacity>
  );
};

export default RegularButton;