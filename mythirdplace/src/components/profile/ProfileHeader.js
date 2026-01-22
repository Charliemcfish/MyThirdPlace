import React from 'react';
import { View, Text, Pressable, Platform, Dimensions } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import Avatar from '../common/Avatar';
import CommunityLevel from '../social/CommunityLevel';
import SocialStats from '../social/SocialStats';

const ProfileHeader = ({
  profile,
  isOwnProfile = false,
  onEditPress,
  showEditButton = true,
  socialStats = null,
  showSocialStats = false,
  onStatClick
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 768;
  
  const openLink = (url) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      // For mobile, would use Linking
      console.log('Open link:', url);
    }
  };

  return (
    <View style={[styles.header, isSmallScreen && styles.headerMobile]}>
      <View style={styles.avatarSection}>
        <Avatar
          profilePhotoURL={profile?.profilePhotoURL}
          displayName={profile?.displayName}
          size={isSmallScreen ? "large" : "extra_large"}
          showBorder={profile?.isVerified}
        />
      </View>

      <View style={styles.infoSection}>
        <View style={styles.nameSection}>
          <Text style={[globalStyles.heading2, styles.displayName]}>
            {profile?.displayName || 'Anonymous User'}
          </Text>
          {profile?.isVerified && (
            <Text style={styles.verifiedBadge}>✓</Text>
          )}
          {socialStats && (
            <View style={styles.communityBadgeContainer}>
              <CommunityLevel
                regularVenuesCount={socialStats.regularVenuesCount || 0}
                createdVenuesCount={socialStats.createdVenuesCount || 0}
                publishedBlogsCount={socialStats.publishedBlogsCount || 0}
                isMigratedUser={profile?.isMigratedUser || false}
                size="small"
                showDescription={false}
              />
            </View>
          )}
        </View>

        {profile?.bio && (
          <Text style={[globalStyles.bodyText, styles.bio]}>
            {profile.bio}
          </Text>
        )}

        {/* Social Stats */}
        {showSocialStats && socialStats && (
          <View style={styles.socialStatsContainer}>
            <SocialStats
              regularVenuesCount={socialStats.regularVenuesCount || 0}
              createdVenuesCount={socialStats.createdVenuesCount || 0}
              publishedBlogsCount={socialStats.publishedBlogsCount || 0}
              isOwnProfile={isOwnProfile}
              userUID={profile?.uid}
              size="normal"
              onStatClick={onStatClick}
            />
          </View>
        )}

        <View style={styles.metaInfo}>
          <Text style={globalStyles.captionText}>
            Member since {profile?.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          {profile?.publicEmail && (
            <Pressable
              onPress={() => Platform.OS === 'web' && (window.location.href = `mailto:${profile.publicEmail}`)}
              style={styles.contactItem}
            >
              <Text style={[globalStyles.bodyText, styles.contactText]}>
                📧 {profile.publicEmail}
              </Text>
            </Pressable>
          )}

          {profile?.linkedinURL && (
            <Pressable
              onPress={() => openLink(profile.linkedinURL)}
              style={styles.contactItem}
            >
              <Text style={[globalStyles.bodyText, styles.linkText]}>
                🔗 LinkedIn Profile
              </Text>
            </Pressable>
          )}

          {profile?.portfolioURL && (
            <Pressable
              onPress={() => openLink(profile.portfolioURL)}
              style={styles.contactItem}
            >
              <Text style={[globalStyles.bodyText, styles.linkText]}>
                🌐 Portfolio Website
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = {
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 20
  },
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16
  },
  avatarSection: {
    alignItems: 'center'
  },
  infoSection: {
    flex: 1
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8
  },
  displayName: {
    marginBottom: 0,
    marginRight: 8
  },
  verifiedBadge: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold'
  },
  bio: {
    marginBottom: 12,
    lineHeight: 22
  },
  metaInfo: {
    marginBottom: 16
  },
  contactSection: {
    gap: 8
  },
  contactItem: {
    paddingVertical: 4
  },
  contactText: {
    color: colors.darkGrey
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline'
  },
  communityBadgeContainer: {
    marginLeft: 4
  },
  socialStatsContainer: {
    marginBottom: 16
  }
};

export default ProfileHeader;