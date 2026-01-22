import React from 'react';
import { View, Image, Text, Platform, Dimensions } from 'react-native';
import { colors } from '../../styles/theme';

const Avatar = ({
  profilePhotoURL,
  photoURL, // Alternative prop name for compatibility
  displayName,
  size = 'medium',
  style = {},
  showBorder = false
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 768;
  
  const sizeMap = {
    small: isSmallScreen ? 36 : 40,
    medium: isSmallScreen ? 64 : 80,
    large: isSmallScreen ? 100 : 120,
    extra_large: isSmallScreen ? 130 : 160
  };
  
  const avatarSize = sizeMap[size] || sizeMap.medium;
  const fontSize = avatarSize * 0.4;
  
  const avatarStyles = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    backgroundColor: colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...(showBorder && {
      borderWidth: 3,
      borderColor: colors.primary
    }),
    ...style
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const defaultAvatarStyles = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  };

  const initialsStyles = {
    fontSize: fontSize,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center'
  };

  const imageURL = profilePhotoURL || photoURL;

  if (imageURL) {
    return (
      <View style={avatarStyles}>
        <Image
          source={{ uri: imageURL }}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          }}
          onError={() => {
            // If image fails to load, show initials instead
          }}
        />
      </View>
    );
  }

  // Show initials when no photo is available
  return (
    <View style={[avatarStyles, defaultAvatarStyles]}>
      <Text style={initialsStyles}>
        {getInitials(displayName)}
      </Text>
    </View>
  );
};

export default Avatar;