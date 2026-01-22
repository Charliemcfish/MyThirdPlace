import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getVenueRegulars } from '../../services/userVenueRelationships';
import { getVenue } from '../../services/venue';
import Avatar from '../../components/common/Avatar';
import SecondaryButton from '../../components/common/SecondaryButton';
import SemiCircleHeader from '../../components/common/SemiCircleHeader';

const VenueRegularsScreen = () => {
  const [regulars, setRegulars] = useState([]);
  const [venue, setVenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const { venueId, totalCount } = route.params || {};

  useEffect(() => {
    if (venueId) {
      fetchData();
    }
  }, [venueId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [regularsData, venueData] = await Promise.all([
        getVenueRegulars(venueId, 100), // Get up to 100 regulars
        getVenue(venueId)
      ]);

      setRegulars(regularsData);
      setVenue(venueData);
    } catch (error) {
      console.error('Error fetching venue regulars data:', error);
      setError('Failed to load regulars. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const handleUserPress = (regular) => {
    navigation.navigate('ViewProfile', { userId: regular.userUID });
  };

  const handleVenuePress = () => {
    navigation.navigate('VenueDetail', { venueId: venueId });
  };

  const formatJoinDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return `Regular since ${date.toLocaleDateString('en-US', options)}`;
  };

  const getRelativeTime = (timestamp) => {
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

  if (Platform.OS === 'web') {
    const containerStyle = {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'inherit',
      minHeight: '100vh',
      backgroundColor: '#FFFFFF'
    };

    const headerStyle = {
      marginBottom: '24px'
    };

    const titleStyle = {
      fontSize: '28px',
      fontWeight: '700',
      color: '#333333',
      marginBottom: '8px'
    };

    const subtitleStyle = {
      fontSize: '16px',
      color: '#666666',
      marginBottom: '16px'
    };

    const venueInfoStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      backgroundColor: '#F8F9FA',
      borderRadius: '12px',
      marginBottom: '24px',
      cursor: 'pointer',
      border: '1px solid #E9ECEF',
      transition: 'background-color 0.2s ease'
    };

    const regularsGridStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    };

    const regularCardStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E9ECEF',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };

    const regularInfoStyle = {
      flex: 1,
      minWidth: 0
    };

    const regularNameStyle = {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '4px'
    };

    const regularDateStyle = {
      fontSize: '14px',
      color: '#666666',
      marginBottom: '2px'
    };

    const regularTimeStyle = {
      fontSize: '12px',
      color: '#999999'
    };

    const loadingStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      fontSize: '16px',
      color: '#666666'
    };

    const errorStyle = {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#DC3545',
      fontSize: '16px'
    };

    const emptyStyle = {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#666666',
      fontSize: '16px'
    };

    if (isLoading) {
      return (
        <div style={containerStyle}>
          <div style={loadingStyle}>
            <div style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              border: '2px solid #E9ECEF',
              borderTop: '2px solid #006548',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '12px'
            }} />
            Loading regulars...
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={containerStyle}>
          <div style={errorStyle}>
            {error}
            <br />
            <button
              onClick={fetchData}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#006548',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            {regulars.length === 1 ? '1 Regular' : `${regulars.length} Regulars`}
          </h1>
          {venue && (
            <p style={subtitleStyle}>
              People who are regulars at {venue.name}
            </p>
          )}
        </div>

        {venue && (
          <div
            style={venueInfoStyle}
            onClick={handleVenuePress}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#E9ECEF';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#F8F9FA';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: venue.photos?.[0] ? 'transparent' : '#DDD',
              backgroundImage: venue.photos?.[0] ? `url(${venue.photos[0]})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '12px'
            }}>
              {!venue.photos?.[0] && '📍'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#333333',
                marginBottom: '4px'
              }}>
                {venue.name}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666666'
              }}>
                {venue.category} • {venue.address?.city}
              </div>
            </div>
            <div style={{
              fontSize: '14px',
              color: '#006548',
              fontWeight: '600'
            }}>
              View venue →
            </div>
          </div>
        )}

        {regulars.length === 0 ? (
          <div style={emptyStyle}>
            No regulars yet. Be the first to mark this venue as your regular!
          </div>
        ) : (
          <div style={regularsGridStyle}>
            {regulars.map((regular) => (
              <div
                key={regular.id}
                style={regularCardStyle}
                onClick={() => handleUserPress(regular)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#F8F9FA';
                  e.target.style.borderColor = '#006548';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#FFFFFF';
                  e.target.style.borderColor = '#E9ECEF';
                }}
              >
                <Avatar
                  photoURL={regular.userPhotoURL}
                  displayName={regular.userDisplayName}
                  size={48}
                />
                <div style={regularInfoStyle}>
                  <div style={regularNameStyle}>
                    {regular.userDisplayName || 'Anonymous User'}
                  </div>
                  <div style={regularDateStyle}>
                    {formatJoinDate(regular.createdAt)}
                  </div>
                  <div style={regularTimeStyle}>
                    {getRelativeTime(regular.createdAt)}
                  </div>
                </div>
                <div style={{
                  fontSize: '18px',
                  color: '#006548'
                }}>
                  →
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button
            onClick={() => navigation.goBack()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#F8F9FA',
              border: '1px solid #E9ECEF',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333333'
            }}
          >
            ← Back to venue
          </button>
        </div>
      </div>
    );
  }

  // React Native implementation
  const containerStyleRN = {
    flex: 1,
    backgroundColor: '#FFFFFF'
  };

  const contentStyleRN = {
    padding: 20
  };

  const headerStyleRN = {
    marginBottom: 24
  };

  const titleStyleRN = {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8
  };

  const subtitleStyleRN = {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16
  };

  const venueInfoStyleRN = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF'
  };

  const regularCardStyleRN = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 12
  };

  const regularInfoStyleRN = {
    flex: 1,
    marginLeft: 16
  };

  const regularNameStyleRN = {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4
  };

  const regularDateStyleRN = {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2
  };

  const regularTimeStyleRN = {
    fontSize: 12,
    color: '#999999'
  };

  if (isLoading) {
    return (
      <View style={[containerStyleRN, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#006548" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666666' }}>
          Loading regulars...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[containerStyleRN, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: '#DC3545', textAlign: 'center', marginBottom: 16 }}>
          {error}
        </Text>
        <SecondaryButton onPress={fetchData}>
          Try Again
        </SecondaryButton>
      </View>
    );
  }

  return (
    <View style={containerStyleRN}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={contentStyleRN}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#006548']}
          />
        }
      >
        <View style={headerStyleRN}>
          <Text style={titleStyleRN}>
            {regulars.length === 1 ? '1 Regular' : `${regulars.length} Regulars`}
          </Text>
          {venue && (
            <Text style={subtitleStyleRN}>
              People who are regulars at {venue.name}
            </Text>
          )}
        </View>

        {venue && (
          <TouchableOpacity style={venueInfoStyleRN} onPress={handleVenuePress}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: '#DDD',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ fontSize: 12, color: '#666' }}>📍</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#333333',
                marginBottom: 4
              }}>
                {venue.name}
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#666666'
              }}>
                {venue.category} • {venue.address?.city}
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              color: '#006548',
              fontWeight: '600'
            }}>
              →
            </Text>
          </TouchableOpacity>
        )}

        {regulars.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 16, color: '#666666', textAlign: 'center' }}>
              No regulars yet. Be the first to mark this venue as your regular!
            </Text>
          </View>
        ) : (
          regulars.map((regular) => (
            <TouchableOpacity
              key={regular.id}
              style={regularCardStyleRN}
              onPress={() => handleUserPress(regular)}
            >
              <Avatar
                photoURL={regular.userPhotoURL}
                displayName={regular.userDisplayName}
                size={48}
              />
              <View style={regularInfoStyleRN}>
                <Text style={regularNameStyleRN}>
                  {regular.userDisplayName || 'Anonymous User'}
                </Text>
                <Text style={regularDateStyleRN}>
                  {formatJoinDate(regular.createdAt)}
                </Text>
                <Text style={regularTimeStyleRN}>
                  {getRelativeTime(regular.createdAt)}
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: '#006548' }}>→</Text>
            </TouchableOpacity>
          ))
        )}

        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <SecondaryButton
            onPress={() => navigation.goBack()}
            style={{ paddingHorizontal: 24 }}
          >
            ← Back to venue
          </SecondaryButton>
        </View>
      </ScrollView>
    </View>
  );
};

export default VenueRegularsScreen;