import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView, Platform } from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllBlogs, deleteBlog, updateBlogData } from '../../services/admin';
import BlogEditModal from '../../components/blogs/BlogEditModal';

const AdminBlogsScreen = ({ navigation }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBlog, setEditingBlog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await getAllBlogs();
      // Sort blogs by createdAt, newest first
      const sortedBlogs = data.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA; // Descending order (newest first)
      });
      setBlogs(sortedBlogs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId, blogTitle) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Delete blog "${blogTitle}"? This cannot be undone.`)) return;
    }
    try {
      await deleteBlog(blogId);
      Alert.alert('Success', 'Blog deleted successfully');
      loadBlogs();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete blog');
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingBlog(null);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      await updateBlogData(editingBlog.id, updatedData);
      await loadBlogs();
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout navigation={navigation} title="Blog Management" currentScreen="AdminBlogs">
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search blogs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#006548" />
      ) : (
        <ScrollView horizontal style={styles.tableContainer}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell, styles.titleCell]}>Title</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.categoryCell]}>Category</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.dateCell]}>Created</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.actionsCell]}>Actions</Text>
            </View>

            {filteredBlogs.map((blog) => (
              <View key={blog.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.titleCell]}>{blog.title}</Text>
                <Text style={[styles.tableCell, styles.categoryCell]}>{blog.category}</Text>
                <Text style={[styles.tableCell, styles.dateCell]}>
                  {blog.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                </Text>
                <View style={[styles.tableCell, styles.actionsCell]}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(blog)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('BlogDetail', { blogId: blog.id })}
                  >
                    <Text style={styles.buttonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(blog.id, blog.title)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <BlogEditModal
        visible={modalVisible}
        onClose={handleCloseModal}
        blog={editingBlog}
        onSave={handleSaveEdit}
      />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  table: {
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#006548',
    paddingBottom: 12,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  tableCell: {
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  headerCell: {
    fontWeight: '700',
    color: '#333',
    fontSize: 14,
  },
  titleCell: {
    width: 300,
  },
  categoryCell: {
    width: 150,
  },
  dateCell: {
    width: 150,
  },
  actionsCell: {
    width: 280,
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#006548',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AdminBlogsScreen;
