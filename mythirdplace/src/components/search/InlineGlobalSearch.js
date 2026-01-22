import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { combineVenueSearch } from '../../services/venueSearch';
import { combineBlogSearch } from '../../services/blogSearch';
import { getSearchSuggestions } from '../../services/searchIndexing';
import CompactSearchResult from './CompactSearchResult';
import { colors } from '../../styles/theme';

/**
 * InlineGlobalSearch Component
 * Search interface that pushes content down instead of overlaying
 */
const InlineGlobalSearch = ({
  placeholder = "Search venues and blog posts...",
  showRecentSearches = true,
  showSuggestions = true,
  maxResults = 5,
  onSearchFocus,
  onSearchBlur,
  onSearchResults,
  style
}) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    venues: [],
    blogs: [],
    totalResults: 0
  });
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'venues', 'blogs'

  const searchTimeout = useRef(null);
  const inputRef = useRef(null);
  const resultsHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRecentSearches();

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Animate results container height
    Animated.timing(resultsHeight, {
      toValue: showResults ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [showResults]);

  const loadRecentSearches = async () => {
    try {
      const mockRecentSearches = [
        'coffee shops near me',
        'coworking spaces',
        'community building',
        'remote work',
        'third places'
      ];
      setRecentSearches(mockRecentSearches);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      if (searchQuery.length < 2) return;

      const suggestions = await getSearchSuggestions(searchQuery, 'all');
      setSuggestions(suggestions.slice(0, 6));
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const performSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults({ venues: [], blogs: [], totalResults: 0 });
      setShowResults(false);
      return;
    }

    console.log('InlineGlobalSearch: Starting search for:', query);
    setLoading(true);
    setShowResults(true);

    try {
      const [venueResults, blogResults] = await Promise.all([
        combineVenueSearch(query, {}, Math.ceil(maxResults / 2)),
        combineBlogSearch(query, {}, Math.ceil(maxResults / 2))
      ]);

      console.log('InlineGlobalSearch: Venue results:', venueResults);
      console.log('InlineGlobalSearch: Blog results:', blogResults);

      const results = {
        venues: venueResults.venues || [],
        blogs: blogResults.blogs || [],
        totalResults: (venueResults.venues?.length || 0) + (blogResults.blogs?.length || 0)
      };

      console.log('InlineGlobalSearch: Final results:', results);
      setSearchResults(results);

      // Call the onSearchResults callback if provided
      if (onSearchResults) {
        onSearchResults(query, results);
      }

      // Save search to recent searches
      saveRecentSearch(query);

    } catch (error) {
      console.error('InlineGlobalSearch: Error performing search:', error);
      setSearchResults({ venues: [], blogs: [], totalResults: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleSearchSubmit = () => {
    performSearch(searchQuery);
    Keyboard.dismiss();
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchQuery(suggestion);
    performSearch(suggestion);
  };

  const handleRecentSearchPress = (recentSearch) => {
    setSearchQuery(recentSearch);
    performSearch(recentSearch);
  };

  const handleFocus = () => {
    setSearchFocused(true);
    setShowResults(true);
    if (onSearchFocus) onSearchFocus();
  };

  const handleBlur = () => {
    setSearchFocused(false);
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowResults(false);
    }, 150);
    if (onSearchBlur) onSearchBlur();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ venues: [], blogs: [], totalResults: 0 });
    setShowResults(false);
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const saveRecentSearch = async (query) => {
    try {
      const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updatedRecent);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const handleVenuePress = (venue) => {
    navigation.navigate('VenueDetail', {
      venueId: venue.id,
      venueName: venue.name
    });
    clearSearch();
  };

  const handleBlogPress = (blog) => {
    navigation.navigate('BlogDetail', {
      blogId: blog.id,
      blogTitle: blog.title
    });
    clearSearch();
  };

  const handleViewAllResults = () => {
    navigation.navigate('UnifiedSearch', {
      query: searchQuery,
      results: searchResults
    });
    clearSearch();
  };

  const getFilteredResults = () => {
    switch (selectedTab) {
      case 'venues':
        return { venues: searchResults.venues, blogs: [], totalResults: searchResults.venues.length };
      case 'blogs':
        return { venues: [], blogs: searchResults.blogs, totalResults: searchResults.blogs.length };
      default:
        return searchResults;
    }
  };

  const filteredResults = getFilteredResults();

  return (
    <View style={[styles.container, style]}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, searchFocused && styles.searchInputFocused]}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSearchSubmit}
          placeholder={placeholder}
          placeholderTextColor="#999"
          clearButtonMode="while-editing"
          returnKeyType="search"
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearSearch}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Animated Results Container */}
      <Animated.View
        style={[
          styles.resultsContainer,
          {
            maxHeight: resultsHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 500],
            }),
            opacity: resultsHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          }
        ]}
      >
        {showResults && (
          <View style={styles.resultsContent}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            )}

            {!loading && searchQuery.length === 0 && showRecentSearches && recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                {recentSearches.slice(0, 3).map((recent, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleRecentSearchPress(recent)}
                  >
                    <Text style={styles.recentSearchIcon}>🕒</Text>
                    <Text style={styles.suggestionText}>{recent}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!loading && searchQuery.length > 0 && suggestions.length > 0 && filteredResults.totalResults === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Suggestions</Text>
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Text style={styles.suggestionIcon}>🔍</Text>
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!loading && filteredResults.totalResults > 0 && (
              <View style={styles.resultsSection}>
                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
                    onPress={() => setSelectedTab('all')}
                  >
                    <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
                      All ({searchResults.totalResults})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, selectedTab === 'venues' && styles.activeTab]}
                    onPress={() => setSelectedTab('venues')}
                  >
                    <Text style={[styles.tabText, selectedTab === 'venues' && styles.activeTabText]}>
                      Venues ({searchResults.venues.length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, selectedTab === 'blogs' && styles.activeTab]}
                    onPress={() => setSelectedTab('blogs')}
                  >
                    <Text style={[styles.tabText, selectedTab === 'blogs' && styles.activeTabText]}>
                      Blogs ({searchResults.blogs.length})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Results */}
                <ScrollView
                  style={styles.resultsScrollView}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {/* Venues */}
                  {filteredResults.venues.length > 0 && (
                    <View>
                      {selectedTab === 'all' && (
                        <Text style={styles.resultsSectionTitle}>Venues</Text>
                      )}
                      {filteredResults.venues.slice(0, selectedTab === 'venues' ? 10 : 3).map(venue => (
                        <CompactSearchResult
                          key={venue.id}
                          item={venue}
                          type="venue"
                          onPress={handleVenuePress}
                        />
                      ))}
                    </View>
                  )}

                  {/* Blogs */}
                  {filteredResults.blogs.length > 0 && (
                    <View>
                      {selectedTab === 'all' && (
                        <Text style={styles.resultsSectionTitle}>Blog Posts</Text>
                      )}
                      {filteredResults.blogs.slice(0, selectedTab === 'blogs' ? 10 : 3).map(blog => (
                        <CompactSearchResult
                          key={blog.id}
                          item={blog}
                          type="blog"
                          onPress={handleBlogPress}
                        />
                      ))}
                    </View>
                  )}

                  {/* View All Button */}
                  {searchResults.totalResults > 6 && selectedTab === 'all' && (
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={handleViewAllResults}
                    >
                      <Text style={styles.viewAllText}>
                        View all {searchResults.totalResults} results
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            )}

            {!loading && searchQuery.length > 0 && filteredResults.totalResults === 0 && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsIcon}>🔍</Text>
                <Text style={styles.noResultsTitle}>
                  No results found for "{searchQuery}"
                </Text>
                <Text style={styles.noResultsText}>
                  Try different keywords or check your spelling
                </Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e3e8ef',
    color: '#1a1a1a',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInputFocused: {
    borderColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.01 }],
  },
  clearButton: {
    position: 'absolute',
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6c7581',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
  },
  resultsContainer: {
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 8,
  },
  resultsContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  recentSearchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  resultsSection: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
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
  resultsScrollView: {
    maxHeight: 350,
  },
  resultsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  viewAllButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 16,
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
  },
});

export default InlineGlobalSearch;