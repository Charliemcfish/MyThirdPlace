import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image as RNImage
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import { getUserProfile, getPublicProfile } from '../../services/user';
import { getCurrentUser } from '../../services/auth';
import { getUserRegularVenues } from '../../services/userVenueRelationships';
import { getUserVenues } from '../../services/venue';
import { getBlogsByAuthor } from '../../services/blog';
import Button from '../../components/common/Button';
import SecondaryButton from '../../components/common/SecondaryButton';
import ProfileHeader from '../../components/profile/ProfileHeader';
import Navigation from '../../components/common/Navigation';
import MyRegularVenues from '../../components/profile/MyRegularVenues';
import PortfolioSection from '../../components/portfolio/PortfolioSection';
import Footer from '../../components/homepage/Footer';
import VenueCard from '../../components/venues/VenueCard';
import BlogCard from '../../components/blogs/BlogCard';
import { getUserEvents } from '../../services/events';
import { Timestamp } from 'firebase/firestore';

const ViewProfileScreen = ({ navigation, route }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [socialStats, setSocialStats] = useState({ regularVenuesCount: 0, createdVenuesCount: 0, publishedBlogsCount: 0 });
  const [screenWidth, setScreenWidth] = useState(Platform.OS === 'web' ? window.innerWidth : 768);
  const [userBlogs, setUserBlogs] = useState([]);
  const [userVenues, setUserVenues] = useState([]);
  const [userRegularVenues, setUserRegularVenues] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const blogsRef = React.useRef(null);
  const venuesRef = React.useRef(null);
  const regularsRef = React.useRef(null);

  const { userId } = route.params || {};

  // Responsive breakpoints
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;

  useEffect(() => {
    console.log('ViewProfile route params:', route.params);
    console.log('Extracted userId:', userId);

    if (userId) {
      loadUserProfile();
    } else {
      setError('No user ID provided');
      setLoading(false);
    }

    if (Platform.OS === 'web') {
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [userId]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if viewing own profile
      const user = getCurrentUser();
      const isOwnProfile = user && user.uid === userId;

      let profile;
      if (isOwnProfile) {
        // Load complete profile for own profile
        profile = await getUserProfile(userId);
      } else {
        // Load public profile data only
        const fullProfile = await getUserProfile(userId);
        profile = getPublicProfile(fullProfile);
      }

      if (profile) {
        setUserProfile(profile);

        // Load social statistics for any profile (own or other user's)
        try {
          const [regularVenues, createdVenues, userBlogs, events] = await Promise.all([
            getUserRegularVenues(userId, 100),
            getUserVenues(userId, 100),
            getBlogsByAuthor(userId, true),
            getUserEvents(userId)
          ]);

          const publishedBlogs = userBlogs.filter(blog => blog.isPublished);

          setSocialStats({
            regularVenuesCount: regularVenues.length,
            createdVenuesCount: createdVenues.length,
            publishedBlogsCount: publishedBlogs.length
          });
          setUserRegularVenues(regularVenues);
          setUserVenues(createdVenues);
          setUserBlogs(publishedBlogs);
          setUserEvents(events);
        } catch (socialError) {
          console.error('Error loading social stats:', socialError);
          setSocialStats({ regularVenuesCount: 0, createdVenuesCount: 0, publishedBlogsCount: 0 });
          setUserRegularVenues([]);
          setUserVenues([]);
          setUserBlogs([]);
          setUserEvents([]);
        }
      } else {
        setError('Profile not found');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleContact = () => {
    if (userProfile?.publicEmail) {
      if (Platform.OS === 'web') {
        window.location.href = `mailto:${userProfile.publicEmail}`;
      } else {
        Alert.alert('Email', userProfile.publicEmail);
      }
    } else {
      Alert.alert('No Contact Info', 'This user has not provided public contact information.');
    }
  };

  const handleStatClick = (statType) => {
    let targetRef = null;
    switch (statType) {
      case 'blogs':
        targetRef = blogsRef;
        break;
      case 'created':
        targetRef = venuesRef;
        break;
      case 'regular':
        targetRef = regularsRef;
        break;
    }

    if (targetRef?.current) {
      if (Platform.OS === 'web') {
        targetRef.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        targetRef.current.measure((x, y, width, height, pageX, pageY) => {
          // Scroll to the component
        });
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const formatDateRange = (startTimestamp, endTimestamp) => {
    if (!startTimestamp || !endTimestamp) return '';

    const startFormatted = formatDate(startTimestamp);
    const endFormatted = formatDate(endTimestamp);

    // If same date, just show once
    if (startFormatted === endFormatted) {
      return startFormatted.toUpperCase();
    }

    return `${startFormatted} - ${endFormatted}`.toUpperCase();
  };

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.container}>
        <View style={globalStyles.headerContainer}>
          <Text style={globalStyles.headerText}>Profile Not Found</Text>
        </View>
        
        <View style={[globalStyles.containerPadded, styles.errorContainer]}>
          <Text style={globalStyles.bodyText}>{error}</Text>
          
          <Button onPress={handleGoBack} style={{ marginTop: 20 }}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  const isOwnProfile = currentUser && currentUser.uid === userId;

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />
      
      <ScrollView style={styles.scrollView}>
        <View style={globalStyles.headerContainer}>
          <View style={globalStyles.maxWidthContainer}>
            <Text style={globalStyles.headerText}>
              {isOwnProfile ? 'My Profile' : 'Profile'}
            </Text>
          </View>
        </View>

        <View style={globalStyles.maxWidthContainerPadded}>
        {userProfile && (
          <>
            {/* Profile Header with Avatar, Info, and Social Stats */}
            <View style={globalStyles.card}>
              <ProfileHeader
                profile={userProfile}
                isOwnProfile={isOwnProfile}
                onEditPress={handleEditProfile}
                showEditButton={false}
                socialStats={socialStats}
                showSocialStats={true}
                onStatClick={handleStatClick}
              />
            </View>

            {/* Desktop Layout with Sidebar */}
            <View style={isDesktop ? styles.desktopLayout : styles.mobileLayout}>

              {/* Main Content Area */}
              <View style={isDesktop ? styles.mainContent : styles.fullContent}>

                {/* Additional About Section for other users */}
                {!isOwnProfile && (
                  <View style={globalStyles.card}>
                    <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>About</Text>

                    {userProfile.bio ? (
                      <Text style={globalStyles.bodyText}>{userProfile.bio}</Text>
                    ) : (
                      <Text style={[globalStyles.bodyText, styles.placeholderText]}>
                        This user hasn't added a bio yet.
                      </Text>
                    )}

                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Text style={globalStyles.captionText}>
                          Member since {userProfile.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                        </Text>
                      </View>

                      {userProfile.isVerified && (
                        <View style={styles.statItem}>
                          <Text style={[globalStyles.captionText, styles.verifiedText]}>
                            ✓ Verified Member
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Regular Venues */}
                {socialStats.regularVenuesCount > 0 && (
                  <View style={globalStyles.card}>
                    <MyRegularVenues
                      userUID={userId}
                      maxDisplay={isDesktop ? 6 : 4}
                      showHeader={true}
                    />
                  </View>
                )}

              </View>

              {/* Desktop Sidebar */}
              {isDesktop && (
                <View style={styles.sidebar}>
                  <View style={globalStyles.card}>
                    <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>
                      {isOwnProfile ? 'Actions' : 'Community'}
                    </Text>

                    {isOwnProfile ? (
                      <Button onPress={handleEditProfile}>
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        {userProfile.publicEmail && (
                          <Button
                            onPress={handleContact}
                            style={{ marginBottom: 12 }}
                          >
                            Contact
                          </Button>
                        )}

                        <SecondaryButton
                          onPress={() => Alert.alert('Coming Soon', 'Message feature coming soon!')}
                          style={{ marginBottom: 12 }}
                        >
                          Message
                        </SecondaryButton>
                      </>
                    )}
                  </View>
                </View>
              )}

              {/* Mobile Actions */}
              {!isDesktop && (
                <View style={styles.actionContainer}>
                  {isOwnProfile ? (
                    <Button onPress={handleEditProfile}>
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      {userProfile.publicEmail && (
                        <Button onPress={handleContact}>
                          Contact
                        </Button>
                      )}

                      <SecondaryButton
                        onPress={() => Alert.alert('Coming Soon', 'Message feature coming soon!')}
                        style={{ marginTop: 12 }}
                      >
                        Message
                      </SecondaryButton>
                    </>
                  )}
                </View>
              )}

            </View>

            {/* User Content Sections */}
            {userProfile && (
              <>
                {/* Portfolio Section */}
                <PortfolioSection
                  userUID={userId}
                  isOwnProfile={isOwnProfile}
                  navigation={navigation}
                  maxDisplay={6}
                />

                {/* User's Blogs */}
                {userBlogs.length > 0 && (
                  <View style={globalStyles.card} ref={blogsRef}>
                    <Text style={[globalStyles.heading3, { marginBottom: 20 }]}>
                      Published Blogs ({userBlogs.length})
                    </Text>
                    <View style={styles.contentGrid}>
                      {userBlogs.slice(0, 6).map((blog) => (
                        <View key={blog.id} style={styles.gridItem}>
                          <BlogCard
                            blog={blog}
                            size="small"
                            showAuthor={false}
                            showCategory={true}
                          />
                        </View>
                      ))}
                    </View>
                    {userBlogs.length > 6 && (
                      <Button
                        onPress={() => navigation.navigate('BlogListings')}
                        style={{ marginTop: 16, alignSelf: 'center' }}
                      >
                        View All Blogs ({userBlogs.length})
                      </Button>
                    )}
                  </View>
                )}

                {/* User's Created Venues */}
                {userVenues.length > 0 && (
                  <View style={globalStyles.card} ref={venuesRef}>
                    <Text style={[globalStyles.heading3, { marginBottom: 20 }]}>
                      Places Added ({userVenues.length})
                    </Text>
                    <View style={styles.contentGrid}>
                      {userVenues.slice(0, 6).map((venue) => (
                        <View key={venue.id} style={styles.gridItem}>
                          <VenueCard
                            venue={venue}
                            onPress={() => navigation.navigate('VenueDetail', { venueId: venue.id })}
                          />
                        </View>
                      ))}
                    </View>
                    {userVenues.length > 6 && (
                      <Button
                        onPress={() => navigation.navigate('VenueListings')}
                        style={{ marginTop: 16, alignSelf: 'center' }}
                      >
                        View All Places ({userVenues.length})
                      </Button>
                    )}
                  </View>
                )}

                {/* User's Upcoming Events */}
                {userEvents.length > 0 && (
                  <View style={globalStyles.card}>
                    <Text style={[globalStyles.heading3, { marginBottom: 20 }]}>
                      Upcoming Events ({userEvents.length})
                    </Text>
                    <View style={styles.eventsGrid}>
                      {userEvents.map((event) => (
                        <View key={event.id} style={styles.eventCard}>
                          {event.eventImageURL && (
                            <RNImage
                              source={{ uri: event.eventImageURL }}
                              style={styles.eventImage}
                              resizeMode="cover"
                            />
                          )}
                          <View style={styles.eventCardContent}>
                            <Text style={styles.eventVenueName}>{event.venueName}</Text>
                            <View style={styles.eventDateRow}>
                              <Text style={styles.eventDate}>
                                {formatDateRange(event.startDate, event.endDate)}
                              </Text>
                              {event.isRecurring && (
                                <View style={styles.recurringBadge}>
                                  <Text style={styles.recurringBadgeText}>
                                    {event.recurrenceFrequency === 'weekly' ? 'Weekly' : 'Monthly'}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.eventName}>{event.eventName}</Text>

                            {event.bookingRequired && event.bookingLink && (
                              <TouchableOpacity
                                style={styles.eventBookingButton}
                                onPress={() => {
                                  if (Platform.OS === 'web') {
                                    window.open(event.bookingLink, '_blank');
                                  } else {
                                    Linking.openURL(event.bookingLink);
                                  }
                                }}
                              >
                                <Text style={styles.eventBookingButtonText}>
                                  {event.bookingButtonText || 'Book Now'}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              </>
            )}

            {/* Back Button */}
            <SecondaryButton onPress={handleGoBack}>
              Back
            </SecondaryButton>
          </>
        )}
        </View>
        <Footer navigation={navigation} />
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 40
  },
  actionContainer: {
    marginBottom: 20
  },
  placeholderText: {
    fontStyle: 'italic',
    color: colors.mediumGrey
  },
  statsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey
  },
  statItem: {
    marginBottom: 8
  },
  verifiedText: {
    color: colors.primary,
    fontWeight: '600'
  },
  desktopLayout: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'flex-start'
  },
  mobileLayout: {
    flexDirection: 'column'
  },
  mainContent: {
    flex: 1,
    minWidth: 0
  },
  fullContent: {
    width: '100%'
  },
  sidebar: {
    width: 320,
    flexShrink: 0
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start'
  },
  gridItem: {
    width: '31%',
    minWidth: 280
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start'
  },
  eventCard: {
    width: '48%',
    minWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightGrey,
    flexDirection: 'row'
  },
  eventImage: {
    width: 180,
    height: 140,
    backgroundColor: '#f0f0f0'
  },
  eventCardContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between'
  },
  eventVenueName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap'
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    letterSpacing: 0.5
  },
  recurringBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  recurringBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 22
  },
  eventBookingButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  eventBookingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  }
};

export default ViewProfileScreen;