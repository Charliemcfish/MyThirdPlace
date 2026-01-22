import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';

const AdminSidebar = ({ navigation, currentScreen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', screen: 'AdminHome' },
    { id: 'claims', label: 'Claims Management', icon: '✓', screen: 'AdminClaims', badge: true },
    { id: 'users', label: 'Users', icon: '👥', screen: 'AdminUsers' },
    { id: 'venues', label: 'Venues', icon: '📍', screen: 'AdminVenues' },
    { id: 'blogs', label: 'Blogs', icon: '📝', screen: 'AdminBlogs' },
    { id: 'content', label: 'Page Content', icon: '📄', screen: 'AdminContent' },
    { id: 'seo', label: 'SEO Settings', icon: '🔍', screen: 'AdminSEO' },
    { id: 'tags', label: 'Tags & Categories', icon: '🏷️', screen: 'AdminTags' },
    { id: 'featured', label: 'Featured Venues', icon: '⭐', screen: 'AdminFeatured' },
    { id: 'analytics', label: 'Analytics', icon: '📈', screen: 'AdminAnalytics' },
  ];

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
    if (onClose) onClose();
  };

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>MyThirdPlace</Text>
        <Text style={styles.logoSubtext}>Admin Dashboard</Text>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              currentScreen === item.screen && styles.menuItemActive
            ]}
            onPress={() => handleNavigation(item.screen)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[
              styles.menuText,
              currentScreen === item.screen && styles.menuTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          navigation.replace('AdminLogin');
        }}
      >
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: '#006548',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#005040',
  },
  logoContainer: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#005040',
  },
  logoText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  logoSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 6,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 16,
    fontWeight: '500',
  },
  menuTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#005040',
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminSidebar;
