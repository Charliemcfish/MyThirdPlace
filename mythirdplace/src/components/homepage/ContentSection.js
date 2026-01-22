import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Platform, Dimensions } from 'react-native';
import { colors, typography, spacing, borderRadius, breakpoints } from '../../styles/theme';

const ContentSection = () => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef(null);
  const isMobile = screenWidth < breakpoints.tablet;

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateScreenWidth);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && !isMobile) {
      const handleScroll = () => {
        if (sectionRef.current) {
          const rect = sectionRef.current.getBoundingClientRect();
          const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
          setScrollY(scrollProgress);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile]);

  const imageTransform = Platform.OS === 'web' && !isMobile ? {
    transform: `translateY(${scrollY * -100}px)`,
    transition: 'none'
  } : {};

  const textTransform = Platform.OS === 'web' && !isMobile ? {
    transform: `translateY(${scrollY * 50}px)`,
    transition: 'none'
  } : {};

  return (
    <View style={styles.container} ref={sectionRef}>
      <View style={styles.content}>
        <View style={[styles.row, isMobile && styles.rowMobile]}>
          {isMobile ? (
            // Mobile: Text first, then image below
            <>
              <View style={[styles.textContainer, styles.textContainerMobile, Platform.OS === 'web' && !isMobile && { style: textTransform }]}>
                <Text style={styles.heading}>What is a Third Place?</Text>

                <Text style={styles.paragraph}>
                 The Third Place concept, pioneered by sociologist Ray Oldenburg (1932–2022), highlights the vital gathering spots beyond home (the first place) and work (the second place). Cafés, pubs, libraries, parks, and coworking spaces are more than just physical locations - they are social anchors where community, belonging, and connection come to life.

At MyThirdPlace, we’re building a community-driven map of these spaces and the human stories they inspire. Through venue listings, personal blogs, and shared experiences, we celebrate the value of Third Places worldwide and make it easier for people to discover and connect with them.
                </Text>
              </View>

              <View style={[styles.imageContainer, styles.imageContainerMobile, Platform.OS === 'web' && !isMobile && { style: imageTransform }]}>
                <Image
                  source={require('../../../assets/ray.png')}
                  style={[styles.image, styles.imageMobile]}
                  resizeMode="contain"
                />
              </View>
            </>
          ) : (
            // Desktop: Image on left, text on right
            <>
              <View style={[styles.imageContainer, Platform.OS === 'web' && !isMobile && { style: imageTransform }]}>
                <Image
                  source={require('../../../assets/ray.png')}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>

              <View style={[styles.textContainer, Platform.OS === 'web' && !isMobile && { style: textTransform }]}>
                <Text style={styles.heading}>What is a Third Place?</Text>

                <Text style={styles.paragraph}>
                 The Third Place concept, pioneered by sociologist Ray Oldenburg (1932–2022), highlights the vital gathering spots beyond home (the first place) and work (the second place). Cafés, pubs, libraries, parks, and coworking spaces are more than just physical locations - they are social anchors where community, belonging, and connection come to life.

At MyThirdPlace, we’re building a community-driven map of these spaces and the human stories they inspire. Through venue listings, personal blogs, and shared experiences, we celebrate the value of Third Places worldwide and make it easier for people to discover and connect with them.
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xxl,
  },
  content: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  rowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xl,
  },
  textContainer: {
    flex: 1,
  },
  textContainerMobile: {
    width: '100%',
  },
  heading: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  paragraph: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 28,
    fontSize: 18,
  },
  imageContainer: {
    flex: 0.8,
    alignItems: 'center',
  },
  imageContainerMobile: {
    width: '100%',
    alignItems: 'center',
  },
  image: {
    width: 400,
    height: 400,
  },
  imageMobile: {
    width: 320,
    height: 320,
  },
});

export default ContentSection;