import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { getUserVerifiedVenues } from '../../services/claimsManagement';
import { auth } from '../../services/firebase';
import { VerificationBadge } from '../../components/claims/VerificationStatus';

const OwnerDashboardScreen = ({ navigation }) => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerifiedVenues();
  }, []);

  const loadVerifiedVenues = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const verifiedVenues = await getUserVerifiedVenues(user.uid);
      setVenues(verifiedVenues);
    } catch (error) {
      console.error('Error loading verified venues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#006548" />
      </View>
    );
  }

  if (venues.length === 0) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Business Owner Dashboard</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏢</Text>
          <Text style={styles.emptyText}>No Verified Venues</Text>
          <Text style={styles.emptySubtext}>
            You don't have any verified business listings yet.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Business Owner Dashboard</Text>
        <Text style={styles.subtitle}>Manage your verified venues</Text>
      </View>

      <View style={styles.venuesList}>
        {venues.map((venue) => (
          <TouchableOpacity
            key={venue.id}
            style={styles.venueCard}
            onPress={() => navigation.navigate('VenueDetail', { venueId: venue.id })}
          >
            <View style={styles.venueHeader}>
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <Text style={styles.venueCategory}>{venue.category}</Text>
              </View>
              <VerificationBadge venue={venue} />
            </View>

            <View style={styles.venueStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{venue.regularCount || 0}</Text>
                <Text style={styles.statLabel}>Regulars</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{venue.blogCount || 0}</Text>
                <Text style={styles.statLabel}>Blog Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{venue.viewCount || 0}</Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
            </View>

            <View style={styles.venueActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('EditVenue', { venueId: venue.id })}
              >
                <Text style={styles.actionButtonText}>Edit Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => navigation.navigate('VenueDetail', { venueId: venue.id })}
              >
                <Text style={styles.actionButtonTextSecondary}>View Page</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpText}>
          Contact our business support team at support@mythirdplace.com
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#006548',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  venuesList: {
    padding: 16,
  },
  venueCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  venueCategory: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  venueStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#006548',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  venueActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#006548',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#006548',
  },
  actionButtonTextSecondary: {
    color: '#006548',
    fontSize: 14,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default OwnerDashboardScreen;
