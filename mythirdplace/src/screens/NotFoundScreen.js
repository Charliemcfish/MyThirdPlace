import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../styles/theme';
import Navigation from '../components/common/Navigation';

const NotFoundScreen = ({ navigation }) => {
  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />

      <View style={styles.content}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🔍</Text>

          <Text style={styles.title}>Page Not Found</Text>

          <Text style={styles.description}>
            Sorry, we couldn't find the page you're looking for.
            The page may have been moved, deleted, or doesn't exist.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleGoHome}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                🏠 Go to Homepage
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleGoBack}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                ← Go Back
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Looking for something specific?</Text>
            <View style={styles.quickLinks}>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => navigation.navigate('VenueListings')}
              >
                <Text style={styles.quickLinkText}>Browse Third Places</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => navigation.navigate('BlogListings')}
              >
                <Text style={styles.quickLinkText}>Read Blog Posts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.quickLinkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
  },
  errorIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  helpSection: {
    alignItems: 'center',
    width: '100%',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickLinks: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default NotFoundScreen;