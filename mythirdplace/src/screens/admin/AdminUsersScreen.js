import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView, Platform } from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllUsers, deleteUser, updateUserData, getUserContent } from '../../services/admin';

const AdminUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Delete user ${userName}? This cannot be undone.`)) return;
    } else {
      Alert.alert(
        'Confirm Delete',
        `Delete user ${userName}? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: () => performDelete(userId) }
        ]
      );
      return;
    }
    await performDelete(userId);
  };

  const performDelete = async (userId) => {
    try {
      await deleteUser(userId);
      Alert.alert('Success', 'User deleted successfully');
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({
      displayName: user.displayName || '',
      bio: user.bio || '',
      email: user.email || '',
    });
  };

  const handleSaveEdit = async () => {
    try {
      await updateUserData(editingUser, editForm);
      Alert.alert('Success', 'User updated successfully');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleViewContent = async (userId) => {
    try {
      const content = await getUserContent(userId);

      if (Platform.OS === 'web') {
        const message = `User Content:\n\nVenues: ${content.venues.length}\nBlogs: ${content.blogs.length}\n\nVenue Names:\n${content.venues.map(v => '- ' + v.name).join('\n')}\n\nBlog Titles:\n${content.blogs.map(b => '- ' + b.title).join('\n')}`;
        alert(message);
      } else {
        Alert.alert(
          'User Content',
          `Venues: ${content.venues.length}\nBlogs: ${content.blogs.length}`,
          [
            { text: 'View Venues', onPress: () => navigation.navigate('AdminVenues') },
            { text: 'View Blogs', onPress: () => navigation.navigate('AdminBlogs') },
            { text: 'Close' }
          ]
        );
      }
    } catch (error) {
      console.error('Error loading user content:', error);
      Alert.alert('Error', 'Failed to load user content');
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout navigation={navigation} title="User Management" currentScreen="AdminUsers">
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
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
              <Text style={[styles.tableCell, styles.headerCell, styles.nameCell]}>Name</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.emailCell]}>Email</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.dateCell]}>Joined</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.actionsCell]}>Actions</Text>
            </View>

            {filteredUsers.map((user) => (
              <View key={user.id} style={styles.tableRow}>
                {editingUser === user.id ? (
                  <>
                    <TextInput
                      style={[styles.tableCell, styles.nameCell, styles.input]}
                      value={editForm.displayName}
                      onChangeText={(text) => setEditForm({ ...editForm, displayName: text })}
                    />
                    <TextInput
                      style={[styles.tableCell, styles.emailCell, styles.input]}
                      value={editForm.email}
                      onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                    />
                    <Text style={[styles.tableCell, styles.dateCell]}>
                      {user.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                    </Text>
                    <View style={[styles.tableCell, styles.actionsCell]}>
                      <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                        <Text style={styles.buttonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setEditingUser(null)}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={[styles.tableCell, styles.nameCell]}>
                      {user.displayName || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.emailCell]}>{user.email}</Text>
                    <Text style={[styles.tableCell, styles.dateCell]}>
                      {user.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                    </Text>
                    <View style={[styles.tableCell, styles.actionsCell]}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit(user)}
                      >
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => handleViewContent(user.id)}
                      >
                        <Text style={styles.buttonText}>Content</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(user.id, user.displayName || user.email)}
                      >
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
  nameCell: {
    width: 200,
  },
  emailCell: {
    width: 250,
  },
  dateCell: {
    width: 150,
  },
  actionsCell: {
    width: 300,
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
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
  saveButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
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

export default AdminUsersScreen;
