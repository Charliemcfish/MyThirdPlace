import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllUsers, getAllVenues, getAllBlogs, getSystemSettings, updateSystemSetting } from '../../services/admin';

const AdminAnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVenues: 0,
    totalBlogs: 0,
    recentUsers: 0,
    recentVenues: 0,
    recentBlogs: 0,
  });
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [users, venues, blogs, settings] = await Promise.all([
        getAllUsers(),
        getAllVenues(),
        getAllBlogs(),
        getSystemSettings()
      ]);

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recentUsers = users.filter(u =>
        u.createdAt?.toDate?.() > sevenDaysAgo
      ).length;

      const recentVenues = venues.filter(v =>
        v.createdAt?.toDate?.() > sevenDaysAgo
      ).length;

      const recentBlogs = blogs.filter(b =>
        b.createdAt?.toDate?.() > sevenDaysAgo
      ).length;

      setStats({
        totalUsers: users.length,
        totalVenues: venues.length,
        totalBlogs: blogs.length,
        recentUsers,
        recentVenues,
        recentBlogs,
      });

      setGoogleAnalyticsId(settings.googleAnalyticsId?.value || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalytics = async () => {
    setSaving(true);
    try {
      await updateSystemSetting('googleAnalyticsId', googleAnalyticsId);
      Alert.alert('Success', 'Google Analytics ID saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save Google Analytics ID');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout navigation={navigation} title="Analytics" currentScreen="AdminAnalytics">
        <ActivityIndicator size="large" color="#006548" />
      </AdminLayout>
    );
  }

  const StatCard = ({ title, value, subtitle, color = '#006548' }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <AdminLayout navigation={navigation} title="Analytics" currentScreen="AdminAnalytics">
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              subtitle={`+${stats.recentUsers} in last 7 days`}
            />
            <StatCard
              title="Total Venues"
              value={stats.totalVenues}
              subtitle={`+${stats.recentVenues} in last 7 days`}
            />
            <StatCard
              title="Total Blogs"
              value={stats.totalBlogs}
              subtitle={`+${stats.recentBlogs} in last 7 days`}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Google Analytics Integration</Text>
          <Text style={styles.description}>
            Enter your Google Analytics Measurement ID (e.g., G-XXXXXXXXXX) to enable tracking
          </Text>
          <TextInput
            style={styles.input}
            placeholder="G-XXXXXXXXXX"
            value={googleAnalyticsId}
            onChangeText={setGoogleAnalyticsId}
          />
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveAnalytics}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Analytics ID'}
            </Text>
          </TouchableOpacity>

          {googleAnalyticsId && (
            <View style={styles.analyticsLink}>
              <Text style={styles.linkText}>View your analytics at:</Text>
              <Text
                style={styles.link}
                onPress={() => {
                  if (typeof window !== 'undefined') {
                    window.open('https://analytics.google.com/', '_blank');
                  }
                }}
              >
                https://analytics.google.com/
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growth Metrics</Text>
          <View style={styles.metricsContainer}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>New Users (7 days)</Text>
              <Text style={styles.metricValue}>{stats.recentUsers}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>New Venues (7 days)</Text>
              <Text style={styles.metricValue}>{stats.recentVenues}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>New Blogs (7 days)</Text>
              <Text style={styles.metricValue}>{stats.recentBlogs}</Text>
            </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#28a745',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#006548',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  analyticsLink: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 6,
  },
  linkText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  link: {
    fontSize: 14,
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
  metricsContainer: {
    gap: 12,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  metricLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#006548',
  },
});

export default AdminAnalyticsScreen;
