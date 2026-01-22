import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

const PortfolioItemCard = ({ portfolioItem, onPress, style, isOwnProfile = false, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress(portfolioItem);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(portfolioItem);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(portfolioItem);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      onMouseEnter={() => Platform.OS === 'web' && setIsHovered(true)}
      onMouseLeave={() => Platform.OS === 'web' && setIsHovered(false)}
    >
      {/* Featured Image */}
      <View style={styles.imageContainer}>
        {portfolioItem.featuredImageURL ? (
          <Image
            source={{ uri: portfolioItem.featuredImageURL }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📄</Text>
          </View>
        )}

        {/* Overlay for better text readability */}
        <View style={styles.overlay} />

        {/* Title Overlay */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {portfolioItem.title}
          </Text>
        </View>
      </View>

      {/* Edit/Delete Buttons (Own Profile Only) */}
      {isOwnProfile && Platform.OS === 'web' && isHovered && (
        <View style={styles.actionButtonsOverlay}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hover Effect (Web only) */}
      {Platform.OS === 'web' && !isOwnProfile && (
        <View style={styles.hoverOverlay}>
          <Text style={styles.hoverText}>View Portfolio Item</Text>
        </View>
      )}

      {/* Mobile Edit/Delete for Own Profile */}
      {isOwnProfile && Platform.OS !== 'web' && (
        <View style={styles.mobileActionsContainer}>
          <TouchableOpacity style={styles.mobileEditButton} onPress={handleEdit}>
            <Text style={styles.mobileActionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mobileDeleteButton} onPress={handleDelete}>
            <Text style={styles.mobileActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
        }
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3
      }
    })
  },
  imageContainer: {
    width: '100%',
    height: 200,
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
    backgroundColor: colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.3
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
    ...Platform.select({
      web: {
        background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))'
      },
      default: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
      }
    })
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  hoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 101, 72, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
    ':hover': {
      opacity: 1
    }
  },
  hoverText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600'
  },
  actionButtonsOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
    zIndex: 20
  },
  editButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  deleteButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.error,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  actionButtonText: {
    fontSize: 16
  },
  mobileActionsContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
    zIndex: 20
  },
  mobileEditButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  mobileDeleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  mobileActionText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600'
  }
};

export default PortfolioItemCard;