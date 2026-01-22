import React, { useState, useEffect } from 'react';
import { View, Text, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getVenueRegulars } from '../../services/userVenueRelationships';
import Avatar from '../common/Avatar';

const VenueRegulars = ({
  venueId,
  maxDisplay = 6,
  onSeeAllPress,
  style,
  showCount = true,
  size = 'normal'
}) => {
  const [regulars, setRegulars] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (venueId) {
      fetchRegulars();
    }
  }, [venueId]);

  const fetchRegulars = async () => {
    try {
      setIsLoading(true);
      const regularData = await getVenueRegulars(venueId, maxDisplay + 10); // Get a few extra
      setRegulars(regularData);
      setTotalCount(regularData.length);
    } catch (error) {
      console.error('Error fetching venue regulars:', error);
      setRegulars([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeeAllPress = () => {
    if (onSeeAllPress) {
      onSeeAllPress(totalCount);
    } else {
      navigation.navigate('VenueRegulars', { venueId, totalCount });
    }
  };

  const handleUserPress = (regular) => {
    navigation.navigate('ViewProfile', { userId: regular.userUID });
  };

  const formatJoinDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const getSizeConfig = () => {
    const configs = {
      small: {
        avatarSize: 32,
        fontSize: '12px',
        spacing: '8px',
        gridGap: '8px'
      },
      normal: {
        avatarSize: 40,
        fontSize: '14px',
        spacing: '12px',
        gridGap: '12px'
      },
      large: {
        avatarSize: 48,
        fontSize: '16px',
        spacing: '16px',
        gridGap: '16px'
      }
    };
    return configs[size] || configs.normal;
  };

  if (isLoading) {
    if (Platform.OS === 'web') {
      return (
        <div style={{
          padding: getSizeConfig().spacing,
          fontFamily: 'inherit',
          color: '#666666'
        }}>
          Loading regulars...
        </div>
      );
    }
    return (
      <View style={{ padding: 12 }}>
        <Text style={{ color: '#666666', fontSize: 14 }}>Loading regulars...</Text>
      </View>
    );
  }

  if (regulars.length === 0) {
    if (Platform.OS === 'web') {
      return (
        <div style={{
          padding: getSizeConfig().spacing,
          fontFamily: 'inherit',
          color: '#666666',
          textAlign: 'center'
        }}>
          No regulars yet. Be the first!
        </div>
      );
    }
    return (
      <View style={{ padding: 12, alignItems: 'center' }}>
        <Text style={{ color: '#666666', fontSize: 14 }}>No regulars yet. Be the first!</Text>
      </View>
    );
  }

  const displayRegulars = regulars.slice(0, maxDisplay);
  const remainingCount = Math.max(0, totalCount - maxDisplay);
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
      padding: sizeConfig.spacing,
      fontFamily: 'inherit',
      ...flattenedStyle
    };

    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(${sizeConfig.avatarSize * 2}px, 1fr))`,
      gap: sizeConfig.gridGap,
      marginBottom: sizeConfig.spacing
    };

    const userItemStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'background-color 0.2s ease',
      textDecoration: 'none'
    };

    const userItemHoverStyle = {
      ...userItemStyle,
      backgroundColor: '#F8F9FA'
    };

    const nameStyle = {
      fontSize: sizeConfig.fontSize,
      fontWeight: '500',
      color: '#333333',
      marginTop: '4px',
      textAlign: 'center',
      lineHeight: '1.2',
      maxWidth: '80px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };

    const dateStyle = {
      fontSize: '11px',
      color: '#666666',
      marginTop: '2px',
      textAlign: 'center'
    };

    const seeAllStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      cursor: 'pointer',
      padding: '8px 12px',
      backgroundColor: '#F8F9FA',
      borderRadius: '6px',
      border: '1px solid #E9ECEF',
      fontSize: sizeConfig.fontSize,
      fontWeight: '600',
      color: '#006548',
      textDecoration: 'none',
      transition: 'background-color 0.2s ease'
    };

    return (
      <div style={containerStyle}>
        {showCount && totalCount > 0 && (
          <div style={{
            fontSize: sizeConfig.fontSize,
            fontWeight: '600',
            color: '#333333',
            marginBottom: sizeConfig.spacing
          }}>
            {totalCount === 1 ? '1 Regular' : `${totalCount} Regulars`}
          </div>
        )}

        <div style={gridStyle}>
          {displayRegulars.map((regular) => (
            <div
              key={regular.id}
              onClick={() => handleUserPress(regular)}
              style={userItemStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#F8F9FA';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Avatar
                profilePhotoURL={regular.userPhotoURL}
                displayName={regular.userDisplayName}
                size={sizeConfig.avatarSize}
              />
              <div style={nameStyle} title={regular.userDisplayName}>
                {regular.userDisplayName || 'Anonymous'}
              </div>
              <div style={dateStyle}>
                {formatJoinDate(regular.createdAt)}
              </div>
            </div>
          ))}
        </div>

        {remainingCount > 0 && (
          <div
            onClick={handleSeeAllPress}
            style={seeAllStyle}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#E9ECEF';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#F8F9FA';
            }}
          >
            <span>See all {totalCount} regulars</span>
            <span style={{ fontSize: '12px' }}>→</span>
          </div>
        )}
      </div>
    );
  }

  // React Native implementation
  const containerStyleRN = {
    padding: parseInt(sizeConfig.spacing)
  };

  const gridStyleRN = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: parseInt(sizeConfig.spacing)
  };

  const userItemStyleRN = {
    alignItems: 'center',
    padding: 8,
    margin: 4,
    borderRadius: 8,
    width: sizeConfig.avatarSize * 2
  };

  const nameStyleRN = {
    fontSize: parseInt(sizeConfig.fontSize),
    fontWeight: '500',
    color: '#333333',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 80
  };

  const dateStyleRN = {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
    textAlign: 'center'
  };

  const seeAllStyleRN = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9ECEF'
  };

  return (
    <View style={[containerStyleRN, style]}>
      {showCount && totalCount > 0 && (
        <Text style={{
          fontSize: parseInt(sizeConfig.fontSize),
          fontWeight: '600',
          color: '#333333',
          marginBottom: parseInt(sizeConfig.spacing)
        }}>
          {totalCount === 1 ? '1 Regular' : `${totalCount} Regulars`}
        </Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={gridStyleRN}
      >
        {displayRegulars.map((regular) => (
          <TouchableOpacity
            key={regular.id}
            onPress={() => handleUserPress(regular)}
            style={userItemStyleRN}
          >
            <Avatar
              profilePhotoURL={regular.userPhotoURL}
              displayName={regular.userDisplayName}
              size={sizeConfig.avatarSize}
            />
            <Text style={nameStyleRN} numberOfLines={1}>
              {regular.userDisplayName || 'Anonymous'}
            </Text>
            <Text style={dateStyleRN}>
              {formatJoinDate(regular.createdAt)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {remainingCount > 0 && (
        <TouchableOpacity onPress={handleSeeAllPress} style={seeAllStyleRN}>
          <Text style={{
            fontSize: parseInt(sizeConfig.fontSize),
            fontWeight: '600',
            color: '#006548'
          }}>
            See all {totalCount} regulars →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VenueRegulars;