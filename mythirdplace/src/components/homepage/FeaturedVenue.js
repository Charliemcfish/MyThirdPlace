import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import SemiCircleHeader from '../common/SemiCircleHeader';
import { getVenue } from '../../services/venue';
import { addRegularRelationship, removeRegularRelationship, isUserRegularAtVenue } from '../../services/userVenueRelationships';
import { getCurrentUser } from '../../services/auth';
import { getContentSettings } from '../../services/contentSettings';

const FeaturedVenue = ({ navigation }) => {
  const [venue, setVenue] = useState(null);
  const [isRegular, setIsRegular] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    loadFeaturedVenue();
  }, []);

  useEffect(() => {
    if (venue && user) {
      checkIfRegular();
    }
  }, [venue, user]);

  const loadFeaturedVenue = async () => {
    try {
      const settings = await getContentSettings();
      const featuredVenueId = settings.featuredVenueId;

      if (featuredVenueId) {
        const venueData = await getVenue(featuredVenueId);
        if (venueData) {
          setVenue(venueData);
        }
      }
    } catch (error) {
      console.error('Error loading featured venue:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfRegular = async () => {
    try {
      const status = await isUserRegularAtVenue(user.uid, venue.id);
      setIsRegular(status);
    } catch (error) {
      console.error('Error checking regular status:', error);
    }
  };

  const handleRegularToggle = async () => {
    if (!user) {
      navigation?.navigate('Auth');
      return;
    }

    try {
      if (isRegular) {
        await removeRegularRelationship(user.uid, venue.id);
        setIsRegular(false);
      } else {
        const userData = {
          displayName: user.displayName || user.email,
          profilePhotoURL: user.photoURL
        };
        await addRegularRelationship(user.uid, venue.id, userData, venue);
        setIsRegular(true);
      }
    } catch (error) {
      console.error('Error updating regular status:', error);
    }
  };

  const handleVenuePress = () => {
    if (venue && navigation) {
      navigation.navigate('VenueDetail', { venueId: venue.id });
    }
  };

  if (loading || !venue) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SemiCircleHeader title="Featured" size="large" />

        <View style={styles.featuredWrapper}>
          <TouchableOpacity style={styles.venueCard} onPress={handleVenuePress}>
          <View style={styles.venueImageContainer}>
            {venue.photos && venue.photos.length > 0 ? (
              <Image
                source={{ uri: venue.photos[0] }}
                style={styles.venueImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>📍</Text>
              </View>
            )}
          </View>

          <View style={styles.venueInfo}>
            <View style={styles.venueHeader}>
              <Text style={styles.venueName}>{venue.name}</Text>
              <Text style={styles.venueCategory}>{venue.category}</Text>
            </View>

            {venue.address && (
              <View style={styles.addressContainer}>
                <Text style={styles.addressIcon}>📍</Text>
                <Text style={styles.venueAddress}>
                  {venue.address.street}, {venue.address.city}
                </Text>
              </View>
            )}

            {venue.description && (
              <Text style={styles.venueDescription} numberOfLines={3}>
                {venue.description}
              </Text>
            )}

            <View style={styles.contactInfo}>
              {venue.contactInfo?.website && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>🌐</Text>
                  <Text style={styles.contactText} numberOfLines={1}>
                    {venue.contactInfo.website.replace(/^https?:\/\//, '')}
                  </Text>
                </View>
              )}

              {venue.contactInfo?.phone && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>📞</Text>
                  <Text style={styles.contactText}>
                    {venue.contactInfo.phone}
                  </Text>
                </View>
              )}

              {venue.contactInfo?.email && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>✉️</Text>
                  <Text style={styles.contactText} numberOfLines={1}>
                    {venue.contactInfo.email}
                  </Text>
                </View>
              )}
            </View>

            {venue.tags && venue.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {venue.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                {venue.tags.length > 3 && (
                  <Text style={styles.moreTagsText}>+{venue.tags.length - 3} more</Text>
                )}
              </View>
            )}

            {venue.contactInfo?.socialMedia && Object.keys(venue.contactInfo.socialMedia).length > 0 && (
              <View style={styles.socialMediaContainer}>
                <Text style={styles.socialMediaTitle}>Follow on Social Media</Text>
                <View style={styles.socialMediaButtons}>
                  {venue.contactInfo.socialMedia.instagram && (
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => window.open(venue.contactInfo.socialMedia.instagram, '_blank')}
                    >
                      <Text style={styles.socialIcon}>📷</Text>
                    </TouchableOpacity>
                  )}
                  {venue.contactInfo.socialMedia.facebook && (
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => window.open(venue.contactInfo.socialMedia.facebook, '_blank')}
                    >
                      <Text style={styles.socialIcon}>📘</Text>
                    </TouchableOpacity>
                  )}
                  {venue.contactInfo.socialMedia.linkedin && (
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => window.open(venue.contactInfo.socialMedia.linkedin, '_blank')}
                    >
                      <Text style={styles.socialIcon}>💼</Text>
                    </TouchableOpacity>
                  )}
                  {venue.contactInfo.socialMedia.twitter && (
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => window.open(venue.contactInfo.socialMedia.twitter, '_blank')}
                    >
                      <Text style={styles.socialIcon}>🐦</Text>
                    </TouchableOpacity>
                  )}
                  {venue.contactInfo.socialMedia.tiktok && (
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => window.open(venue.contactInfo.socialMedia.tiktok, '_blank')}
                    >
                      <Text style={styles.socialIcon}>🎵</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
          </TouchableOpacity>

          <View style={styles.actionBar}>
            <TouchableOpacity
              style={[styles.regularButton, isRegular && styles.regularButtonActive]}
              onPress={handleRegularToggle}
            >
              <Text style={[styles.regularButtonText, isRegular && styles.regularButtonTextActive]}>
                {isRegular ? '✓ I\'m a Regular' : 'Mark as Regular'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={handleVenuePress}>
              <Text style={styles.shareButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
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
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  featuredWrapper: {
    ...shadows.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: 'transparent',
  },
  venueCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    minHeight: 500,
    position: 'relative',
  },
  venueImageContainer: {
    height: 300,
    width: '100%',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  venueInfo: {
    padding: spacing.xl,
    flex: 1,
  },
  venueHeader: {
    marginBottom: spacing.md,
  },
  venueName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  venueCategory: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addressIcon: {
    marginRight: spacing.sm,
    fontSize: 16,
  },
  venueAddress: {
    ...typography.body1,
    color: colors.textSecondary,
    flex: 1,
  },
  venueDescription: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  contactInfo: {
    marginBottom: spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactIcon: {
    marginRight: spacing.sm,
    fontSize: 16,
    width: 20,
  },
  contactText: {
    ...typography.body2,
    color: colors.textSecondary,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  moreTagsText: {
    ...typography.caption,
    color: colors.textLight,
    alignSelf: 'center',
    marginLeft: spacing.sm,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.backgroundLight,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    gap: spacing.md,
  },
  regularButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    flex: 1,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  regularButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  regularButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: 'bold',
  },
  regularButtonTextActive: {
    color: colors.white,
  },
  shareButton: {
    backgroundColor: colors.textSecondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    flex: 1,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shareButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: 'bold',
  },
  socialMediaContainer: {
    marginBottom: spacing.lg,
  },
  socialMediaTitle: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  socialMediaButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  socialButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  socialIcon: {
    fontSize: 16,
    color: colors.white,
  },
});

export default FeaturedVenue;