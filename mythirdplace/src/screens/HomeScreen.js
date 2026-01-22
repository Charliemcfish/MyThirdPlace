import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { colors } from '../styles/theme';
import Navigation from '../components/common/Navigation';
import HeroSection from '../components/homepage/HeroSection';
import MapSection from '../components/homepage/MapSection';
import ContentSection from '../components/homepage/ContentSection';
import PlacesCarousel from '../components/homepage/PlacesCarousel';
import BlogCarousel from '../components/homepage/BlogCarousel';
import FeaturedVenue from '../components/homepage/FeaturedVenue';
import InstagramFeed from '../components/homepage/InstagramFeed';
import FAQSection from '../components/homepage/FAQSection';
import Footer from '../components/homepage/Footer';
import GlobalSearch from '../components/search/GlobalSearch';
import { getDiscoveryFeed } from '../services/popularContent';
import useDocumentTitle from '../hooks/useDocumentTitle';

const HomeScreen = ({ navigation }) => {
  const [discoveryContent, setDiscoveryContent] = useState([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useDocumentTitle('Home');

  useEffect(() => {
    loadDiscoveryContent();
  }, []);

  const loadDiscoveryContent = async () => {
    try {
      const content = await getDiscoveryFeed({}, { limit: 10 });
      setDiscoveryContent(content);
    } catch (error) {
      console.error('Error loading discovery content:', error);
    }
  };

  const handleSearchFocus = () => {
    if (Platform.OS === 'web' && window.innerWidth < 768) {
      navigation.navigate('UnifiedSearch');
    }
  };

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />


      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        <HeroSection navigation={navigation} />
        <MapSection navigation={navigation} />
        <ContentSection />
        <FeaturedVenue navigation={navigation} />
        <PlacesCarousel discoveryContent={discoveryContent} />
        <BlogCarousel discoveryContent={discoveryContent} />
        <InstagramFeed />
        <FAQSection />
        <Footer navigation={navigation} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    ...Platform.select({
      web: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  globalSearch: {
    maxWidth: 600,
    alignSelf: 'center',
  },
});

export default HomeScreen;