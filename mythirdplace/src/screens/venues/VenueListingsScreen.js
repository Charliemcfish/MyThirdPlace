import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import { getVenues, loadDynamicCategories } from '../../services/venue';
import { getCurrentUser } from '../../services/auth';
import { combineVenueSearch } from '../../services/venueSearch';
import Button from '../../components/common/Button';
import VenueCard from '../../components/venues/VenueCard';
import CategorySelector from '../../components/venues/CategorySelector';
import Navigation from '../../components/common/Navigation';
import GlobalSearch from '../../components/search/GlobalSearch';
import InlineGlobalSearch from '../../components/search/InlineGlobalSearch';
import FilterInterface from '../../components/search/FilterInterface';
import Footer from '../../components/homepage/Footer';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const VenueListingsScreen = ({ navigation, route }) => {
  useDocumentTitle('Third Places');

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || '');
  const [searchFilters, setSearchFilters] = useState({});
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    // Load dynamic categories
    loadDynamicCategories();

    const updateScreenWidth = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateScreenWidth);

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Handle search from homepage
    if (route?.params?.searchQuery) {
      setSearchQuery(route.params.searchQuery);
      setIsSearchMode(true);
      if (route.params.searchResults?.venues) {
        setVenues(route.params.searchResults.venues);
        setLoading(false);
      }
    }
  }, [route?.params]);

  useEffect(() => {
    console.log('Selected category changed to:', selectedCategory);
    if (!isSearchMode) {
      loadVenues();
    }
  }, [selectedCategory]);

  // Separate effect for search that only runs when explicitly triggered
  useEffect(() => {
    if (isSearchMode && searchQuery) {
      performSearch();
    }
  }, [searchQuery, searchFilters]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      console.log('Loading venues with category:', selectedCategory);
      
      const categoryFilter = selectedCategory === 'all' ? null : selectedCategory;
      console.log('Category filter being sent to getVenues:', categoryFilter);
      
      const result = await getVenues({
        category: categoryFilter,
        limitCount: 999
      });
      
      console.log('Venues loaded:', result);
      console.log('Number of venues:', result.venues?.length || 0);
      
      // Log categories of returned venues for debugging
      if (result.venues && result.venues.length > 0) {
        const categories = result.venues.map(v => ({ name: v.name, category: v.category }));
        console.log('Venue categories:', categories);
        console.log('Unique categories found:', [...new Set(categories.map(c => c.category))]);
      } else {
        console.log('No venues returned - this might indicate filtering issue');
      }
      
      setVenues(result.venues || []);
    } catch (error) {
      console.error('Error loading venues:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', `Failed to load venues: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVenuePress = (venue) => {
    navigation.navigate('VenueDetail', { venueId: venue.id });
  };

  const handleCreateVenue = () => {
    if (!currentUser) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('CreateVenue');
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const filters = {
        ...searchFilters,
        category: selectedCategory === 'all' ? null : selectedCategory
      };

      const result = await combineVenueSearch(searchQuery, filters, 50);
      setVenues(result.venues || []);
    } catch (error) {
      console.error('Error performing search:', error);
      Alert.alert('Error', 'Failed to search venues');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query, results) => {
    setSearchQuery(query);
    setIsSearchMode(query.length > 0);
    if (results && results.venues) {
      setVenues(results.venues);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setSearchFilters(newFilters);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    setSearchFilters({});
    // Clear any route parameters
    navigation.setParams({ searchQuery: undefined, searchResults: undefined });
    loadVenues();
  };



  const getGridColumns = () => {
    // Force single column on mobile for better responsiveness
    if (screenWidth < 768) return 1; // Mobile: single column
    if (screenWidth >= 1200) return 4;
    if (screenWidth >= 900) return 3;
    if (screenWidth >= 600) return 2;
    return 1;
  };

  const getGridGap = () => {
    if (screenWidth < 768) return 16; // Mobile: consistent gap
    if (screenWidth >= 1200) return 20;
    if (screenWidth >= 900) return 16;
    if (screenWidth >= 600) return 12;
    return 8;
  };

  const renderVenueGrid = () => {
    const columns = getGridColumns();
    const gap = getGridGap();
    const rows = [];
    
    for (let i = 0; i < venues.length; i += columns) {
      const rowVenues = venues.slice(i, i + columns);
      rows.push(
        <View key={i} style={[styles.venueRow, { gap: gap }]}>
          {rowVenues.map((venue) => (
            <View
              key={venue.id}
              style={[styles.venueCardContainer, { flex: 1 / columns }]}
            >
              <VenueCard
                venue={venue}
                onPress={handleVenuePress}
                style={styles.venueCard}
              />
            </View>
          ))}
          {/* Add empty placeholders for incomplete rows */}
          {Array.from({ length: columns - rowVenues.length }, (_, index) => (
            <View key={`placeholder-${index}`} style={{ flex: 1 / columns }} />
          ))}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />
      
      <ScrollView style={styles.scrollView}>
        <View style={globalStyles.headerContainer}>
          <View style={globalStyles.maxWidthContainer}>
            <Text style={globalStyles.headerText}>Third Places</Text>
          </View>
        </View>

        <View style={globalStyles.maxWidthContainerPadded}>
        {/* Enhanced Search Interface */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>
            Search Third Places
          </Text>

          <InlineGlobalSearch
            placeholder="Search venues by name, location, or amenities..."
            showRecentSearches={false}
            showSuggestions={true}
            maxResults={4}
            onSearchResults={handleSearch}
            style={{ marginBottom: 16 }}
          />

          <View style={styles.searchActions}>
            {isSearchMode && (
              <Button
                onPress={clearSearch}
                style={{
                  backgroundColor: '#f0f0f0',
                  paddingVertical: 8,
                  flex: 1
                }}
                textStyle={{ color: colors.primary, fontSize: 14 }}
              >
                Clear Search & Filters
              </Button>
            )}

            {/* Mobile Filters Button */}
            {screenWidth < 768 && (
              <Button
                onPress={() => {
                  console.log('Mobile filters button pressed, current state:', showMobileFilters);
                  setShowMobileFilters(!showMobileFilters);
                }}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  marginLeft: isSearchMode ? 8 : 0,
                  minWidth: 120,
                  borderRadius: 8
                }}
                textStyle={{ color: colors.white, fontSize: 14, fontWeight: '600' }}
              >
                Filters {showMobileFilters ? '▲' : '▼'}
              </Button>
            )}
          </View>
        </View>

        {/* Create Venue Button */}
        <View style={{ marginBottom: 24 }}>
          <Button onPress={handleCreateVenue}>
            + Add a Third Place
          </Button>
        </View>

        {/* Mobile Filters Section - Above Results */}
        {screenWidth < 768 && showMobileFilters && (
          <View style={styles.mobileFilters}>
            <View style={styles.mobileFiltersCard}>
              <Text style={styles.sidebarTitle}>
                {isSearchMode ? 'Filters' : 'Filter by Category'}
              </Text>
              {isSearchMode ? (
                <FilterInterface
                  filters={searchFilters}
                  onFiltersChange={handleFiltersChange}
                  contentType="venue"
                  showContentTypeFilter={false}
                  style={{...styles.compactFilters, compactMode: true}}
                />
              ) : (
                <CategorySelector
                  selectedCategory={selectedCategory}
                  onCategorySelect={(category) => {
                    console.log('Category selected:', category);
                    setSelectedCategory(category);
                  }}
                  showAllOption={true}
                  layout="vertical"
                />
              )}
            </View>
          </View>
        )}

        {/* Venue Grid with Sidebar */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading third places...</Text>
          </View>
        ) : (
          <View style={[styles.contentContainer, screenWidth >= 768 && styles.sidebarLayout]}>
            {/* Results Section */}
            <View style={[styles.resultsSection, screenWidth >= 768 && styles.resultsWithSidebar]}>
              {venues.length > 0 ? (
                <View style={styles.venueGrid}>
                  {renderVenueGrid()}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>🏢</Text>
                  <Text style={styles.emptyTitle}>No third places found</Text>
                  <Text style={styles.emptySubtitle}>
                    {selectedCategory === 'all'
                      ? 'Be the first to add a third place to the community!'
                      : 'No venues in this category yet.'
                    }
                  </Text>
                  {currentUser && (
                    <Button onPress={handleCreateVenue} style={styles.emptyButton}>
                      Add the First One
                    </Button>
                  )}
                </View>
              )}
            </View>

            {/* Sidebar for Filters - Always visible on desktop */}
            {screenWidth >= 768 && (
              <View style={styles.sidebar}>
                <View style={styles.sidebarCard}>
                  <Text style={styles.sidebarTitle}>
                    {isSearchMode ? 'Filters' : 'Filter by Category'}
                  </Text>
                  {isSearchMode ? (
                    <FilterInterface
                      filters={searchFilters}
                      onFiltersChange={handleFiltersChange}
                      contentType="venue"
                      showContentTypeFilter={false}
                      style={{...styles.compactFilters, compactMode: true}}
                    />
                  ) : (
                    <CategorySelector
                      selectedCategory={selectedCategory}
                      onCategorySelect={(category) => {
                        console.log('Category selected:', category);
                        setSelectedCategory(category);
                      }}
                      showAllOption={true}
                      layout="vertical"
                    />
                  )}
                </View>
              </View>
            )}
          </View>
        )}
        </View>
        <Footer navigation={navigation} />
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.mediumGrey
  },
  contentContainer: {
    marginTop: 24
  },
  sidebarLayout: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start'
  },
  searchActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  mobileFilters: {
    marginBottom: 20
  },
  mobileFiltersCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  resultsSection: {
    flex: 1
  },
  resultsWithSidebar: {
    flex: 3,
    marginRight: 0
  },
  sidebar: {
    flex: 1,
    minWidth: 280,
    maxWidth: 320
  },
  sidebarCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'sticky',
    top: 24
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16
  },
  compactFilters: {
    backgroundColor: 'transparent',
    padding: 0
  },
  venueGrid: {
    marginTop: 0
  },
  venueRow: {
    flexDirection: 'row',
    marginBottom: 24
  },
  venueCardContainer: {
    minWidth: 0 // Allow flex shrinking
  },
  venueCard: {
    marginHorizontal: 4
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.mediumGrey,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  emptyButton: {
    minWidth: 200
  }
};

export default VenueListingsScreen;