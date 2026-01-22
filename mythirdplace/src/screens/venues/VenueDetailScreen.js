import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Alert,
  Pressable,
  Platform,
  Dimensions,
  Animated,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import { getVenue, incrementViewCount, getUserVenues } from '../../services/venue';
import { getUserProfile } from '../../services/user';
import { getCurrentUser } from '../../services/auth';
import { getRegularCount, getUserRegularVenues } from '../../services/userVenueRelationships';
import { getBlogsByAuthor } from '../../services/blog';
import Button from '../../components/common/Button';
import SecondaryButton from '../../components/common/SecondaryButton';
import CategoryBadge from '../../components/common/CategoryBadge';
import VenueGallery from '../../components/venues/VenueGallery';
import Avatar from '../../components/common/Avatar';
import Navigation from '../../components/common/Navigation';
import VenueMap from '../../components/maps/VenueMap';
import VenueMapModal from '../../components/maps/VenueMapModal';
import VenueTagsDisplay from '../../components/venues/enhanced/VenueTagsDisplay';
import EnhancedContactInfo from '../../components/venues/enhanced/EnhancedContactInfo';
import MultipleLocationsDisplay from '../../components/venues/enhanced/MultipleLocationsDisplay';
import RegularButton from '../../components/social/RegularButton';
import RegularCount from '../../components/social/RegularCount';
import VenueRegulars from '../../components/social/VenueRegulars';
import SocialProof from '../../components/social/SocialProof';
import CommunityLevel from '../../components/social/CommunityLevel';
import VenueBlogs from '../../components/venues/VenueBlogs';
import Footer from '../../components/homepage/Footer';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import ClaimListingButton from '../../components/claims/ClaimListingButton';
import VerificationStatus from '../../components/claims/VerificationStatus';
import { hasUserClaimedVenue, getUserClaims } from '../../services/claimsManagement';
import VenueEventsDisplay from '../../components/events/VenueEventsDisplay';
import EventFormModal from '../../components/events/EventFormModal';
import { createEvent } from '../../services/events';

