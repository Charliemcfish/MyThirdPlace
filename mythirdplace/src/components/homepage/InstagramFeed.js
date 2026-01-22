import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Linking } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';
import SemiCircleHeader from '../common/SemiCircleHeader';

const InstagramFeed = () => {
  const embedRef = useRef(null);

  useEffect(() => {
    // Load Instagram embed script for web
    if (Platform.OS === 'web') {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);

      // Add custom styling
      const style = document.createElement('style');
      style.innerHTML = `
        /* Mobile responsive styling */
        @media (max-width: 768px) {
          ._ac7v {
            align-items: stretch !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 2rem !important;
            flex-shrink: 0 !important;
            position: relative !important;
          }
        }
      `;
      document.head.appendChild(style);

      // Process embeds after script loads
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };

      return () => {
        // Cleanup script and styles on unmount
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, []);

  if (Platform.OS !== 'web') {
    // For mobile apps, show a simple call-to-action
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <SemiCircleHeader title="Follow Us" size="large" />
          <Text style={styles.subtitle}>@mythirdplaceltd on Instagram</Text>

          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.followButton}
              onPress={() => Linking.openURL('https://www.instagram.com/mythirdplaceltd/?hl=en')}
            >
              <Text style={styles.followButtonText}>
                Follow @mythirdplaceltd
              </Text>
            </TouchableOpacity>
            <Text style={styles.followSubtext}>
              See community stories and discover new third places
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SemiCircleHeader title="Follow Us" size="large" />

        <Text style={styles.subtitle}>@mythirdplaceltd on Instagram</Text>

        {/* Instagram Profile Embed */}
        <View style={styles.embedWrapper}>
          <div
            className="instagram-embed-wrapper"
            ref={embedRef}
            style={{
              maxWidth: '800px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            <blockquote
              className="instagram-media"
              data-instgrm-permalink="https://www.instagram.com/mythirdplaceltd/?hl=en"
              data-instgrm-version="14"
              style={{
                background: '#FFF',
                border: '0',
                borderRadius: '3px',
                boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                margin: '1px auto',
                maxWidth: '100%',
                minWidth: '326px',
                padding: '0',
                width: '100%',
              }}
            >
              <div style={{ padding: '16px' }}>
                <a
                  href="https://www.instagram.com/mythirdplaceltd/?hl=en"
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

        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.followButton}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.open('https://www.instagram.com/mythirdplaceltd/?hl=en', '_blank');
              } else {
                Linking.openURL('https://www.instagram.com/mythirdplaceltd/?hl=en');
              }
            }}
          >
            <Text style={styles.followButtonText}>
              Follow @mythirdplaceltd
            </Text>
          </TouchableOpacity>
          <Text style={styles.followSubtext}>
            See community stories and discover new third places
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.xxl,
  },
  content: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    ...typography.h4,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  embedWrapper: {
    marginBottom: spacing.xl,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  followButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  followSubtext: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default InstagramFeed;