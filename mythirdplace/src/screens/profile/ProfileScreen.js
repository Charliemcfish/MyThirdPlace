import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image as RNImage
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import VenueCard from '../../components/venues/VenueCard';
import BlogCard from '../../components/blogs/BlogCard';
import { logoutUser, getCurrentUser } from '../../services/auth';
import { getUserProfile, getPublicProfile } from '../../services/user';
import { getBlogsByAuthor } from '../../services/blog';
import { getUserRegularVenues } from '../../services/userVenueRelationships';
import { getUserVenues } from '../../services/venue';
import Button from '../../components/common/Button';
import SecondaryButton from '../../components/common/SecondaryButton';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileCompletion from '../../components/profile/ProfileCompletion';
import Navigation from '../../components/common/Navigation';
import SocialStats from '../../components/social/SocialStats';
import MyRegularVenues from '../../components/profile/MyRegularVenues';
import CommunityLevel from '../../components/social/CommunityLevel';
import PortfolioSection from '../../components/portfolio/PortfolioSection';
import Footer from '../../components/homepage/Footer';
import EventFormModal from '../../components/events/EventFormModal';
import { createEvent, getUserEvents } from '../../services/events';

const ProfileScreen = ({ navigation }) => {
  useDocumentTitle('My Profile');

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewAsPublic, setViewAsPublic] = useState(false);
  const [blogStats, setBlogStats] = useState({ published: 0, drafts: 0, totalViews: 0 });
  const [socialStats, setSocialStats] = useState({ regularVenuesCount: 0, createdVenuesCount: 0 });
  const [screenWidth, setScreenWidth] = useState(Platform.OS === 'web' ? window.innerWidth : 768);
  const [userBlogs, setUserBlogs] = useState([]);
  const [userVenues, setUserVenues] = useState([]);
  const [userRegularVenues, setUserRegularVenues] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const blogsRef = React.useRef(null);
  const venuesRef = React.useRef(null);
  const regularsRef = React.useRef(null);
  const [selectedVenueForEvent, setSelectedVenueForEvent] = useState(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    loadUserProfile();

    if (Platform.OS === 'web') {
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserProfile();
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);

        // Load blog statistics and blogs
        try {
          const userBlogsData = await getBlogsByAuthor(currentUser.uid, true);
          const published = userBlogsData.filter(blog => blog.isPublished);
          const drafts = userBlogsData.filter(blog => blog.isDraft);
          const totalViews = published.reduce((sum, blog) => sum + (blog.viewCount || 0), 0);

          setBlogStats({
            published: published.length,
            drafts: drafts.length,
            totalViews: totalViews
          });
          setUserBlogs(published); // Only show published blogs in profile
        } catch (blogError) {
          console.error('Error loading blog statistics:', blogError);
          setBlogStats({ published: 0, drafts: 0, totalViews: 0 });
          setUserBlogs([]);
        }

        // Load social statistics and venues
        try {
          const [regularVenues, createdVenues] = await Promise.all([
            getUserRegularVenues(currentUser.uid, 100),
            getUserVenues(currentUser.uid, 100)
          ]);

          setSocialStats({
            regularVenuesCount: regularVenues.length,
            createdVenuesCount: createdVenues.length
          });
          setUserRegularVenues(regularVenues);
          setUserVenues(createdVenues);

          // Load user events
          try {
            const events = await getUserEvents(currentUser.uid);
            setUserEvents(events);
          } catch (eventsError) {
            console.error('Error loading events:', eventsError);
            setUserEvents([]);
          }
        } catch (socialError) {
          console.error('Error loading social statistics:', socialError);
          setSocialStats({ regularVenuesCount: 0, createdVenuesCount: 0 });
          setUserRegularVenues([]);
          setUserVenues([]);
          setUserEvents([]);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('handleLogout function called');
    
    if (Platform.OS === 'web') {
      // Use web confirm for web platform
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        try {
          console.log('User confirmed logout, starting process...');
          setLoading(true);
          await logoutUser();
          console.log('Logout successful');
        } catch (error) {
          console.error('Logout error:', error);
          alert('Failed to sign out. Please try again.');
          setLoading(false);
        }
      } else {
        console.log('User cancelled logout');
      }
    } else {
      // Use React Native Alert for mobile
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            onPress: async () => {
              try {
                console.log('User confirmed logout, starting process...');
                setLoading(true);
                await logoutUser();
                console.log('Logout successful');
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to sign out. Please try again.');
                setLoading(false);
              }
            },
          },
        ]
      );
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userProfile });
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

  const handleSaveEvent = async (eventData, imageFile = null) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to create events');
      return;
    }

    try {
      await createEvent(eventData, currentUser.uid, imageFile);
      Alert.alert('Success', 'Event created successfully');
      setEventModalVisible(false);
      setSelectedVenueForEvent(null);
      setEditingEvent(null);
      // Reload events
      const events = await getUserEvents(currentUser.uid);
      setUserEvents(events);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error; // Let the modal handle the error
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this event?');
      if (!confirmed) return;
    } else {
      Alert.alert(
        'Delete Event',
        'Are you sure you want to delete this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => await performDelete()
          }
        ]
      );
      return;
    }

    await performDelete();

    async function performDelete() {
      try {
        const { deleteEvent } = await import('../../services/events');
        await deleteEvent(eventId, currentUser.uid);
        Alert.alert('Success', 'Event deleted successfully');
        // Reload events
        const events = await getUserEvents(currentUser.uid);
        setUserEvents(events);
      } catch (error) {
        console.error('Error deleting event:', error);
        Alert.alert('Error', error.message || 'Failed to delete event');
      }
    }
  };

  const formatDateRange = (startTimestamp, endTimestamp) => {
    if (!startTimestamp || !endTimestamp) return '';

    const formatDate = (timestamp) => {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    };

    const startFormatted = formatDate(startTimestamp);
    const endFormatted = formatDate(endTimestamp);

    if (startFormatted === endFormatted) {
      return startFormatted.toUpperCase();
    }

    return `${startFormatted} - ${endFormatted}`.toUpperCase();
  };

  // Get the profile to display based on view mode
  const getDisplayProfile = () => {
    if (!userProfile) return null;
    return viewAsPublic ? getPublicProfile(userProfile) : userProfile;
  };

  const displayProfile = getDisplayProfile();

  // Responsive breakpoints
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />
      
      <ScrollView style={styles.scrollView}>
        <View style={globalStyles.headerContainer}>
          <View style={globalStyles.maxWidthContainer}>
            <Text style={globalStyles.headerText}>
              {viewAsPublic ? 'Public Profile Preview' : 'My Profile'}
            </Text>
            
            {/* View Toggle */}
            {userProfile && (
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>View as public</Text>
                <Switch
                  value={viewAsPublic}
                  onValueChange={setViewAsPublic}
                  trackColor={{ false: colors.lightGrey, true: colors.primary }}
                  thumbColor={viewAsPublic ? colors.white : colors.mediumGrey}
                />
              </View>
            )}
          </View>
        </View>

        <View style={globalStyles.maxWidthContainerPadded}>
        {displayProfile && (
          <>
            {/* Profile Header with Avatar, Info, and Social Stats */}
            <View style={globalStyles.card}>
              <ProfileHeader
                profile={displayProfile}
                isOwnProfile={!viewAsPublic}
                onEditPress={handleEditProfile}
                showEditButton={false}
                socialStats={{
                  regularVenuesCount: socialStats.regularVenuesCount,
                  createdVenuesCount: socialStats.createdVenuesCount,
                  publishedBlogsCount: blogStats.published
                }}
                showSocialStats={true}
                onStatClick={handleStatClick}
              />
            </View>

            {/* Desktop Layout with Sidebar */}
            <View style={isDesktop ? styles.desktopLayout : styles.mobileLayout}>

              {/* Main Content Area */}
              <View style={isDesktop ? styles.mainContent : styles.fullContent}>

                {/* Show different content based on view mode */}
                {viewAsPublic ? (
                  <>
                    {/* Public View - What others see */}
                    <View style={[globalStyles.card, styles.publicViewNotice]}>
                      <Text style={styles.publicViewTitle}>👁️ Public View</Text>
                      <Text style={globalStyles.bodyText}>
                        This is how your profile appears to other users. Private information like your login email and account settings are hidden.
                      </Text>

                      {!displayProfile.publicEmail && userProfile.publicEmail && (
                        <Text style={[globalStyles.captionText, { marginTop: 8, fontStyle: 'italic' }]}>
                          Note: Your public email is hidden because you haven't enabled "Show public email" in your settings.
                        </Text>
                      )}
                    </View>

                {/* Additional Info for Public View */}
                <View style={globalStyles.card}>
                  <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>About</Text>
                  
                  {displayProfile.bio ? (
                    <Text style={globalStyles.bodyText}>{displayProfile.bio}</Text>
                  ) : (
                    <Text style={[globalStyles.bodyText, styles.placeholderText]}>
                      This user hasn't added a bio yet.
                    </Text>
                  )}

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={globalStyles.captionText}>
                        Member since {displayProfile.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </Text>
                    </View>
                    
                    {blogStats.published > 0 && (
                      <View style={styles.statItem}>
                        <Text style={globalStyles.captionText}>
                          {blogStats.published} blog {blogStats.published === 1 ? 'post' : 'posts'} published
                        </Text>
                      </View>
                    )}
                    
                    {displayProfile.isVerified && (
                      <View style={styles.statItem}>
                        <Text style={[globalStyles.captionText, styles.verifiedText]}>
                          ✓ Verified Member
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Portfolio Section in Public View */}
                <PortfolioSection
                  userUID={userProfile?.uid}
                  isOwnProfile={false}
                  navigation={navigation}
                  maxDisplay={6}
                />

                {/* Third Places in Public View */}
                {socialStats.regularVenuesCount > 0 && (
                  <View style={globalStyles.card}>
                    <MyRegularVenues
                      maxDisplay={4}
                      showHeader={true}
                      userUID={userProfile?.uid}
                    />
                  </View>
                )}

                {/* Actions that others would see */}
                <View style={styles.publicActionsContainer}>
                  {displayProfile.publicEmail && (
                    <Button onPress={() => Alert.alert('Demo', `Others would see: Contact ${displayProfile.displayName}`)}>
                      Contact
                    </Button>
                  )}
                  
                  <SecondaryButton 
                    onPress={() => Alert.alert('Demo', 'Others would see: Message feature coming soon!')}
                    style={{ marginTop: 12 }}
                  >
                    Message
                  </SecondaryButton>
                </View>
              </>
            ) : (
              <>
                {/* Private View - Your full profile */}
                {/* Profile Completion Indicator */}
                <ProfileCompletion 
                  profile={userProfile}
                  onEditPress={handleEditProfile}
                />

                {/* Edit Profile Button */}
                <Button onPress={handleEditProfile} style={{ marginBottom: 16 }}>
                  Edit Profile
                </Button>

                {/* Portfolio Section in Private View */}
                <PortfolioSection
                  userUID={userProfile?.uid}
                  isOwnProfile={true}
                  navigation={navigation}
                  maxDisplay={6}
                />

                {/* My Regular Venues */}
                {socialStats.regularVenuesCount > 0 && (
                  <View style={globalStyles.card}>
                    <MyRegularVenues
                      maxDisplay={6}
                      showHeader={true}
                    />
                  </View>
                )}
                  </>
                )}

              </View>

              {/* Desktop Sidebar */}
              {isDesktop && (
                <View style={styles.sidebar}>
                  {!viewAsPublic ? (
                    // Account Actions for Own Profile
                    <View style={globalStyles.card}>
                      <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>Account</Text>

                      <View style={styles.accountButtonsGrid}>
                        <SecondaryButton
                          style={styles.accountButton}
                          textStyle={styles.accountButtonText}
                          onPress={() => navigation.navigate('VenueListings')}
                        >
                          Browse Third Places
                        </SecondaryButton>

                        <SecondaryButton
                          style={styles.accountButton}
                          textStyle={styles.accountButtonText}
                          onPress={() => navigation.navigate('CreateVenue')}
                        >
                          Add a Third Place
                        </SecondaryButton>

                        <SecondaryButton
                          style={styles.accountButton}
                          textStyle={styles.accountButtonText}
                          onPress={() => navigation.navigate('BlogListings')}
                        >
                          Browse Blogs
                        </SecondaryButton>

                        <SecondaryButton
                          style={styles.accountButton}
                          textStyle={styles.accountButtonText}
                          onPress={() => navigation.navigate('MyBlogs')}
                        >
                          My Blogs ({blogStats.published} published, {blogStats.drafts} drafts)
                        </SecondaryButton>

                        <SecondaryButton
                          style={styles.accountButton}
                          textStyle={styles.accountButtonText}
                          onPress={() => navigation.navigate('CreateBlog')}
                        >
                          Write New Blog Post
                        </SecondaryButton>

                        <SecondaryButton
                          style={styles.accountButton}
                          textStyle={styles.accountButtonText}
                          onPress={() => navigation.navigate('CreatePortfolio')}
                        >
                          Add Portfolio Item
                        </SecondaryButton>

                        <SecondaryButton
                          style={[styles.accountButton, styles.signOutButton]}
                          textStyle={{ color: colors.error }}
                          onPress={handleLogout}
                        >
                          Sign Out
                        </SecondaryButton>
                      </View>
                    </View>
                  ) : (
                    // Community Actions for Public View
                    <View style={globalStyles.card}>
                      <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>Community</Text>

                      {displayProfile.publicEmail && (
                        <Button
                          onPress={() => Alert.alert('Demo', `Others would see: Contact ${displayProfile.displayName}`)}
                          style={{ marginBottom: 12 }}
                        >
                          Contact
                        </Button>
                      )}

                      <SecondaryButton
                        onPress={() => Alert.alert('Demo', 'Others would see: Message feature coming soon!')}
                        style={{ marginBottom: 12 }}
                      >
                        Message
                      </SecondaryButton>
                    </View>
                  )}
                </View>
              )}


            </View>

            {/* User Content Sections */}
            {displayProfile && (
              <>
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
                        onPress={() => navigation.navigate('MyBlogs')}
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
                          <TouchableOpacity
                            style={profileStyles.addEventButtonSmall}
                            onPress={() => {
                              setSelectedVenueForEvent(venue);
                              setEventModalVisible(true);
                            }}
                          >
                            <Text style={profileStyles.addEventButtonTextSmall}>Add Event</Text>
                          </TouchableOpacity>
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

                {/* Upcoming Events Section */}
                {userEvents.length > 0 && (
                  <View style={globalStyles.card}>
                    <Text style={[globalStyles.heading3, { marginBottom: 20 }]}>
                      Upcoming Events
                    </Text>
                    <View style={styles.eventsGrid}>
                      {userEvents.map((event) => (
                        <View key={event.id} style={profileStyles.eventCard}>
                          {event.eventImageURL && (
                            <RNImage
                              source={{ uri: event.eventImageURL }}
                              style={profileStyles.eventImage}
                              resizeMode="cover"
                            />
                          )}
                          <View style={profileStyles.eventCardInner}>
                            <Text style={profileStyles.eventVenueName}>{event.venueName}</Text>
                            <View style={profileStyles.eventDateRow}>
                              <Text style={profileStyles.eventDate}>
                                {formatDateRange(event.startDate, event.endDate)}
                              </Text>
                              {event.isRecurring && (
                                <View style={profileStyles.recurringBadge}>
                                  <Text style={profileStyles.recurringBadgeText}>
                                    {event.recurrenceFrequency === 'weekly' ? 'Weekly' : 'Monthly'}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={profileStyles.eventName}>{event.eventName}</Text>

                            <View style={profileStyles.eventButtons}>
                            {event.bookingRequired && event.bookingLink && (
                              <TouchableOpacity
                                style={profileStyles.eventBookingButton}
                                onPress={() => {
                                  if (Platform.OS === 'web') {
                                    window.open(event.bookingLink, '_blank');
                                  } else {
                                    Linking.openURL(event.bookingLink);
                                  }
                                }}
                              >
                                <Text style={profileStyles.eventBookingButtonText}>
                                  {event.bookingButtonText || 'Book Now'}
                                </Text>
                              </TouchableOpacity>
                            )}

                            <View style={profileStyles.eventManageButtons}>
                              <TouchableOpacity
                                style={profileStyles.editEventButton}
                                onPress={async () => {
                                  // If recurring instance, load master event
                                  if (event.masterEventId) {
                                    try {
                                      const { doc, getDoc } = await import('firebase/firestore');
                                      const { db } = await import('../../services/firebase');
                                      const eventDoc = await getDoc(doc(db, 'events', event.masterEventId));
                                      if (eventDoc.exists()) {
                                        setEditingEvent({ id: eventDoc.id, ...eventDoc.data() });
                                      } else {
                                        setEditingEvent(event);
                                      }
                                    } catch (error) {
                                      console.error('Error loading master event:', error);
                                      setEditingEvent(event);
                                    }
                                  } else {
                                    setEditingEvent(event);
                                  }
                                  setSelectedVenueForEvent({ id: event.venueId, name: event.venueName });
                                  setEventModalVisible(true);
                                }}
                              >
                                <Text style={profileStyles.editEventButtonText}>Edit</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={profileStyles.deleteEventButton}
                                onPress={() => handleDeleteEvent(event.masterEventId || event.id)}
                              >
                                <Text style={profileStyles.deleteEventButtonText}>Delete</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              </>
            )}

            {/* Mobile Account/Community Actions - Moved to Bottom */}
            {!isDesktop && (
              <>
                {!viewAsPublic ? (
                  <View style={globalStyles.card}>
                    <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>Account</Text>

                    <View style={styles.accountButtonsGrid}>
                      <SecondaryButton
                        style={styles.accountButton}
                        textStyle={styles.accountButtonText}
                        onPress={() => navigation.navigate('VenueListings')}
                      >
                        Browse Third Places
                      </SecondaryButton>

                      <SecondaryButton
                        style={styles.accountButton}
                        textStyle={styles.accountButtonText}
                        onPress={() => navigation.navigate('CreateVenue')}
                      >
                        Add a Third Place
                      </SecondaryButton>

                      <SecondaryButton
                        style={styles.accountButton}
                        textStyle={styles.accountButtonText}
                        onPress={() => navigation.navigate('BlogListings')}
                      >
                        Browse Blogs
                      </SecondaryButton>

                      <SecondaryButton
                        style={styles.accountButton}
                        textStyle={styles.accountButtonText}
                        onPress={() => navigation.navigate('MyBlogs')}
                      >
                        My Blogs ({blogStats.published} published, {blogStats.drafts} drafts)
                      </SecondaryButton>

                      <SecondaryButton
                        style={styles.accountButton}
                        textStyle={styles.accountButtonText}
                        onPress={() => navigation.navigate('CreateBlog')}
                      >
                        Write New Blog Post
                      </SecondaryButton>

                      <SecondaryButton
                        style={styles.accountButton}
                        textStyle={styles.accountButtonText}
                        onPress={() => navigation.navigate('CreatePortfolio')}
                      >
                        Add Portfolio Item
                      </SecondaryButton>

                      <SecondaryButton
                        style={[styles.accountButton, styles.signOutButton]}
                        textStyle={{ color: colors.error }}
                        onPress={handleLogout}
                      >
                        Sign Out
                      </SecondaryButton>
                    </View>
                  </View>
                ) : (
                  <View style={styles.publicActionsContainer}>
                    {displayProfile.publicEmail && (
                      <Button onPress={() => Alert.alert('Demo', `Others would see: Contact ${displayProfile.displayName}`)}>
                        Contact
                      </Button>
                    )}

                    <SecondaryButton
                      onPress={() => Alert.alert('Demo', 'Others would see: Message feature coming soon!')}
                      style={{ marginTop: 12 }}
                    >
                      Message
                    </SecondaryButton>
                  </View>
                )}
              </>
            )}
          </>
        )}
        </View>
        <Footer navigation={navigation} />
      </ScrollView>

      {/* Event Form Modal */}
      <EventFormModal
        visible={eventModalVisible}
        onClose={() => {
          setEventModalVisible(false);
          setSelectedVenueForEvent(null);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        venueId={selectedVenueForEvent?.id}
        venueName={selectedVenueForEvent?.name}
        editingEvent={editingEvent}
      />
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8
  },
  toggleLabel: {
    fontSize: 14,
    color: colors.mediumGrey,
    fontWeight: '500'
  },
  publicViewNotice: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.primary,
    borderWidth: 1
  },
  publicViewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8
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
  publicActionsContainer: {
    marginBottom: 20
  },
  communityLevelContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  desktopLayout: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'flex-start'
  },
  mobileLayout: {
    flexDirection: 'column'
  },
  eventsGrid: {
    gap: 12
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
  accountButtonsGrid: {
    gap: 8
  },
  accountButton: {
    marginVertical: 4,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#005040',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0, 101, 72, 0.2)'
      }
    })
  },
  accountButtonText: {
    color: colors.white,
    fontWeight: '600'
  },
  signOutButton: {
    backgroundColor: colors.white,
    borderColor: colors.error,
    marginTop: 8
  }
};

const profileStyles = StyleSheet.create({
  addEventButtonSmall: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center'
  },
  addEventButtonTextSmall: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600'
  },
  eventCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    overflow: 'hidden'
  },
  eventCardInner: {
    flex: 1,
    padding: 16
  },
  eventVenueName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap'
  },
  eventDate: {
    fontSize: 11,
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
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12
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
  },
  eventImage: {
    width: 200,
    height: 140,
    backgroundColor: '#f0f0f0'
  },
  eventButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    flexWrap: 'wrap'
  },
  eventManageButtons: {
    flexDirection: 'row',
    gap: 8
  },
  editEventButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center'
  },
  editEventButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600'
  },
  deleteEventButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center'
  },
  deleteEventButtonText: {
    color: '#e74c3c',
    fontSize: 13,
    fontWeight: '600'
  }
});

export default ProfileScreen;