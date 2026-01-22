import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  Platform,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import { 
  uploadProfilePhoto, 
  deleteProfilePhoto, 
  updateProfilePhoto 
} from '../../services/user';
import Avatar from '../common/Avatar';
import SecondaryButton from '../common/SecondaryButton';

const PhotoUpload = ({
  userId,
  currentPhotoURL,
  displayName,
  onPhotoUpdated,
  editable = true,
  size = 'large'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      Alert.alert('Invalid File Type', 'Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      Alert.alert('File Too Large', 'Please upload an image under 5MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const photoURL = await uploadProfilePhoto(
        file,
        userId,
        (progress) => setUploadProgress(progress)
      );
      
      await updateProfilePhoto(userId, photoURL);
      
      if (onPhotoUpdated) {
        onPhotoUpdated(photoURL);
      }
      
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePhotoRemove = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to remove your profile photo?');
      if (!confirmed) return;
    } else {
      Alert.alert(
        'Remove Photo',
        'Are you sure you want to remove your profile photo?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => confirmRemovePhoto() }
        ]
      );
      return;
    }

    await confirmRemovePhoto();
  };

  const confirmRemovePhoto = async () => {
    setUploading(true);
    try {
      await deleteProfilePhoto(userId);
      await updateProfilePhoto(userId, '');
      
      if (onPhotoUpdated) {
        onPhotoUpdated('');
      }
      
      Alert.alert('Success', 'Profile photo removed successfully!');
    } catch (error) {
      console.error('Photo removal error:', error);
      Alert.alert('Error', 'Failed to remove photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!editable) {
    return <Avatar profilePhotoURL={currentPhotoURL} displayName={displayName} size={size} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Avatar 
          profilePhotoURL={currentPhotoURL} 
          displayName={displayName} 
          size={size}
          showBorder={uploading}
        />
        
        {uploading && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator color={colors.white} size="large" />
            {uploadProgress > 0 && (
              <Text style={styles.progressText}>
                {Math.round(uploadProgress)}%
              </Text>
            )}
          </View>
        )}
      </View>

      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoSelect}
          style={{ display: 'none' }}
        />
      )}

      <View style={styles.buttonContainer}>
        <SecondaryButton
          onPress={triggerFileSelect}
          disabled={uploading}
          style={styles.button}
        >
          {currentPhotoURL ? 'Change Photo' : 'Upload Photo'}
        </SecondaryButton>

        {currentPhotoURL && (
          <SecondaryButton
            onPress={handlePhotoRemove}
            disabled={uploading}
            style={[styles.button, styles.removeButton]}
            textStyle={styles.removeButtonText}
          >
            Remove Photo
          </SecondaryButton>
        )}
      </View>
    </View>
  );
};

const styles = {
  container: {
    alignItems: 'center',
    marginVertical: 20
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  button: {
    minWidth: 120
  },
  removeButton: {
    borderColor: colors.error
  },
  removeButtonText: {
    color: colors.error
  }
};

export default PhotoUpload;