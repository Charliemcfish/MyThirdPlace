import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';
import SemiCircleHeader from '../common/SemiCircleHeader';
import Button from '../common/Button';
import InteractiveMap from '../maps/InteractiveMap';
import { getVenues } from '../../services/venue';
import { getCurrentUser } from '../../services/auth';
import { useNavigation } from '@react-navigation/native';

const MapSection = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venueCount, setVenueCount] = useState(0);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && venueCount > 0) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCounter();
          }
        },
        { threshold: 0.5 }
      );

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }

      return () => observer.disconnect();
    }
  }, [venueCount, hasAnimated]);

  const animateCounter = () => {
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Use easeOut function for smoother animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easeOut * venueCount);

      setAnimatedCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedCount(venueCount);
      }
    };

    requestAnimationFrame(animate);
  };

  const loadVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get venues with coordinates for map display
      const result = await getVenues({ limitCount: 100 }); // Load more venues for map
      
      // Filter venues that have coordinates (geocoded addresses)
      const venuesWithCoordinates = result.venues.filter(venue => 
        venue.coordinates && 
        venue.coordinates.lat && 
        venue.coordinates.lng
      );
      
      setVenues(venuesWithCoordinates);
      setVenueCount(result.totalCount || result.venues.length);
    } catch (err) {
      console.error('Error loading venues for map:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlace = () => {
    const user = getCurrentUser();

    if (!user) {
      // User not logged in, redirect to Login page
      if (navigation) {
        navigation.navigate('Login');
      } else {
        // Fallback for web
        if (Platform.OS === 'web') {
          window.location.href = '/login';
        }
      }
    } else {
      // User is logged in, go to create venue page
      if (navigation) {
        navigation.navigate('CreateVenue');
      } else {
        // Fallback for web
        if (Platform.OS === 'web') {
          window.location.href = '/create-venue';
        }
      }
    }
  };

  const handleVenueClick = (venue) => {
    if (navigation) {
      navigation.navigate('VenueDetail', { venueId: venue.id });
    } else {
      // Fallback for web
      if (Platform.OS === 'web') {
        window.location.href = `/venues/${venue.id}`;
      }
    }
  };

  const getMapCenter = () => {
    if (venues.length === 0) {
      // Default to London
      return { lat: 51.5074, lng: -0.1278 };
    }

    // If only one venue, center on it
    if (venues.length === 1) {
      return venues[0].coordinates;
    }

    // Calculate center of all venues
    const latSum = venues.reduce((sum, venue) => sum + venue.coordinates.lat, 0);
    const lngSum = venues.reduce((sum, venue) => sum + venue.coordinates.lng, 0);
    
    return {
      lat: latSum / venues.length,
      lng: lngSum / venues.length
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerWrapper}>
          <SemiCircleHeader title="Map" size="large" />
        </View>

        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapIcon}>🗺️</Text>
              <Text style={styles.mapText}>Loading map...</Text>
              <Text style={styles.mapSubtext}>
                Discovering third places around the world
              </Text>
            </View>
          ) : error ? (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapIcon}>⚠️</Text>
              <Text style={styles.mapText}>Map temporarily unavailable</Text>
              <Text style={styles.mapSubtext}>
                {error || 'Please try again later'}
              </Text>
            </View>
          ) : (
            <InteractiveMap
              venues={venues}
              center={getMapCenter()}
              zoom={venues.length === 1 ? 13 : 2}
              height={400}
              showInfoWindows={true}
              enableClustering={venues.length > 20}
            />
          )}
        </View>

        <View style={styles.separatorContainer} ref={sectionRef}>
          <View style={styles.callToActionCard}>
            <View style={styles.counterContainer}>
              <Text style={styles.counterNumber}>{animatedCount.toLocaleString()}</Text>
              <Text style={styles.counterText}>venues have been added to MyThirdPlace</Text>
            </View>

            <Text style={styles.callToActionTitle}>
              Add Yours Today!
            </Text>
            <Text style={styles.callToActionSubtext}>
              Join our growing community of third place enthusiasts and help others discover amazing spaces
            </Text>

            <Button
              onPress={handleAddPlace}
              style={styles.addButton}
            >
              Add Your Place
            </Button>
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
    paddingHorizontal: spacing.lg,
  },
  headerWrapper: {
    marginBottom: -1,
    zIndex: 10,
  },
  mapContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPlaceholder: {
    height: Platform.OS === 'web' ? 400 : 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  mapIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  mapText: {
    ...typography.h3,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  mapSubtext: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 400,
  },
  statsContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  statsText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  separatorContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  callToActionCard: {
    backgroundColor: colors.lightGreen,
    padding: spacing.xxl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    maxWidth: 600,
    width: '100%',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  counterNumber: {
    ...typography.h1,
    fontSize: 48,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  counterText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  callToActionTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  callToActionSubtext: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  addButton: {
    paddingHorizontal: spacing.xl,
    minWidth: 200,
  },
});

export default MapSection;