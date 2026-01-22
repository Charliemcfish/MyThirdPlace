import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  Modal,
  Platform
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { getBlog, incrementViewCount } from '../../services/blog';
import { getUserProfile } from '../../services/user';
import Navigation from '../../components/common/Navigation';
import BlogContent from '../../components/blogs/BlogContent';
import CategoryBadge from '../../components/blogs/CategoryBadge';
import Avatar from '../../components/common/Avatar';
import BlogVenues from '../../components/blogs/BlogVenues';
import { blogCategories } from '../../services/blog';
import { formatRelativeDate, formatReadingTime } from '../../services/content';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import Footer from '../../components/homepage/Footer';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const { width: screenWidth } = Dimensions.get('window');

const BlogDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { blogId, showSuccessMessage, blogTitle } = route.params || {};

  console.log('📝 BlogDetailScreen route params:', route.params);
  console.log('🎉 showSuccessMessage:', showSuccessMessage);
  console.log('📰 blogTitle:', blogTitle);

  const [blog, setBlog] = useState(null);

  // Set dynamic page title
  useDocumentTitle(blog?.title || blogTitle || 'Blog Post');
  const [authorProfile, setAuthorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // Add custom CSS for blog detail pages only
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Create style element
      const styleId = 'blog-detail-custom-styles';
      const existingStyle = document.getElementById(styleId);

      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .r-1h0z5md {
            justify-content: center !important;
          
          }
        `;
        document.head.appendChild(style);
      }

      // Cleanup function to remove styles when component unmounts
      return () => {
        const styleElement = document.getElementById(styleId);
        if (styleElement) {
          styleElement.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    setCurrentUser(auth.currentUser);
    loadBlog();
  }, [blogId]);

  useFocusEffect(
    React.useCallback(() => {
      // Increment view count when screen comes into focus
      if (blog && !loading) {
        incrementViewCount(blogId);
      }
    }, [blog, loading, blogId])
  );

  const loadBlog = async () => {
    try {
      setLoading(true);
      setError(null);

      const blogData = await getBlog(blogId);
      setBlog(blogData);

      // Show success message if this is a newly published blog
      console.log('🔍 Checking success message conditions:', { showSuccessMessage, blogTitle });
      if (showSuccessMessage && blogTitle) {
        console.log('✅ Showing success message');
        setTimeout(() => {
          console.log('🚨 About to show celebration modal');
          setShowCelebrationModal(true);
        }, 1000);
      } else {
        console.log('❌ Success message not shown - missing conditions');
      }

      // Load author profile
      if (blogData.authorUID) {
        try {
          const profile = await getUserProfile(blogData.authorUID);
          setAuthorProfile(profile);
        } catch (profileError) {
          console.error('Error loading author profile:', profileError);
        }
      }

    } catch (error) {
      console.error('Error loading blog:', error);
      setError(error.message);
      Alert.alert('Error', 'Could not load blog post', [
        { text: 'Go Back', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = () => {
    if (!blog?.category) return '';
    const category = blogCategories?.find?.(cat => cat.id === blog.category);
    return category ? category.name : blog.category;
  };

  const getPublishedDate = () => {
    if (!blog) return '';
    return formatRelativeDate(blog.publishedAt || blog.createdAt);
  };

  const getReadingTime = () => {
    if (!blog) return '';
    return formatReadingTime(blog.readTime);
  };

  const handleAuthorPress = () => {
    if (blog?.authorUID) {
      navigation.navigate('ViewProfile', { userId: blog.authorUID });
    }
  };

  const handleEditPress = () => {
    navigation.navigate('CreateBlog', { 
      blogId: blog.id, 
      mode: 'edit' 
    });
  };

  const canEditBlog = () => {
    return currentUser && blog && currentUser.uid === blog.authorUID;
  };

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text>Loading blog post...</Text>
      </View>
    );
  }

  if (error || !blog) {
    return (
      <View style={globalStyles.errorContainer}>
        <Text style={globalStyles.errorText}>
          {error || 'Blog post not found'}
        </Text>
        <TouchableOpacity 
          style={globalStyles.retryButton}
          onPress={loadBlog}
        >
          <Text style={globalStyles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        {/* Featured Image */}
        {blog.featuredImageURL && (
          <View style={styles.featuredImageContainer}>
            <Image 
              source={{ uri: blog.featuredImageURL }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.content}>
          {/* Category Badge */}
          {blog.category && (
            <View style={styles.categoryContainer}>
              <CategoryBadge
                category={blog.category}
                categoryName={getCategoryName()}
                size="medium"
              />
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{blog.title}</Text>

          {/* Author Information */}
          <TouchableOpacity 
            style={styles.authorSection}
            onPress={handleAuthorPress}
          >
            <Avatar
              photoURL={blog.authorPhotoURL || authorProfile?.profilePhotoURL}
              displayName={blog.authorName || authorProfile?.displayName}
              size={48}
            />
            
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {blog.authorName || authorProfile?.displayName || 'Anonymous'}
              </Text>
              
              {authorProfile?.bio && (
                <Text style={styles.authorBio} numberOfLines={2}>
                  {authorProfile.bio}
                </Text>
              )}
              
              <View style={styles.metaInfo}>
                <Text style={styles.metaText}>
                  Published {getPublishedDate()}
                </Text>
                <Text style={styles.metaSeparator}>•</Text>
                <Text style={styles.metaText}>
                  {getReadingTime()}
                </Text>
                {blog.viewCount > 0 && (
                  <>
                    <Text style={styles.metaSeparator}>•</Text>
                    <Text style={styles.metaText}>
                      {blog.viewCount.toLocaleString()} views
                    </Text>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {blog.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Blog Content */}
          <View style={styles.blogContentContainer}>
            <BlogContent content={blog.content} />
          </View>

          {/* Venue References and Related Content */}
          <BlogVenues
            blog={blog}
            showRelatedContent={true}
          />

          {/* Author Profile Link */}
          <TouchableOpacity 
            style={styles.authorProfileLink}
            onPress={handleAuthorPress}
          >
            <Text style={styles.authorProfileLinkText}>
              View {blog.authorName || 'Author'}'s Profile
            </Text>
          </TouchableOpacity>

          {/* Placeholder for future features */}
          <View style={styles.futureFeatures}>
            <Text style={styles.futureText}>
              Coming soon: Comments, likes, and related blog posts
            </Text>
          </View>
        </View>
        <Footer navigation={navigation} />
      </ScrollView>

      {/* Celebration Modal */}
      <Modal
        visible={showCelebrationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCelebrationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.celebrationModal}>
            <Text style={styles.celebrationEmojis}>🎉 🎊 🥳</Text>
            <Text style={styles.celebrationTitle}>
              Your post "{blogTitle || blog?.title}" is now ready to read!
            </Text>
            <Text style={styles.celebrationSubtitle}>
              Your blog has been published and is live for the community to discover!
            </Text>
            <TouchableOpacity
              style={styles.celebrationButton}
              onPress={() => {
                console.log('🎯 Celebration modal closed');
                setShowCelebrationModal(false);
              }}
            >
              <Text style={styles.celebrationButtonText}>Awesome! 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  featuredImageContainer: {
    width: '100%',
    maxWidth: 1400,
    height: 488,
    alignSelf: 'center',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 36,
    marginBottom: 20,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  authorBio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 14,
    color: '#333',
  },
  metaSeparator: {
    fontSize: 14,
    color: '#ccc',
    marginHorizontal: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tagText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  blogContentContainer: {
    marginBottom: 32,
  },
  authorProfileLink: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  authorProfileLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  futureFeatures: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  futureText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Celebration Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 350,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
  },
  celebrationEmojis: {
    fontSize: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  celebrationButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  celebrationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BlogDetailScreen;