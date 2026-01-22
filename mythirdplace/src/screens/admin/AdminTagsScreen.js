import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import { getTags, saveTag, deleteTag, getCategories, saveCategory, deleteCategory } from '../../services/admin';

const AdminTagsScreen = ({ navigation }) => {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tagsData, categoriesData] = await Promise.all([getTags(), getCategories()]);
      setTags(tagsData);
      setCategories(categoriesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }
    try {
      await saveTag(null, { name: newTag.trim(), category: 'custom' });
      Alert.alert('Success', 'Tag added successfully');
      setNewTag('');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add tag');
    }
  };

  const handleDeleteTag = async (tagId, tagName) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Delete tag "${tagName}"?`)) return;
    }
    try {
      await deleteTag(tagId);
      Alert.alert('Success', 'Tag deleted successfully');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete tag');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    try {
      await saveCategory(null, { name: newCategory.trim() });
      Alert.alert('Success', 'Category added successfully');
      setNewCategory('');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Delete category "${categoryName}"?`)) return;
    }
    try {
      await deleteCategory(categoryId);
      Alert.alert('Success', 'Category deleted successfully');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <AdminLayout navigation={navigation} title="Tags & Categories" currentScreen="AdminTags">
        <ActivityIndicator size="large" color="#006548" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout navigation={navigation} title="Tags & Categories" currentScreen="AdminTags">
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Venue Tags</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="Add new tag..."
              value={newTag}
              onChangeText={setNewTag}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
              <Text style={styles.addButtonText}>Add Tag</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.itemsContainer}>
            {tags.map((tag) => (
              <View key={tag.id} style={styles.item}>
                <Text style={styles.itemText}>{tag.name}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTag(tag.id, tag.name)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Venue Categories</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="Add new category..."
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
              <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.itemsContainer}>
            {categories.map((category) => (
              <View key={category.id} style={styles.item}>
                <Text style={styles.itemText}>{category.name}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCategory(category.id, category.name)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#006548',
  },
  addRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#006548',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  itemsContainer: {
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminTagsScreen;
