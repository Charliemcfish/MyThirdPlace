import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../../styles/theme';
import { getTagById } from '../../../data/venueTags.js';

const VenueTagsDisplay = ({ tags = [], style }) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.tagsGrid}>
        {tags.slice(0, 12).map((tagId) => {
          const tag = getTagById(tagId);
          if (!tag) return null;
          
          return (
            <View key={tagId} style={styles.tagPill}>
              <Text style={styles.tagIcon}>{tag.icon}</Text>
              <Text style={styles.tagText}>{tag.name}</Text>
            </View>
          );
        })}
      </View>
      {tags.length > 12 && (
        <Text style={styles.moreText}>
          +{tags.length - 12} more amenities
        </Text>
      )}
    </View>
  );
};

const styles = {
  container: {
    marginVertical: 8
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6
  },
  tagIcon: {
    fontSize: 12,
    marginRight: 4
  },
  tagText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500'
  },
  moreText: {
    fontSize: 12,
    color: colors.mediumGrey,
    marginTop: 8,
    fontStyle: 'italic'
  }
};

export default VenueTagsDisplay;