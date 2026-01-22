import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { colors, typography, spacing, breakpoints } from '../../styles/theme';
import { getCurrentUser, onAuthStateChange } from '../../services/auth';
import Button from './Button';
import SecondaryButton from './SecondaryButton';

const Navigation = ({ navigation }) => {
  const [user, setUser] = useState(getCurrentUser());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  const isMobile = screenWidth < breakpoints.tablet;

  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateScreenWidth);
    return () => subscription?.remove();
  }, []);

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  const handleMenuPress = (item) => {
    setIsMobileMenuOpen(false);

    switch(item) {
      case 'About':
        navigation.navigate('About');
        break;
      case 'Contact Us':
        navigation.navigate('Contact');
        break;
      case 'Third Places':
        navigation.navigate('VenueListings');
        break;
      case 'Add Place':
        if (user) {
          navigation.navigate('CreateVenue');
        } else {
          alert('Please log in to add a venue.');
        }
        break;
      case 'Blogs':
        navigation.navigate('BlogListings');
        break;
      case 'Write Blog':
        if (user) {
          navigation.navigate('CreateBlog');
        } else {
          alert('Please log in to write a blog post.');
        }
        break;
      case 'My Blogs':
        if (user) {
          navigation.navigate('MyBlogs');
        } else {
          alert('Please log in to view your blogs.');
        }
        break;
      default:
        alert(`${item} navigation coming soon!`);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const PersonIcon = () => (
    <View style={styles.personIcon}>
      <Text style={styles.personIconText}>👤</Text>
    </View>
  );

  const BurgerIcon = () => (
    <View style={styles.burgerIcon}>
      <View style={[styles.burgerLine, isMobileMenuOpen && styles.burgerLineRotated1]} />
      <View style={[styles.burgerLine, isMobileMenuOpen && styles.burgerLineHidden]} />
      <View style={[styles.burgerLine, isMobileMenuOpen && styles.burgerLineRotated2]} />
    </View>
  );

  return (
    <>
    <View style={styles.container}>
      <View style={[styles.content, isMobile && styles.contentMobile]}>
        {/* Logo Section */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => navigation.navigate('Home')}
        >
          <Image
            source={require('../../../assets/logo.png')}
            style={isMobile ? styles.logoMobile : styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Desktop Menu */}
        {!isMobile && (
          <View style={styles.desktopMenu}>
            <Text style={styles.menuItem} onPress={() => handleMenuPress('About')}>
              About
            </Text>
            <Text style={styles.menuItem} onPress={() => handleMenuPress('Blogs')}>
              Blogs
            </Text>
            <Text style={styles.menuItem} onPress={() => handleMenuPress('Third Places')}>
              Third Places
            </Text>
            {user && (
              <Text style={styles.menuItem} onPress={() => handleMenuPress('My Blogs')}>
                My Blogs
              </Text>
            )}
            <Text style={styles.menuItem} onPress={() => handleMenuPress('Contact Us')}>
              Contact Us
            </Text>
          </View>
        )}

        {/* Desktop User Section */}
        {!isMobile && (
          <View style={styles.desktopUserSection}>
            {user ? (
              <TouchableOpacity onPress={handleProfilePress} style={styles.profileIconButton}>
                <PersonIcon />
              </TouchableOpacity>
            ) : (
              <View style={styles.authButtons}>
                <SecondaryButton
                  onPress={handleLoginPress}
                  style={styles.loginButton}
                  textStyle={isMobile ? styles.authButtonTextMobile : {}}
                >
                  Login
                </SecondaryButton>
                <Button
                  onPress={handleRegisterPress}
                  style={styles.registerButton}
                  textStyle={isMobile ? styles.authButtonTextMobile : {}}
                >
                  Register
                </Button>
              </View>
            )}
          </View>
        )}

        {/* Spacer for mobile */}
        {isMobile && <View style={styles.mobileSpacer} />}

        {/* Mobile Menu Button */}
        {isMobile && (
          <TouchableOpacity
            onPress={toggleMobileMenu}
            style={styles.mobileMenuButton}
          >
            <BurgerIcon />
          </TouchableOpacity>
        )}
      </View>
    </View>

      {/* Full Screen Mobile Menu Overlay - Rendered outside container */}
      {isMobileMenuOpen && (
        <View style={[styles.fullScreenOverlay, { zIndex: 99999 }]}>
          <View style={styles.fullScreenMenu}>
            {/* Close Button */}
            <TouchableOpacity 
              onPress={() => setIsMobileMenuOpen(false)} 
              style={[styles.closeButton, { zIndex: 99999 }]}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            {/* Menu Items */}
            <View style={styles.fullScreenMenuItems}>
              <TouchableOpacity onPress={() => handleMenuPress('About')} style={styles.fullScreenMenuItem}>
                <Text style={styles.fullScreenMenuText}>About</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleMenuPress('Blogs')} style={styles.fullScreenMenuItem}>
                <Text style={styles.fullScreenMenuText}>Blogs</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleMenuPress('Third Places')} style={styles.fullScreenMenuItem}>
                <Text style={styles.fullScreenMenuText}>Third Places</Text>
              </TouchableOpacity>
              
              {user && (
                <>
                  <TouchableOpacity onPress={() => handleMenuPress('My Blogs')} style={styles.fullScreenMenuItem}>
                    <Text style={styles.fullScreenMenuText}>My Blogs</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => handleMenuPress('Write Blog')} style={styles.fullScreenMenuItem}>
                    <Text style={styles.fullScreenMenuText}>Write Blog</Text>
                  </TouchableOpacity>
                </>
              )}
              
              <TouchableOpacity onPress={() => handleMenuPress('Contact Us')} style={styles.fullScreenMenuItem}>
                <Text style={styles.fullScreenMenuText}>Contact Us</Text>
              </TouchableOpacity>
              
              {/* User Section */}
              <View style={styles.fullScreenUserSection}>
                {user ? (
                  <TouchableOpacity 
                    onPress={() => { handleProfilePress(); setIsMobileMenuOpen(false); }} 
                    style={styles.fullScreenMenuItem}
                  >
                    <Text style={styles.fullScreenMenuText}>My Profile</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.fullScreenAuthSection}>
                    <TouchableOpacity 
                      onPress={() => { handleLoginPress(); setIsMobileMenuOpen(false); }} 
                      style={styles.fullScreenMenuItem}
                    >
                      <Text style={styles.fullScreenMenuText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => { handleRegisterPress(); setIsMobileMenuOpen(false); }} 
                      style={styles.fullScreenMenuItem}
                    >
                      <Text style={styles.fullScreenMenuText}>Register</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: spacing.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    minWidth: 0,
    gap: spacing.sm,
  },
  contentMobile: {
    paddingHorizontal: spacing.sm,
  },
  logoContainer: {
    flex: 0,
    alignSelf: 'flex-start',
    left: -80,
  },
  logo: {
    height: 60,
    width: 240,
    alignSelf: 'flex-start',
  },
  logoMobile: {
    height: 28,
    width: 112,
    alignSelf: 'flex-start',
  },
  desktopMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xxl * 2,
    marginRight: spacing.md,
    flexShrink: 0,
  },
  menuItem: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '500',
    cursor: 'pointer',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    textDecorationLine: 'none',
    marginHorizontal: spacing.md,
  },
  desktopUserSection: {
    marginLeft: 'auto',
    flexShrink: 1,
    minWidth: 0,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
  },
  loginButton: {
    minWidth: 35,
    paddingHorizontal: 4,
    paddingVertical: 3,
    marginRight: 3,
    flexShrink: 1,
  },
  registerButton: {
    minWidth: 40,
    paddingHorizontal: 4,
    paddingVertical: 3,
    flexShrink: 1,
  },
  authButtonTextMobile: {
    fontSize: 11,
    fontWeight: '600',
  },
  profileButton: {
    minWidth: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // Person Icon Styles
  personIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  personIconText: {
    fontSize: 20,
    color: colors.primary,
  },
  profileIconButton: {
    padding: 4,
  },
  // Mobile Menu Styles
  mobileSpacer: {
    flex: 1,
  },
  mobileMenuButton: {
    padding: spacing.sm,
  },
  burgerIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  burgerLine: {
    width: '100%',
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 1.5,
    transformOrigin: 'center',
  },
  burgerLineRotated1: {
    transform: [{ rotate: '45deg' }, { translateY: 7.5 }],
  },
  burgerLineHidden: {
    opacity: 0,
  },
  burgerLineRotated2: {
    transform: [{ rotate: '-45deg' }, { translateY: -7.5 }],
  },
  // Full Screen Mobile Menu
  fullScreenOverlay: {
    ...(Platform.OS === 'web' 
      ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          width: '100vw',
        }
      : {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100%',
          width: '100%',
        }
    ),
    backgroundColor: colors.white,
    zIndex: 99999,
    elevation: 99999,
  },
  fullScreenMenu: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999999,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  fullScreenMenuItems: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenMenuItem: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginVertical: spacing.sm,
    width: '100%',
    alignItems: 'center',
  },
  fullScreenMenuText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fullScreenUserSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    width: '100%',
    alignItems: 'center',
  },
  fullScreenAuthSection: {
    width: '100%',
    alignItems: 'center',
  },
});

export default Navigation;