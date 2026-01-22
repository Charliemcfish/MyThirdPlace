import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { combineVenueSearch } from '../../services/venueSearch';
import { combineBlogSearch } from '../../services/blogSearch';
import { getSearchSuggestions } from '../../services/searchIndexing';
import VenueCard from '../venues/VenueCard';
import BlogCard from '../blogs/BlogCard';
import { colors } from '../../styles/theme';

/**
 * GlobalSearch Component
 * Unified search interface for venues and blogs with real-time results
 */
const GlobalSearch = ({
  placeholder = "Search venues and blog posts...",
  showRecentSearches = true,
  showSuggestions = true,
  maxResults = 10,
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

  const loadRecentSearches = async () => {
    try {
      // This would load from AsyncStorage in a real app
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

    console.log('GlobalSearch: Starting search for:', query);
    setLoading(true);
    setShowResults(true);

    try {
      // Search both venues and blogs simultaneously
      console.log('GlobalSearch: Calling search services...');
      const [venueResults, blogResults] = await Promise.all([
        combineVenueSearch(query, {}, Math.ceil(maxResults / 2)),
        combineBlogSearch(query, {}, Math.ceil(maxResults / 2))
      ]);

      console.log('GlobalSearch: Venue results:', venueResults);
      console.log('GlobalSearch: Blog results:', blogResults);

      const results = {
        venues: venueResults.venues || [],
        blogs: blogResults.blogs || [],
        totalResults: (venueResults.venues?.length || 0) + (blogResults.blogs?.length || 0)
      };

      console.log('GlobalSearch: Final results:', results);
      setSearchResults(results);

      // Call the onSearchResults callback if provided
      if (onSearchResults) {
        onSearchResults(query, results);
      }

      // Save search to recent searches
      saveRecentSearch(query);

    } catch (error) {
      console.error('GlobalSearch: Error performing search:', error);
      setSearchResults({ venues: [], blogs: [], totalResults: 0 });
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
    if (onSearchBlur) onSearchBlur();
    // Hide results after a short delay to allow clicking on results
    setTimeout(() => {
      setShowResults(false);
    }, 150);
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
      // Would save to AsyncStorage in real app
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
    navigation.navigate('SearchResults', {
      query: searchQuery,
      results: searchResults
    });
    setShowResults(false);
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

      {/* Results Panel */}
      {showResults && (
        <View style={styles.resultsPanel}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {!loading && searchQuery.length === 0 && showRecentSearches && recentSearches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {recentSearches.map((recent, index) => (
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

          {!loading && searchQuery.length > 0 && suggestions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Suggestions</Text>
              {suggestions.map((suggestion, index) => (
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

          {!loading && searchResults.totalResults > 0 && (
            <>
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
                style={styles.resultsContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Venues */}
                {filteredResults.venues.length > 0 && (
                  <View style={styles.section}>
                    {selectedTab === 'all' && (
                      <Text style={styles.sectionTitle}>Venues</Text>
                    )}
                    {filteredResults.venues.slice(0, selectedTab === 'venues' ? 10 : 3).map(venue => (
                      <VenueCard
                        key={venue.id}
                        venue={venue}
                        onPress={() => handleVenuePress(venue)}
                        style={styles.resultCard}
                        showDistance={venue.distance !== undefined}
                        compact={true}
                        size="small"
                      />
                    ))}
                  </View>
                )}

                {/* Blogs */}
                {filteredResults.blogs.length > 0 && (
                  <View style={styles.section}>
                    {selectedTab === 'all' && (
                      <Text style={styles.sectionTitle}>Blog Posts</Text>
                    )}
                    {filteredResults.blogs.slice(0, selectedTab === 'blogs' ? 10 : 3).map(blog => (
                      <BlogCard
                        key={blog.id}
                        blog={blog}
                        onPress={() => handleBlogPress(blog)}
                        style={styles.resultCard}
                        showSnippet={true}
                        compact={true}
                        size="small"
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
            </>
          )}

          {!loading && searchQuery.length > 0 && searchResults.totalResults === 0 && (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  searchInputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
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
  resultsPanel: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 250,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    marginTop: 2,
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  resultsContainer: {
    maxHeight: 200,
    paddingBottom: 8,
  },
  resultCard: {
    marginHorizontal: 4,
    marginVertical: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fafafa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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

export default GlobalSearch;