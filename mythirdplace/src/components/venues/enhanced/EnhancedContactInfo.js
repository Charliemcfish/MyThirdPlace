import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { globalStyles } from '../../../styles/globalStyles';
import { colors } from '../../../styles/theme';
import { getSocialMediaIcon, getSocialMediaDisplayName, extractUsernameFromURL } from '../../../services/socialMedia';
import FontAwesomeIcon from '../../common/FontAwesomeIcon';

const EnhancedContactInfo = ({ venue, style }) => {
  const { contactInfo = {}, socialMedia = {}, isOwnerCreated } = venue;
  
  // Show contact section if there's contact info (for owners) or social media (for anyone)
  const hasContactInfo = contactInfo.workEmail || contactInfo.workPhone || contactInfo.website;
  const hasSocialMedia = Object.keys(socialMedia).length > 0;

  if (!hasContactInfo && !hasSocialMedia) {
    return null;
  }

  const handleEmailPress = () => {
    if (contactInfo.workEmail) {
      Linking.openURL(`mailto:${contactInfo.workEmail}`);
    }
  };

  const handlePhonePress = () => {
    if (contactInfo.workPhone) {
      Linking.openURL(`tel:${contactInfo.workPhone}`);
    }
  };

  const handleWebsitePress = () => {
    if (contactInfo.website) {
      const url = contactInfo.website.startsWith('http') 
        ? contactInfo.website 
        : `https://${contactInfo.website}`;
      Linking.openURL(url);
    }
  };

  const handleSocialMediaPress = (platform, url) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Only show contact info title and details for venue owners */}
      {hasContactInfo && isOwnerCreated && (
        <>
          <Text style={[globalStyles.heading4, styles.sectionTitle]}>
            Contact Information
          </Text>

          {/* Email */}
          {contactInfo.workEmail && (
            <Pressable style={styles.contactItem} onPress={handleEmailPress}>
              <Text style={styles.contactIcon}>📧</Text>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{contactInfo.workEmail}</Text>
              </View>
            </Pressable>
          )}

          {/* Phone */}
          {contactInfo.workPhone && (
            <Pressable style={styles.contactItem} onPress={handlePhonePress}>
              <Text style={styles.contactIcon}>📞</Text>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{contactInfo.workPhone}</Text>
              </View>
            </Pressable>
          )}

          {/* Website */}
          {contactInfo.website && (
            <Pressable style={styles.contactItem} onPress={handleWebsitePress}>
              <Text style={styles.contactIcon}>🌐</Text>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactValue}>{contactInfo.website}</Text>
              </View>
            </Pressable>
          )}
        </>
      )}

      {/* Social Media - show for everyone */}
      {Object.keys(socialMedia).length > 0 && (
        <View style={[styles.socialMediaSection, hasContactInfo && isOwnerCreated && styles.socialMediaSectionWithContact]}>
          <Text style={styles.socialMediaTitle}>Follow Us</Text>
          <View style={styles.socialMediaGrid}>
            {Object.entries(socialMedia).map(([platform, url]) => {
              if (!url) return null;

              const iconName = getSocialMediaIcon(platform);
              const displayName = getSocialMediaDisplayName(platform);
              const username = extractUsernameFromURL(platform, url);

              return (
                <Pressable
                  key={platform}
                  style={styles.socialMediaItem}
                  onPress={() => handleSocialMediaPress(platform, url)}
                >
                  <FontAwesomeIcon
                    name={iconName}
                    size={20}
                    color={colors.primary}
                    style={styles.socialMediaIconFA}
                  />
                  <View style={styles.socialMediaTextContainer}>
                    <Text style={styles.socialMediaPlatform}>{displayName}</Text>
                    {username && (
                      <Text style={styles.socialMediaUsername}>@{username}</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    marginVertical: 16
  },
  sectionTitle: {
    marginBottom: 16
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.lightGrey
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24
  },
  contactTextContainer: {
    flex: 1
  },
  contactLabel: {
    fontSize: 12,
    color: colors.mediumGrey,
    fontWeight: '500',
    marginBottom: 2
  },
  contactValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500'
  },
  socialMediaSection: {
    marginTop: 16
  },
  socialMediaSectionWithContact: {
    marginTop: 16
  },
  socialMediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12
  },
  socialMediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  socialMediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    minWidth: 120
  },
  socialMediaIcon: {
    fontSize: 18,
    marginRight: 10
  },
  socialMediaIconFA: {
    marginRight: 10,
    width: 20
  },
  socialMediaTextContainer: {
    flex: 1
  },
  socialMediaPlatform: {
    fontSize: 12,
    color: colors.mediumGrey,
    fontWeight: '500'
  },
  socialMediaUsername: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600'
  }
};

export default EnhancedContactInfo;