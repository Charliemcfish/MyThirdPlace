import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, Dimensions, Platform } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import { getUserProfile } from '../../services/user';
import CategoryBadge from '../common/CategoryBadge';
import Avatar from '../common/Avatar';

const VenueCard = ({ 
  venue, 
  onPress, 
  style = {},
  imageHeight = 160 
}) => {
  const [creator, setCreator] = useState(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (venue.createdBy) {
      loadCreator();
    }
  }, [venue.createdBy]);

  const loadCreator = async () => {
    try {
      const userProfile = await getUserProfile(venue.createdBy);
      setCreator(userProfile);
    } catch (error) {
      console.error('Error loading venue creator:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays <= 7) return `${diffDays} days ago`;
      if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    } catch {
      return 'Recently';
    }
  };

  const formatLocation = () => {
    const parts = [];
    if (venue.address?.city) parts.push(venue.address.city);
    if (venue.address?.country && venue.address.country !== 'United Kingdom') {
      parts.push(venue.address.country);
    }
    return parts.join(', ') || 'Location not specified';
  };

  return (
    <Pressable
      style={[styles.card, style]}
      onPress={() => onPress(venue)}
      android_ripple={{ color: colors.lightGrey }}
    >
      {/* Venue Image */}
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        {venue.primaryPhotoURL ? (
          <Image
            source={{ uri: venue.primaryPhotoURL }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📸</Text>
          </View>
        )}
        
        {/* Category Badge Overlay */}
        <View style={styles.categoryOverlay}>
          <CategoryBadge 
            categoryId={venue.category} 
            size="small"
          />
        </View>
      </View>

      {/* Venue Information */}
      <View style={styles.content}>
        {/* Venue Name and Location */}
        <View style={styles.headerSection}>
          <Text style={styles.venueName} numberOfLines={2}>
            {venue.name}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {formatLocation()}
          </Text>
        </View>

        {/* Creator and Date Info */}
        <View style={styles.creatorSection}>
          <View style={styles.creatorInfo}>
            <Avatar
              profilePhotoURL={creator?.profilePhotoURL}
              displayName={creator?.displayName}
              size="small"
            />
            <View style={styles.creatorText}>
              <Text style={styles.creatorName} numberOfLines={1}>
                {creator?.displayName || 'Anonymous'}
              </Text>
              <Text style={styles.createdDate}>
                {formatDate(venue.createdAt)}
              </Text>
            </View>
          </View>
          
          {/* View Count */}
          {venue.viewCount > 0 && (
            <View style={styles.viewCount}>
              <Text style={styles.viewCountText}>
                {venue.viewCount} view{venue.viewCount !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = {
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 300,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer'
      },
      default: {
        elevation: 3,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      }
    })
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: colors.lightGrey
  },
  image: {
    width: '100%',
    height: '100%'
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight
  },
  placeholderText: {
    fontSize: 32,
    opacity: 0.5
  },
  categoryOverlay: {
    position: 'absolute',
    top: 12,
    right: 12
  },
  content: {
    padding: 16,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  headerSection: {
    marginBottom: 12
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 24,
    minHeight: 48 // Reserve space for 2 lines
  },
  location: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20
  },
  creatorSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  creatorText: {
    marginLeft: 8,
    flex: 1
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18
  },
  createdDate: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16
  },
  viewCount: {
    alignItems: 'flex-end'
  },
  viewCountText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500'
  }
};

// Web hover effects
if (Platform.OS === 'web') {
  styles.card = {
    ...styles.card,
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
    }
  };
}

export default VenueCard;