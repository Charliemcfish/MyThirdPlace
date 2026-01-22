import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Platform, Dimensions, TouchableOpacity, Linking } from 'react-native';
import { colors, typography, spacing, borderRadius, breakpoints } from '../../styles/theme';
import FontAwesomeIcon from '../common/FontAwesomeIcon';

const Footer = ({ navigation }) => {
  const currentYear = new Date().getFullYear();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const isMobile = screenWidth < breakpoints.tablet;

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateScreenWidth);
    return () => subscription?.remove();
  }, []);

  const handleMenuPress = (item) => {
    if (!navigation) return;

    switch(item) {
      case 'About':
        alert('About page coming soon!');
        break;
      case 'Third Places':
        navigation.navigate('VenueListings');
        break;
      case 'Blogs':
        navigation.navigate('BlogListings');
        break;
      case 'My Blogs':
        navigation.navigate('MyBlogs');
        break;
      case 'Contact Us':
        alert('Contact page coming soon!');
        break;
      default:
        alert(`${item} navigation coming soon!`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Top Section */}
        {isMobile ? (
          <View style={styles.mobileLayout}>
            {/* Logo and Description */}
            <View style={styles.mobileLogoSection}>
              <Image
                source={require('../../../assets/logo.png')}
                style={isMobile ? styles.logoMobile : styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.mobileDescription}>
                Supporting writers, showcasing spaces, and celebrating community
              </Text>
            </View>

            {/* Quick Links */}
            <View style={styles.mobileLinkSection}>
              <Text style={styles.mobileSectionTitle}>Quick Links</Text>
              <TouchableOpacity onPress={() => handleMenuPress('About')}>
                <Text style={styles.mobileLink}>About</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuPress('Blogs')}>
                <Text style={styles.mobileLink}>Blogs</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuPress('Third Places')}>
                <Text style={styles.mobileLink}>Third Places</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuPress('Contact Us')}>
                <Text style={styles.mobileLink}>Contact Us</Text>
              </TouchableOpacity>
            </View>

            {/* Legal */}
            <View style={styles.mobileLinkSection}>
              <Text style={styles.mobileSectionTitle}>Legal</Text>
              <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                <Text style={styles.mobileLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
                <Text style={styles.mobileLink}>Terms of Service</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('CookiePolicy')}>
                <Text style={styles.mobileLink}>Cookie Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('DataProtection')}>
                <Text style={styles.mobileLink}>Data Protection</Text>
              </TouchableOpacity>
            </View>

            {/* Contact */}
            <View style={styles.mobileLinkSection}>
              <Text style={styles.mobileSectionTitle}>Contact</Text>
              <Text style={styles.mobileContactText}>joshuachan@mythirdplace.co.uk</Text>
              <Text style={styles.mobileContactText}>Follow us on social media:</Text>
              <View style={styles.mobileSocialIcons}>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      window.open('https://www.instagram.com/mythirdplaceltd/?hl=en', '_blank');
                    } else {
                      Linking.openURL('https://www.instagram.com/mythirdplaceltd/?hl=en');
                    }
                  }}
                >
                  <FontAwesomeIcon name="fa-instagram" size={20} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      window.open('https://www.linkedin.com/company/mythirdplaceuk/', '_blank');
                    } else {
                      Linking.openURL('https://www.linkedin.com/company/mythirdplaceuk/');
                    }
                  }}
                >
                  <FontAwesomeIcon name="fa-linkedin" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.topSection}>
            {/* Logo and Description */}
            <View style={styles.logoSection}>
              <Image
                source={require('../../../assets/logo.png')}
                style={isMobile ? styles.logoMobile : styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.description}>
                Supporting writers, showcasing spaces, and celebrating community
              </Text>
            </View>

            {/* Quick Links */}
            <View style={styles.linksSection}>
              <Text style={styles.sectionTitle}>Quick Links</Text>
              <TouchableOpacity onPress={() => handleMenuPress('About')}>
                <Text style={styles.link}>About</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuPress('Blogs')}>
                <Text style={styles.link}>Blogs</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuPress('Third Places')}>
                <Text style={styles.link}>Third Places</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuPress('Contact Us')}>
                <Text style={styles.link}>Contact Us</Text>
              </TouchableOpacity>
            </View>

            {/* Legal */}
            <View style={styles.linksSection}>
              <Text style={styles.sectionTitle}>Legal</Text>
              <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                <Text style={styles.link}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
                <Text style={styles.link}>Terms of Service</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('CookiePolicy')}>
                <Text style={styles.link}>Cookie Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('DataProtection')}>
                <Text style={styles.link}>Data Protection</Text>
              </TouchableOpacity>
            </View>

            {/* Contact */}
            <View style={styles.linksSection}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <Text style={styles.contactText}>joshuachan@mythirdplace.co.uk</Text>
              <Text style={styles.contactText}>Follow us on social media:</Text>
              <View style={styles.socialIcons}>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      window.open('https://www.instagram.com/mythirdplaceltd/?hl=en', '_blank');
                    } else {
                      Linking.openURL('https://www.instagram.com/mythirdplaceltd/?hl=en');
                    }
                  }}
                >
                  <FontAwesomeIcon name="fa-instagram" size={24} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      window.open('https://www.linkedin.com/company/mythirdplaceuk/', '_blank');
                    } else {
                      Linking.openURL('https://www.linkedin.com/company/mythirdplaceuk/');
                    }
                  }}
                >
                  <FontAwesomeIcon name="fa-linkedin" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Bottom Section */}
        <View style={[styles.bottomSection, isMobile && styles.bottomSectionMobile]}>
          <Text style={[styles.copyright, isMobile && styles.copyrightMobile]}>
            © {currentYear} MyThirdPlace. All rights reserved.
          </Text>
          <Text style={[styles.madeWith, isMobile && styles.madeWithMobile]}>
            Made with ❤️ for building stronger communities
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xxl,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  content: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  logoSection: {
    flex: 1,
    maxWidth: 300,
    paddingRight: spacing.md,
  },
  // Mobile Layout
  mobileLayout: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  mobileLogoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  mobileDescription: {
    ...typography.body1,
    color: colors.white,
    opacity: 0.9,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  mobileLinkSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    width: '100%',
  },
  mobileSectionTitle: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  mobileLink: {
    ...typography.body2,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 2,
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
  },
  mobileContactText: {
    ...typography.body2,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 2,
    whiteSpace: Platform.OS === 'web' ? 'nowrap' : undefined,
  },
  mobileSocialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  logo: {
    height: 80,
    width: 320,
    marginBottom: spacing.md,
  },
  logoMobile: {
    height: 140,
    width: 520,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body1,
    color: colors.white,
    opacity: 0.9,
    lineHeight: 24,
  },
  linksSection: {
    flex: 0,
    minWidth: 150,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.white,
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  link: {
    ...typography.body1,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.xs,
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
  },
  contactText: {
    ...typography.body1,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
    whiteSpace: Platform.OS === 'web' ? 'nowrap' : undefined,
  },
  socialIcons: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  socialIconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  bottomSectionMobile: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  copyright: {
    ...typography.body2,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  copyrightMobile: {
    fontSize: 12,
  },
  madeWith: {
    ...typography.body2,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  madeWithMobile: {
    fontSize: 12,
  },
});

export default Footer;