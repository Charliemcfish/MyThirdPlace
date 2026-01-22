import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import { getCurrentUser } from '../../services/auth';
import { 
  updateUserProfile, 
  getUserProfile, 
  validateProfileData 
} from '../../services/user';
import Button from '../../components/common/Button';
import SecondaryButton from '../../components/common/SecondaryButton';
import PhotoUpload from '../../components/profile/PhotoUpload';
import Navigation from '../../components/common/Navigation';

const EditProfileScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    linkedinURL: '',
    portfolioURL: '',
    publicEmail: '',
    showPublicEmail: false,
    profilePhotoURL: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
        const profile = await getUserProfile(user.uid);
        if (profile) {
          const profileData = {
            displayName: profile.displayName || '',
            bio: profile.bio || '',
            linkedinURL: profile.linkedinURL || '',
            portfolioURL: profile.portfolioURL || '',
            publicEmail: profile.publicEmail || '',
            showPublicEmail: profile.showPublicEmail || false,
            profilePhotoURL: profile.profilePhotoURL || ''
          };
          setFormData(profileData);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setInitialLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Set up auto-save with debounce
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      autoSave({ ...formData, [field]: value });
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    setAutoSaveTimeout(timeout);
  };

  const autoSave = async (dataToSave) => {
    if (!currentUser || !hasChanges) return;
    
    const validation = validateProfileData(dataToSave);
    if (validation.isValid) {
      try {
        await updateUserProfile(currentUser.uid, dataToSave);
        setHasChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  };

  const validateForm = () => {
    const validation = validateProfileData(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handlePhotoUpdated = (photoURL) => {
    updateFormData('profilePhotoURL', photoURL);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (currentUser) {
        await updateUserProfile(currentUser.uid, formData);
        setHasChanges(false);
        
        Alert.alert(
          'Profile Updated',
          'Your profile has been updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  if (initialLoading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
        <View style={globalStyles.headerContainer}>
          <View style={globalStyles.maxWidthContainer}>
            <Text style={globalStyles.headerText}>Edit Profile</Text>
            {hasChanges && (
              <Text style={styles.autoSaveText}>Changes will be saved automatically</Text>
            )}
          </View>
        </View>

        <View style={globalStyles.maxWidthContainerPadded}>
          {/* Profile Photo Upload */}
          <View style={globalStyles.card}>
            <Text style={[globalStyles.heading4, { marginBottom: 16, textAlign: 'center' }]}>
              Profile Photo
            </Text>
            <PhotoUpload
              userId={currentUser?.uid}
              currentPhotoURL={formData.profilePhotoURL}
              displayName={formData.displayName}
              onPhotoUpdated={handlePhotoUpdated}
              size="large"
            />
          </View>

          {/* Basic Information */}
          <View style={globalStyles.card}>
            <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>Basic Information</Text>

            <Text style={[globalStyles.bodyText, { marginBottom: 8 }]}>Display Name *</Text>
            <TextInput
              style={[
                globalStyles.input,
                errors.displayName && { borderColor: colors.error }
              ]}
              placeholder="Your display name"
              value={formData.displayName}
              onChangeText={(value) => updateFormData('displayName', value)}
              autoCapitalize="words"
            />
            {errors.displayName && <Text style={globalStyles.errorText}>{errors.displayName}</Text>}

            <Text style={[globalStyles.bodyText, { marginBottom: 8, marginTop: 16 }]}>Bio</Text>
            <TextInput
              style={[
                globalStyles.input,
                { height: 100, textAlignVertical: 'top' },
                errors.bio && { borderColor: colors.error }
              ]}
              placeholder="Tell us about yourself and your interests in third places..."
              value={formData.bio}
              onChangeText={(value) => updateFormData('bio', value)}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            {errors.bio && <Text style={globalStyles.errorText}>{errors.bio}</Text>}
            <Text style={[globalStyles.captionText, { textAlign: 'right' }]}>
              {formData.bio.length}/500
            </Text>
          </View>

          {/* Contact Information */}
          <View style={globalStyles.card}>
            <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>Contact Information</Text>

            <Text style={[globalStyles.bodyText, { marginBottom: 8 }]}>Public Email</Text>
            <TextInput
              style={[
                globalStyles.input,
                errors.publicEmail && { borderColor: colors.error }
              ]}
              placeholder="public@example.com (optional)"
              value={formData.publicEmail}
              onChangeText={(value) => updateFormData('publicEmail', value)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.publicEmail && <Text style={globalStyles.errorText}>{errors.publicEmail}</Text>}

            {/* Public Email Visibility Toggle */}
            <View style={styles.switchContainer}>
              <Text style={globalStyles.bodyText}>Show public email on profile</Text>
              <Switch
                value={formData.showPublicEmail}
                onValueChange={(value) => updateFormData('showPublicEmail', value)}
                trackColor={{ false: colors.lightGrey, true: colors.primary }}
                thumbColor={formData.showPublicEmail ? colors.white : colors.mediumGrey}
              />
            </View>

            <Text style={[globalStyles.bodyText, { marginBottom: 8, marginTop: 16 }]}>LinkedIn URL</Text>
            <TextInput
              style={[
                globalStyles.input,
                errors.linkedinURL && { borderColor: colors.error }
              ]}
              placeholder="https://linkedin.com/in/yourprofile (optional)"
              value={formData.linkedinURL}
              onChangeText={(value) => updateFormData('linkedinURL', value)}
              autoCapitalize="none"
            />
            {errors.linkedinURL && <Text style={globalStyles.errorText}>{errors.linkedinURL}</Text>}

            <Text style={[globalStyles.bodyText, { marginBottom: 8, marginTop: 16 }]}>Portfolio URL</Text>
            <TextInput
              style={[
                globalStyles.input,
                errors.portfolioURL && { borderColor: colors.error }
              ]}
              placeholder="https://yourportfolio.com (optional)"
              value={formData.portfolioURL}
              onChangeText={(value) => updateFormData('portfolioURL', value)}
              autoCapitalize="none"
            />
            {errors.portfolioURL && <Text style={globalStyles.errorText}>{errors.portfolioURL}</Text>}
          </View>

          <Button
            onPress={handleSave}
            disabled={loading}
            style={loading && { opacity: 0.6 }}
          >
            {loading ? <ActivityIndicator color={colors.white} /> : 'Save Changes'}
          </Button>

          <SecondaryButton onPress={() => navigation.goBack()}>
            Cancel
          </SecondaryButton>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  autoSaveText: {
    fontSize: 12,
    color: colors.mediumGrey,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8
  }
};

export default EditProfileScreen;