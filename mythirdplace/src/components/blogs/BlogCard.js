import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CategoryBadge from './CategoryBadge';
import Avatar from '../common/Avatar';
import { blogCategories } from '../../services/blog';
import { formatRelativeDate, formatReadingTime, truncateText } from '../../services/content';
import { theme } from '../../styles/theme';

const BlogCard = ({ 
  blog, 
  size = 'medium', // 'small', 'medium', 'large'
  showAuthor = true,
  showCategory = true,
  showExcerpt = true,
  onPress
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress(blog);
    } else {
      navigation.navigate('BlogDetail', { blogId: blog.id });
    }
  };

  const handleAuthorPress = () => {
    if (blog.authorUID) {
      navigation.navigate('ViewProfile', { userId: blog.authorUID });
    }
  };

  const getCategoryName = () => {
    const category = blogCategories?.find?.(cat => cat.id === blog.category);
    return category ? category.name : blog.category;
  };

  const getPublishedDate = () => {
    return formatRelativeDate(blog.publishedAt || blog.createdAt);
  };

  const getReadingTime = () => {
    return formatReadingTime(blog.readTime);
  };

  const styles = createStyles(size);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      {/* Featured Image */}
      {blog.featuredImageURL && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: blog.featuredImageURL }} 
            style={styles.featuredImage}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.content}>
        {/* Category Badge */}
        {showCategory && (
          <View style={styles.categoryContainer}>
            <CategoryBadge
              category={blog.category}
              categoryName={getCategoryName()}
              size="small"
            />
          </View>
        )}

        {/* Title */}
        <Text style={styles.title} numberOfLines={size === 'small' ? 2 : 3}>
          {blog.title}
        </Text>

        {/* Excerpt */}
        {blog.excerpt && size !== 'small' && (
          <Text style={styles.excerpt} numberOfLines={3}>
            {blog.excerpt}
          </Text>
        )}

        {/* Author & Meta Information */}
        <View style={styles.metaContainer}>
          {showAuthor && (
            <TouchableOpacity
              style={styles.authorContainer}
              onPress={handleAuthorPress}
            >
              <Avatar
                profilePhotoURL={blog.authorPhotoURL}
                displayName={blog.authorName}
                size={size === 'small' ? 24 : 32}
              />
              <View style={styles.authorTextContainer}>
                <Text style={styles.authorName} numberOfLines={1}>
                  {blog.authorName || 'Anonymous'}
                </Text>
                <Text style={styles.publishedDate}>
                  {getPublishedDate()}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.metaInfo}>
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

        {/* Draft Indicator */}
        {blog.isDraft && (
          <View style={styles.draftBadge}>
            <Text style={styles.draftText}>DRAFT</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (size) => {
  const sizeConfig = {
    small: {
      padding: 12,
      titleSize: 16,
      excerptSize: 14,
      metaSize: 12,
    },
    medium: {
      padding: 16,
      titleSize: 18,
      excerptSize: 15,
      metaSize: 13,
    },
    large: {
      padding: 20,
      titleSize: 22,
      excerptSize: 16,
      metaSize: 14,
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  return StyleSheet.create({
    card: {
      backgroundColor: '#fff',
      borderRadius: 12,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      overflow: 'hidden',
      height: size === 'large' ? 480 : size === 'small' ? 380 : 420,
    },
    imageContainer: {
      width: '100%',
      height: size === 'large' ? 200 : size === 'small' ? 120 : 150,
    },
    featuredImage: {
      width: '100%',
      height: '100%',
    },
    content: {
      padding: config.padding,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    categoryContainer: {
      marginBottom: 8,
    },
    title: {
      fontSize: config.titleSize,
      fontWeight: '700',
      color: '#1a1a1a',
      lineHeight: config.titleSize * 1.3,
      marginBottom: size === 'small' ? 6 : 8,
      height: config.titleSize * 1.3 * 3, // Fixed height for 3 lines
    },
    excerpt: {
      fontSize: config.excerptSize,
      color: '#333',
      lineHeight: config.excerptSize * 1.5,
      marginBottom: 12,
      height: config.excerptSize * 1.5 * 3, // Fixed height for 3 lines
    },
    metaContainer: {
      flexDirection: size === 'small' ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: size === 'small' ? 'flex-start' : 'center',
    },
    authorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: size === 'small' ? 8 : 0,
      flex: size === 'small' ? undefined : 1,
    },
    authorTextContainer: {
      marginLeft: 8,
      flex: 1,
    },
    authorName: {
      fontSize: config.metaSize,
      fontWeight: '600',
      color: '#333',
      lineHeight: config.metaSize * 1.2,
    },
    publishedDate: {
      fontSize: config.metaSize - 1,
      color: '#666',
      lineHeight: (config.metaSize - 1) * 1.2,
      marginTop: 2,
    },
    metaInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metaText: {
      fontSize: config.metaSize,
      color: '#333',
    },
    metaSeparator: {
      fontSize: config.metaSize,
      color: '#ccc',
      marginHorizontal: 6,
    },
    draftBadge: {
      position: 'absolute',
      top: config.padding,
      right: config.padding,
      backgroundColor: '#f39c12',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    draftText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#fff',
      letterSpacing: 0.5,
    },
  });
};

export default BlogCard;