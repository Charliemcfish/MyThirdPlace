import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getVenuesInBlog, getRelatedBlogs, getVenueRecommendations } from '../../services/blogVenueIntegration';
import CategoryBadge from '../common/CategoryBadge';
import { colors } from '../../styles/theme';

const BlogVenues = ({
  blog,
  showRelatedContent = true,
  style
}) => {
  const navigation = useNavigation();
  const [venues, setVenues] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [recommendedVenues, setRecommendedVenues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (blog?.id) {
      loadVenueReferences();
      if (showRelatedContent) {
        loadRelatedContent();
      }
    }
  }, [blog?.id, showRelatedContent]);

  const loadVenueReferences = async () => {
    if (!blog?.id) return;

    try {
      setLoading(true);
      const venuesData = await getVenuesInBlog(blog.id);
      setVenues(venuesData);
    } catch (error) {
      console.error('Error loading venue references:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedContent = async () => {
    if (!blog?.id || !blog?.linkedVenues) return;

    try {
      const [relatedBlogsData, recommendedVenuesData] = await Promise.all([
        getRelatedBlogs(blog.id, blog.linkedVenues, 4),
        getVenueRecommendations(blog.id)
      ]);

      setRelatedBlogs(relatedBlogsData);
      setRecommendedVenues(recommendedVenuesData.slice(0, 6));
    } catch (error) {
      console.error('Error loading related content:', error);
    }
  };

  const handleVenuePress = (venue) => {
    navigation.navigate('VenueDetail', {
      venueId: venue.id,
      venueName: venue.name
    });
  };

  const handleRelatedBlogPress = (relatedBlog) => {
    navigation.navigate('BlogDetail', {
      blogId: relatedBlog.id,
      blogTitle: relatedBlog.title
    });
  };

  const renderVenueCard = (venue) => {
    const relationshipBadgeColor = {
      'featured': colors.primary,
      'mentioned': '#666',
      'compared': '#f39c12'
    }[venue.relationshipType] || '#666';

    const relationshipBadgeText = {
      'featured': 'Featured Place',
      'mentioned': 'Mentioned',
      'compared': 'Compared'
    }[venue.relationshipType] || 'Referenced';

    return (
      <TouchableOpacity
        key={venue.id}
        style={[
          styles.venueCard,
          venue.relationshipType === 'featured' && styles.featuredVenueCard
        ]}
        onPress={() => handleVenuePress(venue)}
        activeOpacity={0.7}
      >
        {venue.primaryPhotoURL ? (
          <Image
            source={{ uri: venue.primaryPhotoURL }}
            style={styles.venueImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.venueImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📍</Text>
          </View>
        )}

        <View style={styles.venueInfo}>
          <View style={styles.venueHeader}>
            <Text style={styles.venueName} numberOfLines={1}>
              {venue.name}
            </Text>
            <View style={[styles.relationshipBadge, { backgroundColor: relationshipBadgeColor }]}>
              <Text style={styles.relationshipBadgeText}>
                {relationshipBadgeText}
              </Text>
            </View>
          </View>

          <Text style={styles.venueLocation} numberOfLines={1}>
            📍 {venue.address?.city || 'Unknown location'}
          </Text>

          <CategoryBadge categoryId={venue.category} size="small" />

          {venue.contextInBlog && (
            <Text style={styles.contextText} numberOfLines={2}>
              "{venue.contextInBlog}"
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRelatedBlogCard = (relatedBlog) => (
    <TouchableOpacity
      key={relatedBlog.id}
      style={styles.relatedBlogCard}
      onPress={() => handleRelatedBlogPress(relatedBlog)}
      activeOpacity={0.7}
    >
      {relatedBlog.featuredImageURL && (
        <Image
          source={{ uri: relatedBlog.featuredImageURL }}
          style={styles.relatedBlogImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.relatedBlogInfo}>
        <Text style={styles.relatedBlogTitle} numberOfLines={2}>
          {relatedBlog.title}
        </Text>
        <Text style={styles.relatedBlogAuthor}>
          by {relatedBlog.authorName || 'Anonymous'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecommendedVenueCard = (venue) => (
    <TouchableOpacity
      key={venue.id}
      style={styles.recommendedVenueCard}
      onPress={() => handleVenuePress(venue)}
      activeOpacity={0.7}
    >
      {venue.primaryPhotoURL ? (
        <Image
          source={{ uri: venue.primaryPhotoURL }}
          style={styles.recommendedVenueImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.recommendedVenueImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>📍</Text>
        </View>
      )}

      <Text style={styles.recommendedVenueName} numberOfLines={1}>
        {venue.name}
      </Text>
      <CategoryBadge categoryId={venue.category} size="small" />
    </TouchableOpacity>
  );

  if (loading && venues.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading venue references...</Text>
        </View>
      </View>
    );
  }

  if (venues.length === 0) {
    return null; // Don't show anything if no venues are referenced
  }

  return (
    <View style={[styles.container, style]}>
      {/* Main Venue References */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Places Featured in This Blog
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.venuesList}
          contentContainerStyle={styles.venuesListContent}
        >
          {venues.map(renderVenueCard)}
        </ScrollView>
      </View>

      {/* Related Content */}
      {showRelatedContent && (
        <>
          {relatedBlogs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Related Blog Posts
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.relatedBlogsList}
                contentContainerStyle={styles.relatedBlogsListContent}
              >
                {relatedBlogs.map(renderRelatedBlogCard)}
              </ScrollView>
            </View>
          )}

          {recommendedVenues.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                You Might Also Like
              </Text>
              <Text style={styles.sectionSubtitle}>
                Similar places to explore
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.recommendedVenuesList}
                contentContainerStyle={styles.recommendedVenuesListContent}
              >
                {recommendedVenues.map(renderRecommendedVenueCard)}
              </ScrollView>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  venuesList: {
    marginTop: 12,
  },
  venuesListContent: {
    paddingRight: 20,
  },
  venueCard: {
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
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  featuredVenueCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  venueImage: {
    width: '100%',
    height: 120,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  venueInfo: {
    padding: 16,
  },
  venueHeader: {
    marginBottom: 8,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  relationshipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  relationshipBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  venueLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  contextText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
  relatedBlogsList: {
    marginTop: 12,
  },
  relatedBlogsListContent: {
    paddingRight: 20,
  },
  relatedBlogCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  relatedBlogImage: {
    width: '100%',
    height: 100,
  },
  relatedBlogInfo: {
    padding: 12,
  },
  relatedBlogTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
  },
  relatedBlogAuthor: {
    fontSize: 12,
    color: '#666',
  },
  recommendedVenuesList: {
    marginTop: 12,
  },
  recommendedVenuesListContent: {
    paddingRight: 20,
  },
  recommendedVenueCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  recommendedVenueImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  recommendedVenueName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
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

export default BlogVenues;