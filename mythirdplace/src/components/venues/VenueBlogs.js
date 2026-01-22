import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getBlogsAboutVenue } from '../../services/blogVenueIntegration';
import { generateContentPreview, formatRelativeDate, formatReadingTime } from '../../services/content';
import Avatar from '../common/Avatar';
import { colors } from '../../styles/theme';

const VenueBlogs = ({
  venue,
  maxDisplay = 6,
  showViewAllButton = true,
  style
}) => {
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (venue?.id) {
      loadBlogs();
    }
  }, [venue?.id]);

  const loadBlogs = async () => {
    if (!venue?.id) return;

    try {
      setLoading(true);
      setError(null);

      const blogsData = await getBlogsAboutVenue(venue.id, maxDisplay + 2);
      setBlogs(blogsData);

    } catch (error) {
      console.error('Error loading venue blogs:', error);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleBlogPress = (blog) => {
    navigation.navigate('BlogDetail', {
      blogId: blog.id,
      blogTitle: blog.title
    });
  };

  const handleViewAllPress = () => {
    navigation.navigate('VenueBlogs', {
      venueId: venue.id,
      venueName: venue.name
    });
  };

  const handleWriteBlogPress = () => {
    // Pre-populate the blog creation with this venue
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

  const renderBlogCard = (blog) => {
    const excerpt = blog.excerpt || generateContentPreview(blog.content, 120);
    const relationshipType = blog.venueRelationships?.find(
      rel => rel.venueId === venue.id
    )?.relationshipType || 'mentioned';

    return (
      <TouchableOpacity
        key={blog.id}
        style={styles.blogCard}
        onPress={() => handleBlogPress(blog)}
        activeOpacity={0.7}
      >
        {blog.featuredImageURL && (
          <Image
            source={{ uri: blog.featuredImageURL }}
            style={styles.blogImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.blogContent}>
          <View style={styles.blogHeader}>
            <Text style={styles.blogTitle} numberOfLines={2}>
              {blog.title}
            </Text>

            {relationshipType !== 'mentioned' && (
              <View style={[
                styles.relationshipBadge,
                relationshipType === 'featured' && styles.featuredBadge
              ]}>
                <Text style={[
                  styles.relationshipText,
                  relationshipType === 'featured' && styles.featuredText
                ]}>
                  {relationshipType === 'featured' ? 'Featured' : 'Compared'}
                </Text>
              </View>
            )}
          </View>


          <View style={styles.blogFooter}>
            <View style={styles.authorSection}>
              <Avatar
                profilePhotoURL={blog.authorPhotoURL}
                displayName={blog.authorName}
                size={24}
              />
              <Text style={styles.authorName}>
                {blog.authorName || 'Anonymous'}
              </Text>
            </View>

            <View style={styles.blogMeta}>
              <Text style={styles.metaText}>
                {formatRelativeDate(blog.publishedAt || blog.createdAt)}
              </Text>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.metaText}>
                {formatReadingTime(blog.readTime)}
              </Text>
              {blog.viewCount > 0 && (
                <>
                  <Text style={styles.metaSeparator}>•</Text>
                  <Text style={styles.metaText}>
                    {blog.viewCount} views
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>
        No blogs about {venue.name} yet
      </Text>
      <Text style={styles.emptyDescription}>
        Have you visited this place? Share your experience and help others discover what makes {venue.name} special as a third place.
      </Text>

      <TouchableOpacity
        style={styles.writeBlogButton}
        onPress={handleWriteBlogPress}
      >
        <Text style={styles.writeBlogText}>
          Be the first to write about {venue.name}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadBlogs}
      >
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && blogs.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.sectionTitle}>
          Blogs about {venue.name}
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading blog posts...</Text>
        </View>
      </View>
    );
  }

  if (error && blogs.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.sectionTitle}>
          Blogs about {venue.name}
        </Text>
        {renderError()}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>
          Blogs about {venue.name}
        </Text>

        {blogs.length > 0 && (
          <Text style={styles.blogCount}>
            {blogs.length} {blogs.length === 1 ? 'post' : 'posts'}
          </Text>
        )}
      </View>

      {blogs.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.blogsList}
            contentContainerStyle={styles.blogsListContent}
          >
            {blogs.slice(0, maxDisplay).map(renderBlogCard)}
          </ScrollView>

          <View style={styles.actionButtons}>
            {showViewAllButton && blogs.length > maxDisplay && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={handleViewAllPress}
              >
                <Text style={styles.viewAllText}>
                  View all {blogs.length} blogs about {venue.name}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.writeBlogButton}
              onPress={handleWriteBlogPress}
            >
              <Text style={styles.writeBlogText}>
                Write about {venue.name}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  blogCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  blogsList: {
    marginBottom: 16,
  },
  blogsListContent: {
    paddingRight: 20,
  },
  blogCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  blogImage: {
    width: '100%',
    height: 140,
  },
  blogContent: {
    padding: 16,
  },
  blogHeader: {
    marginBottom: 8,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 4,
  },
  relationshipBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  featuredBadge: {
    backgroundColor: colors.primary,
  },
  relationshipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  featuredText: {
    color: '#fff',
  },
  blogExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  blogFooter: {
    gap: 8,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  blogMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  metaSeparator: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 6,
  },
  actionButtons: {
    gap: 12,
  },
  viewAllButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  writeBlogButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  writeBlogText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 300,
  },
  errorState: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  retryText: {
    fontSize: 14,
    color: colors.primary,
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
});

export default VenueBlogs;