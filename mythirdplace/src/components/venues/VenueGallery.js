import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  Pressable, 
  ScrollView, 
  Dimensions,
  Platform,
  Modal
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';

const VenueGallery = ({ 
  photos = [], 
  venueName = '',
  style = {},
  mainImageHeight = 300
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 768;

  if (!photos || photos.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.placeholderContainer, { height: mainImageHeight }]}>
          <Text style={styles.placeholderText}>📸</Text>
          <Text style={styles.placeholderSubtext}>No photos available</Text>
        </View>
      </View>
    );
  }

  const currentPhoto = photos[currentPhotoIndex];

  const goToPrevious = () => {
    setCurrentPhotoIndex(prev => 
      prev === 0 ? photos.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentPhotoIndex(prev => 
      prev === photos.length - 1 ? 0 : prev + 1
    );
  };

  const selectPhoto = (index) => {
    setCurrentPhotoIndex(index);
  };

  const openFullscreen = () => {
    setFullscreenVisible(true);
  };

  const closeFullscreen = () => {
    setFullscreenVisible(false);
  };

  return (
    <>
      <View style={[styles.container, style]}>
        {/* Main Image */}
        <View style={styles.mainImageContainer}>
          <Pressable 
            style={[styles.mainImage, { height: mainImageHeight }]}
            onPress={openFullscreen}
          >
            <Image
              source={{ uri: currentPhoto }}
              style={styles.image}
              resizeMode="cover"
            />
            
            {/* Photo Counter */}
            {photos.length > 1 && (
              <View style={styles.photoCounter}>
                <Text style={styles.photoCounterText}>
                  {currentPhotoIndex + 1} / {photos.length}
                </Text>
              </View>
            )}

            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <Pressable 
                  style={[styles.navButton, styles.prevButton]}
                  onPress={goToPrevious}
                >
                  <Text style={styles.navButtonText}>‹</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.navButton, styles.nextButton]}
                  onPress={goToNext}
                >
                  <Text style={styles.navButtonText}>›</Text>
                </Pressable>
              </>
            )}

            {/* Fullscreen Indicator */}
            <View style={styles.fullscreenIndicator}>
              <Text style={styles.fullscreenText}>🔍</Text>
            </View>
          </Pressable>
        </View>

        {/* Thumbnail Strip */}
        {photos.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailStrip}
            contentContainerStyle={styles.thumbnailContent}
          >
            {photos.map((photo, index) => (
              <Pressable
                key={index}
                style={[
                  styles.thumbnail,
                  index === currentPhotoIndex && styles.activeThumbnail
                ]}
                onPress={() => selectPhoto(index)}
              >
                <Image
                  source={{ uri: photo }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={fullscreenVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={closeFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          <Pressable 
            style={styles.fullscreenOverlay}
            onPress={closeFullscreen}
          >
            <View style={styles.fullscreenContent}>
              {/* Close Button */}
              <Pressable 
                style={styles.closeButton}
                onPress={closeFullscreen}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>

              {/* Fullscreen Image */}
              <Image
                source={{ uri: currentPhoto }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />

              {/* Fullscreen Navigation */}
              {photos.length > 1 && (
                <>
                  <Pressable 
                    style={[styles.fullscreenNavButton, styles.fullscreenPrevButton]}
                    onPress={goToPrevious}
                  >
                    <Text style={styles.fullscreenNavText}>‹</Text>
                  </Pressable>
                  
                  <Pressable 
                    style={[styles.fullscreenNavButton, styles.fullscreenNextButton]}
                    onPress={goToNext}
                  >
                    <Text style={styles.fullscreenNavText}>›</Text>
                  </Pressable>

                  {/* Fullscreen Counter */}
                  <View style={styles.fullscreenCounter}>
                    <Text style={styles.fullscreenCounterText}>
                      {currentPhotoIndex + 1} of {photos.length}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

const styles = {
  container: {
    backgroundColor: colors.white
  },
  mainImageContainer: {
    position: 'relative',
    backgroundColor: colors.lightGrey,
    borderRadius: 12,
    overflow: 'hidden'
  },
  mainImage: {
    width: '100%',
    backgroundColor: colors.lightGrey,
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 12
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.5,
    marginBottom: 8
  },
  placeholderSubtext: {
    fontSize: 16,
    color: colors.mediumGrey
  },
  photoCounter: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  photoCounterText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600'
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  prevButton: {
    left: 16
  },
  nextButton: {
    right: 16
  },
  navButtonText: {
    color: colors.white,
    fontSize: 30,
    fontWeight: 'bold'
  },
  fullscreenIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  fullscreenText: {
    fontSize: 16
  },
  thumbnailStrip: {
    marginTop: 16
  },
  thumbnailContent: {
    paddingHorizontal: 4
  },
  thumbnail: {
    width: 80,
    height: 60,
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  activeThumbnail: {
    borderColor: colors.primary
  },
  thumbnailImage: {
    width: '100%',
    height: '100%'
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)'
  },
  fullscreenOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullscreenContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold'
  },
  fullscreenImage: {
    width: '100%',
    height: '100%'
  },
  fullscreenNavButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -40,
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullscreenPrevButton: {
    left: 20
  },
  fullscreenNextButton: {
    right: 20
  },
  fullscreenNavText: {
    color: colors.white,
    fontSize: 40,
    fontWeight: 'bold'
  },
  fullscreenCounter: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  fullscreenCounterText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600'
  }
};

export default VenueGallery;