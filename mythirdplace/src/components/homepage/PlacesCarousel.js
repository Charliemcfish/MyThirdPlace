import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform, TouchableOpacity, Text, Image, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import SemiCircleHeader from '../common/SemiCircleHeader';
import CarouselCard from '../common/CarouselCard';
import { getVenues } from '../../services/venue';
import { useNavigation } from '@react-navigation/native';

const PlacesCarousel = () => {
  const scrollViewRef = React.useRef(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateScreenWidth);
    return () => subscription?.remove();
  }, []);

  // Responsive breakpoints
  const getItemsToShow = () => {
    if (screenWidth >= 1200) return 5; // Large desktop
    if (screenWidth >= 768) return 3;  // Tablet/small desktop
    return 1; // Mobile
  };

  const getCardWidth = () => {
    const itemsToShow = getItemsToShow();
    const containerPadding = 32; // 16px on each side
    const gap = 16; // gap between cards
    const totalGaps = (itemsToShow - 1) * gap;
    const availableWidth = Math.min(1400, screenWidth) - containerPadding;
    return (availableWidth - totalGaps) / itemsToShow;
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const result = await getVenues({ limitCount: 8 });
      let venues = result.venues || [];

      // Prioritize "The Brown Bag" if it exists
      const brownBagIndex = venues.findIndex(venue =>
        venue.name && venue.name.toLowerCase().includes('brown bag')
      );

      if (brownBagIndex > 0) {
        // Move The Brown Bag to the front
        const brownBag = venues.splice(brownBagIndex, 1)[0];
        venues.unshift(brownBag);
      }

      setVenues(venues);
    } catch (error) {
      console.error('Error loading venues for carousel:', error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVenuePress = (venue) => {
    navigation.navigate('VenueDetail', { venueId: venue.id });
  };

  const scrollLeft = () => {
    const itemsToShow = getItemsToShow();
    const newIndex = Math.max(0, currentIndex - itemsToShow);
    setCurrentIndex(newIndex);
  };

  const scrollRight = () => {
    const itemsToShow = getItemsToShow();
    const maxIndex = Math.max(0, venues.length - itemsToShow);
    const newIndex = Math.min(maxIndex, currentIndex + itemsToShow);
    setCurrentIndex(newIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SemiCircleHeader
          title="Places"
          size="large"
          onPress={() => navigation.navigate('VenueListings')}
        />
        
        <View style={styles.carouselContainer}>
          {Platform.OS === 'web' && (
            <>
              <TouchableOpacity onPress={scrollLeft} style={[styles.arrowButton, styles.leftArrow]}>
                <Text style={styles.arrowText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={scrollRight} style={[styles.arrowButton, styles.rightArrow]}>
                <Text style={styles.arrowText}>›</Text>
              </TouchableOpacity>
            </>
          )}
          
          <View style={[styles.carouselGrid, { maxWidth: Math.min(1400, screenWidth) }]}>
            {venues.slice(currentIndex, currentIndex + getItemsToShow()).map((venue) => (
              <TouchableOpacity key={venue.id} onPress={() => handleVenuePress(venue)}>
                <View style={[styles.venueCard, { width: getCardWidth() }]}>
                  {venue.photos && venue.photos.length > 0 ? (
                    <Image
                      source={{ uri: venue.photos[0] }}
                      style={styles.venueImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>📍</Text>
                    </View>
                  )}

                  <View style={styles.venueInfo}>
                    <Text style={styles.venueName} numberOfLines={2}>{venue.name}</Text>
                    <Text style={styles.venueCategory}>{venue.category}</Text>
                    {venue.address && (
                      <Text style={styles.venueLocation} numberOfLines={1}>
                        {venue.address.city}
                      </Text>
                    )}

                    {venue.description && (
                      <Text style={styles.venueDescription} numberOfLines={2}>
                        {venue.description}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.xxl,
  },
  content: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  carouselContainer: {
    position: 'relative',
  },
  carouselGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: spacing.lg,
    gap: 16,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ translateY: -20 }],
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  arrowText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  scrollView: {
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  venueCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    height: 350,
    display: 'flex',
    flexDirection: 'column',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueImage: {
    width: '100%',
    height: 180,
  },
  placeholderImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  venueInfo: {
    padding: spacing.md,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  venueName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: 'bold',
  },
  venueCategory: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  venueLocation: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  venueDescription: {
    ...typography.caption,
    color: colors.textLight,
    lineHeight: 16,
  },
});

export default PlacesCarousel;