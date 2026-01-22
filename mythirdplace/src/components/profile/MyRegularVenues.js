import React, { useState, useEffect } from 'react';
import { View, Text, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserRegularVenues } from '../../services/userVenueRelationships';
import { getCurrentUser } from '../../services/auth';

const MyRegularVenues = ({ style, maxDisplay = 6, showHeader = true, userUID = null }) => {
  const [regularVenues, setRegularVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const currentUser = getCurrentUser();

  const targetUserUID = userUID || currentUser?.uid;

  useEffect(() => {
    if (targetUserUID) {
      fetchRegularVenues();
    }
  }, [targetUserUID]);

  const fetchRegularVenues = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const venues = await getUserRegularVenues(targetUserUID, maxDisplay + 2);
      setRegularVenues(venues);
    } catch (error) {
      console.error('Error fetching regular venues:', error);
      setError('Failed to load regular venues');
      setRegularVenues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVenuePress = (venue) => {
    navigation.navigate('VenueDetail', { venueId: venue.venueId });
  };

  const handleSeeAllPress = () => {
    if (userUID) {
      navigation.navigate('UserRegularVenues', { userId: userUID });
    } else {
      navigation.navigate('MyRegularVenues');
    }
  };

  const formatJoinDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const displayVenues = regularVenues.slice(0, maxDisplay);
  const hasMore = regularVenues.length > maxDisplay;

  if (Platform.OS === 'web') {
    const flattenStyle = (styleArray) => {
      if (!styleArray) return {};
      if (Array.isArray(styleArray)) {
        return Object.assign({}, ...styleArray.filter(Boolean));
      }
      return styleArray;
    };

    const flattenedStyle = flattenStyle(style);

    const containerStyle = {
      fontFamily: 'inherit',
      ...flattenedStyle
    };

    const headerStyle = {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    };

    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    };

    const venueCardStyle = {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E9ECEF',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };

    const venueImageStyle = {
      width: '100%',
      height: '120px',
      backgroundColor: '#F8F9FA',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: '#666666'
    };

    const venueInfoStyle = {
      padding: '12px'
    };

    const venueNameStyle = {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '4px'
    };

    const venueCategoryStyle = {
      fontSize: '14px',
      color: '#666666',
      marginBottom: '4px'
    };

    const regularSinceStyle = {
      fontSize: '12px',
      color: '#999999'
    };

    const loadingStyle = {
      textAlign: 'center',
      padding: '20px',
      color: '#666666'
    };

    const emptyStyle = {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#666666',
      backgroundColor: '#F8F9FA',
      borderRadius: '12px',
      border: '1px solid #E9ECEF'
    };

    const seeAllButtonStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      backgroundColor: '#F8F9FA',
      border: '1px solid #E9ECEF',
      borderRadius: '8px',
      color: '#006548',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'background-color 0.2s ease'
    };

    if (isLoading) {
      return (
        <div style={containerStyle}>
          <div style={loadingStyle}>Loading regular venues...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={containerStyle}>
          <div style={emptyStyle}>{error}</div>
        </div>
      );
    }

    if (regularVenues.length === 0) {
      return (
        <div style={containerStyle}>
          {showHeader && (
            <div style={headerStyle}>
              <span>My Regular Places</span>
            </div>
          )}
          <div style={emptyStyle}>
            {userUID ? 'No regular venues yet' : 'You haven\'t marked any venues as regular yet. Visit venue pages and click "I am a Regular" to add them here.'}
          </div>
        </div>
      );
    }

    return (
      <div style={containerStyle}>
        {showHeader && (
          <div style={headerStyle}>
            <span>My Regular Places ({regularVenues.length})</span>
            {hasMore && (
              <div
                style={seeAllButtonStyle}
                onClick={handleSeeAllPress}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#E9ECEF';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#F8F9FA';
                }}
              >
                See all →
              </div>
            )}
          </div>
        )}

        <div style={gridStyle}>
          {displayVenues.map((venue) => (
            <div
              key={venue.id}
              style={venueCardStyle}
              onClick={() => handleVenuePress(venue)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#006548';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E9ECEF';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              <div
                style={{
                  ...venueImageStyle,
                  backgroundImage: venue.venuePrimaryPhoto ? `url(${venue.venuePrimaryPhoto})` : 'none'
                }}
              >
                {!venue.venuePrimaryPhoto && '📍'}
              </div>
              <div style={venueInfoStyle}>
                <div style={venueNameStyle}>{venue.venueName || 'Unknown Venue'}</div>
                <div style={venueCategoryStyle}>
                  {venue.venueCategory || 'Unknown'} • {venue.venueCity || 'Unknown City'}
                </div>
                <div style={regularSinceStyle}>
                  Regular since {formatJoinDate(venue.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // React Native implementation
  const containerStyleRN = {
    ...style
  };

  const headerStyleRN = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  };

  const headerTextStyleRN = {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333'
  };

  const venueCardStyleRN = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 12,
    overflow: 'hidden'
  };

  const venueImageStyleRN = {
    width: '100%',
    height: 120,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const venueInfoStyleRN = {
    padding: 12
  };

  const venueNameStyleRN = {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4
  };

  const venueCategoryStyleRN = {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4
  };

  const regularSinceStyleRN = {
    fontSize: 12,
    color: '#999999'
  };

  const emptyStyleRN = {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF'
  };

  const seeAllButtonStyleRN = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8
  };

  if (isLoading) {
    return (
      <View style={containerStyleRN}>
        <Text style={{ textAlign: 'center', padding: 20, color: '#666666' }}>
          Loading regular venues...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={containerStyleRN}>
        <View style={emptyStyleRN}>
          <Text style={{ color: '#666666', textAlign: 'center' }}>{error}</Text>
        </View>
      </View>
    );
  }

  if (regularVenues.length === 0) {
    return (
      <View style={containerStyleRN}>
        {showHeader && (
          <View style={headerStyleRN}>
            <Text style={headerTextStyleRN}>My Regular Places</Text>
          </View>
        )}
        <View style={emptyStyleRN}>
          <Text style={{ color: '#666666', textAlign: 'center' }}>
            {userUID ? 'No regular venues yet' : 'You haven\'t marked any venues as regular yet. Visit venue pages and click "I am a Regular" to add them here.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={containerStyleRN}>
      {showHeader && (
        <View style={headerStyleRN}>
          <Text style={headerTextStyleRN}>
            My Regular Places ({regularVenues.length})
          </Text>
          {hasMore && (
            <TouchableOpacity style={seeAllButtonStyleRN} onPress={handleSeeAllPress}>
              <Text style={{ color: '#006548', fontWeight: '600', fontSize: 14 }}>
                See all →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {displayVenues.map((venue) => (
          <TouchableOpacity
            key={venue.id}
            style={venueCardStyleRN}
            onPress={() => handleVenuePress(venue)}
          >
            <View style={venueImageStyleRN}>
              {venue.venuePrimaryPhoto ? (
                <Text>📍</Text>
              ) : (
                <Text style={{ fontSize: 24, color: '#666666' }}>📍</Text>
              )}
            </View>
            <View style={venueInfoStyleRN}>
              <Text style={venueNameStyleRN}>{venue.venueName || 'Unknown Venue'}</Text>
              <Text style={venueCategoryStyleRN}>
                {venue.venueCategory || 'Unknown'} • {venue.venueCity || 'Unknown City'}
              </Text>
              <Text style={regularSinceStyleRN}>
                Regular since {formatJoinDate(venue.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default MyRegularVenues;