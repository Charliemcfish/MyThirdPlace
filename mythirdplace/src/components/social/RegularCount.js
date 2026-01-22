import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, Platform, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getRegularCount } from '../../services/userVenueRelationships';

const RegularCount = ({ venueId, onPress, style, textStyle, showZero = false, size = 'normal' }) => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (venueId) {
      fetchRegularCount();
    }
  }, [venueId]);

  const fetchRegularCount = async () => {
    try {
      setIsLoading(true);
      const regularCount = await getRegularCount(venueId);
      setCount(regularCount);
    } catch (error) {
      console.error('Error fetching regular count:', error);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(count);
    } else if (count > 0) {
      navigation.navigate('VenueRegulars', { venueId, count });
    }
  };

  const formatCount = (num) => {
    if (num === 0 && !showZero) return '';
    if (num === 1) return '1 regular';
    if (num <= 50) return `${num} regulars`;
    return '50+ regulars';
  };

  const getSeeAllText = (num) => {
    if (num === 0) return '';
    if (num === 1) return 'See regular';
    return 'See all regulars';
  };

  const getSizeConfig = () => {
    const configs = {
      small: {
        fontSize: '12px',
        padding: '4px 8px',
        gap: '4px'
      },
      normal: {
        fontSize: '14px',
        padding: '6px 12px',
        gap: '6px'
      },
      large: {
        fontSize: '16px',
        padding: '8px 16px',
        gap: '8px'
      }
    };
    return configs[size] || configs.normal;
  };

  if (isLoading) {
    if (Platform.OS === 'web') {
      return (
        <div style={{
          ...getSizeConfig(),
          color: '#666666',
          fontFamily: 'inherit'
        }}>
          Loading...
        </div>
      );
    }
    return <Text style={{ color: '#666666', fontSize: 14 }}>Loading...</Text>;
  }

  if (count === 0 && !showZero) {
    return null;
  }

  const sizeConfig = getSizeConfig();

  if (Platform.OS === 'web') {
    const flattenStyle = (styleArray) => {
      if (!styleArray) return {};
      if (Array.isArray(styleArray)) {
        return Object.assign({}, ...styleArray.filter(Boolean));
      }
      return styleArray;
    };

    const flattenedStyle = flattenStyle(style);
    const flattenedTextStyle = flattenStyle(textStyle);

    const containerStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: sizeConfig.gap,
      cursor: count > 0 ? 'pointer' : 'default',
      padding: sizeConfig.padding,
      borderRadius: '6px',
      backgroundColor: count > 0 ? '#F8F9FA' : 'transparent',
      border: count > 0 ? '1px solid #E9ECEF' : 'none',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
      ...flattenedStyle
    };

    const textStyleWeb = {
      fontSize: sizeConfig.fontSize,
      fontWeight: '500',
      color: '#333333',
      margin: '0',
      ...flattenedTextStyle
    };

    const seeAllStyle = {
      fontSize: sizeConfig.fontSize,
      fontWeight: '600',
      color: '#006548',
      margin: '0',
      textDecoration: 'none'
    };

    if (count === 0) {
      return (
        <div style={containerStyle}>
          <span style={textStyleWeb}>No regulars yet</span>
        </div>
      );
    }

    return (
      <div
        onClick={handlePress}
        style={{
          ...containerStyle,
          ':hover': {
            backgroundColor: '#E9ECEF'
          }
        }}
      >
        <span style={textStyleWeb}>{formatCount(count)}</span>
        {count > 0 && (
          <>
            <span style={{ color: '#DEE2E6', fontSize: sizeConfig.fontSize }}>•</span>
            <span style={seeAllStyle}>{getSeeAllText(count)}</span>
          </>
        )}
      </div>
    );
  }

  // React Native implementation
  const containerStyleRN = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: count > 0 ? '#F8F9FA' : 'transparent',
    borderRadius: 6,
    borderWidth: count > 0 ? 1 : 0,
    borderColor: '#E9ECEF'
  };

  const textStyleRN = {
    fontSize: parseInt(sizeConfig.fontSize),
    fontWeight: '500',
    color: '#333333'
  };

  const seeAllStyleRN = {
    fontSize: parseInt(sizeConfig.fontSize),
    fontWeight: '600',
    color: '#006548',
    marginLeft: 8
  };

  if (count === 0) {
    return (
      <View style={[containerStyleRN, style]}>
        <Text style={[textStyleRN, textStyle]}>No regulars yet</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[containerStyleRN, style]}
      disabled={count === 0}
    >
      <Text style={[textStyleRN, textStyle]}>{formatCount(count)}</Text>
      {count > 0 && (
        <>
          <Text style={{ color: '#DEE2E6', fontSize: parseInt(sizeConfig.fontSize), marginHorizontal: 6 }}>•</Text>
          <Text style={seeAllStyleRN}>{getSeeAllText(count)}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default RegularCount;