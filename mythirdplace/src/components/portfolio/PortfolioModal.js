import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Platform,
  Linking,
  Alert
} from 'react-native';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

const PortfolioModal = ({ visible, onClose, portfolioItem, portfolioItems = [], currentIndex = 0, onNavigate }) => {
  const [screenWidth, setScreenWidth] = useState(
    Platform.OS === 'web' ? window.innerWidth : 768
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;

  const hasMultipleItems = portfolioItems.length > 1;
  const canGoPrevious = hasMultipleItems && currentIndex > 0;
  const canGoNext = hasMultipleItems && currentIndex < portfolioItems.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious && onNavigate) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext && onNavigate) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleButtonPress = async (button) => {
    try {
      if (Platform.OS === 'web') {
        window.open(button.url, '_blank', 'noopener,noreferrer');
      } else {
        const supported = await Linking.canOpenURL(button.url);
        if (supported) {
          await Linking.openURL(button.url);
        } else {
          Alert.alert('Error', 'Cannot open this URL');
        }
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open link');
    }
  };

  if (!portfolioItem) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          isMobile ? styles.modalContainerMobile : styles.modalContainerDesktop
        ]}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close portfolio item"
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          {/* Navigation Arrows */}
          {hasMultipleItems && (
            <>
              {/* Previous Arrow */}
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton, !canGoPrevious && styles.navButtonDisabled]}
                onPress={handlePrevious}
                disabled={!canGoPrevious}
                accessibilityLabel="Previous portfolio item"
              >
                <Text style={[styles.navButtonText, !canGoPrevious && styles.navButtonTextDisabled]}>‹</Text>
              </TouchableOpacity>

              {/* Next Arrow */}
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton, !canGoNext && styles.navButtonDisabled]}
                onPress={handleNext}
                disabled={!canGoNext}
                accessibilityLabel="Next portfolio item"
              >
                <Text style={[styles.navButtonText, !canGoNext && styles.navButtonTextDisabled]}>›</Text>
              </TouchableOpacity>

              {/* Item Counter */}
              <View style={styles.counterContainer}>
                <Text style={styles.counterText}>{currentIndex + 1} of {portfolioItems.length}</Text>
              </View>
            </>
          )}

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={[
              styles.contentContainer,
              isMobile ? styles.contentContainerMobile : styles.contentContainerDesktop
            ]}>

              {/* Content Section (Left on desktop, top on mobile) */}
              <View style={[
                styles.textSection,
                isMobile ? styles.textSectionMobile : styles.textSectionDesktop
              ]}>
                <Text style={styles.title}>{portfolioItem.title}</Text>

                <Text style={styles.description}>
                  {portfolioItem.description}
                </Text>

                {/* Custom Buttons */}
                {portfolioItem.buttons && portfolioItem.buttons.length > 0 && (
                  <View style={styles.buttonsContainer}>
                    {portfolioItem.buttons.map((button, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.customButton,
                          index === 0 ? styles.primaryButton : styles.secondaryButton
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.buttonText,
                          index === 0 ? styles.primaryButtonText : styles.secondaryButtonText
                        ]}>
                          {button.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Spacer for mobile to prevent overlap */}
                {isMobile && <View style={{ height: 40 }} />}
              </View>

              {/* Image Section (Right on desktop, bottom on mobile) */}
              <View style={[
                styles.imageSection,
                isMobile ? styles.imageSectionMobile : styles.imageSectionDesktop
              ]}>
                {portfolioItem.featuredImageURL ? (
                  <Image
                    source={{ uri: portfolioItem.featuredImageURL }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>📄</Text>
                    <Text style={styles.placeholderLabel}>No Image</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    position: 'relative',
    ...Platform.select({
      web: {
        maxHeight: '90vh',
        maxWidth: '90vw'
      },
      default: {
        maxHeight: '90%',
        maxWidth: '90%'
      }
    })
  },
  modalContainerDesktop: {
    width: 900,
    minHeight: 600,
    maxHeight: '90vh'
  },
  modalContainerMobile: {
    width: '100%',
    maxWidth: 500,
    minHeight: '80%',
    maxHeight: '90%'
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    backgroundColor: colors.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    lineHeight: 24
  },
  scrollView: {
    flex: 1
  },
  contentContainer: {
    flex: 1,
    padding: 24
  },
  contentContainerDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 32
  },
  contentContainerMobile: {
    flexDirection: 'column',
    paddingTop: 40
  },
  textSection: {
    justifyContent: 'flex-start'
  },
  textSectionDesktop: {
    flex: 1,
    paddingRight: 16
  },
  textSectionMobile: {
    width: '100%',
    marginBottom: 32
  },
  imageSection: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageSectionDesktop: {
    flex: 1,
    minHeight: 400
  },
  imageSectionMobile: {
    width: '100%',
    height: 200
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 20,
    lineHeight: 34
  },
  description: {
    fontSize: 16,
    color: colors.darkGrey,
    lineHeight: 24,
    marginBottom: 24
  },
  buttonsContainer: {
    gap: 12
  },
  customButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48
  },
  primaryButton: {
    backgroundColor: colors.primary
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  primaryButtonText: {
    color: colors.white
  },
  secondaryButtonText: {
    color: colors.primary
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    minHeight: 300
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGrey,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.3,
    marginBottom: 8
  },
  placeholderLabel: {
    fontSize: 16,
    color: colors.mediumGrey,
    fontWeight: '500'
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10
  },
  prevButton: {
    left: 16
  },
  nextButton: {
    right: 16
  },
  navButtonDisabled: {
    backgroundColor: colors.lightGrey,
    opacity: 0.5
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary
  },
  navButtonTextDisabled: {
    color: colors.mediumGrey
  },
  counterContainer: {
    position: 'absolute',
    top: 16,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10
  },
  counterText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500'
  }
};

export default PortfolioModal;