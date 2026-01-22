import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
  Modal,
  Animated,
  PanResponder
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { combineVenueSearch } from '../../services/venueSearch';
import { combineBlogSearch } from '../../services/blogSearch';
import { getLocationSuggestions, searchNearMe } from '../../services/locationSearch';
import { getDiscoveryFeed } from '../../services/popularContent';
import VenueCard from '../venues/VenueCard';
import BlogCard from '../blogs/BlogCard';
import FilterInterface from './FilterInterface';
import { colors } from '../../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * MobileSearchInterface Component
 * Optimized search experience for mobile devices with touch-friendly controls
 */
const MobileSearchInterface = ({
  initialQuery = '',
  showLocationSearch = true,
  showDiscovery = true,
  onClose,
  style
}) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState({
    venues: [],
    blogs: [],
    totalResults: 0
  });
  const [discoveryContent, setDiscoveryContent] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'venues', 'blogs', 'discovery'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('content'); // 'content', 'location'
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const searchInputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const searchTimeout = useRef(null);

  useEffect(() => {
    loadDiscoveryContent();
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      if (searchMode === 'location') {
        loadLocationSuggestions(searchQuery);
      } else {
        debouncedSearch(searchQuery);
      }
    } else {
      setSearchResults({ venues: [], blogs: [], totalResults: 0 });
      setLocationSuggestions([]);
    }
  }, [searchQuery, searchMode]);

  const loadDiscoveryContent = async () => {
    try {
      const content = await getDiscoveryFeed({ location: userLocation }, { limit: 15 });
      setDiscoveryContent(content);
    } catch (error) {
      console.error('Error loading discovery content:', error);
    }
  };

  const loadLocationSuggestions = async (query) => {
    try {
      const suggestions = await getLocationSuggestions(query);
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading location suggestions:', error);
    }
  };

  const debouncedSearch = (query) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const performSearch = async (query) => {
    if (!query || query.length < 2) return;

    setLoading(true);
    try {
      const [venueResults, blogResults] = await Promise.all([
        combineVenueSearch(query, filters, 20),
        combineBlogSearch(query, filters, 20)
      ]);

      setSearchResults({
        venues: venueResults.venues || [],
        blogs: blogResults.blogs || [],
        totalResults: (venueResults.venues?.length || 0) + (blogResults.blogs?.length || 0)
      });
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchNearMe = async () => {
    setLoading(true);
    try {
      const results = await searchNearMe('all', 25, filters);
      setSearchResults({
        venues: results.venues || [],
        blogs: results.blogs || [],
        totalResults: results.totalResults || 0
      });
      setUserLocation(results.userLocation);
      setActiveTab('all');
    } catch (error) {
      console.error('Error searching near me:', error);
      alert('Unable to get your location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSuggestionPress = (suggestion) => {
    setSearchQuery(suggestion.name);
    setSearchMode('content');
    performSearch(suggestion.name);
    setLocationSuggestions([]);
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (searchQuery) {
      performSearch(searchQuery);
    }
  };

  const handleVenuePress = (venue) => {
    navigation.navigate('VenueDetail', {
      venueId: venue.id,
      venueName: venue.name
    });
  };

  const handleBlogPress = (blog) => {
    navigation.navigate('BlogDetail', {
      blogId: blog.id,
      blogTitle: blog.title
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ venues: [], blogs: [], totalResults: 0 });
    setLocationSuggestions([]);
    setActiveTab('discovery');
  };

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'venues':
        return { venues: searchResults.venues, blogs: [], totalResults: searchResults.venues.length };
      case 'blogs':
        return { venues: [], blogs: searchResults.blogs, totalResults: searchResults.blogs.length };
      case 'discovery':
        return { venues: [], blogs: [], totalResults: 0 };
      default:
        return searchResults;
    }
  };

  const filteredResults = getFilteredResults();

  const renderSearchHeader = () => (
    <View style={styles.searchHeader}>
      <View style={styles.searchInputContainer}>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchMode === 'location' ? "Search locations..." : "Search venues and blogs..."}
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => performSearch(searchQuery)}
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchControls}>
        <TouchableOpacity
          style={[styles.searchModeButton, searchMode === 'content' && styles.activeModeButton]}
          onPress={() => setSearchMode('content')}
        >
          <Text style={[styles.searchModeText, searchMode === 'content' && styles.activeModeText]}>
            🔍 Content
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.searchModeButton, searchMode === 'location' && styles.activeModeButton]}
          onPress={() => setSearchMode('location')}
        >
          <Text style={[styles.searchModeText, searchMode === 'location' && styles.activeModeText]}>
            📍 Location
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nearMeButton} onPress={handleSearchNearMe}>
          <Text style={styles.nearMeButtonText}>Near Me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>⚙️</Text>
          {Object.keys(filters).length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{Object.keys(filters).length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
        onPress={() => handleTabPress('all')}
      >
        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
          All ({searchResults.totalResults})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'venues' && styles.activeTab]}
        onPress={() => handleTabPress('venues')}
      >
        <Text style={[styles.tabText, activeTab === 'venues' && styles.activeTabText]}>
          Venues ({searchResults.venues.length})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'blogs' && styles.activeTab]}
        onPress={() => handleTabPress('blogs')}
      >
        <Text style={[styles.tabText, activeTab === 'blogs' && styles.activeTabText]}>
          Blogs ({searchResults.blogs.length})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'discovery' && styles.activeTab]}
        onPress={() => handleTabPress('discovery')}
      >
        <Text style={[styles.tabText, activeTab === 'discovery' && styles.activeTabText]}>
          Discover
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLocationSuggestions = () => {
    if (searchMode !== 'location' || locationSuggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Location Suggestions</Text>
        {locationSuggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionItem}
            onPress={() => handleLocationSuggestionPress(suggestion)}
          >
            <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
            <Text style={styles.suggestionText}>{suggestion.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (activeTab === 'discovery') {
      return renderDiscoveryContent();
    }

    if (searchQuery.length === 0) {
      return renderEmptyState();
    }

    if (filteredResults.totalResults === 0) {
      return renderNoResults();
    }

    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Venues */}
        {filteredResults.venues.length > 0 && (
          <View style={styles.resultsSection}>
            {activeTab === 'all' && (
              <Text style={styles.sectionTitle}>Venues</Text>
            )}
            {filteredResults.venues.map(venue => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onPress={() => handleVenuePress(venue)}
                style={styles.resultCard}
                showDistance={venue.distance !== undefined}
                compact={true}
              />
            ))}
          </View>
        )}

        {/* Blogs */}
        {filteredResults.blogs.length > 0 && (
          <View style={styles.resultsSection}>
            {activeTab === 'all' && (
              <Text style={styles.sectionTitle}>Blog Posts</Text>
            )}
            {filteredResults.blogs.map(blog => (
              <BlogCard
                key={blog.id}
                blog={blog}
                onPress={() => handleBlogPress(blog)}
                style={styles.resultCard}
                showSnippet={true}
                compact={true}
              />
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderDiscoveryContent = () => (
    <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.discoveryTitle}>Discover Popular Content</Text>
      {discoveryContent.map((item, index) => {
        if (item.contentType === 'venue') {
          return (
            <VenueCard
              key={`${item.contentType}-${item.id}`}
              venue={item}
              onPress={() => handleVenuePress(item)}
              style={styles.resultCard}
              showPopularityBadge={true}
              compact={true}
            />
          );
        } else {
          return (
            <BlogCard
              key={`${item.contentType}-${item.id}`}
              blog={item}
              onPress={() => handleBlogPress(item)}
              style={styles.resultCard}
              showSnippet={true}
              compact={true}
            />
          );
        }
      })}
    </ScrollView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🔍</Text>
      <Text style={styles.emptyStateTitle}>Start Your Search</Text>
      <Text style={styles.emptyStateText}>
        Search for venues, blogs, or locations to discover your next third place
      </Text>
      <TouchableOpacity style={styles.discoverButton} onPress={() => setActiveTab('discovery')}>
        <Text style={styles.discoverButtonText}>Browse Popular Content</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.noResults}>
      <Text style={styles.noResultsIcon}>🤔</Text>
      <Text style={styles.noResultsTitle}>
        No results found for "{searchQuery}"
      </Text>
      <Text style={styles.noResultsText}>
        Try different keywords, check your spelling, or browse popular content instead
      </Text>
      <TouchableOpacity style={styles.browseButton} onPress={() => setActiveTab('discovery')}>
        <Text style={styles.browseButtonText}>Browse Popular Content</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, style]}>
      {renderSearchHeader()}
      {renderLocationSuggestions()}
      {renderTabBar()}
      {renderSearchResults()}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Search Filters</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          <FilterInterface
            filters={filters}
            onFiltersChange={handleFilterChange}
            mobileOptimized={true}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: '#333',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  activeModeButton: {
    backgroundColor: colors.primary,
  },
  searchModeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeModeText: {
    color: '#fff',
  },
  nearMeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginRight: 8,
  },
  nearMeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 16,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultsSection: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  resultCard: {
    marginHorizontal: 12,
    marginVertical: 6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  discoverButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  discoveryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  noResultsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default MobileSearchInterface;