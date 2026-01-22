import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors } from '../../styles/theme';

/**
 * CompactSearchResult Component
 * Displays search results in a compact horizontal layout
 */
const CompactSearchResult = ({ item, onPress, type = 'venue' }) => {
  const renderImage = () => {
    let imageSource = require('../../../assets/logo.png'); // Default fallback

    if (type === 'venue') {
      imageSource = item.photos && item.photos.length > 0
        ? { uri: item.photos[0] }
        : require('../../../assets/logo.png');
    } else if (type === 'blog') {
      imageSource = item.featuredImageURL
        ? { uri: item.featuredImageURL }
        : require('../../../assets/logo.png');
    }

    return (
      <Image
        source={imageSource}
        style={styles.image}
        defaultSource={require('../../../assets/logo.png')}
        resizeMode="cover"
      />
    );
  };

  const renderContent = () => {
    if (type === 'venue') {
      return (
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.category} • {item.address?.city || 'Location not specified'}
          </Text>
          {item.distance && (
            <Text style={styles.distance}>{item.distance.toFixed(1)}km away</Text>
          )}
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            By {item.authorName} • {item.formattedPublishedDate || 'Recently'}
          </Text>
          {item.readTime && (
            <Text style={styles.distance}>{item.readTime} min read</Text>
          )}
          {item.content && (
            <Text style={styles.description} numberOfLines={2}>
              {item.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
            </Text>
          )}
        </View>
      );
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <View style={styles.layout}>
        {renderContent()}
        {renderImage()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  layout: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  distance: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    color: '#777',
    lineHeight: 14,
  },
});

export default CompactSearchResult;