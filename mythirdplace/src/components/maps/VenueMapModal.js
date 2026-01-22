import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VenueMap from './VenueMap';
import { colors } from '../../styles/theme';

const VenueMapModal = ({ visible, onClose, venue }) => {
  if (!venue) return null;

  const screenWidth = Dimensions.get('window').width;
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;

  const getModalWidth = () => {
    if (isDesktop) return 900;
    if (isTablet) return screenWidth * 0.9;
    return screenWidth;
  };

  const formatAddress = () => {
    if (!venue.address) return '';
    const { street, city, country } = venue.address;
    return [street, city, country].filter(Boolean).join(', ');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width: getModalWidth() }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Location of {venue.name}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Map */}
            {venue.coordinates && (
              <View style={styles.mapContainer}>
                <VenueMap
                  venue={venue}
                  height={isMobile ? 400 : 600}
                  zoom={15}
                />
              </View>
            )}

            {/* Address */}
            {venue.address && (
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Address:</Text>
                <Text style={styles.addressText}>{formatAddress()}</Text>
              </View>
            )}

            {/* Get Directions Button */}
            {venue.coordinates && (
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => {
                  const { latitude, longitude } = venue.coordinates;
                  const url = Platform.select({
                    ios: `maps://app?daddr=${latitude},${longitude}`,
                    android: `google.navigation:q=${latitude},${longitude}`,
                    web: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
                  });
                  if (Platform.OS === 'web') {
                    window.open(url, '_blank');
                  } else {
                    Linking.openURL(url);
                  }
                }}
              >
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    paddingRight: 16
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    padding: 20
  },
  mapContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16
  },
  addressContainer: {
    marginBottom: 16
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4
  },
  addressText: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22
  },
  directionsButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default VenueMapModal;
