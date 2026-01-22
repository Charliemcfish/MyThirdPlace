import React from 'react';
import { View, Text, Platform } from 'react-native';

const CommunityLevel = ({
  regularVenuesCount = 0,
  createdVenuesCount = 0,
  publishedBlogsCount = 0,
  isMigratedUser = false,
  style,
  size = 'normal',
  showDescription = true
}) => {
  const calculateCommunityLevel = () => {
    // Migrated users always get the Supporter badge, regardless of activity
    if (isMigratedUser) {
      return {
        level: 'supporter',
        displayName: 'Supporter',
        emoji: '🌟',
        description: 'Early platform supporter',
        color: '#FFD700',
        backgroundColor: '#FFFACD',
        isSupporter: true
      };
    }

    const totalActivity = regularVenuesCount + createdVenuesCount + publishedBlogsCount;

    if (totalActivity === 0) {
      return {
        level: 'newcomer',
        displayName: 'New Member',
        emoji: '👋',
        description: 'Welcome to MyThirdPlace!',
        color: '#6C757D',
        backgroundColor: '#F8F9FA'
      };
    } else if (totalActivity <= 2) {
      return {
        level: 'newcomer',
        displayName: 'Newcomer',
        emoji: '🌱',
        description: 'Just getting started',
        color: '#6C757D',
        backgroundColor: '#F8F9FA'
      };
    } else if (totalActivity <= 9) {
      return {
        level: 'regular',
        displayName: 'Regular Member',
        emoji: '⭐',
        description: 'Active community member',
        color: '#FFC107',
        backgroundColor: '#FFF8E1'
      };
    } else if (totalActivity <= 24) {
      return {
        level: 'contributor',
        displayName: 'Contributor',
        emoji: '🏆',
        description: 'Frequent contributor',
        color: '#FF9800',
        backgroundColor: '#FFF3E0'
      };
    } else {
      return {
        level: 'ambassador',
        displayName: 'Community Ambassador',
        emoji: '👑',
        description: 'Community leader',
        color: '#E91E63',
        backgroundColor: '#FCE4EC'
      };
    }
  };

  const levelInfo = calculateCommunityLevel();

  const getSizeConfig = () => {
    const configs = {
      small: {
        fontSize: '12px',
        emojiSize: '16px',
        padding: '6px 10px',
        borderRadius: '12px'
      },
      normal: {
        fontSize: '14px',
        emojiSize: '18px',
        padding: '8px 12px',
        borderRadius: '16px'
      },
      large: {
        fontSize: '16px',
        emojiSize: '20px',
        padding: '10px 16px',
        borderRadius: '20px'
      }
    };
    return configs[size] || configs.normal;
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

    const shineKeyframes = `
      @keyframes shine {
        0% {
          background-position: -200px 0;
        }
        100% {
          background-position: calc(200px + 100%) 0;
        }
      }
    `;

    // Add shine effect for Supporter badge
    const shineEffect = levelInfo.isSupporter ? {
      background: `linear-gradient(90deg, ${levelInfo.backgroundColor} 0%, rgba(255, 255, 255, 0.8) 50%, ${levelInfo.backgroundColor} 100%)`,
      backgroundSize: '200px 100%',
      animation: 'shine 3s infinite',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    } : {};

    const containerStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: sizeConfig.padding,
      backgroundColor: levelInfo.backgroundColor,
      borderRadius: sizeConfig.borderRadius,
      border: `1px solid ${levelInfo.color}20`,
      fontFamily: 'inherit',
      position: 'relative',
      overflow: 'hidden',
      ...shineEffect,
      ...flattenedStyle
    };

    const emojiStyle = {
      fontSize: sizeConfig.emojiSize,
      lineHeight: '1'
    };

    const textStyle = {
      fontSize: sizeConfig.fontSize,
      fontWeight: '600',
      color: levelInfo.color,
      margin: '0'
    };

    const descriptionStyle = {
      fontSize: '12px',
      color: '#666666',
      margin: '0',
      marginLeft: '4px',
      fontStyle: 'italic'
    };

    // Inject CSS animation for shine effect
    if (levelInfo.isSupporter && typeof document !== 'undefined') {
      const styleId = 'supporter-shine-animation';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = shineKeyframes;
        document.head.appendChild(style);
      }
    }

    return (
      <div style={containerStyle}>
        <span style={emojiStyle}>{levelInfo.emoji}</span>
        <span style={textStyle}>{levelInfo.displayName}</span>
        {showDescription && size !== 'small' && (
          <span style={descriptionStyle}>• {levelInfo.description}</span>
        )}
      </div>
    );
  }

  // React Native implementation
  const containerStyleRN = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: parseInt(sizeConfig.padding.split(' ')[1]),
    paddingVertical: parseInt(sizeConfig.padding.split(' ')[0]),
    backgroundColor: levelInfo.backgroundColor,
    borderRadius: parseInt(sizeConfig.borderRadius),
    borderWidth: levelInfo.isSupporter ? 2 : 1,
    borderColor: levelInfo.isSupporter ? levelInfo.color : levelInfo.color + '20',
    alignSelf: 'flex-start',
    ...(levelInfo.isSupporter && {
      shadowColor: '#FFD700',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    })
  };

  const emojiStyleRN = {
    fontSize: parseInt(sizeConfig.emojiSize),
    marginRight: 6
  };

  const textStyleRN = {
    fontSize: parseInt(sizeConfig.fontSize),
    fontWeight: '600',
    color: levelInfo.color
  };

  const descriptionStyleRN = {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    fontStyle: 'italic'
  };

  return (
    <View style={[containerStyleRN, style]}>
      <Text style={emojiStyleRN}>{levelInfo.emoji}</Text>
      <Text style={textStyleRN}>{levelInfo.displayName}</Text>
      {showDescription && size !== 'small' && (
        <Text style={descriptionStyleRN}> • {levelInfo.description}</Text>
      )}
    </View>
  );
};

export default CommunityLevel;