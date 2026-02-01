import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { extractUsernameFromURL } from '../../services/socialMedia';
import { Ionicons } from '@expo/vector-icons';
import FontAwesomeIcon from '../common/FontAwesomeIcon';

const VenueInstagramFeed = ({ venue, style }) => {
  const embedRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  // Extract Instagram handle from venue's social media
  const instagramUrl = venue?.socialMedia?.instagram;
  const instagramHandle = instagramUrl ? extractUsernameFromURL('instagram', instagramUrl) : null;

  useEffect(() => {
    // Load Instagram embed script for web
    if (Platform.OS === 'web' && instagramHandle) {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);

      // Process embeds after script loads
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };

      return () => {
        // Cleanup script on unmount
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [instagramHandle]);

  // Don't render if no Instagram handle
  if (!instagramHandle) {
    return null;
  }

  const fullInstagramUrl = `https://www.instagram.com/${instagramHandle}/`;

  const handleFollowPress = () => {
    if (Platform.OS === 'web') {
      window.open(fullInstagramUrl, '_blank');
    } else {
      Linking.openURL(fullInstagramUrl);
    }
  };

  if (Platform.OS !== 'web') {
    // For mobile apps, show a styled call-to-action card
    return (
      <View style={[styles.container, globalStyles.card, style]}>
        <View style={styles.header}>
          <View style={styles.instagramIconContainer}>
            <FontAwesomeIcon name="fa-instagram" size={24} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Instagram</Text>
            <Text style={styles.handleText}>@{instagramHandle}</Text>
          </View>
        </View>

        <Text style={styles.description}>
          See the latest photos and updates from {venue.name} on Instagram
        </Text>

        <TouchableOpacity style={styles.followButton} onPress={handleFollowPress}>
          <FontAwesomeIcon name="fa-instagram" size={18} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.followButtonText}>Follow @{instagramHandle}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Web version with Instagram embed
  return (
    <View style={[styles.container, globalStyles.card, style]}>
      <View style={styles.header}>
        <View style={styles.instagramIconContainer}>
          <FontAwesomeIcon name="fa-instagram" size={24} color="#fff" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Instagram</Text>
          <Text style={styles.handleText}>@{instagramHandle}</Text>
        </View>
      </View>

      {/* Instagram Profile Embed */}
      <View style={styles.embedWrapper}>
        <div
          className="instagram-venue-embed-wrapper"
          ref={embedRef}
          style={{
            maxWidth: '100%',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={fullInstagramUrl}
            data-instgrm-version="14"
            style={{
              background: '#FFF',
              border: '0',
              borderRadius: '8px',
              boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
              margin: '0 auto',
              maxWidth: '100%',
              minWidth: isMobile ? '280px' : '326px',
              padding: '0',
              width: '100%',
            }}
          >
            <div style={{ padding: '16px' }}>
              <a
                href={fullInstagramUrl}
                style={{
                  background: '#FFFFFF',
                  lineHeight: '0',
                  padding: '0 0',
                  textAlign: 'center',
                  textDecoration: 'none',
                  width: '100%',
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                View this profile on Instagram
              </a>
            </div>
          </blockquote>
        </div>
      </View>

      {/* Follow CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.followButton} onPress={handleFollowPress}>
          <FontAwesomeIcon name="fa-instagram" size={18} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.followButtonText}>Follow @{instagramHandle}</Text>
        </TouchableOpacity>
        <Text style={styles.followSubtext}>
          See the latest photos and stories from {venue.name}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instagramIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
    backgroundColor: '#e1306c', // Fallback for React Native
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  handleText: {
    fontSize: 14,
    color: colors.mediumGrey,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  embedWrapper: {
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 8,
  },
  ctaContainer: {
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: '#e1306c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  followButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  followSubtext: {
    fontSize: 13,
    color: colors.mediumGrey,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default VenueInstagramFeed;
