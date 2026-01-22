import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

const CarouselCard = ({
  image,
  title,
  subtitle,
  category,
  location,
  author,
  authorAvatar,
  date,
  excerpt,
  type = 'venue' // 'venue' or 'blog'
}) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: image }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        {category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        )}
        
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        {type === 'venue' && location && (
          <Text style={styles.location}>{location}</Text>
        )}
        
        {type === 'blog' && (
          <View style={styles.blogMeta}>
            {author && (
              <View style={styles.authorContainer}>
                {authorAvatar ? (
                  <Image
                    source={{ uri: authorAvatar }}
                    style={styles.authorAvatarImage}
                  />
                ) : (
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorInitial}>
                      {author.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.authorName}>{author}</Text>
              </View>
            )}
            {date && (
              <Text style={styles.date}>{date}</Text>
            )}
          </View>
        )}
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    width: '100%',
    height: 300, // Fixed height for consistency
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    display: 'flex',
    flexDirection: 'column',
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  content: {
    padding: spacing.md,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  categoryText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  title: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  location: {
    ...typography.body2,
    color: colors.textLight,
  },
  blogMeta: {
    marginBottom: spacing.sm,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  authorAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  authorInitial: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  authorName: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  date: {
    ...typography.caption,
    color: colors.textLight,
  },
  excerpt: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default CarouselCard;