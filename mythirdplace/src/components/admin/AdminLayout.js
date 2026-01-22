import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import AdminSidebar from './AdminSidebar';
import { auth } from '../../services/firebase';
import { getAdminUser } from '../../services/admin';

const AdminLayout = ({ children, navigation, title, currentScreen }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [isMobile, setIsMobile] = useState(Dimensions.get('window').width < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(Dimensions.get('window').width < 768);
    };

    if (Platform.OS === 'web') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    const loadAdminName = async () => {
      if (auth.currentUser) {
        try {
          const adminData = await getAdminUser(auth.currentUser.email);
          if (adminData && adminData.displayName) {
            // Extract first name from display name (e.g., "Joshua Chan" -> "Josh")
            const firstName = adminData.displayName.split(' ')[0];
            // Special case: if first name is "Joshua", shorten to "Josh"
            setAdminName(firstName === 'Joshua' ? 'Josh' : firstName);
          } else {
            setAdminName(auth.currentUser.email?.split('@')[0] || 'Admin');
          }
        } catch (error) {
          console.error('Error loading admin name:', error);
          setAdminName(auth.currentUser.email?.split('@')[0] || 'Admin');
        }
      }
    };

    loadAdminName();
  }, []);

  return (
    <View style={styles.container}>
      {/* Sidebar - always visible on desktop, toggleable on mobile */}
      {(!isMobile || sidebarOpen) && (
        <>
          {isMobile && (
            <TouchableOpacity
              style={styles.overlay}
              onPress={() => setSidebarOpen(false)}
              activeOpacity={1}
            />
          )}
          <View style={[styles.sidebarContainer, isMobile && styles.sidebarMobile]}>
            <AdminSidebar
              navigation={navigation}
              currentScreen={currentScreen}
              onClose={() => setSidebarOpen(false)}
            />
          </View>
        </>
      )}

      {/* Main Content */}
      <View style={[styles.mainContent, !isMobile && styles.mainContentDesktop]}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            {isMobile && (
              <TouchableOpacity
                style={styles.hamburger}
                onPress={() => setSidebarOpen(!sidebarOpen)}
              >
                <Text style={styles.hamburgerIcon}>☰</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.welcomeText}>Welcome back, {adminName}</Text>
          </View>
        </View>

        {/* Page Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {title && <Text style={styles.pageTitle}>{title}</Text>}
          {children}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  sidebarContainer: {
    zIndex: 999,
  },
  sidebarMobile: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  mainContent: {
    flex: 1,
  },
  mainContentDesktop: {
    marginLeft: 0,
  },
  topBar: {
    height: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hamburger: {
    marginRight: 15,
    padding: 5,
  },
  hamburgerIcon: {
    fontSize: 24,
    color: '#006548',
  },
  welcomeText: {
    fontSize: 18,
    color: '#006548',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
});

export default AdminLayout;
