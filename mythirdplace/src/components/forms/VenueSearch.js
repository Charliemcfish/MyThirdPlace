import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { getVenues, searchVenuesWithTags, getCategoryById } from '../../services/venue';
import { getUserRegularVenues } from '../../services/userVenueRelationships';
import { getCurrentUser } from '../../services/auth';
import { colors } from '../../styles/theme';
import CategoryBadge from '../common/CategoryBadge';

const VenueSearch = ({
  onVenueSelect,
  onCancel,
  selectedVenues = [],
  maxSelections = 1,
  placeholder = "Search for a venue...",
  showRecent = true,
  style
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentVenues, setRecentVenues] = useState([]);
  const [regularVenues, setRegularVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const searchTimeout = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (showRecent && user) {
      loadUserVenues();
    }
  }, [showRecent]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const loadUserVenues = async () => {
    if (!currentUser) return;

    try {
      // Load user's regular venues and recently created venues
      const [regularVenuesData, recentVenuesData] = await Promise.all([
        getUserRegularVenues(currentUser.uid, 10),
        getVenues({ createdBy: currentUser.uid, limitCount: 5 })
      ]);

      setRegularVenues(regularVenuesData || []);
      setRecentVenues(recentVenuesData.venues || []);
    } catch (error) {
      console.error('Error loading user venues:', error);
    }
  };

  const performSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      const results = await searchVenuesWithTags(query, [], { limitCount: 20 });
      setSearchResults(results.venues || []);
    } catch (error) {
      console.error('Error searching venues:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);

    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for search
    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleVenueSelect = (venue, relationshipType = 'mentioned') => {
    const isAlreadySelected = selectedVenues.some(v => v.venueId === venue.id);

    if (isAlreadySelected) {
      return;
    }

    if (maxSelections === 1) {
      onVenueSelect([{
        venueId: venue.id,
        venue: venue,
        relationshipType: relationshipType
      }]);
      clearSearch();
    } else {
      if (selectedVenues.length >= maxSelections) {
        return;
      }

      onVenueSelect([...selectedVenues, {
        venueId: venue.id,
        venue: venue,
        relationshipType: relationshipType
      }]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleFocus = () => {
    if (showRecent && (recentVenues.length > 0 || regularVenues.length > 0)) {
      setShowResults(true);
    }
  };

  const renderVenueItem = (venue, source = 'search') => {
    const isSelected = selectedVenues.some(v => v.venueId === venue.id);
    const categoryInfo = getCategoryById(venue.category);

    return (
      <TouchableOpacity
        key={`${source}-${venue.id}`}
        style={[styles.venueItem, isSelected && styles.selectedVenueItem]}
        onPress={() => !isSelected && handleVenueSelect(venue)}
        disabled={isSelected}
      >
        {venue.primaryPhotoURL ? (
          <Image
            source={{ uri: venue.primaryPhotoURL }}
            style={styles.venueImage}
          />
        ) : (
          <View style={[styles.venueImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>
              {categoryInfo?.icon || '📍'}
            </Text>
          </View>
        )}

        <View style={styles.venueInfo}>
          <Text style={styles.venueName} numberOfLines={1}>
            {venue.name}
          </Text>
          <Text style={styles.venueLocation} numberOfLines={1}>
            {venue.address?.city || 'Unknown location'}
          </Text>
          <CategoryBadge categoryId={venue.category} size="small" />
        </View>

        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}

        {source === 'regular' && (
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceText}>Regular</Text>
          </View>
        )}

        {source === 'recent' && (
          <View style={[styles.sourceBadge, styles.recentBadge]}>
            <Text style={styles.sourceText}>Your venue</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSuggestions = () => {
    if (searchQuery.length >= 2) {
      return null; // Don't show suggestions when searching
    }

    return (
      <>
        {regularVenues.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>Your Regular Places</Text>
            {regularVenues.slice(0, 5).map(venue => renderVenueItem(venue, 'regular'))}
          </View>
        )}

        {recentVenues.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>Your Recent Venues</Text>
            {recentVenues.map(venue => renderVenueItem(venue, 'recent'))}
          </View>
        )}

        {regularVenues.length === 0 && recentVenues.length === 0 && (
          <View style={styles.noSuggestions}>
            <Text style={styles.noSuggestionsText}>
              Start typing to search for venues
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          placeholderTextColor="#999"
          clearButtonMode="while-editing"
        />

        {onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {maxSelections > 1 && selectedVenues.length > 0 && (
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedVenues.length} of {maxSelections} venues selected
          </Text>
        </View>
      )}

      {showResults && (
        <ScrollView
          style={styles.resultsContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Searching venues...</Text>
            </View>
          )}

          {!loading && searchQuery.length >= 2 && (
            <>
              {searchResults.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>
                    Search Results ({searchResults.length})
                  </Text>
                  {searchResults.map(venue => renderVenueItem(venue, 'search'))}
                </>
              ) : (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>
                    No venues found for "{searchQuery}"
                  </Text>
                  <Text style={styles.noResultsSubtext}>
                    Try different keywords or check the spelling
                  </Text>
                </View>
              )}
            </>
          )}

          {!loading && searchQuery.length < 2 && renderSuggestions()}
        </ScrollView>
      )}

      {searchQuery.length === 0 && !showResults && showRecent && (
        <TouchableOpacity
          style={styles.createVenueHint}
          onPress={() => {
            // This could navigate to create venue screen
            console.log('Navigate to create venue');
          }}
        >
          <Text style={styles.createVenueText}>
            Can't find the venue? Tap here to add it
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  cancelButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  selectedCount: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  selectedCountText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  resultsContainer: {
    maxHeight: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
  },
  suggestionsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  venueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  selectedVenueItem: {
    backgroundColor: '#e8f4f8',
    borderColor: colors.primary,
  },
  venueImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  venueLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sourceBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  recentBadge: {
    backgroundColor: colors.primary,
  },
  sourceText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  noResults: {
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  noSuggestions: {
    alignItems: 'center',
    padding: 20,
  },
  noSuggestionsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  createVenueHint: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  createVenueText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default VenueSearch;