import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllVenues, getSystemSettings, updateSystemSetting } from '../../services/admin';

const AdminFeaturedScreen = ({ navigation }) => {
  const [venues, setVenues] = useState([]);
  const [featuredVenueId, setFeaturedVenueId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [venuesData, settings] = await Promise.all([
        getAllVenues(),
        getSystemSettings()
      ]);
      setVenues(venuesData);
      setFeaturedVenueId(settings.featuredVenueId?.value || null);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const selectFeatured = (venueId) => {
    setFeaturedVenueId(venueId === featuredVenueId ? null : venueId);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSystemSetting('featuredVenueId', featuredVenueId);
      Alert.alert('Success', 'Featured venue updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update featured venue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout navigation={navigation} title="Featured Venues" currentScreen="AdminFeatured">
        <ActivityIndicator size="large" color="#006548" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout navigation={navigation} title="Featured Venues" currentScreen="AdminFeatured">
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Select ONE venue to feature on the homepage {featuredVenueId ? '(1 selected)' : '(none selected)'}
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.venuesContainer}>
        {venues.map((venue) => {
          const isFeatured = venue.id === featuredVenueId;
          return (
            <TouchableOpacity
              key={venue.id}
              style={[styles.venueCard, isFeatured && styles.venueCardFeatured]}
              onPress={() => selectFeatured(venue.id)}
            >
              {venue.photos && venue.photos.length > 0 && (
                <Image
                  source={{ uri: venue.photos[0] }}
                  style={styles.venueImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <Text style={styles.venueCategory}>{venue.category}</Text>
                <Text style={styles.venueLocation}>{venue.address?.city}</Text>
              </View>
              <View style={[styles.checkbox, isFeatured && styles.checkboxChecked]}>
                {isFeatured && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#006548',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  venuesContainer: {
    flex: 1,
  },
  venueCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  venueCardFeatured: {
    borderColor: '#006548',
    backgroundColor: '#f0f8f6',
  },
  venueImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  venueCategory: {
    fontSize: 14,
    color: '#006548',
    marginBottom: 2,
  },
  venueLocation: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  checkboxChecked: {
    backgroundColor: '#006548',
    borderColor: '#006548',
  },
  checkmark: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default AdminFeaturedScreen;
