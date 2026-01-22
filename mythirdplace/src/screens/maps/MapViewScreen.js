import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
  StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';
import InteractiveMap from '../../components/maps/InteractiveMap';
import VenueCard from '../../components/venues/VenueCard';
import { getGeocodedVenues, sortVenuesByDistance, getVenuesWithinRadius } from '../../services/venue';
import { venueCategories } from '../../services/venue';
import geocodingService from '../../services/geocoding';
import mapsService from '../../services/maps';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MapViewScreen = () => {
  const navigation = useNavigation();
  
  // Map and venues state
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [distanceRadius, setDistanceRadius] = useState(null); // in km
  
  // User location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  
  // Map state
  const [mapRef, setMapRef] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showVenueDetails, setShowVenueDetails] = useState(false);
  
  // View state
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  useEffect(() => {
    loadVenues();
    tryGetUserLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [venues, searchQuery, selectedCategory, userLocation, distanceRadius]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const geocodedVenues = await getGeocodedVenues({ limit: 200 });
      setVenues(geocodedVenues);
    } catch (err) {
      console.error('Error loading venues:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tryGetUserLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      
      const location = await geocodingService.getCurrentLocation();
      setUserLocation(location);
    } catch (err) {
      console.warn('Could not get user location:', err);
      setLocationError(err.message);
    } finally {
      setLocationLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...venues];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(venue =>
        venue.name.toLowerCase().includes(query) ||
        venue.description?.toLowerCase().includes(query) ||
        venue.address?.city?.toLowerCase().includes(query) ||
        venue.address?.country?.toLowerCase().includes(query) ||
        venue.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(venue => venue.category === selectedCategory);
    }

    // Distance filter
    if (userLocation && distanceRadius) {
      filtered = getVenuesWithinRadius(userLocation, distanceRadius, filtered);
    }

    // Sort by distance if user location available
    if (userLocation) {
      filtered = sortVenuesByDistance(userLocation, filtered);
    }

    setFilteredVenues(filtered);
  };

  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
    setShowVenueDetails(true);
  };

  const handleNavigateToVenue = (venue) => {
    setShowVenueDetails(false);
    if (navigation) {
      navigation.navigate('VenueDetail', { venueId: venue.id });
    }
  };

  const handleSearchLocation = async (query) => {
    if (!query.trim()) return;

    try {
      const geocodeResult = await geocodingService.geocodeAddress(query);
      
      // Update map center to searched location
      if (mapRef && geocodeResult.coordinates) {
        // Note: Would need to expose map centering in InteractiveMap component
        console.log('Centering map on:', geocodeResult.coordinates);
      }
    } catch (error) {
      console.error('Search location error:', error);
    }
  };

  const toggleDistanceFilter = (radius) => {
    if (distanceRadius === radius) {
      setDistanceRadius(null); // Remove filter
    } else {
      setDistanceRadius(radius);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setDistanceRadius(null);
  };

  const getMapCenter = () => {
    if (userLocation) return userLocation;
    if (filteredVenues.length > 0) {
      // Calculate center of filtered venues
      const latSum = filteredVenues.reduce((sum, venue) => sum + venue.coordinates.lat, 0);
      const lngSum = filteredVenues.reduce((sum, venue) => sum + venue.coordinates.lng, 0);
      return {
        lat: latSum / filteredVenues.length,
        lng: lngSum / filteredVenues.length
      };
    }
    return { lat: 51.5074, lng: -0.1278 }; // Default to London
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== 'all') count++;
    if (distanceRadius) count++;
    return count;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading venues</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadVenues}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filter Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search venues or locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => handleSearchLocation(searchQuery)}
          />
          <TouchableOpacity 
            style={[styles.filterButton, getActiveFiltersCount() > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>
              🔍 {getActiveFiltersCount() > 0 ? `(${getActiveFiltersCount()})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Expanded Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                <TouchableOpacity
                  style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory('all')}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === 'all' && styles.categoryChipTextActive]}>
                    All
                  </Text>
                </TouchableOpacity>
                {venueCategories().map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={[styles.categoryChipText, selectedCategory === category.id && styles.categoryChipTextActive]}>
                      {category.icon} {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Distance Filter */}
            {userLocation && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Distance:</Text>
                <View style={styles.distanceFilters}>
                  {[1, 5, 10, 25].map(radius => (
                    <TouchableOpacity
                      key={radius}
                      style={[styles.distanceChip, distanceRadius === radius && styles.distanceChipActive]}
                      onPress={() => toggleDistanceFilter(radius)}
                    >
                      <Text style={[styles.distanceChipText, distanceRadius === radius && styles.distanceChipTextActive]}>
                        {radius}km
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.hideFiltersButton} onPress={() => setShowFilters(false)}>
                <Text style={styles.hideFiltersText}>Hide Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Results Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} found
            {userLocation && distanceRadius && ` within ${distanceRadius}km`}
          </Text>
          
          {/* Location Status */}
          {locationLoading && (
            <Text style={styles.locationStatus}>📍 Getting your location...</Text>
          )}
          {userLocation && (
            <Text style={styles.locationStatus}>📍 Using your location for sorting</Text>
          )}
          {locationError && !userLocation && (
            <TouchableOpacity onPress={tryGetUserLocation} style={styles.locationRetry}>
              <Text style={styles.locationRetryText}>📍 Enable location for better results</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity
          style={[styles.viewToggleButton, viewMode === 'map' && styles.viewToggleButtonActive]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}>
            🗺️ Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>
            📋 List
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map or List View */}
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <InteractiveMap
            venues={filteredVenues}
            center={getMapCenter()}
            zoom={userLocation && distanceRadius ? 11 : 6}
            height={screenHeight - 200}
            onVenueClick={handleVenueClick}
            showInfoWindows={true}
            enableClustering={filteredVenues.length > 20}
            onMapLoad={setMapRef}
          />
        </View>
      ) : (
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={true}>
          {filteredVenues.map((venue, index) => (
            <TouchableOpacity
              key={venue.id}
              style={styles.listVenueContainer}
              onPress={() => handleNavigateToVenue(venue)}
            >
              <VenueCard
                venue={venue}
                onPress={() => handleNavigateToVenue(venue)}
                showDistance={userLocation}
                userLocation={userLocation}
              />
            </TouchableOpacity>
          ))}
          
          {filteredVenues.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No venues found</Text>
              <Text style={styles.noResultsSubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Venue Details Modal */}
      <Modal
        visible={showVenueDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowVenueDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedVenue && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedVenue.name}</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowVenueDetails(false)}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody}>
                  <VenueCard
                    venue={selectedVenue}
                    onPress={() => handleNavigateToVenue(selectedVenue)}
                    showDistance={userLocation}
                    userLocation={userLocation}
                    expandable={true}
                  />
                  
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalActionButton}
                      onPress={() => handleNavigateToVenue(selectedVenue)}
                    >
                      <Text style={styles.modalActionText}>View Full Details</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modalActionButton, styles.modalActionButtonSecondary]}
                      onPress={() => {
                        mapsService.openDirections(selectedVenue, userLocation);
                        setShowVenueDetails(false);
                      }}
                    >
                      <Text style={[styles.modalActionText, styles.modalActionTextSecondary]}>
                        Get Directions
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.backgroundLight,
  },
  errorText: {
    ...typography.h4,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  retryButtonText: {
    ...typography.body2,
    color: colors.white,
    fontWeight: '600',
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    minHeight: 44,
  },
  filterButton: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filtersContainer: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.text,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  distanceFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  distanceChip: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  distanceChipText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  distanceChipTextActive: {
    color: colors.white,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  clearFiltersButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  clearFiltersText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '500',
  },
  hideFiltersButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  hideFiltersText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  summaryContainer: {
    paddingBottom: spacing.sm,
  },
  summaryText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  locationStatus: {
    ...typography.caption,
    color: colors.success || colors.primary,
    fontWeight: '500',
  },
  locationRetry: {
    alignSelf: 'flex-start',
  },
  locationRetryText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    margin: spacing.sm,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  viewToggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm - 2,
  },
  viewToggleButtonActive: {
    backgroundColor: colors.white,
  },
  viewToggleText: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  viewToggleTextActive: {
    color: colors.text,
  },
  mapContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    padding: spacing.sm,
  },
  listVenueContainer: {
    marginBottom: spacing.sm,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noResultsText: {
    ...typography.h4,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  noResultsSubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  modalActionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  modalActionButtonSecondary: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActionText: {
    ...typography.body2,
    color: colors.white,
    fontWeight: '600',
  },
  modalActionTextSecondary: {
    color: colors.text,
  },
});

export default MapViewScreen;