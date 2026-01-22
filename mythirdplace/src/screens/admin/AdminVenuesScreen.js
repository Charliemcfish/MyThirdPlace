import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView, Platform } from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllVenues, deleteVenue, updateVenueData } from '../../services/admin';

const AdminVenuesScreen = ({ navigation }) => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVenue, setEditingVenue] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const data = await getAllVenues();
      setVenues(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (venueId, venueName) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Delete venue "${venueName}"? This cannot be undone.`)) return;
    }
    try {
      await deleteVenue(venueId);
      Alert.alert('Success', 'Venue deleted successfully');
      loadVenues();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete venue');
    }
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue.id);
    setEditForm({
      name: venue.name || '',
      description: venue.description || '',
      category: venue.category || '',
    });
  };

  const handleSaveEdit = async () => {
    try {
      await updateVenueData(editingVenue, editForm);
      Alert.alert('Success', 'Venue updated successfully');
      setEditingVenue(null);
      loadVenues();
    } catch (error) {
      Alert.alert('Error', 'Failed to update venue');
    }
  };

  const filteredVenues = venues.filter(venue =>
    venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout navigation={navigation} title="Venue Management" currentScreen="AdminVenues">
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search venues..."
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
              <Text style={[styles.tableCell, styles.headerCell, styles.categoryCell]}>Category</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.locationCell]}>Location</Text>
              <Text style={[styles.tableCell, styles.headerCell, styles.actionsCell]}>Actions</Text>
            </View>

            {filteredVenues.map((venue) => (
              <View key={venue.id} style={styles.tableRow}>
                {editingVenue === venue.id ? (
                  <>
                    <TextInput
                      style={[styles.tableCell, styles.nameCell, styles.input]}
                      value={editForm.name}
                      onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                    />
                    <TextInput
                      style={[styles.tableCell, styles.categoryCell, styles.input]}
                      value={editForm.category}
                      onChangeText={(text) => setEditForm({ ...editForm, category: text })}
                    />
                    <TextInput
                      style={[styles.tableCell, styles.locationCell, styles.input]}
                      value={editForm.description}
                      onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                      multiline
                    />
                    <View style={[styles.tableCell, styles.actionsCell]}>
                      <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                        <Text style={styles.buttonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setEditingVenue(null)}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={[styles.tableCell, styles.nameCell]}>{venue.name}</Text>
                    <Text style={[styles.tableCell, styles.categoryCell]}>{venue.category}</Text>
                    <Text style={[styles.tableCell, styles.locationCell]}>
                      {venue.address?.city || 'N/A'}
                    </Text>
                    <View style={[styles.tableCell, styles.actionsCell]}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit(venue)}
                      >
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => navigation.navigate('VenueDetail', { venueId: venue.id })}
                      >
                        <Text style={styles.buttonText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(venue.id, venue.name)}
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
    width: 250,
  },
  categoryCell: {
    width: 150,
  },
  locationCell: {
    width: 200,
  },
  actionsCell: {
    width: 280,
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

export default AdminVenuesScreen;
