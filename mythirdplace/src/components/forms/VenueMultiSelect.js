import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import VenueSearch from './VenueSearch';
import CategoryBadge from '../common/CategoryBadge';
import { colors } from '../../styles/theme';

const VenueMultiSelect = ({
  selectedVenues = [],
  onVenuesChange,
  maxSelections = 5,
  label,
  required = false,
  style
}) => {
  const [showSearch, setShowSearch] = useState(false);

  const handleVenueSelect = (venues) => {
    onVenuesChange(venues);
  };

  const handleRemoveVenue = (venueToRemove) => {
    const updatedVenues = selectedVenues.filter(
      v => v.venueId !== venueToRemove.venueId
    );
    onVenuesChange(updatedVenues);
  };

  const updateRelationshipType = (venueId, newType) => {
    const updatedVenues = selectedVenues.map(v =>
      v.venueId === venueId ? { ...v, relationshipType: newType } : v
    );
    onVenuesChange(updatedVenues);
  };

  const renderSelectedVenue = (selectedVenue, index) => {
    const venue = selectedVenue.venue;

    // Safety check - if venue is undefined, don't render
    if (!venue || !venue.id) {
      console.warn('Invalid venue data in selectedVenue:', selectedVenue);
      return null;
    }

    return (
      <View key={`${venue.id}-${index}`} style={styles.selectedVenueContainer}>
        <View style={styles.selectedVenueInfo}>
          <Text style={styles.selectedVenueName}>{venue.name || 'Unknown venue'}</Text>
          <Text style={styles.selectedVenueLocation}>
            {venue.address?.city || 'Unknown location'}
          </Text>
          <CategoryBadge categoryId={venue.category} size="small" />
        </View>

        <View style={styles.relationshipSection}>
          <Text style={styles.relationshipLabel}>Role:</Text>
          <View style={styles.relationshipButtons}>
            {['featured', 'mentioned', 'compared'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.relationshipButton,
                  selectedVenue.relationshipType === type && styles.activeRelationshipButton
                ]}
                onPress={() => updateRelationshipType(venue.id, type)}
              >
                <Text style={[
                  styles.relationshipButtonText,
                  selectedVenue.relationshipType === type && styles.activeRelationshipText
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveVenue(selectedVenue)}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (showSearch) {
    return (
      <View style={[styles.container, style]}>
        {label && (
          <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
          </Text>
        )}

        <VenueSearch
          onVenueSelect={handleVenueSelect}
          onCancel={() => setShowSearch(false)}
          selectedVenues={selectedVenues}
          maxSelections={maxSelections}
          placeholder="Search to add more venues..."
          showRecent={true}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      {selectedVenues.length > 0 && (
        <ScrollView style={styles.selectedVenuesContainer} nestedScrollEnabled>
          {selectedVenues.map((selectedVenue, index) =>
            renderSelectedVenue(selectedVenue, index)
          )}
        </ScrollView>
      )}

      {selectedVenues.length < maxSelections && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowSearch(true)}
        >
          <Text style={styles.addButtonText}>
            {selectedVenues.length === 0
              ? 'Link to venues (optional)'
              : `Add another venue (${selectedVenues.length}/${maxSelections})`
            }
          </Text>
        </TouchableOpacity>
      )}

      {selectedVenues.length === maxSelections && (
        <View style={styles.maxReachedContainer}>
          <Text style={styles.maxReachedText}>
            Maximum {maxSelections} venues selected
          </Text>
        </View>
      )}

      <Text style={styles.helperText}>
        If someone has created a listing for the venue you have written about, link it here: A preview of your blog will appear on the venue's listing page!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  selectedVenuesContainer: {
    maxHeight: 300,
    marginBottom: 12,
  },
  selectedVenueContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  selectedVenueInfo: {
    marginBottom: 12,
  },
  selectedVenueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedVenueLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  relationshipSection: {
    marginBottom: 8,
  },
  relationshipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  relationshipButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relationshipButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeRelationshipButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  relationshipButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeRelationshipText: {
    color: '#fff',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#e74c3c',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  addButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  maxReachedContainer: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  maxReachedText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default VenueMultiSelect;