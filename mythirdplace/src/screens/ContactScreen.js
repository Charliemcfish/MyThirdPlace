import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions
} from 'react-native';
import { colors, typography, spacing, borderRadius, breakpoints } from '../styles/theme';
import Navigation from '../components/common/Navigation';
import SemiCircleHeader from '../components/common/SemiCircleHeader';
import Footer from '../components/homepage/Footer';
import InteractiveMap from '../components/maps/InteractiveMap';
import { getVenues } from '../services/venue';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ContactScreen = ({ navigation }) => {
  const [venues, setVenues] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  const isMobile = screenWidth < breakpoints.tablet;

  useDocumentTitle('Contact Us');

  useEffect(() => {
    loadVenues();

    const updateScreenWidth = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateScreenWidth);
    return () => subscription?.remove();
  }, []);

  const loadVenues = async () => {
    try {
      setMapLoading(true);
      const result = await getVenues({ limitCount: 100 });
      const venuesWithCoordinates = result.venues.filter(venue =>
        venue.coordinates &&
        venue.coordinates.lat &&
        venue.coordinates.lng
      );
      setVenues(venuesWithCoordinates);
    } catch (err) {
      console.error('Error loading venues for contact map:', err);
    } finally {
      setMapLoading(false);
    }
  };


  const getMapCenter = () => {
    if (venues.length === 0) {
      return { lat: 51.5074, lng: -0.1278 };
    }

    if (venues.length === 1) {
      return venues[0].coordinates;
    }

    const latSum = venues.reduce((sum, venue) => sum + venue.coordinates.lat, 0);
    const lngSum = venues.reduce((sum, venue) => sum + venue.coordinates.lng, 0);

    return {
      lat: latSum / venues.length,
      lng: lngSum / venues.length
    };
  };

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <SemiCircleHeader title="Contact Us" size="large" />
            <Text style={styles.subtitle}>
              Get in touch with the MyThirdPlace team
            </Text>
          </View>

        {/* Main Content */}
        <View style={isMobile ? { ...styles.mainContent, ...styles.mainContentMobile } : styles.mainContent}>
          {/* Contact Form */}
          <View style={isMobile ? { ...styles.formSection, ...styles.formSectionMobile } : styles.formSection}>
            {Platform.OS === 'web' ? (
              <div style={styles.formContainer}>
                <form name="contact" method="POST" data-netlify="true" style={styles.webForm}>
                  <input type="hidden" name="form-name" value="contact" />

                  <div style={isMobile ? { ...styles.nameRow, ...styles.nameRowMobile } : styles.nameRow}>
                    <div style={isMobile ? { ...styles.nameField, ...styles.nameFieldMobile } : styles.nameField}>
                      <label style={styles.label}>First Name *</label>
                      <input
                        type="text"
                        name="first-name"
                        required
                        style={styles.input}
                        placeholder="e.g. John"
                      />
                    </div>

                    <div style={isMobile ? { ...styles.nameField, ...styles.nameFieldMobile } : styles.nameField}>
                      <label style={styles.label}>Last Name *</label>
                      <input
                        type="text"
                        name="last-name"
                        required
                        style={styles.input}
                        placeholder="e.g. Smith"
                      />
                    </div>
                  </div>

                  <div style={styles.fieldContainer}>
                    <label style={styles.label}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      style={styles.input}
                      placeholder="john.smith@example.com"
                    />
                  </div>

                  <div style={styles.fieldContainer}>
                    <label style={styles.label}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      style={styles.input}
                      placeholder="+44 7700 900123 (optional)"
                    />
                  </div>

                  <div style={styles.fieldContainer}>
                    <label style={styles.label}>Message *</label>
                    <textarea
                      name="message"
                      required
                      style={styles.textArea}
                      placeholder="Venue to list? Blog to pitch? Feedback to share? Type it here…"
                      rows="6"
                    />
                  </div>

                  <button type="submit" style={styles.submitButton}>
                    Send Message
                  </button>
                </form>
              </div>
            ) : (
              <View style={styles.formContainer}>
                <Text style={styles.webOnlyMessage}>
                  Contact form is available on the web version of this app.
                </Text>
              </View>
            )}
          </View>

          {/* Map Section */}
          <View style={isMobile ? { ...styles.mapSection, ...styles.mapSectionMobile } : styles.mapSection}>
            <Text style={styles.mapTitle}>Find Third Places Near You</Text>
            <View style={styles.mapContainer}>
              {mapLoading ? (
                <View style={styles.mapPlaceholder}>
                  <Text style={styles.mapIcon}>🗺️</Text>
                  <Text style={styles.mapLoadingText}>Loading map...</Text>
                </View>
              ) : (
                <InteractiveMap
                  venues={venues}
                  center={getMapCenter()}
                  zoom={venues.length === 1 ? 13 : 2}
                  height={400}
                  showInfoWindows={true}
                  enableClustering={venues.length > 20}
                />
              )}
            </View>
          </View>
        </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  headerSection: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  subtitle: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  mainContent: {
    flexDirection: 'row',
    gap: spacing.xl,
    padding: spacing.xl,
    marginTop: spacing.xl, // Add gap between header and content
  },
  mainContentMobile: {
    flexDirection: 'column',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  formSection: {
    flex: 1,
  },
  formSectionMobile: {
    flex: undefined,
    width: '100%',
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  webForm: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  nameRowMobile: {
    flexDirection: 'column',
  },
  nameField: {
    flex: 1,
    flexDirection: 'column',
    marginRight: spacing.md,
  },
  nameFieldMobile: {
    marginRight: 0,
    marginBottom: spacing.sm,
  },
  fieldContainer: {
    marginBottom: spacing.md,
    flexDirection: 'column',
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    display: 'block',
    fontFamily: 'Barlow, sans-serif',
    letterSpacing: 0.5,
    height: '1rem',
    lineHeight: '1rem',
  },
  input: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.lightGrey,
    borderRadius: borderRadius.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    outline: 'none',
    fontFamily: 'Barlow, sans-serif',
    fontWeight: '400',
    lineHeight: 1.5,
    minHeight: 48,
    boxSizing: 'border-box',
    width: '100%',
  },
  textArea: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.lightGrey,
    borderRadius: borderRadius.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    minHeight: 120,
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'Barlow, sans-serif',
    fontWeight: '400',
    lineHeight: 1.6,
    boxSizing: 'border-box',
    width: '100%',
  },
  submitButton: {
    backgroundColor: colors.primary,
    color: colors.white,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: spacing.xxl,
    paddingRight: spacing.xxl,
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: 16,
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: spacing.xl,
    fontFamily: 'Barlow, sans-serif',
    minHeight: 52,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    boxShadow: '0 4px 12px rgba(0, 101, 72, 0.3)',
    width: '100%',
  },
  webOnlyMessage: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
  mapSection: {
    flex: 1,
    marginTop: 0,
  },
  mapSectionMobile: {
    flex: undefined,
    width: '100%',
    marginTop: 0,
  },
  mapTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  mapContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mapPlaceholder: {
    height: 400,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  mapLoadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default ContactScreen;