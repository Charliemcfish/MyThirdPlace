import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { getBlogs, searchBlogs, blogCategories } from '../../services/blog';
import { loadDynamicCategories } from '../../services/venue';
import { combineBlogSearch } from '../../services/blogSearch';
import Navigation from '../../components/common/Navigation';
import BlogCard from '../../components/blogs/BlogCard';
import CategorySelector from '../../components/venues/CategorySelector';
import Button from '../../components/common/Button';
import GlobalSearch from '../../components/search/GlobalSearch';
import InlineGlobalSearch from '../../components/search/InlineGlobalSearch';
import FilterInterface from '../../components/search/FilterInterface';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import Footer from '../../components/homepage/Footer';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const BlogListingsScreen = () => {
  const navigation = useNavigation();

  useDocumentTitle('Blogs');

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter and search state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'popular'
  const [searchFilters, setSearchFilters] = useState({});
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Pagination state
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Responsive breakpoints
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  useEffect(() => {
    setCurrentUser(auth.currentUser);
    loadDynamicCategories();
  }, []);

  useEffect(() => {
    if (!isSearchMode) {
      loadBlogs();
    }
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateScreenWidth);
    return () => subscription?.remove();
  }, []);

  // Removed useFocusEffect to prevent unnecessary reloads that can cause crashes

  const loadBlogs = async (isRefresh = false, loadMore = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      setError(null);

      const filters = {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        startAfter: loadMore ? lastDoc : undefined
      };

      let blogResults;
      if (searchQuery.trim()) {
        blogResults = { 
          blogs: await searchBlogs(searchQuery, filters),
          hasMore: false,
          lastDoc: null 
        };
      } else {
        blogResults = await getBlogs(1, 9, filters);
      }

      if (loadMore) {
        setBlogs(prev => [...prev, ...blogResults.blogs]);
      } else {
        setBlogs(blogResults.blogs);
      }

      setHasMore(blogResults.hasMore);
      setLastDoc(blogResults.lastDoc);

    } catch (error) {
      console.error('Error loading blogs:', error);
      setError(error.message);
      
      if (!isRefresh && !loadMore) {
        Alert.alert('Error', 'Could not load blog posts');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const refreshBlogs = () => {
    setLastDoc(null);
    setCurrentPage(1);
    loadBlogs(true);
  };

  const loadMoreBlogs = () => {
    if (!loadingMore && hasMore && lastDoc) {
      loadBlogs(false, true);
    }
  };

  const handleSearch = (query, results) => {
    setSearchQuery(query);
    setIsSearchMode(query.length > 0);
    if (results && results.blogs) {
      setBlogs(results.blogs);
    }
    setLastDoc(null);
    setCurrentPage(1);
  };

  const performEnhancedSearch = async () => {
    try {
      setLoading(true);
      const filters = {
        ...searchFilters,
        category: selectedCategory === 'all' ? null : selectedCategory,
        sortBy: sortBy === 'newest' ? 'recent' : sortBy
      };

      const result = await combineBlogSearch(searchQuery, filters, 50);
      setBlogs(result.blogs || []);
    } catch (error) {
      console.error('Error performing enhanced search:', error);
      Alert.alert('Error', 'Failed to search blogs');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    setSearchFilters({});
    setSelectedCategory('all');
    setLastDoc(null);
    setCurrentPage(1);
    // Load blogs normally without search
    setBlogs([]);
    loadBlogs();
  };

  const handleFiltersChange = (newFilters) => {
    setSearchFilters(newFilters);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setLastDoc(null);
    setCurrentPage(1);
  };

  const handleCreateBlog = () => {
    if (currentUser) {
      navigation.navigate('CreateBlog');
    } else {
      navigation.navigate('Login');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Blog Posts</Text>
      <Text style={styles.headerSubtitle}>
        Discover stories and insights from the MyThirdPlace community
      </Text>

      {/* Enhanced Search Interface */}
      <View style={styles.searchContainer}>
        <InlineGlobalSearch
          placeholder="Search blog posts by title, content, or author..."
          showRecentSearches={false}
          showSuggestions={true}
          maxResults={4}
          onSearchResults={handleSearch}
          style={{ marginBottom: 16 }}
        />

{/* Action buttons row */}
        <View style={styles.searchActions}>
          {isSearchMode && (
            <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
              <Text style={styles.clearSearchButtonText}>Clear Search & Filters</Text>
            </TouchableOpacity>
          )}

          {/* Mobile Filters Button */}
          {isMobile && (
            <Button
              onPress={() => setShowMobileFilters(!showMobileFilters)}
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

      {/* Category Filter - Hidden on desktop, shown on mobile */}

      {/* Create Blog Button */}
      <View style={styles.createButtonContainer}>
        <Button
          onPress={handleCreateBlog}
          style={styles.createButton}
        >
          Write a Blog Post
        </Button>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {searchQuery ? `Search results for "${searchQuery}"` :
           selectedCategory === 'all' ? 'All blog posts' :
           `${blogCategories().find(cat => cat.id === selectedCategory)?.name || selectedCategory} posts`}
        </Text>
        <Text style={styles.resultsCount}>
          {blogs.length} {blogs.length === 1 ? 'post' : 'posts'}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No blogs found' : 'No blog posts yet'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery ? 
          'Try adjusting your search terms or category filter' :
          'Be the first to share your third place story!'
        }
      </Text>
      {currentUser && !searchQuery && (
        <Button
          onPress={handleCreateBlog}
          style={styles.emptyStateButton}
        >
          Write First Blog Post
        </Button>
      )}
    </View>
  );

  const getGridItemStyle = () => {
    if (isMobile) {
      return { ...styles.blogGridItem, width: '100%' }; // 1 column on mobile
    }
    if (isTablet) {
      return { ...styles.blogGridItem, width: '48%' }; // 2 columns on tablet
    }
    return styles.blogGridItem; // 3 columns on desktop (31%)
  };

  const renderBlogGrid = () => (
    <View style={styles.blogGrid}>
      {blogs.map((blog, index) => (
        <View key={blog.id} style={getGridItemStyle()}>
          <BlogCard
            blog={blog}
            size="medium"
            showAuthor={true}
            showCategory={false}
            showExcerpt={true}
          />
        </View>
      ))}
      
      {/* Load More Button - spans full width */}
      {hasMore && blogs.length > 0 && (
        <View style={styles.loadMoreContainer}>
          {loadingMore ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreBlogs}>
              <Text style={styles.loadMoreText}>Load More Posts</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderFilterSidebar = () => (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Filters</Text>
      <FilterInterface
        filters={searchFilters}
        onFiltersChange={handleFiltersChange}
        contentType="blog"
        showContentTypeFilter={false}
        style={{...styles.compactFilters, compactMode: true}}
      />
    </View>
  );

  const renderCategorySidebar = () => (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Categories</Text>
      <CategorySelector
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategoryChange}
        showAllOption={true}
        layout="vertical"
      />
    </View>
  );

  if (loading && blogs.length === 0) {
    return (
      <View style={styles.container}>
        <Navigation navigation={navigation} />
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading blog posts...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshBlogs}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={true}
      >
        {renderHeader()}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshBlogs}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mobile Category Filter - Above Listings */}
        {(isMobile || isTablet) && showMobileFilters && (
          <View style={styles.mobileCategorySection}>
            {/* Add mobile filter dropdown like on venues page */}
            <View style={styles.mobileFilters}>
              <View style={styles.mobileFiltersCard}>
                <Text style={styles.sidebarTitle}>
                  {isSearchMode ? 'Filters' : 'Filter by Category'}
                </Text>
                {isSearchMode ? (
                  <FilterInterface
                    filters={searchFilters}
                    onFiltersChange={handleFiltersChange}
                    contentType="blog"
                    showContentTypeFilter={false}
                    style={{...styles.compactFilters, compactMode: true}}
                  />
                ) : (
                  <CategorySelector
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategoryChange}
                    showAllOption={true}
                    layout="vertical"
                  />
                )}
              </View>
            </View>
          </View>
        )}

        {blogs.length === 0 ? renderEmptyState() : (
          <View style={[styles.mainContent, isMobile && styles.mainContentMobile]}>
            <View style={[styles.contentArea, isSearchMode && isDesktop && styles.contentAreaWithSidebar]}>
              {renderBlogGrid()}
            </View>
            {isDesktop && (isSearchMode ? renderFilterSidebar() : renderCategorySidebar())}
          </View>
        )}
        <Footer navigation={navigation} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  searchFiltersContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  filterInterface: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  clearSearchButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignSelf: 'center',
  },
  clearSearchButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  createButtonContainer: {
    marginVertical: 16,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  mainContent: {
    flexDirection: 'row',
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    gap: 30,
  },
  contentArea: {
    flex: 1,
  },
  contentAreaWithSidebar: {
    flex: 3,
  },
  compactFilters: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  blogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 20,
  },
  blogGridItem: {
    width: '31%', // 3 columns with gaps on desktop
    minWidth: 280, // Minimum width for readability
  },
  sidebar: {
    width: 280,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    height: 'fit-content',
    position: 'sticky',
    top: 20,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  categoryItemActive: {
    backgroundColor: colors.primary,
  },
  categoryItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  categoryItemTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 13,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  loadMoreContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  loadMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
  },
  errorContainer: {
    backgroundColor: '#ffeaea',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  // Responsive Styles
  mainContentMobile: {
    flexDirection: 'column',
    gap: 20,
  },
  mobileCategorySection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
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
});

export default BlogListingsScreen;