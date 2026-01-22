import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import {
  createPortfolioItem,
  updatePortfolioItem,
  getPortfolioItem,
  validatePortfolioData
} from '../../services/portfolio';
import { getUserProfile } from '../../services/user';
import Navigation from '../../components/common/Navigation';
import PortfolioForm from '../../components/portfolio/PortfolioForm';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

const CreatePortfolioScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { portfolioId, mode = 'create' } = route.params || {};

  useDocumentTitle(mode === 'edit' ? 'Edit Portfolio Item' : 'Create Portfolio Item');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    featuredImage: null,
    buttons: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  const isEditMode = mode === 'edit' && portfolioId;

  useEffect(() => {
    loadUserProfile();
    if (isEditMode) {
      loadPortfolioForEdit();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadPortfolioForEdit = async () => {
    try {
      setLoading(true);

      const portfolio = await getPortfolioItem(portfolioId);

      if (!portfolio) {
        Alert.alert('Error', 'Portfolio item not found');
        navigation.goBack();
        return;
      }

      // Check if current user is the owner
      const user = auth.currentUser;
      if (!user || portfolio.userUID !== user.uid) {
        Alert.alert('Error', 'You can only edit your own portfolio items');
        navigation.goBack();
        return;
      }

      // Populate form with portfolio data
      const portfolioFormData = {
        title: portfolio.title || '',
        description: portfolio.description || '',
        featuredImage: portfolio.featuredImageURL ? { uri: portfolio.featuredImageURL } : null,
        buttons: Array.isArray(portfolio.buttons) ? portfolio.buttons : []
      };

      setFormData(portfolioFormData);
      setOriginalData(portfolioFormData);

    } catch (error) {
      console.error('Error loading portfolio for edit:', error);
      Alert.alert('Error', 'Could not load portfolio item for editing');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Add userUID to form data for validation
      const portfolioData = {
        ...formData,
        userUID: user.uid
      };

      // Validate form data
      const validation = validatePortfolioData(portfolioData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        Alert.alert('Validation Error', 'Please fix the errors before saving');
        return;
      }

      // Prepare data for save
      const saveData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        buttons: formData.buttons.filter(button =>
          button.text.trim() && button.url.trim()
        ),
        userUID: user.uid
      };

      // Handle image upload
      let imageBlob = null;
      if (formData.featuredImage) {
        // Check if this is already a Firebase Storage URL (for edit mode)
        if (formData.featuredImage.uri && formData.featuredImage.uri.includes('firebasestorage.googleapis.com')) {
          // Image is already uploaded, no need to re-upload
          imageBlob = null;
        } else {
          // New image that needs to be uploaded
          try {
            const response = await fetch(formData.featuredImage.uri);
            imageBlob = await response.blob();
          } catch (fetchError) {
            console.error('Error converting image to blob:', fetchError);
            imageBlob = formData.featuredImage;
          }
        }
      }

      let result;
      if (isEditMode) {
        result = await updatePortfolioItem(portfolioId, saveData, imageBlob);
      } else {
        result = await createPortfolioItem(saveData, imageBlob);
      }

      // Navigate immediately and show success message
      navigation.navigate('Profile');

      // Show brief success message
      setTimeout(() => {
        Alert.alert(
          'Success',
          isEditMode ? 'Portfolio item updated successfully!' : 'Portfolio item created successfully!'
        );
      }, 100);

    } catch (error) {
      console.error('Error saving portfolio item:', error);
      Alert.alert('Error', error.message || 'Failed to save portfolio item');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = () => {
      if (isEditMode && originalData) {
        // Compare current form data with original data for edit mode
        return (
          formData.title !== originalData.title ||
          formData.description !== originalData.description ||
          formData.buttons.length !== originalData.buttons.length ||
          JSON.stringify(formData.buttons) !== JSON.stringify(originalData.buttons) ||
          (formData.featuredImage?.uri !== originalData.featuredImage?.uri)
        );
      } else {
        // For create mode, check if any fields are filled
        return formData.title || formData.description || formData.featuredImage || formData.buttons.length > 0;
      }
    };

    if (hasChanges()) {
      const confirmAction = () => {
        if (Platform.OS === 'web') {
          const confirmed = window.confirm('Are you sure you want to discard your changes?');
          if (confirmed) {
            navigation.goBack();
          }
        } else {
          Alert.alert(
            'Discard Changes',
            'Are you sure you want to discard your changes?',
            [
              { text: 'Keep Editing', style: 'cancel' },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => navigation.goBack()
              }
            ]
          );
        }
      };
      confirmAction();
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Navigation navigation={navigation} />

      <View style={styles.headerContainer}>
        <View style={globalStyles.maxWidthContainer}>
          <Text style={globalStyles.headerText}>
            {isEditMode ? 'Edit Portfolio Item' : 'Create Portfolio Item'}
          </Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <PortfolioForm
          portfolioData={formData}
          onPortfolioDataChange={setFormData}
          errors={errors}
          onErrorsChange={setErrors}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={handleCancel}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  headerContainer: {
    ...globalStyles.headerContainer
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%'
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: {
        elevation: 4
      }
    })
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  saveButton: {
    backgroundColor: colors.primary
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.mediumGrey
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white
  }
};

export default CreatePortfolioScreen;