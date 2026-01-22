import React from 'react';
import { View, Text, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';

const SemiCircleHeader = ({ title, containerStyle, textStyle, size = 'normal', onPress }) => {
  const sizeStyles = size === 'large' ? styles.semiCircleLarge : styles.semiCircle;

  // Map titles to images
  const getImageForTitle = (title) => {
    const imageMap = {
      'Map': require('../../../assets/map.png'),
      'Places': require('../../../assets/places.png'),
      'Blogs': require('../../../assets/blogs.png'),
      'Follow Us': require('../../../assets/follow_us.png'),
      'Featured': require('../../../assets/featured.png'),
      'Contact Us': require('../../../assets/contact_us.png')
    };
    return imageMap[title] || null;
  };

  const headerImage = getImageForTitle(title);

  const content = headerImage ? (
    // Image header - no background, full width
    <View style={styles.imageContainer}>
      <Image
        source={headerImage}
        style={[
          styles.headerImage,
          size === 'large' ? styles.headerImageLarge : styles.headerImageNormal,
          Platform.OS === 'web' && {
            objectFit: 'contain',
            objectPosition: 'center bottom'
          }
        ]}
        resizeMode="contain"
      />
    </View>
  ) : (
    // Text header with semi-circle background (for Map and other unmapped titles)
    <View style={[sizeStyles]}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {onPress ? (
        <TouchableOpacity onPress={onPress} style={styles.touchable}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 0,
    zIndex: 10,
  },
  touchable: {
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
    width: '100%',
  },
  semiCircle: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderTopLeftRadius: 500,
    borderTopRightRadius: 500,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  semiCircleLarge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    ...typography.h1,
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 32,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 0,
    paddingLeft: 10
  },
  headerImage: {
    width: '100%',
    maxWidth: 960
  },
  headerImageNormal: {
    height: 168
  },
  headerImageLarge: {
    height: 192
  },
});

export default SemiCircleHeader;