const VenueDetailScreen = ({ navigation, route }) => {
  const [venue, setVenue] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const successAnimation = useRef(new Animated.Value(0)).current;
  const [regularCountKey, setRegularCountKey] = useState(0);
  const [socialProofData, setSocialProofData] = useState({ regularCount: 0, isPopular: false, isTrending: false });
  const [creatorSocialStats, setCreatorSocialStats] = useState({ regularVenuesCount: 0, createdVenuesCount: 0, publishedBlogsCount: 0 });
  const [hasExistingClaim, setHasExistingClaim] = useState(false);
  const [userClaim, setUserClaim] = useState(null);
  const [verifiedOwner, setVerifiedOwner] = useState(null);
  const [ownerSocialStats, setOwnerSocialStats] = useState({ regularVenuesCount: 0, createdVenuesCount: 0, publishedBlogsCount: 0 });
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);

  const { venueId, showSuccessMessage: initialShowSuccess, venueName, showClaimSuccess } = route.params || {};
  const screenWidth = Dimensions.get('window').width;

  // Set dynamic page title
  useDocumentTitle(venue?.name || venueName || 'Venue Details');
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;
  const isSmallMobile = screenWidth < 480;

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (venueId) {
      loadVenue();
    } else {
      setError('No venue ID provided');
      setLoading(false);
    }

    // Show success message if navigated from venue creation or claim submission
    if (initialShowSuccess || showClaimSuccess) {
      setShowSuccessMessage(true);
      // Start success animation
      Animated.sequence([
        Animated.timing(successAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(successAnimation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowSuccessMessage(false);
      });
    }
  }, [venueId, initialShowSuccess, showClaimSuccess]);

  const loadVenue = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load venue data
      const venueData = await getVenue(venueId);
      if (!venueData) {
        setError('Venue not found');
        return;
      }

      setVenue(venueData);

      // Increment view count
      incrementViewCount(venueId);

      // Load creator profile and social proof data
      const promises = [];

      if (venueData.createdBy) {
        promises.push(
          getUserProfile(venueData.createdBy).catch(error => {
            console.error('Error loading creator profile:', error);
            return null;
          })
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      // Load social proof data
      promises.push(
        getRegularCount(venueId).catch(error => {
          console.error('Error loading regular count:', error);
          return 0;
        })
      );

      const [creatorProfile, regularCount] = await Promise.all(promises);

      if (creatorProfile) {
        setCreator(creatorProfile);

        // Load creator's social stats (limited to reduce load)
        try {
          const [creatorRegularVenues, creatorCreatedVenues, creatorBlogs] = await Promise.all([
            getUserRegularVenues(creatorProfile.uid, 20),
            getUserVenues(creatorProfile.uid, 20),
            getBlogsByAuthor(creatorProfile.uid, true)
          ]);

          const publishedBlogs = creatorBlogs.filter(blog => blog.isPublished);

          setCreatorSocialStats({
            regularVenuesCount: creatorRegularVenues.length,
            createdVenuesCount: creatorCreatedVenues.length,
            publishedBlogsCount: publishedBlogs.length
          });
        } catch (socialError) {
          console.error('Error loading creator social stats:', socialError);
          setCreatorSocialStats({ regularVenuesCount: 0, createdVenuesCount: 0, publishedBlogsCount: 0 });
        }
      }

      // Set social proof data
      setSocialProofData({
        regularCount,
        isPopular: regularCount >= 20,
        isTrending: false // This would be determined by recent activity
      });

      // Check if user has claimed this venue
      const user = getCurrentUser();
      if (user) {
        const hasClaim = await hasUserClaimedVenue(user.uid, venueId);
        setHasExistingClaim(hasClaim);

        // Get user's claim details if they have one
        if (hasClaim) {
          const userClaims = await getUserClaims(user.uid);
          const venueClaim = userClaims.find(claim => claim.venueId === venueId);
          setUserClaim(venueClaim);
        }
      }

      // Load verified owner if venue is verified
      if (venueData.claimStatus === 'verified' && venueData.verifiedOwner) {
        try {
          const ownerProfile = await getUserProfile(venueData.verifiedOwner);
          if (ownerProfile) {
            setVerifiedOwner(ownerProfile);

            // Load owner's social stats (limited to reduce load)
            const [ownerRegularVenues, ownerCreatedVenues, ownerBlogs] = await Promise.all([
              getUserRegularVenues(ownerProfile.uid, 20),
              getUserVenues(ownerProfile.uid, 20),
              getBlogsByAuthor(ownerProfile.uid, true)
            ]);

            const ownerPublishedBlogs = ownerBlogs.filter(blog => blog.isPublished);

            setOwnerSocialStats({
              regularVenuesCount: ownerRegularVenues.length,
              createdVenuesCount: ownerCreatedVenues.length,
              publishedBlogsCount: ownerPublishedBlogs.length
            });
          }
        } catch (ownerError) {
          console.error('Error loading verified owner:', ownerError);
        }
      }
    } catch (error) {
      console.error('Error loading venue:', error);
      setError('Failed to load venue details');
    } finally {
      setLoading(false);
    }
  };

  const handleContactCreator = () => {
    if (!creator) return;
    
    if (creator.publicEmail && creator.showPublicEmail) {
      if (Platform.OS === 'web') {
        window.location.href = `mailto:${creator.publicEmail}?subject=About ${venue.name}`;
      } else {
        Alert.alert('Contact', `Email: ${creator.publicEmail}`);
      }
    } else {
      Alert.alert('No Contact Info', 'This user has not provided public contact information.');
    }
  };

  const handleViewCreatorProfile = () => {
    if (creator) {
      // Check if viewing own profile
      if (currentUser && currentUser.uid === creator.uid) {
        navigation.navigate('Profile');
      } else {
        navigation.navigate('ViewProfile', { userId: creator.uid });
      }
    }
  };

  const handleViewOwnerProfile = () => {
    if (verifiedOwner) {
      // Check if viewing own profile
      if (currentUser && currentUser.uid === verifiedOwner.uid) {
        navigation.navigate('Profile');
      } else {
        navigation.navigate('ViewProfile', { userId: verifiedOwner.uid });
      }
    }
  };

  const handleShare = () => {
    if (Platform.OS === 'web') {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: venue.name,
          text: venue.description,
          url: url
        });
      } else {
        navigator.clipboard.writeText(url);
        Alert.alert('Link Copied', 'Venue link copied to clipboard!');
      }
    } else {
      Alert.alert('Coming Soon', 'Sharing feature coming soon!');
    }
  };

  const handleRegularStatusChange = async (newStatus) => {
    // Force refresh of regular count and regulars display
    setRegularCountKey(prev => prev + 1);

    // Update social proof data
    try {
      const updatedRegularCount = await getRegularCount(venueId);
      setSocialProofData(prev => ({
        ...prev,
        regularCount: updatedRegularCount,
        isPopular: updatedRegularCount >= 20
      }));
    } catch (error) {
      console.error('Error updating social proof data:', error);
    }
  };

  const handleClaimListing = () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please log in to claim this venue listing.');
      navigation.navigate('Login');
      return;
    }

    navigation.navigate('ClaimListing', {
      venue: venue,
      user: currentUser
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const formatAddress = () => {
    if (!venue.address) return 'Address not available';
    return venue.address.fullAddress || 'Address not complete';
  };

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading venue details...</Text>
      </View>
    );
  }

  if (error || !venue) {
    return (
      <View style={globalStyles.container}>
        <View style={globalStyles.headerContainer}>
          <Text style={globalStyles.headerText}>Venue Not Found</Text>
        </View>
        
        <View style={[globalStyles.containerPadded, styles.errorContainer]}>
          <Text style={styles.errorIcon}>🏢</Text>
          <Text style={globalStyles.bodyText}>{error || 'This venue could not be found.'}</Text>
          
          <Button onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  const isOwnVenue = currentUser && currentUser.uid === venue.createdBy;

  // Check if user is venue owner (creator or verified owner)
  const isVenueOwner = currentUser && (
    currentUser.uid === venue.createdBy ||
    currentUser.uid === venue.verifiedOwner
  );

  // Handle save event
  const handleSaveEvent = async (eventData, imageFile) => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to create events');
      return;
    }

    try {
      await createEvent(eventData, currentUser.uid, imageFile);
      Alert.alert('Success', 'Event created successfully');
      setEventModalVisible(false);
      setEditingEvent(null);
      // Trigger events refresh
      setEventsRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error; // Let the modal handle the error
    }
  };

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />
      
      <ScrollView style={styles.scrollView}>
        <View style={globalStyles.headerContainer}>
          <View style={globalStyles.maxWidthContainer}>
            <Text style={globalStyles.headerText}>{venue.name}</Text>
          </View>
        </View>

        {/* Success Message Overlay */}
      {showSuccessMessage && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successAnimation,
              transform: [
                {
                  translateY: successAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.successMessage}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>
              {showClaimSuccess ? 'Claim Request Submitted!' : 'Your venue is now live!'}
            </Text>
            <Text style={styles.successSubtitle}>
              {showClaimSuccess
                ? 'Your claim request will be reviewed soon. You will receive an email notification.'
                : `${venueName || 'Your venue'} has been successfully added to MyThirdPlace`}
            </Text>
          </View>
        </Animated.View>
      )}

        <View style={globalStyles.maxWidthContainerPadded}>
        <View style={isDesktop ? styles.desktopMainLayout : (isTablet ? styles.tabletMainLayout : styles.mobileGridLayout)}>
          {/* Left Side - Images, Title, About */}
          <View style={isDesktop ? styles.leftSection : (isTablet ? styles.tabletLeftSection : styles.mobileContentGrid)}>
            {/* Owner Event Banner */}
            {isVenueOwner && (
              <View style={styles.ownerBanner}>
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerText}>
                    Let members know about upcoming events at your venue!
                  </Text>
                  <TouchableOpacity
                    style={styles.addEventButton}
                    onPress={() => setEventModalVisible(true)}
                  >
                    <Text style={styles.addEventButtonText}>Add Event</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Photo Gallery */}
            <VenueGallery 
              photos={venue.photos}
              venueName={venue.name}
              mainImageHeight={isDesktop ? 400 : (isTablet ? 300 : 250)}
              style={{ marginBottom: 24 }}
            />

            {/* Venue Header */}
            <View style={[globalStyles.card, { marginBottom: 32 }]}>
              <View style={styles.venueHeader}>
                <View style={styles.venueTitle}>
                  <Text style={globalStyles.heading2}>{venue.name}</Text>
                  <CategoryBadge categoryId={venue.category} size="medium" />
                </View>

                <View style={styles.venueStats}>
                  {venue.viewCount > 0 && (
                    <Text style={styles.viewCount}>
                      {venue.viewCount} view{venue.viewCount !== 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
              </View>

              <Text style={styles.address}>📍 {formatAddress()}</Text>

              {/* Social Proof */}
              <SocialProof
                regularCount={socialProofData.regularCount}
                isPopular={socialProofData.isPopular}
                isTrending={socialProofData.isTrending}
                style={styles.socialProof}
              />

              {/* Verification Status */}
              <VerificationStatus
                venue={venue}
                userClaim={userClaim}
                isOwner={isOwnVenue}
              />

              {/* Social Actions */}
              <View style={styles.socialActions}>
                <RegularButton
                  venue={venue}
                  onStatusChange={handleRegularStatusChange}
                  size="normal"
                  style={styles.regularButton}
                />
                <RegularCount
                  key={regularCountKey}
                  venueId={venue.id}
                  size="normal"
                  style={styles.regularCount}
                />
              </View>

              {/* Claim Listing Button - Only show on visitor-created, non-verified venues */}
              {!venue.isOwnerCreated && venue.claimStatus !== 'verified' && (
                <ClaimListingButton
                  onPress={handleClaimListing}
                  hasExistingClaim={hasExistingClaim}
                  isVerified={venue.claimStatus === 'verified'}
                  isOwner={isOwnVenue}
                />
              )}
            </View>

            {/* Description */}
            <View style={[globalStyles.card, { marginBottom: 32 }]}>
              <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>
                About This Place
              </Text>
              <Text style={[globalStyles.bodyText, styles.description]}>
                {venue.description}
              </Text>
              
              {/* Display ownership type */}
              {venue.isOwnerCreated ? (
                <View style={styles.ownershipBadge}>
                  <Text style={styles.ownershipIcon}>🏢</Text>
                  <Text style={styles.ownershipText}>Listed by venue owner</Text>
                </View>
              ) : (
                <View style={styles.ownershipBadge}>
                  <Text style={styles.ownershipIcon}>👥</Text>
                  <Text style={styles.ownershipText}>Listed by visitor</Text>
                </View>
              )}
            </View>

            {/* Amenities & Tags */}
            {venue.tags && venue.tags.length > 0 && (
              <View style={[globalStyles.card, { marginBottom: 32 }]}>
                <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>
                  Amenities & Features
                </Text>
                <VenueTagsDisplay tags={venue.tags} />
              </View>
            )}

            {/* Contact Information */}
            <EnhancedContactInfo venue={venue} />

            {/* Multiple Locations */}
            <MultipleLocationsDisplay venue={venue} />

            {/* Action Buttons - Mobile only */}
            {isMobile && (
              <View style={[styles.actionContainer, globalStyles.card]}>
                <Button 
                  onPress={handleShare}
                  style={styles.actionButton}
                >
                  Share This Place
                </Button>
                
                {creator && creator.publicEmail && creator.showPublicEmail && (
                  <SecondaryButton 
                    onPress={handleContactCreator}
                    style={styles.actionButton}
                  >
                    Contact Creator
                  </SecondaryButton>
                )}
              </View>
            )}
          </View>

          {/* Right Side - Added By, Details, Community */}
          <View style={isDesktop ? styles.rightSection : (isTablet ? styles.tabletRightSection : styles.mobileSidebarGrid)}>
            {/* Verified Owner Info - Show if venue is verified */}
            {verifiedOwner && venue.claimStatus === 'verified' && (
              <View style={[globalStyles.card, isMobile && styles.mobileGridCard, { marginBottom: 32 }]}>
                <View style={styles.ownerHeader}>
                  <Text style={[globalStyles.heading4, { marginBottom: 0 }]}>
                    Owner of Venue
                  </Text>
                  <View style={styles.verifiedBadgeSmall}>
                    <Text style={styles.verifiedBadgeTextSmall}>✓ Verified</Text>
                  </View>
                </View>

                <Pressable
                  style={styles.creatorCard}
                  onPress={handleViewOwnerProfile}
                >
                  <Avatar
                    profilePhotoURL={verifiedOwner.profilePhotoURL}
                    displayName={verifiedOwner.displayName}
                    size="medium"
                  />
                  <View style={styles.creatorInfo}>
                    <View style={styles.creatorNameRow}>
                      <Text style={styles.creatorName}>
                        {verifiedOwner.displayName}
                      </Text>
                      <CommunityLevel
                        regularVenuesCount={ownerSocialStats.regularVenuesCount}
                        createdVenuesCount={ownerSocialStats.createdVenuesCount}
                        publishedBlogsCount={ownerSocialStats.publishedBlogsCount}
                        isMigratedUser={verifiedOwner?.isMigratedUser || false}
                        size="small"
                        showDescription={false}
                      />
                    </View>
                    <Text style={styles.creatorDate}>
                      Verified on {formatDate(venue.verificationDate)}
                    </Text>
                    {verifiedOwner.bio && (
                      <Text style={styles.creatorBio} numberOfLines={3}>
                        {verifiedOwner.bio}
                      </Text>
                    )}
                  </View>
                </Pressable>
              </View>
            )}

            {/* Creator Info */}
            <View style={[globalStyles.card, isMobile && styles.mobileGridCard, { marginBottom: 32 }]}>
              <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>
                Added By
              </Text>

              {creator ? (
                <Pressable
                  style={styles.creatorCard}
                  onPress={handleViewCreatorProfile}
                >
                  <Avatar
                    profilePhotoURL={creator.profilePhotoURL}
                    displayName={creator.displayName}
                    size="medium"
                  />
                  <View style={styles.creatorInfo}>
                    <View style={styles.creatorNameRow}>
                      <Text style={styles.creatorName}>
                        {creator.displayName}
                      </Text>
                      <CommunityLevel
                        regularVenuesCount={creatorSocialStats.regularVenuesCount}
                        createdVenuesCount={creatorSocialStats.createdVenuesCount}
                        publishedBlogsCount={creatorSocialStats.publishedBlogsCount}
                        isMigratedUser={creator?.isMigratedUser || false}
                        size="small"
                        showDescription={false}
                      />
                    </View>
                    <Text style={styles.creatorDate}>
                      Added on {formatDate(venue.createdAt)}
                    </Text>
                    {creator.bio && (
                      <Text style={styles.creatorBio} numberOfLines={3}>
                        {creator.bio}
                      </Text>
                    )}
                  </View>
                </Pressable>
              ) : (
                <View style={styles.creatorCard}>
                  <Avatar displayName="Anonymous" size="medium" />
                  <View style={styles.creatorInfo}>
                    <Text style={styles.creatorName}>Anonymous</Text>
                    <Text style={styles.creatorDate}>
                      Added on {formatDate(venue.createdAt)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Venue Details */}
            <View style={[globalStyles.card, isMobile && styles.mobileGridCard, { marginBottom: 32 }]}>
              <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>
                Details
              </Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <CategoryBadge categoryId={venue.category} size="small" />
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>
                  {formatAddress()}
                </Text>
              </View>

              {/* View on Map Button */}
              {venue.coordinates && (
                <TouchableOpacity
                  style={styles.viewMapButton}
                  onPress={() => setMapModalVisible(true)}
                >
                  <Ionicons name="map" size={20} color="#fff" />
                  <Text style={styles.viewMapButtonText}>View on map</Text>
                </TouchableOpacity>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Photos:</Text>
                <Text style={styles.detailValue}>
                  {venue.photos?.length || 0} photo{venue.photos?.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Events Section */}
            <View style={[globalStyles.card, isMobile && styles.mobileGridCard, { marginBottom: 32 }]}>
              <VenueEventsDisplay
                venueId={venue.id}
                venueName={venue.name}
                onRefresh={eventsRefreshKey}
              />
            </View>

            {/* Blog Posts About This Venue */}
            <View style={[globalStyles.card, isMobile && styles.mobileGridCard, { marginBottom: 32 }]}>
              <VenueBlogs
                venue={venue}
                maxDisplay={6}
                showViewAllButton={true}
                style={{ marginBottom: 0 }}
              />
            </View>

            {/* Community Features */}
            <View style={[globalStyles.card, isMobile && styles.mobileGridCard, { marginBottom: 32 }]}>
              <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>
                Community
              </Text>

              <VenueRegulars
                key={regularCountKey}
                venueId={venue.id}
                maxDisplay={6}
                size="normal"
                style={styles.venueRegulars}
              />

            </View>

            {/* Action Buttons - Desktop/Tablet only */}
            {!isMobile && (
              <View style={styles.actionContainer}>
                <Button 
                  onPress={handleShare}
                  style={styles.actionButton}
                >
                  Share This Place
                </Button>
                
                {creator && creator.publicEmail && creator.showPublicEmail && (
                  <SecondaryButton 
                    onPress={handleContactCreator}
                    style={styles.actionButton}
                  >
                    Contact Creator
                  </SecondaryButton>
                )}
              </View>
            )}
          </View>
        </View>
        </View>
        <Footer navigation={navigation} />
      </ScrollView>

      {/* Map Modal */}
      <VenueMapModal
        visible={mapModalVisible}
        onClose={() => setMapModalVisible(false)}
        venue={venue}
      />

      {/* Event Form Modal */}
      <EventFormModal
        visible={eventModalVisible}
        onClose={() => {
          setEventModalVisible(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        venueId={venue?.id}
        venueName={venue?.name}
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.mediumGrey
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  desktopMainLayout: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'flex-start'
  },
  tabletMainLayout: {
    flexDirection: 'column',
    gap: 24
  },
  mobileLayout: {
    flexDirection: 'column'
  },
  mobileGridLayout: {
    flexDirection: 'column'
  },
  mobileContentGrid: {
    width: '100%'
  },
  mobileSidebarGrid: {
    width: '100%',
    flexDirection: 'column',
    gap: 16,
    marginTop: 24
  },
  mobileGridCard: {
    width: '100%'
  },
  leftSection: {
    flex: 2,
    minWidth: 0
  },
  rightSection: {
    flex: 1,
    minWidth: 320
  },
  tabletLeftSection: {
    width: '100%'
  },
  tabletRightSection: {
    width: '100%',
    marginTop: 24
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  venueTitle: {
    flex: 1,
    gap: 12
  },
  venueStats: {
    alignItems: 'flex-end'
  },
  viewCount: {
    fontSize: 14,
    color: colors.mediumGrey,
    fontWeight: '500'
  },
  address: {
    fontSize: 16,
    color: colors.mediumGrey,
    lineHeight: 22
  },
  description: {
    lineHeight: 24
  },
  actionContainer: {
    gap: 12,
    marginTop: 0
  },
  actionButton: {
    alignSelf: 'stretch'
  },
  creatorCard: {
    flexDirection: 'row',
    gap: 16
  },
  creatorInfo: {
    flex: 1
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4
  },
  creatorDate: {
    fontSize: 14,
    color: colors.mediumGrey,
    marginBottom: 8
  },
  creatorBio: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mediumGrey,
    minWidth: 70
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20
  },
  detailMap: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    height: 200
  },
  communityButton: {
    marginBottom: 12
  },
  socialActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
    flexWrap: 'wrap'
  },
  regularButton: {
    flex: 0,
    minWidth: 140
  },
  regularCount: {
    flex: 1
  },
  venueRegulars: {
    marginBottom: 16
  },
  socialProof: {
    marginTop: 12,
    marginBottom: 8
  },
  successOverlay: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center'
  },
  successMessage: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    minWidth: 280,
    maxWidth: '90%'
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 16
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22
  },
  ownershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    alignSelf: 'flex-start'
  },
  ownershipIcon: {
    fontSize: 14,
    marginRight: 6
  },
  ownershipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600'
  },
  ownerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  verifiedBadgeSmall: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  verifiedBadgeTextSmall: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600'
  },
  viewMapButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 12,
    gap: 8
  },
  viewMapButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600'
  },
  ownerBanner: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: 24,
    overflow: 'hidden'
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 16
  },
  bannerText: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20
  },
  addEventButton: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center'
  },
  addEventButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'
  }
};

export default VenueDetailScreen;