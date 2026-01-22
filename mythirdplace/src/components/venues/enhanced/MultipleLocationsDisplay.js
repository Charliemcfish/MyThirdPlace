import React, { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { globalStyles } from '../../../styles/globalStyles';
import { colors } from '../../../styles/theme';

const MultipleLocationsDisplay = ({ venue, style }) => {
  const { hasMultipleLocations, additionalLocations = [], address } = venue;
  const [expandedLocation, setExpandedLocation] = useState(null);
  
  if (!hasMultipleLocations || additionalLocations.length === 0) {
    return null;
  }

  const formatAddress = (addressObj) => {
    if (!addressObj) return '';
    return [addressObj.street, addressObj.city, addressObj.postcode, addressObj.country]
      .filter(Boolean)
      .join(', ');
  };

  const handleGetDirections = (location) => {
    const addressString = formatAddress(location.address);
    if (addressString) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;
      Linking.openURL(url);
    }
  };

  const toggleLocationExpansion = (locationId) => {
    setExpandedLocation(expandedLocation === locationId ? null : locationId);
  };

  const totalLocations = 1 + additionalLocations.length;

  return (
    <View style={[styles.container, style]}>
      <Text style={[globalStyles.heading4, styles.sectionTitle]}>
        All Locations ({totalLocations})
      </Text>

      {/* Main Location */}
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationBadge}>📍 Main Location</Text>
          <Text style={styles.locationName}>Primary</Text>
        </View>
        <Text style={styles.locationAddress}>{formatAddress(address)}</Text>
        <Pressable 
          style={styles.directionsButton}
          onPress={() => handleGetDirections({ address })}
        >
          <Text style={styles.directionsText}>Get Directions</Text>
        </Pressable>
      </View>

      {/* Additional Locations */}
      {additionalLocations.map((location, index) => (
        <View key={location.id} style={styles.locationCard}>
          <Pressable 
            style={styles.locationHeader}
            onPress={() => toggleLocationExpansion(location.id)}
          >
            <View style={styles.locationHeaderLeft}>
              <Text style={styles.locationBadge}>📍 Location {index + 2}</Text>
              {location.name && (
                <Text style={styles.locationName}>{location.name}</Text>
              )}
            </View>
            <Text style={styles.expandIcon}>
              {expandedLocation === location.id ? '▼' : '▶'}
            </Text>
          </Pressable>

          <Text style={styles.locationAddress}>{formatAddress(location.address)}</Text>
          
          {expandedLocation === location.id && (
            <View style={styles.locationDetails}>
              {location.phone && (
                <View style={styles.locationDetailItem}>
                  <Text style={styles.locationDetailIcon}>📞</Text>
                  <Text style={styles.locationDetailText}>{location.phone}</Text>
                </View>
              )}
              
              {location.notes && (
                <View style={styles.locationDetailItem}>
                  <Text style={styles.locationDetailIcon}>📝</Text>
                  <Text style={styles.locationDetailText}>{location.notes}</Text>
                </View>
              )}
            </View>
          )}

          <Pressable 
            style={styles.directionsButton}
            onPress={() => handleGetDirections(location)}
          >
            <Text style={styles.directionsText}>Get Directions</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryIcon}>🏢</Text>
        <Text style={styles.summaryText}>
          This venue has {totalLocations} locations. Each location may have different hours and contact information.
        </Text>
      </View>
    </View>
  );
};

const styles = {
  container: {
    marginVertical: 16
  },
  sectionTitle: {
    marginBottom: 16
  },
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    padding: 16,
    marginBottom: 12
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  locationHeaderLeft: {
    flex: 1
  },
  locationBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: '#f0f9f4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text
  },
  expandIcon: {
    fontSize: 12,
    color: colors.mediumGrey
  },
  locationAddress: {
    fontSize: 14,
    color: colors.mediumGrey,
    marginBottom: 12,
    lineHeight: 18
  },
  locationDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 12
  },
  locationDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  locationDetailIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 1
  },
  locationDetailText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 18
  },
  directionsButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  directionsText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500'
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 8
  },
  summaryIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2
  },
  summaryText: {
    fontSize: 14,
    color: colors.mediumGrey,
    flex: 1,
    lineHeight: 18
  }
};

export default MultipleLocationsDisplay;