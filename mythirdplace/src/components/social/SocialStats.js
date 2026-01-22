import React from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SocialStats = ({
  regularVenuesCount = 0,
  createdVenuesCount = 0,
  publishedBlogsCount = 0,
  style,
  isOwnProfile = false,
  userUID,
  size = 'normal',
  onStatClick
}) => {
  const navigation = useNavigation();

  const getSizeConfig = () => {
    const configs = {
      small: {
        fontSize: '14px',
        labelFontSize: '12px',
        padding: '12px',
        gap: '16px'
      },
      normal: {
        fontSize: '18px',
        labelFontSize: '14px',
        padding: '16px',
        gap: '20px'
      },
      large: {
        fontSize: '24px',
        labelFontSize: '16px',
        padding: '20px',
        gap: '24px'
      }
    };
    return configs[size] || configs.normal;
  };

  const handleStatPress = (type) => {
    if (onStatClick) {
      // Use the custom click handler if provided
      onStatClick(type);
      return;
    }

    if (!isOwnProfile && !userUID) return;

    switch (type) {
      case 'regular':
        if (isOwnProfile) {
          navigation.navigate('MyRegularVenues');
        } else {
          navigation.navigate('UserRegularVenues', { userId: userUID });
        }
        break;
      case 'created':
        if (isOwnProfile) {
          navigation.navigate('MyCreatedVenues');
        } else {
          navigation.navigate('UserCreatedVenues', { userId: userUID });
        }
        break;
      case 'blogs':
        if (isOwnProfile) {
          navigation.navigate('MyBlogs');
        } else {
          navigation.navigate('UserBlogs', { userId: userUID });
        }
        break;
      default:
        break;
    }
  };

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

    const containerStyle = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: sizeConfig.padding,
      backgroundColor: '#F8F9FA',
      borderRadius: '12px',
      border: '1px solid #E9ECEF',
      fontFamily: 'inherit',
      ...flattenedStyle
    };

    const statItemStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'background-color 0.2s ease',
      minWidth: '80px'
    };

    const statValueStyle = {
      fontSize: sizeConfig.fontSize,
      fontWeight: '700',
      color: '#333333',
      margin: '0 0 4px 0'
    };

    const statLabelStyle = {
      fontSize: sizeConfig.labelFontSize,
      color: '#666666',
      margin: '0',
      fontWeight: '500'
    };

    return (
      <div style={containerStyle}>
        <div
          style={statItemStyle}
          onClick={() => handleStatPress('regular')}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#E9ECEF';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <div style={statValueStyle}>{regularVenuesCount}</div>
          <div style={statLabelStyle}>
            {regularVenuesCount === 1 ? 'Regular' : 'Regulars'}
          </div>
        </div>

        <div style={{
          width: '1px',
          height: '40px',
          backgroundColor: '#DEE2E6'
        }} />

        <div
          style={statItemStyle}
          onClick={() => handleStatPress('created')}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#E9ECEF';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <div style={statValueStyle}>{createdVenuesCount}</div>
          <div style={statLabelStyle}>
            {createdVenuesCount === 1 ? 'Place Added' : 'Places Added'}
          </div>
        </div>

        <div style={{
          width: '1px',
          height: '40px',
          backgroundColor: '#DEE2E6'
        }} />

        <div
          style={statItemStyle}
          onClick={() => handleStatPress('blogs')}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#E9ECEF';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <div style={statValueStyle}>{publishedBlogsCount}</div>
          <div style={statLabelStyle}>
            {publishedBlogsCount === 1 ? 'Blog' : 'Blogs'}
          </div>
        </div>
      </div>
    );
  }

  // React Native implementation
  const containerStyleRN = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: parseInt(sizeConfig.padding),
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF'
  };

  const statItemStyleRN = {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 80
  };

  const statValueStyleRN = {
    fontSize: parseInt(sizeConfig.fontSize),
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4
  };

  const statLabelStyleRN = {
    fontSize: parseInt(sizeConfig.labelFontSize),
    color: '#666666',
    fontWeight: '500',
    textAlign: 'center'
  };

  const separatorStyleRN = {
    width: 1,
    height: 40,
    backgroundColor: '#DEE2E6'
  };

  return (
    <View style={[containerStyleRN, style]}>
      <TouchableOpacity
        style={statItemStyleRN}
        onPress={() => handleStatPress('regular')}
      >
        <Text style={statValueStyleRN}>{regularVenuesCount}</Text>
        <Text style={statLabelStyleRN}>
          {regularVenuesCount === 1 ? 'Regular' : 'Regulars'}
        </Text>
      </TouchableOpacity>

      <View style={separatorStyleRN} />

      <TouchableOpacity
        style={statItemStyleRN}
        onPress={() => handleStatPress('created')}
      >
        <Text style={statValueStyleRN}>{createdVenuesCount}</Text>
        <Text style={statLabelStyleRN}>
          {createdVenuesCount === 1 ? 'Place Added' : 'Places Added'}
        </Text>
      </TouchableOpacity>

      <View style={separatorStyleRN} />

      <TouchableOpacity
        style={statItemStyleRN}
        onPress={() => handleStatPress('blogs')}
      >
        <Text style={statValueStyleRN}>{publishedBlogsCount}</Text>
        <Text style={statLabelStyleRN}>
          {publishedBlogsCount === 1 ? 'Blog' : 'Blogs'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SocialStats;