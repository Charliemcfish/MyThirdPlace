import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getBlogsAboutVenue } from '../../services/blogVenueIntegration';
import { getVenue } from '../../services/venue';
import Navigation from '../../components/common/Navigation';
import BlogCard from '../../components/blogs/BlogCard';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

const VenueBlogsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { venueId, venueName } = route.params;

  const [venue, setVenue] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadVenueAndBlogs();
  }, [venueId]);

  const loadVenueAndBlogs = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Load venue details and blogs in parallel
      const [venueData, blogsData] = await Promise.all([
        getVenue(venueId),
        getBlogsAboutVenue(venueId, 20)
      ]);

      setVenue(venueData);
      setBlogs(blogsData);
      setHasMore(blogsData.length >= 20);

    } catch (error) {
      console.error('Error loading venue blogs:', error);
      setError('Failed to load blog posts');
      Alert.alert('Error', 'Could not load blog posts about this venue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreBlogs = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const moreBlogs = await getBlogsAboutVenue(venueId, 20, {
        startAfter: blogs[blogs.length - 1]
      });

      if (moreBlogs.length > 0) {
        setBlogs(prev => [...prev, ...moreBlogs]);
        setHasMore(moreBlogs.length >= 20);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more blogs:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleBlogPress = (blog) => {
    navigation.navigate('BlogDetail', {
      blogId: blog.id,
      blogTitle: blog.title
    });
  };

  const handleWriteBlogPress = () => {
    if (!venue) return;

    const preselectedVenue = [{
      venueId: venue.id,
      venue: venue,
      relationshipType: 'featured'
    }];

    navigation.navigate('CreateBlog', {
      preselectedVenues: preselectedVenue,
      suggestedTitle: `My experience at ${venue.name}`
    });
  };

  const renderBlogItem = ({ item }) => (
    <BlogCard
      blog={item}
      onPress={() => handleBlogPress(item)}
      showVenueContext={false} // Don't show venue context since we're on venue page
      style={styles.blogCard}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading more posts...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>
        No blogs about {venue?.name || venueName} yet
      </Text>
      <Text style={styles.emptyDescription}>
        Be the first to share your experience and help others discover what makes this place special as a third place.
      </Text>

      <TouchableOpacity
        style={styles.writeBlogButton}
        onPress={handleWriteBlogPress}
      >
        <Text style={styles.writeBlogText}>
          Write the first blog post
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>
        Blogs about {venue?.name || venueName}
      </Text>

      {venue && (
        <TouchableOpacity
          style={styles.venueLink}
          onPress={() => navigation.navigate('VenueDetail', {
            venueId: venue.id,
            venueName: venue.name
          })}
        >
          <Text style={styles.venueLinkText}>
            ← Back to {venue.name}
          </Text>
        </TouchableOpacity>
      )}

      {blogs.length > 0 && (
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {blogs.length} blog {blogs.length === 1 ? 'post' : 'posts'} found
          </Text>

          <TouchableOpacity
            style={styles.writeButton}
            onPress={handleWriteBlogPress}
          >
            <Text style={styles.writeButtonText}>Write about this place</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <Navigation navigation={navigation} />
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading blog posts...</Text>
        </View>
      </View>
    );
  }

  if (error && blogs.length === 0) {
    return (
      <View style={globalStyles.container}>
        <Navigation navigation={navigation} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadVenueAndBlogs()}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />

      <FlatList
        data={blogs}
        renderItem={renderBlogItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreBlogs}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadVenueAndBlogs(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  venueLink: {
    marginBottom: 16,
  },
  venueLinkText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  writeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  writeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  blogCard: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 400,
  },
  writeBlogButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  writeBlogText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingFooter: {
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default VenueBlogsScreen;