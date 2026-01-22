import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ImageBackground, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import Button from '../common/Button';
import InlineGlobalSearch from '../search/InlineGlobalSearch';
import { getContentSettings } from '../../services/contentSettings';

const HeroSection = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [content, setContent] = useState({
    title: 'Find a Third Place Near you',
    subtitle: 'Or write about your favourite Third Place'
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const settings = await getContentSettings();
      setContent({
        title: settings.homeHeroTitle || 'Find a Third Place Near you',
        subtitle: settings.homeHeroSubtitle || 'Or write about your favourite Third Place'
      });
    } catch (error) {
      console.error('Error loading hero content:', error);
    }
  };

  const handleSearch = () => {
    if (navigation) {
      // Navigate to unified search page with the query
      navigation.navigate('UnifiedSearch', { initialQuery: searchText });
    }
  };

  const handleSearchResults = (query, results) => {
    console.log('HeroSection: Search results callback triggered');
    console.log('HeroSection: Query:', query);
    console.log('HeroSection: Results:', results);
    // Results are handled by the GlobalSearch component's dropdown
    // No navigation needed - results will show inline
  };

  const handleSearchFocus = () => {
    setIsSearchActive(true);
  };

  const handleSearchBlur = () => {
    setIsSearchActive(false);
  };

  return (
    <ImageBackground
      source={require('../../../assets/heroimage.png')}
      style={[styles.container, isSearchActive && styles.expandedContainer]}
      resizeMode="cover"
      imageStyle={styles.imageStyle}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.heading}>{content.title}</Text>
          <Text style={styles.subheading}>{content.subtitle}</Text>

          <View style={styles.searchContainer}>
            <InlineGlobalSearch
              placeholder="Search for cafes, libraries, gyms..."
              showRecentSearches={false}
              showSuggestions={true}
              maxResults={4}
              onSearchResults={handleSearchResults}
              onSearchFocus={handleSearchFocus}
              onSearchBlur={handleSearchBlur}
              style={styles.heroSearch}
            />
          </View>
        </View>
      </View>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: Platform.OS === 'web' ? 500 : 400,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    transition: Platform.OS === 'web' ? 'min-height 0.3s ease' : undefined,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
  },
  expandedContainer: {
    minHeight: Platform.OS === 'web' ? 650 : 550,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 600,
    width: '100%',
  },
  heading: {
    ...typography.h1,
    fontSize: Platform.OS === 'web' ? 48 : 32,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    ...(Platform.OS === 'web'
      ? { textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)' }
      : {
          textShadowColor: 'rgba(0, 0, 0, 0.3)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }
    ),
  },
  subheading: {
    ...typography.h3,
    fontSize: Platform.OS === 'web' ? 20 : 18,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
    opacity: 0.9,
    ...(Platform.OS === 'web'
      ? { textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)' }
      : {
          textShadowColor: 'rgba(0, 0, 0, 0.3)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }
    ),
  },
  searchContainer: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    overflow: 'hidden',
  },
  heroSearch: {
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
    width: Platform.OS === 'web' ? 'auto' : '100%',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchButton: {
    minWidth: 100,
    paddingHorizontal: spacing.lg,
    marginLeft: Platform.OS === 'web' ? spacing.md : 0,
    marginTop: Platform.OS === 'web' ? 0 : spacing.md,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
});

export default HeroSection;