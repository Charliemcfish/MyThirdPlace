import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchBlogsAndVenues } from '../../services/blogVenueIntegration';
import Navigation from '../../components/common/Navigation';
import BlogCard from '../../components/blogs/BlogCard';
import VenueCard from '../../components/venues/VenueCard';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

const UnifiedSearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ blogs: [], venues: [], crossReferences: [] });
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const searchTimeout = useRef(null);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const performSearch = async (query) => {
    if (query.length < 2) {
      setResults({ blogs: [], venues: [], crossReferences: [] });
      setSearchPerformed(false);
      return;
    }

    setLoading(true);
    setSearchPerformed(true);

    try {
      const searchResults = await searchBlogsAndVenues(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Error in unified search:', error);
      setResults({ blogs: [], venues: [], crossReferences: [] });
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
    }, 500);
  };

  const handleBlogPress = (blog) => {
    navigation.navigate('BlogDetail', {
      blogId: blog.id,
      blogTitle: blog.title
    });
  };

  const handleVenuePress = (venue) => {
    navigation.navigate('VenueDetail', {
      venueId: venue.id,
      venueName: venue.name
    });
  };

  const renderSection = (title, items, renderItem, emptyMessage) => {
    if (items.length === 0) {
      return searchPerformed && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.emptyMessage}>{emptyMessage}</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {title} ({items.length})
        </Text>
        <View style={styles.itemsContainer}>
          {items.slice(0, 5).map(renderItem)}
          {items.length > 5 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>
                View all {items.length} {title.toLowerCase()}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderBlogItem = (blog, index) => (
    <BlogCard
      key={blog.id}
      blog={blog}
      onPress={() => handleBlogPress(blog)}
      style={styles.resultCard}
    />
  );

  const renderVenueItem = (venue, index) => (
    <VenueCard
      key={venue.id}
      venue={venue}
      onPress={() => handleVenuePress(venue)}
      style={styles.resultCard}
    />
  );

  const totalResults = results.blogs.length + results.venues.length;

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />

      <View style={styles.content}>
        <View style={styles.searchSection}>
          <Text style={styles.title}>Search Third Places & Stories</Text>
          <Text style={styles.subtitle}>
            Find venues and blog posts across the platform
          </Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search for venues, blog posts, or topics..."
              placeholderTextColor="#999"
              clearButtonMode="while-editing"
            />
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {searchPerformed && !loading && totalResults > 0 && (
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                Found {totalResults} results for "{searchQuery}"
              </Text>
            </View>
          )}
        </View>

        {searchPerformed && !loading && (
          <ScrollView
            style={styles.resultsContainer}
            showsVerticalScrollIndicator={true}
          >
            {totalResults === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsIcon}>🔍</Text>
                <Text style={styles.noResultsTitle}>
                  No results found for "{searchQuery}"
                </Text>
                <Text style={styles.noResultsDescription}>
                  Try different keywords or check the spelling. You can also create new content!
                </Text>
              </View>
            ) : (
              <>
                {renderSection(
                  'Venues',
                  results.venues,
                  renderVenueItem,
                  'No venues match your search'
                )}

                {renderSection(
                  'Blog Posts',
                  results.blogs,
                  renderBlogItem,
                  'No blog posts match your search'
                )}

                {results.crossReferences.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cross References</Text>
                    <Text style={styles.crossReferencesText}>
                      Found {results.crossReferences.length} connections between blogs and venues
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        )}

        {!searchPerformed && (
          <View style={styles.welcomeState}>
            <Text style={styles.welcomeIcon}>🌟</Text>
            <Text style={styles.welcomeTitle}>
              Discover Third Places & Stories
            </Text>
            <Text style={styles.welcomeDescription}>
              Search across venues and blog posts to find your next favorite third place or read inspiring stories about community spaces.
            </Text>

            <View style={styles.searchTips}>
              <Text style={styles.tipsTitle}>Try searching for:</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>• "Coffee shop" or "Library"</Text>
                <Text style={styles.tipItem}>• "Pet-friendly" or "Free Wi-Fi"</Text>
                <Text style={styles.tipItem}>• City names like "London" or "Manchester"</Text>
                <Text style={styles.tipItem}>• Topics like "community" or "remote work"</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  searchSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 18,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  resultsHeader: {
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  itemsContainer: {
    gap: 12,
  },
  resultCard: {
    marginBottom: 0,
  },
  viewAllButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  crossReferencesText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  noResults: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 20,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  welcomeState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  welcomeIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 500,
  },
  searchTips: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default UnifiedSearchScreen;