import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { getBlogsByAuthor, deleteBlog } from '../../services/blog';
import Navigation from '../../components/common/Navigation';
import BlogCard from '../../components/blogs/BlogCard';
import Button from '../../components/common/Button';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

const MyBlogsScreen = () => {
  const navigation = useNavigation();

  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [draftBlogs, setDraftBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('published'); // 'published' or 'drafts'
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
      loadMyBlogs();
    } else {
      navigation.navigate('Login');
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Reload blogs when screen comes into focus
      if (currentUser) {
        refreshMyBlogs();
      }
    }, [currentUser])
  );

  const loadMyBlogs = async (isRefresh = false) => {
    if (!currentUser) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Load all blogs (including drafts) for current user
      const allBlogs = await getBlogsByAuthor(currentUser.uid, true);
      
      const published = allBlogs.filter(blog => blog.isPublished);
      const drafts = allBlogs.filter(blog => !blog.isPublished);

      setPublishedBlogs(published);
      setDraftBlogs(drafts);

    } catch (error) {
      console.error('Error loading my blogs:', error);
      Alert.alert('Error', 'Could not load your blog posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshMyBlogs = () => {
    loadMyBlogs(true);
  };

  const handleCreateBlog = () => {
    navigation.navigate('CreateBlog');
  };

  const handleEditBlog = (blog) => {
    navigation.navigate('CreateBlog', { 
      blogId: blog.id, 
      mode: 'edit' 
    });
  };

  const handleDeleteBlog = (blog) => {
    console.log('handleDeleteBlog called with blog:', blog?.title, blog?.id);

    if (!blog || !blog.id) {
      console.error('Invalid blog object:', blog);
      Alert.alert('Error', 'Cannot delete blog - invalid blog data');
      return;
    }

    console.log('Showing delete confirmation alert');

    if (Platform.OS === 'web') {
      // Use window.confirm for web since Alert.alert doesn't work reliably
      if (window.confirm(`Are you sure you want to delete "${blog.title}"? This action cannot be undone.`)) {
        console.log('User confirmed deletion on web');
        confirmDeleteBlog(blog.id);
      } else {
        console.log('User cancelled deletion on web');
      }
    } else {
      Alert.alert(
        'Delete Blog Post',
        `Are you sure you want to delete "${blog.title}"? This action cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('User cancelled deletion')
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              console.log('User confirmed deletion');
              confirmDeleteBlog(blog.id);
            }
          }
        ]
      );
    }
  };

  const confirmDeleteBlog = async (blogId) => {
    try {
      console.log('Attempting to delete blog:', blogId);
      await deleteBlog(blogId);

      // Remove from local state
      setPublishedBlogs(prev => prev.filter(blog => blog.id !== blogId));
      setDraftBlogs(prev => prev.filter(blog => blog.id !== blogId));

      Alert.alert('Success', 'Blog post deleted successfully');
    } catch (error) {
      console.error('Error deleting blog:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', `Could not delete blog post: ${error.message}`);
    }
  };

  const renderBlogActions = (blog) => (
    <View style={styles.blogActions}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditBlog(blog)}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteBlog(blog)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBlogStats = (blog) => (
    <View style={styles.blogStats}>
      {blog.isPublished && (
        <>
          <Text style={styles.statText}>
            {blog.viewCount || 0} views
          </Text>
          <Text style={styles.statSeparator}>•</Text>
        </>
      )}
      <Text style={styles.statText}>
        {blog.wordCount || 0} words
      </Text>
      <Text style={styles.statSeparator}>•</Text>
      <Text style={styles.statText}>
        {blog.readTime || 1} min read
      </Text>
    </View>
  );

  const renderTabContent = () => {
    const blogs = activeTab === 'published' ? publishedBlogs : draftBlogs;
    
    if (blogs.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>
            {activeTab === 'published' ? 'No published blogs yet' : 'No drafts saved'}
          </Text>
          <Text style={styles.emptyStateText}>
            {activeTab === 'published' 
              ? 'Start writing and publishing your first blog post!'
              : 'Your draft blog posts will appear here.'
            }
          </Text>
          <Button
            onPress={handleCreateBlog}
            style={styles.emptyStateButton}
          >
            {activeTab === 'published' ? 'Write Your First Blog' : 'Create New Draft'}
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.blogsList}>
        {blogs.map((blog) => (
          <View key={blog.id} style={styles.blogItem}>
            <BlogCard
              blog={blog}
              size="medium"
              showAuthor={false}
              showCategory={true}
              showExcerpt={true}
              onPress={() => {
                if (blog.isPublished) {
                  navigation.navigate('BlogDetail', { blogId: blog.id });
                } else {
                  handleEditBlog(blog);
                }
              }}
            />
            
            {renderBlogStats(blog)}
            {renderBlogActions(blog)}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Navigation navigation={navigation} />
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your blog posts...</Text>
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
            onRefresh={refreshMyBlogs}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Blog Posts</Text>
          <Text style={styles.headerSubtitle}>
            Manage your published posts and drafts
          </Text>

          {/* Create Blog Button */}
          <Button
            onPress={handleCreateBlog}
            style={styles.createButton}
          >
            Write New Blog Post
          </Button>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'published' && styles.activeTab]}
            onPress={() => setActiveTab('published')}
          >
            <Text style={[styles.tabText, activeTab === 'published' && styles.activeTabText]}>
              Published ({publishedBlogs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'drafts' && styles.activeTab]}
            onPress={() => setActiveTab('drafts')}
          >
            <Text style={[styles.tabText, activeTab === 'drafts' && styles.activeTabText]}>
              Drafts ({draftBlogs.length})
            </Text>
          </TouchableOpacity>
        </View>

        {renderTabContent()}
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
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: colors.primary,
  },
  blogsList: {
    paddingHorizontal: 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  blogItem: {
    marginBottom: 24,
  },
  blogStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  statSeparator: {
    fontSize: 14,
    color: '#ccc',
    marginHorizontal: 8,
  },
  blogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 6,
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});

export default MyBlogsScreen;