import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
  Image
} from 'react-native';
import { getVenueEvents } from '../../services/events';
import { colors } from '../../styles/theme';
import { Timestamp } from 'firebase/firestore';

const VenueEventsDisplay = ({ venueId, venueName, style, onRefresh }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (venueId) {
      loadEvents();
    }
  }, [venueId, onRefresh]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await getVenueEvents(venueId);
      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
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

    const startDate = startTimestamp instanceof Timestamp ? startTimestamp.toDate() : new Date(startTimestamp);
    const endDate = endTimestamp instanceof Timestamp ? endTimestamp.toDate() : new Date(endTimestamp);

    const startFormatted = formatDate(startTimestamp);
    const endFormatted = formatDate(endTimestamp);

    // If same date, just show once
    if (startFormatted === endFormatted) {
      return startFormatted.toUpperCase();
    }

    return `${startFormatted} - ${endFormatted}`.toUpperCase();
  };

  const handleBookingPress = (bookingLink) => {
    if (!bookingLink) return;

    if (Platform.OS === 'web') {
      window.open(bookingLink, '_blank');
    } else {
      Linking.openURL(bookingLink);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Text style={styles.emojiIcon}>📅</Text>
        </View>
        <Text style={styles.heading}>
          What's on at {venueName}
        </Text>
      </View>

      {/* Events List */}
      {events.length > 0 ? (
        <View style={styles.eventsList}>
          {events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              {event.eventImageURL && (
                <Image
                  source={{ uri: event.eventImageURL }}
                  style={styles.eventImage}
                  resizeMode="cover"
                />
              )}

              <View style={styles.eventContentWrapper}>
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
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
                </View>

                {event.bookingRequired && event.bookingLink && (
                  <TouchableOpacity
                    style={styles.bookingButton}
                    onPress={() => handleBookingPress(event.bookingLink)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.bookingButtonText}>
                      {event.bookingButtonText || 'Book Now'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No upcoming events</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  emojiIcon: {
    fontSize: 24
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1
  },
  eventsList: {
    gap: 8
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 0,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    flexDirection: 'row'
  },
  eventImage: {
    width: 200,
    height: 140,
    backgroundColor: '#f0f0f0'
  },
  eventContentWrapper: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between'
  },
  eventContent: {
    flex: 1
  },
  eventHeader: {
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
    lineHeight: 22
  },
  bookingButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12
  },
  bookingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  noEventsContainer: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  noEventsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic'
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8
  },
  loadingText: {
    fontSize: 14,
    color: '#666'
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    paddingVertical: 20
  }
});

export default VenueEventsDisplay;
