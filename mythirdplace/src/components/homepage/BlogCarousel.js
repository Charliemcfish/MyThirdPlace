import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import { getFeaturedBlogs, getPopularBlogs } from '../../services/blog';
import SemiCircleHeader from '../common/SemiCircleHeader';
import CarouselCard from '../common/CarouselCard';

const BlogCarousel = () => {
  const navigation = useNavigation();
  const scrollViewRef = React.useRef(null);
  const [blogsData, setBlogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateScreenWidth);
    return () => subscription?.remove();
  }, []);

  // Responsive breakpoints
  const getItemsToShow = () => {
    if (screenWidth >= 1200) return 5; // Large desktop
    if (screenWidth >= 768) return 3;  // Tablet/small desktop
    return 1; // Mobile
  };

  const getCardWidth = () => {
    const itemsToShow = getItemsToShow();
    const containerPadding = 32; // 16px on each side
    const gap = 16; // gap between cards
    const totalGaps = (itemsToShow - 1) * gap;
    const availableWidth = Math.min(1400, screenWidth) - containerPadding;
    return (availableWidth - totalGaps) / itemsToShow;
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      
      // Try to get featured blogs first, fall back to popular blogs
      let blogs = await getFeaturedBlogs(6);
      
      if (blogs.length === 0) {
        blogs = await getPopularBlogs(6);
      }
      
      setBlogsData(blogs);
    } catch (error) {
      console.error('Error loading blogs for carousel:', error);
      setBlogsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogPress = (blog) => {
    navigation.navigate('BlogDetail', { blogId: blog.id });
  };

  const handleViewAllPress = () => {
    navigation.navigate('BlogListings');
  };

  const scrollLeft = () => {
    const itemsToShow = getItemsToShow();
    const newIndex = Math.max(0, currentIndex - itemsToShow);
    setCurrentIndex(newIndex);
  };

  const scrollRight = () => {
    const itemsToShow = getItemsToShow();
    const maxIndex = Math.max(0, blogsData.length - itemsToShow);
    const newIndex = Math.min(maxIndex, currentIndex + itemsToShow);
    setCurrentIndex(newIndex);
  };

  if (blogsData.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <SemiCircleHeader
            title="Blogs"
            size="large"
            onPress={() => navigation.navigate('BlogListings')}
          />
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No blog posts available yet.</Text>
            <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllPress}>
              <Text style={styles.viewAllButtonText}>Write the First Blog Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SemiCircleHeader
          title="Blogs"
          size="large"
          onPress={() => navigation.navigate('BlogListings')}
        />
        
        <View style={styles.carouselContainer}>
          {Platform.OS === 'web' && blogsData.length > 2 && (
            <>
              <TouchableOpacity onPress={scrollLeft} style={[styles.arrowButton, styles.leftArrow]}>
                <Text style={styles.arrowText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={scrollRight} style={[styles.arrowButton, styles.rightArrow]}>
                <Text style={styles.arrowText}>›</Text>
              </TouchableOpacity>
            </>
          )}
          
          <View style={[styles.carouselGrid, { maxWidth: Math.min(1400, screenWidth) }]}>
            {blogsData.slice(currentIndex, currentIndex + getItemsToShow()).map((blog) => (
              <TouchableOpacity key={blog.id} onPress={() => handleBlogPress(blog)}>
                <View style={{ width: getCardWidth() }}>
                  <CarouselCard
                    type="blog"
                    image={blog.featuredImageURL}
                    title={blog.title}
                    author={blog.authorName}
                    authorAvatar={blog.authorPhotoURL}
                    date={blog.publishedAt?.toDate ?
                      blog.publishedAt.toDate().toLocaleDateString() :
                      new Date(blog.createdAt.seconds * 1000).toLocaleDateString()
                    }
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xxl,
  },
  content: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  carouselContainer: {
    position: 'relative',
  },
  carouselGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    gap: 16,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 10,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ translateY: -20 }],
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  arrowText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  scrollView: {
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: spacing.lg,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  viewAllButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  viewAllButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BlogCarousel;