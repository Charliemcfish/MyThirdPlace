import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import Button from '../common/Button';
import SecondaryButton from '../common/SecondaryButton';

const PhotoUploader = ({
  photos = [],
  onPhotosChange,
  maxPhotos = 10,
  error = null,
  style = {}
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB per image.');
    }
  };

  const processFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    let errorMessage = '';

    // Check total count
    if (photos.length + fileArray.length > maxPhotos) {
      errorMessage = `Maximum ${maxPhotos} photos allowed. You can add ${maxPhotos - photos.length} more.`;
    }

    // Validate each file
    const filesToProcess = fileArray.slice(0, maxPhotos - photos.length);
    
    for (const file of filesToProcess) {
      try {
        validateFile(file);
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        validFiles.push({
          file,
          previewUrl,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size
        });
      } catch (error) {
        errorMessage += `${file.name}: ${error.message} `;
      }
    }

    if (errorMessage) {
      Alert.alert('Upload Error', errorMessage);
    }

    if (validFiles.length > 0) {
      const updatedPhotos = [...photos, ...validFiles];
      onPhotosChange(updatedPhotos);
    }
  }, [photos, maxPhotos, onPhotosChange]);

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    event.target.value = '';
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removePhoto = (photoId) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    
    // Clean up preview URLs
    const removedPhoto = photos.find(photo => photo.id === photoId);
    if (removedPhoto && removedPhoto.previewUrl) {
      URL.revokeObjectURL(removedPhoto.previewUrl);
    }
    
    onPhotosChange(updatedPhotos);
  };

  const movePhoto = (fromIndex, toIndex) => {
    const updatedPhotos = [...photos];
    const [movedPhoto] = updatedPhotos.splice(fromIndex, 1);
    updatedPhotos.splice(toIndex, 0, movedPhoto);
    onPhotosChange(updatedPhotos);
  };

  const triggerFileSelect = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[globalStyles.heading4, { marginBottom: 8 }]}>
        Photos ({photos.length}/{maxPhotos})
      </Text>
      
      <Text style={[globalStyles.captionText, { marginBottom: 16 }]}>
        Add at least 1 photo (maximum {maxPhotos}). First photo will be the main image.
      </Text>

      {/* File Input (hidden) */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      )}

      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <View
          style={[
            styles.uploadArea,
            dragOver && styles.dragOver
          ]}
          onDrop={Platform.OS === 'web' ? handleDrop : undefined}
          onDragOver={Platform.OS === 'web' ? handleDragOver : undefined}
          onDragLeave={Platform.OS === 'web' ? handleDragLeave : undefined}
        >
          <Text style={styles.uploadIcon}>📷</Text>
          <Text style={styles.uploadText}>
            {Platform.OS === 'web' 
              ? 'Drag and drop photos here or click to browse'
              : 'Tap to select photos'
            }
          </Text>
          <Text style={styles.uploadSubtext}>
            JPEG, PNG, or WebP • Max 5MB each
          </Text>
          
          <Button 
            onPress={triggerFileSelect}
            style={styles.uploadButton}
          >
            Choose Photos
          </Button>
        </View>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <ScrollView 
          horizontal={false} 
          style={styles.photoGrid}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.photoRow}>
            {photos.map((photo, index) => (
              <PhotoItem
                key={photo.id}
                photo={photo}
                index={index}
                isPrimary={index === 0}
                onRemove={() => removePhoto(photo.id)}
                onMoveLeft={index > 0 ? () => movePhoto(index, index - 1) : null}
                onMoveRight={index < photos.length - 1 ? () => movePhoto(index, index + 1) : null}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {error && (
        <Text style={globalStyles.errorText}>{error}</Text>
      )}

      {/* Instructions */}
      {photos.length > 0 && (
        <View style={styles.instructions}>
          <Text style={globalStyles.captionText}>
            • First photo will be your main image
          </Text>
          <Text style={globalStyles.captionText}>
            • Use arrows to reorder photos
          </Text>
          <Text style={globalStyles.captionText}>
            • Tap ✕ to remove photos
          </Text>
        </View>
      )}
    </View>
  );
};

const PhotoItem = ({ photo, index, isPrimary, onRemove, onMoveLeft, onMoveRight }) => (
  <View style={[styles.photoItem, isPrimary && styles.primaryPhotoItem]}>
    <Image 
      source={{ uri: photo.previewUrl }} 
      style={styles.photoPreview}
      resizeMode="cover"
    />
    
    {isPrimary && (
      <View style={styles.primaryBadge}>
        <Text style={styles.primaryBadgeText}>Main</Text>
      </View>
    )}

    <View style={styles.photoControls}>
      <View style={styles.photoControlsTop}>
        {onMoveLeft && (
          <Pressable style={styles.moveButton} onPress={onMoveLeft}>
            <Text style={styles.moveButtonText}>←</Text>
          </Pressable>
        )}
        
        {onMoveRight && (
          <Pressable style={styles.moveButton} onPress={onMoveRight}>
            <Text style={styles.moveButtonText}>→</Text>
          </Pressable>
        )}
      </View>
      
      <Pressable style={styles.removeButton} onPress={onRemove}>
        <Text style={styles.removeButtonText}>✕</Text>
      </Pressable>
    </View>

    <Text style={styles.photoName} numberOfLines={1}>
      {photo.name}
    </Text>
  </View>
);

const styles = {
  container: {
    marginVertical: 16
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: colors.lightGrey,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    marginBottom: 16
  },
  dragOver: {
    borderColor: colors.primary,
    backgroundColor: colors.lightGreen
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8
  },
  uploadSubtext: {
    fontSize: 14,
    color: colors.mediumGrey,
    textAlign: 'center',
    marginBottom: 16
  },
  uploadButton: {
    minWidth: 150
  },
  photoGrid: {
    maxHeight: 400
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  photoItem: {
    width: 150,
    backgroundColor: colors.white,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightGrey,
    marginBottom: 16
  },
  primaryPhotoItem: {
    borderColor: colors.primary,
    borderWidth: 2
  },
  photoPreview: {
    width: '100%',
    height: 120,
    backgroundColor: colors.lightGrey
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  primaryBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold'
  },
  photoControls: {
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'flex-end'
  },
  photoControlsTop: {
    flexDirection: 'row',
    marginBottom: 4
  },
  moveButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4
  },
  moveButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold'
  },
  removeButton: {
    backgroundColor: colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  removeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold'
  },
  photoName: {
    padding: 8,
    fontSize: 12,
    color: colors.mediumGrey,
    textAlign: 'center'
  },
  instructions: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8
  }
};

export default PhotoUploader;