import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import InteractiveMap from './InteractiveMap';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';
import geocodingService from '../../services/geocoding';
import mapsService from '../../services/maps';

const VenueMap = ({ 
  venue, 
  height = 300, 
  showDirections = true, 
  showAddress = true,
  onDirectionsClick,
  style = {} 
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Don't render if venue doesn't have coordinates
  if (!venue || !venue.coordinates || !venue.coordinates.lat || !venue.coordinates.lng) {
    return (
      <View style={[styles.errorContainer, { height }, style]}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorText}>Location not available</Text>
        <Text style={styles.errorSubtext}>Address information is being processed</Text>
      </View>
    );
  }
  
  // Prepare venues array with main location and additional locations
  const getAllVenueLocations = () => {
    const locations = [];
    
    // Add main location
    locations.push({
      ...venue,
      isMainLocation: true,
      locationName: venue.name
    });
    
    // Add additional locations if they exist and have coordinates
    if (venue.hasMultipleLocations && venue.additionalLocations && Array.isArray(venue.additionalLocations)) {
      venue.additionalLocations.forEach((location, index) => {
        if (location.coordinates && location.coordinates.lat && location.coordinates.lng) {
          locations.push({
            id: `${venue.id}_location_${index}`,
            name: `${venue.name} - ${location.name || `Location ${index + 2}`}`,
            locationName: location.name || `Location ${index + 2}`,
            coordinates: location.coordinates,
            address: location.address,
            isMainLocation: false,
            parentVenue: venue.name
          });
        }
      });
    }
    
    return locations;
  };
  
  const venueLocations = getAllVenueLocations();

  const handleGetDirections = async () => {
    if (onDirectionsClick) {
      onDirectionsClick(venue);
      return;
    }

    try {
      setGettingLocation(true);

      // Try to get user's current location
      let origin = userLocation;
      if (!origin) {
        try {
          origin = await geocodingService.getCurrentLocation();
          setUserLocation(origin);
        } catch (locationError) {
          console.warn('Could not get user location:', locationError);
          // Continue without origin location
        }
      }

      // Open directions in maps app
      mapsService.openDirections(venue, origin);
    } catch (error) {
      console.error('Error opening directions:', error);
      // Fallback: just open the location in maps
      mapsService.openDirections(venue, null);
    } finally {
      setGettingLocation(false);
    }
  };

  const formatAddress = () => {
    if (venue.address) {
      const parts = [];
      if (venue.address.street) parts.push(venue.address.street);
      if (venue.address.city) parts.push(venue.address.city);
      if (venue.address.postcode) parts.push(venue.address.postcode);
      if (venue.address.country) parts.push(venue.address.country);
      return parts.join(', ');
    }
    return 'Address not available';
  };

  const getDistance = () => {
    if (!userLocation || !venue.coordinates) return null;
    return geocodingService.calculateDistance(userLocation, venue.coordinates);
  };

  const distance = getDistance();

  return (
    <View style={[styles.container, style]}>
      <InteractiveMap
        venues={venueLocations}
        center={venue.coordinates}
        zoom={venueLocations.length > 1 ? 12 : 15}
        height={height}
        showInfoWindows={venueLocations.length > 1}
        mapStyle={{
          borderRadius: borderRadius.md,
          overflow: 'hidden'
        }}
      />
      
      {showAddress && (
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>
            📍 {formatAddress()}
          </Text>
          {venueLocations.length > 1 && (
            <Text style={styles.multiLocationText}>
              🏢 {venueLocations.length} locations shown on map
            </Text>
          )}
          {distance && (
            <Text style={styles.distanceText}>
              {geocodingService.formatDistance(distance)} away
            </Text>
          )}
        </View>
      )}
      
      {showDirections && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.directionsButton, gettingLocation && styles.directionsButtonDisabled]}
            onPress={handleGetDirections}
            disabled={gettingLocation}
          >
            <Text style={styles.directionsButtonText}>
              {gettingLocation ? 'Getting location...' : '🧭 Get Directions'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const VenueMapCompact = ({ venue, onPress }) => {
  // Compact version for use in venue cards or lists
  if (!venue || !venue.coordinates || !venue.coordinates.lat || !venue.coordinates.lng) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.compactContainer} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <InteractiveMap
        venues={[venue]}
        center={venue.coordinates}
        zoom={13}
        height={120}
        showInfoWindows={false}
        mapStyle={{
          borderRadius: borderRadius.sm,
          overflow: 'hidden'
        }}
      />
      <View style={styles.compactOverlay}>
        <Text style={styles.compactText}>Tap to view larger map</Text>
      </View>
    </TouchableOpacity>
  );
};

const VenueMapModal = ({ venue, visible, onClose }) => {
  // Full-screen map modal for detailed view
  if (!visible || !venue) return null;

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{venue.name}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <VenueMap
        venue={venue}
        height={Platform.OS === 'web' ? 500 : 400}
        showDirections={true}
        showAddress={true}
        style={styles.modalMap}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  errorSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  addressContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addressText: {
    ...typography.body2,
    color: colors.text,
    lineHeight: 20,
  },
  distanceText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  multiLocationText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  actionsContainer: {
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  directionsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  directionsButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  directionsButtonText: {
    ...typography.body2,
    color: colors.white,
    fontWeight: '600',
  },
  compactContainer: {
    position: 'relative',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  compactOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: spacing.xs,
    alignItems: 'center',
  },
  compactText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '500',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    zIndex: 1000,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  modalMap: {
    flex: 1,
    margin: spacing.md,
  },
});

// Export both the main component and variants
export default VenueMap;
export { VenueMapCompact, VenueMapModal };