import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllUsers, getAllVenues, getAllBlogs } from '../../services/admin';
import { getPendingClaimsCount } from '../../services/claimsManagement';

const AdminHomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVenues: 0,
    totalBlogs: 0,
    pendingClaims: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, venues, blogs, claims] = await Promise.all([
        getAllUsers(),
        getAllVenues(),
        getAllBlogs(),
        getPendingClaimsCount(),
      ]);

      setStats({
        totalUsers: users.length,
        totalVenues: venues.length,
        totalBlogs: blogs.length,
        pendingClaims: claims,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <AdminLayout navigation={navigation} title="Dashboard" currentScreen="AdminHome">
      {loading ? (
        <ActivityIndicator size="large" color="#006548" />
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon="👥"
              onPress={() => navigation.navigate('AdminUsers')}
            />
            <StatCard
              title="Total Venues"
              value={stats.totalVenues}
              icon="📍"
              onPress={() => navigation.navigate('AdminVenues')}
            />
            <StatCard
              title="Total Blogs"
              value={stats.totalBlogs}
              icon="📝"
              onPress={() => navigation.navigate('AdminBlogs')}
            />
          </View>

          {/* Pending Claims Alert */}
          {stats.pendingClaims > 0 && (
            <TouchableOpacity
              style={styles.claimsAlert}
              onPress={() => navigation.navigate('AdminClaims')}
            >
              <Text style={styles.claimsAlertIcon}>⚠️</Text>
              <View style={styles.claimsAlertTextContainer}>
                <Text style={styles.claimsAlertTitle}>
                  {stats.pendingClaims} Pending Claim{stats.pendingClaims !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.claimsAlertSubtext}>
                  Venue ownership claims require review
                </Text>
              </View>
              <Text style={styles.claimsAlertArrow}>→</Text>
            </TouchableOpacity>
          )}

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AdminContent')}
            >
              <Text style={styles.actionButtonText}>Edit Page Content</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AdminSEO')}
            >
              <Text style={styles.actionButtonText}>Manage SEO Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AdminFeatured')}
            >
              <Text style={styles.actionButtonText}>Update Featured Venues</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
    gap: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    minWidth: 200,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#006548',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  quickActions: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#006548',
    padding: 14,
    borderRadius: 6,
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  claimsAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  claimsAlertIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  claimsAlertTextContainer: {
    flex: 1,
  },
  claimsAlertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 2,
  },
  claimsAlertSubtext: {
    fontSize: 14,
    color: '#856404',
  },
  claimsAlertArrow: {
    fontSize: 24,
    color: '#856404',
  },
});

export default AdminHomeScreen;
