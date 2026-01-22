import React from 'react';
import { View, Text, Platform } from 'react-native';

const SocialProof = ({
  regularCount = 0,
  recentActivity,
  isPopular = false,
  isTrending = false,
  style,
  size = 'normal'
}) => {
  const getSizeConfig = () => {
    const configs = {
      small: {
        fontSize: '12px',
        padding: '4px 8px',
        borderRadius: '12px',
        gap: '6px'
      },
      normal: {
        fontSize: '14px',
        padding: '6px 12px',
        borderRadius: '16px',
        gap: '8px'
      },
      large: {
        fontSize: '16px',
        padding: '8px 16px',
        borderRadius: '20px',
        gap: '10px'
      }
    };
    return configs[size] || configs.normal;
  };

  const getProofElements = () => {
    const elements = [];

    // Popular venue badge
    if (isPopular && regularCount >= 20) {
      elements.push({
        type: 'popular',
        text: 'Popular',
        emoji: '🔥',
        color: '#FF6B35',
        backgroundColor: '#FFF5F3'
      });
    }

    // Trending badge
    if (isTrending) {
      elements.push({
        type: 'trending',
        text: 'Trending',
        emoji: '📈',
        color: '#10B981',
        backgroundColor: '#F0FDF4'
      });
    }

    // High activity badge
    if (regularCount >= 50) {
      elements.push({
        type: 'community_hub',
        text: 'Community Hub',
        emoji: '🏢',
        color: '#8B5CF6',
        backgroundColor: '#F5F3FF'
      });
    }

    // Recent activity
    if (recentActivity && recentActivity.count > 0) {
      const timeframe = recentActivity.timeframe || 'week';
      const count = recentActivity.count;
      elements.push({
        type: 'recent_activity',
        text: `${count} new regular${count !== 1 ? 's' : ''} this ${timeframe}`,
        emoji: '⚡',
        color: '#06B6D4',
        backgroundColor: '#F0F9FF'
      });
    }

    return elements;
  };

  const proofElements = getProofElements();

  if (proofElements.length === 0) {
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

    const containerStyle = {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sizeConfig.gap,
      fontFamily: 'inherit',
      ...flattenedStyle
    };

    const badgeStyle = (element) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: sizeConfig.padding,
      backgroundColor: element.backgroundColor,
      borderRadius: sizeConfig.borderRadius,
      border: `1px solid ${element.color}30`,
      fontSize: sizeConfig.fontSize,
      fontWeight: '600',
      color: element.color
    });

    const emojiStyle = {
      fontSize: size === 'small' ? '12px' : '14px'
    };

    return (
      <div style={containerStyle}>
        {proofElements.map((element, index) => (
          <div key={`${element.type}-${index}`} style={badgeStyle(element)}>
            <span style={emojiStyle}>{element.emoji}</span>
            <span>{element.text}</span>
          </div>
        ))}
      </div>
    );
  }

  // React Native implementation
  const containerStyleRN = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
  };

  const badgeStyleRN = (element) => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: parseInt(sizeConfig.padding.split(' ')[1]),
    paddingVertical: parseInt(sizeConfig.padding.split(' ')[0]),
    backgroundColor: element.backgroundColor,
    borderRadius: parseInt(sizeConfig.borderRadius),
    borderWidth: 1,
    borderColor: element.color + '30',
    marginRight: parseInt(sizeConfig.gap),
    marginBottom: 4
  });

  const emojiStyleRN = {
    fontSize: size === 'small' ? 12 : 14,
    marginRight: 4
  };

  const textStyleRN = {
    fontSize: parseInt(sizeConfig.fontSize),
    fontWeight: '600',
    color: '#333333'
  };

  return (
    <View style={[containerStyleRN, style]}>
      {proofElements.map((element, index) => (
        <View key={`${element.type}-${index}`} style={badgeStyleRN(element)}>
          <Text style={emojiStyleRN}>{element.emoji}</Text>
          <Text style={[textStyleRN, { color: element.color }]}>{element.text}</Text>
        </View>
      ))}
    </View>
  );
};

export default SocialProof;