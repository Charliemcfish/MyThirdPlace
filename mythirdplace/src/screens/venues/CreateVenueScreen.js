import React, { useState, useEffect, useCallback } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import { getCurrentUser } from '../../services/auth';
import { createVenue, validateVenueData } from '../../services/venue';
import Button from '../../components/common/Button';
import SecondaryButton from '../../components/common/SecondaryButton';
import CategorySelector from '../../components/venues/CategorySelector';
import AddressForm from '../../components/venues/AddressForm';
import PhotoUploader from '../../components/venues/PhotoUploader';
import Navigation from '../../components/common/Navigation';
import OwnershipSelector from '../../components/venues/enhanced/OwnershipSelector';
import TagSelector from '../../components/venues/enhanced/TagSelector';
import ContactInformation from '../../components/venues/enhanced/ContactInformation';
import SocialMediaLinks from '../../components/venues/enhanced/SocialMediaLinks';
import MultipleLocations from '../../components/venues/enhanced/MultipleLocations';

const CreateVenueScreen = ({ navigation }) => {
  useDocumentTitle('Add Venue');

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    ownershipType: '', // 'owner' or 'visitor'
    address: {
      street: '',
      city: '',
      postcode: '',
      country: 'United Kingdom'
    },
    tags: [],
    contactInfo: {
      workEmail: '',
      workPhone: '',
      website: ''
    },
    socialMedia: {
      instagram: '',
      facebook: '',
      linkedin: '',
      twitter: '',
      tiktok: ''
    },
    hasMultipleLocations: false,
    additionalLocations: []
  });
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  const getSteps = () => {
    const baseSteps = [
      { number: 1, title: 'Ownership', subtitle: 'Do you own this venue?' },
      { number: 2, title: 'Basic Info', subtitle: 'Name and description' },
      { number: 3, title: 'Category', subtitle: 'What type of place is it?' },
      { number: 4, title: 'Address', subtitle: 'Where is it located?' }
    ];

    let stepNumber = 5;

    // Add owner-specific steps
    if (formData.ownershipType === 'owner') {
      baseSteps.push(
        { number: stepNumber++, title: 'Contact Info', subtitle: 'Business contact details' }
      );
    }

    // Add social media step for all users
    baseSteps.push(
      { number: stepNumber++, title: 'Social Media', subtitle: 'Online presence and social links' }
    );

    // Add common steps
    baseSteps.push(
      { number: stepNumber++, title: 'Amenities', subtitle: 'Tags and features' },
      { number: stepNumber++, title: 'Photos', subtitle: 'Add images of the venue' },
      { number: stepNumber++, title: 'Review', subtitle: 'Check everything looks good' }
    );

    return baseSteps;
  };
  
  const steps = getSteps();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to create a venue listing.');
      navigation.goBack();
    } else {
      setCurrentUser(user);
    }
  }, [navigation]);

  useEffect(() => {
    // Auto-save draft to local storage (for web)
    if (Platform.OS === 'web') {
      const draftData = {
        formData,
        photos: photos.map(p => ({ ...p, file: null })), // Remove file objects for storage
        currentStep
      };
      localStorage.setItem('venue_draft', JSON.stringify(draftData));
    }
  }, [formData, photos, currentStep]);

  useEffect(() => {
    // Load draft on component mount
    if (Platform.OS === 'web') {
      const draft = localStorage.getItem('venue_draft');
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          if (parsedDraft.formData) {
            setFormData(parsedDraft.formData);
            setCurrentStep(parsedDraft.currentStep || 1);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, []);

  const updateFormData = (field, value) => {
    setFormData(prev => {
      if (field.includes('.')) {
        // Handle nested fields like address.street
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateCurrentStep = () => {
    const stepErrors = {};
    const stepInfo = steps[currentStep - 1];
    
    if (!stepInfo) return true;

    switch (stepInfo.title) {
      case 'Ownership':
        if (!formData.ownershipType) {
          stepErrors.ownershipType = 'Please select whether you own this venue';
        }
        break;

      case 'Basic Info':
        if (!formData.name || formData.name.trim().length < 3) {
          stepErrors.name = 'Venue name must be at least 3 characters';
        } else if (formData.name.length > 100) {
          stepErrors.name = 'Venue name must be less than 100 characters';
        }

        if (!formData.description || formData.description.trim().length < 50) {
          stepErrors.description = 'Description must be at least 50 characters';
        } else if (formData.description.length > 2000) {
          stepErrors.description = 'Description must be less than 2000 characters';
        }
        break;

      case 'Category':
        if (!formData.category) {
          stepErrors.category = 'Please select a category';
        }
        break;

      case 'Address':
        if (!formData.address.street || formData.address.street.trim().length < 3) {
          stepErrors.addressStreet = 'Street address is required';
        }
        if (!formData.address.city || formData.address.city.trim().length < 2) {
          stepErrors.addressCity = 'City is required';
        }
        if (!formData.address.country) {
          stepErrors.addressCountry = 'Country is required';
        }
        break;

      case 'Contact Info':
        if (formData.ownershipType === 'owner') {
          if (!formData.contactInfo.workEmail || !formData.contactInfo.workEmail.trim()) {
            stepErrors.workEmail = 'Business email is required for venue owners';
          } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.contactInfo.workEmail)) {
              stepErrors.workEmail = 'Please enter a valid email address';
            }
          }
          
          if (formData.contactInfo.workPhone && formData.contactInfo.workPhone.trim()) {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
            if (!phoneRegex.test(formData.contactInfo.workPhone)) {
              stepErrors.workPhone = 'Please enter a valid phone number';
            }
          }
          
          if (formData.contactInfo.website && formData.contactInfo.website.trim()) {
            try {
              new URL(formData.contactInfo.website.startsWith('http') 
                ? formData.contactInfo.website 
                : 'https://' + formData.contactInfo.website);
            } catch {
              stepErrors.website = 'Please enter a valid website URL';
            }
          }
        }
        break;

      case 'Social Media':
        // Social media validation will be handled by the SocialMediaLinks component
        break;

      case 'Amenities':
        // Tags validation - no required validation needed
        if (formData.tags.length > 20) {
          stepErrors.tags = 'Maximum 20 tags allowed';
        }
        break;

      case 'Photos':
        if (photos.length === 0) {
          stepErrors.photos = 'At least one photo is required';
        }
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const goToNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
  };

  const handleSubmit = async () => {
    // Validate all data
    const venueData = {
      ...formData,
      createdBy: currentUser.uid
    };

    const validation = validateVenueData(venueData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Photos Required', 'Please add at least one photo of the venue.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Extract files for upload
      const photoFiles = photos.map(photo => photo.file);

      // Create venue
      const venueId = await createVenue(
        venueData,
        photoFiles,
        (progress) => setUploadProgress(progress)
      );

      // Clear draft
      if (Platform.OS === 'web') {
        localStorage.removeItem('venue_draft');
      }

      // Navigate to the newly created venue with success state
      navigation.replace('VenueDetail', { 
        venueId, 
        showSuccessMessage: true,
        venueName: formData.name 
      });
    } catch (error) {
      console.error('🚨 ERROR: Creating venue failed:', error);
      console.error('🚨 ERROR: Error message:', error.message);
      
      // Parse the error message for user-friendly display
      let userFriendlyMessage = 'Failed to create venue. Please try again.';
      let errorDetails = '';
      
      if (error.message) {
        console.log('🔍 PARSING ERROR: Checking error message type...');
        
        if (error.message.includes('Social media validation failed:') || error.message.includes('SOCIAL_MEDIA_VALIDATION_ERROR:')) {
          console.log('🔍 PARSING ERROR: Detected social media validation error');
          userFriendlyMessage = 'There are issues with your social media links.';
          errorDetails = error.message.includes('SOCIAL_MEDIA_VALIDATION_ERROR:')
            ? error.message.replace('SOCIAL_MEDIA_VALIDATION_ERROR: ', '')
            : error.message.replace('Social media validation failed: ', '').replace(/,/g, '\n• ');
        } else if (error.message.includes('Invalid tags selected')) {
          console.log('🔍 PARSING ERROR: Detected tags validation error');
          userFriendlyMessage = 'Some selected amenities are invalid. Please review your tag selections.';
        } else if (error.message.includes('Validation failed:')) {
          console.log('🔍 PARSING ERROR: Detected general validation error');
          userFriendlyMessage = 'Please check your form for errors.';
          errorDetails = error.message.replace('Validation failed: ', '').replace(/,/g, '\n• ');
        } else {
          console.log('🔍 PARSING ERROR: Unknown error type');
          errorDetails = error.message;
        }
      }
      
      // Show user-friendly error dialog
      console.log('🔍 DIALOG: About to show error dialog. Error includes social media?', 
        error.message && (error.message.includes('Social media validation failed:') || error.message.includes('SOCIAL_MEDIA_VALIDATION_ERROR:')));
      
      if (error.message && (error.message.includes('Social media validation failed:') || error.message.includes('SOCIAL_MEDIA_VALIDATION_ERROR:'))) {
        console.log('🚨 DIALOG: Showing social media error dialog');
        const socialMediaErrorDetails = error.message.includes('SOCIAL_MEDIA_VALIDATION_ERROR:') 
          ? error.message.replace('SOCIAL_MEDIA_VALIDATION_ERROR: ', '').replace(/\|/g, '\n• ')
          : errorDetails;
        
        console.log('🚨 DIALOG: Error details for popup:', socialMediaErrorDetails);
          
        // TEST: Show a simple alert first to verify popup system works
        Alert.alert(
          '🔗 Social Media Link Issues',
          `There are problems with your social media links:\n\n• ${socialMediaErrorDetails}\n\nPlease check your URLs and try again. Make sure to include the full URL (e.g., https://www.facebook.com/yourpage)`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Fix Social Media Links', 
              onPress: () => {
                // Go to Social Media step
                for (let i = 0; i < steps.length; i++) {
                  if (steps[i].title === 'Social Media') {
                    setCurrentStep(i + 1);
                    break;
                  }
                }
              }
            }
          ]
        );
        return; // Exit early to prevent other error dialogs
      } else if (error.message && error.message.includes('Invalid tags selected')) {
        Alert.alert(
          '🏷️ Amenities Issue',
          'Some selected amenities are invalid. Please review your tag selections.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Fix Amenities',
              onPress: () => {
                // Go to Amenities step
                for (let i = 0; i < steps.length; i++) {
                  if (steps[i].title === 'Amenities') {
                    setCurrentStep(i + 1);
                    break;
                  }
                }
              }
            }
          ]
        );
      } else if (error.message && error.message.includes('Business email is required')) {
        Alert.alert(
          '📧 Contact Information Required',
          'Business email is required for venue owners. Please add your business email address.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Add Contact Info',
              onPress: () => {
                // Go to Contact Info step
                for (let i = 0; i < steps.length; i++) {
                  if (steps[i].title === 'Contact Info') {
                    setCurrentStep(i + 1);
                    break;
                  }
                }
              }
            }
          ]
        );
      } else {
        // Generic error
        Alert.alert(
          '❌ Unable to Create Venue',
          userFriendlyMessage + (errorDetails ? `\n\nDetails: ${errorDetails}` : '') + '\n\nPlease check your information and try again.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Go to the first step to review
                setCurrentStep(1);
              }
            }
          ]
        );
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <Pressable
              style={[
                styles.progressStep,
                currentStep >= step.number && styles.progressStepActive,
                currentStep === step.number && styles.progressStepCurrent
              ]}
              onPress={() => goToStep(step.number)}
            >
              <Text style={[
                styles.progressStepText,
                currentStep >= step.number && styles.progressStepTextActive
              ]}>
                {step.number}
              </Text>
            </Pressable>
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine,
                currentStep > step.number && styles.progressLineActive
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
      <Text style={styles.stepTitle}>
        Step {currentStep}: {steps[currentStep - 1]?.title}
      </Text>
      <Text style={styles.stepSubtitle}>
        {steps[currentStep - 1]?.subtitle}
      </Text>
    </View>
  );

  const renderStepContent = () => {
    const stepInfo = steps[currentStep - 1];
    if (!stepInfo) return null;

    switch (stepInfo.title) {
      case 'Ownership':
        return (
          <View style={globalStyles.card}>
            <OwnershipSelector
              selectedOwnership={formData.ownershipType}
              onOwnershipSelect={(ownership) => updateFormData('ownershipType', ownership)}
              error={errors.ownershipType}
            />
          </View>
        );

      case 'Basic Info':
        return (
          <View style={globalStyles.card}>
            <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>
              Basic Information
            </Text>

            <Text style={[globalStyles.bodyText, { marginBottom: 8, fontWeight: '600' }]}>
              Venue Name *
            </Text>
            <TextInput
              style={[
                globalStyles.input,
                errors.name && { borderColor: colors.error }
              ]}
              placeholder="e.g., Central Library, The Green Coffee Shop"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              autoCapitalize="words"
              maxLength={100}
            />
            {errors.name && <Text style={globalStyles.errorText}>{errors.name}</Text>}

            <Text style={[globalStyles.bodyText, { marginBottom: 8, marginTop: 16, fontWeight: '600' }]}>
              Description *
            </Text>
            <TextInput
              style={[
                globalStyles.input,
                { height: 120, textAlignVertical: 'top' },
                errors.description && { borderColor: colors.error }
              ]}
              placeholder="Describe this third place. What makes it special? What activities happen here? What's the atmosphere like?"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={5}
              maxLength={2000}
            />
            {errors.description && <Text style={globalStyles.errorText}>{errors.description}</Text>}
            <Text style={[globalStyles.captionText, { textAlign: 'right', marginTop: 4 }]}>
              {formData.description.length}/2000
            </Text>
          </View>
        );

      case 'Category':
        return (
          <View style={globalStyles.card}>
            <Text style={[globalStyles.heading4, { marginBottom: 8 }]}>
              Venue Category
            </Text>
            <Text style={[globalStyles.captionText, { marginBottom: 16 }]}>
              Select the category that best describes this venue
            </Text>
            <CategorySelector
              selectedCategory={formData.category}
              onCategorySelect={(category) => updateFormData('category', category)}
              error={errors.category}
              showCreateOption={true}
              layout="horizontal"
            />
          </View>
        );

      case 'Address':
        return (
          <View style={globalStyles.card}>
            <View style={styles.mainAddressContainer}>
              <AddressForm
                address={formData.address}
                onAddressChange={(address) => updateFormData('address', address)}
                errors={errors}
              />
            </View>

            <View style={styles.multipleLocationsContainer}>
              <MultipleLocations
                hasMultipleLocations={formData.hasMultipleLocations}
                onHasMultipleLocationsChange={(enabled) => updateFormData('hasMultipleLocations', enabled)}
                additionalLocations={formData.additionalLocations}
                onAdditionalLocationsChange={(locations) => updateFormData('additionalLocations', locations)}
                errors={errors}
              />
            </View>
          </View>
        );

      case 'Contact Info':
        return (
          <View style={globalStyles.card}>
            <ContactInformation
              contactInfo={formData.contactInfo}
              onContactInfoChange={(contactInfo) => updateFormData('contactInfo', contactInfo)}
              errors={errors}
            />
          </View>
        );

      case 'Social Media':
        return (
          <View style={globalStyles.card}>
            <SocialMediaLinks
              socialMedia={formData.socialMedia}
              onSocialMediaChange={(socialMedia) => updateFormData('socialMedia', socialMedia)}
              errors={errors}
            />
          </View>
        );

      case 'Amenities':
        return (
          <View style={globalStyles.card}>
            <TagSelector
              selectedTags={formData.tags}
              onTagsChange={(tags) => updateFormData('tags', tags)}
              error={errors.tags}
            />
          </View>
        );

      case 'Photos':
        return (
          <View style={globalStyles.card}>
            <PhotoUploader
              photos={photos}
              onPhotosChange={setPhotos}
              error={errors.photos}
            />
          </View>
        );

      case 'Review':
        return (
          <View>
            <View style={globalStyles.card}>
              <Text style={[globalStyles.heading4, { marginBottom: 16 }]}>
                Review Your Listing
              </Text>
              
              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Ownership:</Text>
                <Text style={styles.reviewValue}>
                  {formData.ownershipType === 'owner' ? 'Business Owner/Manager' : 'Community Member'}
                </Text>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Name:</Text>
                <Text style={styles.reviewValue}>{formData.name}</Text>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Category:</Text>
                <Text style={styles.reviewValue}>{formData.category}</Text>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Description:</Text>
                <Text style={styles.reviewValue}>{formData.description}</Text>
              </View>

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Address:</Text>
                <Text style={styles.reviewValue}>
                  {[
                    formData.address.street,
                    formData.address.city,
                    formData.address.postcode,
                    formData.address.country
                  ].filter(Boolean).join(', ')}
                </Text>
              </View>

              {formData.hasMultipleLocations && formData.additionalLocations.length > 0 && (
                <View style={styles.reviewSection}>
                  <Text style={styles.reviewLabel}>Additional Locations:</Text>
                  <Text style={styles.reviewValue}>
                    {formData.additionalLocations.length} additional location{formData.additionalLocations.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {formData.ownershipType === 'owner' && (
                <>
                  <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>Business Email:</Text>
                    <Text style={styles.reviewValue}>{formData.contactInfo.workEmail || 'Not provided'}</Text>
                  </View>

                  <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>Business Phone:</Text>
                    <Text style={styles.reviewValue}>{formData.contactInfo.workPhone || 'Not provided'}</Text>
                  </View>

                  <View style={styles.reviewSection}>
                    <Text style={styles.reviewLabel}>Website:</Text>
                    <Text style={styles.reviewValue}>{formData.contactInfo.website || 'Not provided'}</Text>
                  </View>
                </>
              )}

              {formData.tags.length > 0 && (
                <View style={styles.reviewSection}>
                  <Text style={styles.reviewLabel}>Amenities:</Text>
                  <Text style={styles.reviewValue}>{formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''} selected</Text>
                </View>
              )}

              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Photos:</Text>
                <Text style={styles.reviewValue}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</Text>
              </View>
            </View>

            {loading && (
              <View style={globalStyles.card}>
                <Text style={[globalStyles.bodyText, { textAlign: 'center', marginBottom: 16 }]}>
                  Creating your venue listing...
                </Text>
                <ActivityIndicator size="large" color={colors.primary} />
                {uploadProgress > 0 && (
                  <Text style={[globalStyles.captionText, { textAlign: 'center', marginTop: 8 }]}>
                    Upload progress: {Math.round(uploadProgress)}%
                  </Text>
                )}
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

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
            <Text style={globalStyles.headerText}>Create Venue</Text>
          </View>
        </View>

        <View style={globalStyles.maxWidthContainerPadded}>
          {renderProgressBar()}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentStep > 1 && (
              <SecondaryButton
                onPress={goToPreviousStep}
                style={styles.navButton}
                disabled={loading}
              >
                Previous
              </SecondaryButton>
            )}

            {currentStep < steps.length ? (
              <Button
                onPress={goToNextStep}
                style={[styles.navButton, currentStep === 1 && styles.fullWidthButton]}
                disabled={loading}
              >
                Next
              </Button>
            ) : (
              <Button
                onPress={handleSubmit}
                style={[styles.navButton, styles.submitButton]}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Venue'}
              </Button>
            )}
          </View>
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
  progressContainer: {
    marginBottom: 32,
    alignItems: 'center'
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '100%',
    paddingHorizontal: 16
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2
  },
  progressStepActive: {
    backgroundColor: colors.primary
  },
  progressStepCurrent: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.2 }]
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.mediumGrey
  },
  progressStepTextActive: {
    color: colors.white
  },
  progressLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.lightGrey,
    marginHorizontal: 4
  },
  progressLineActive: {
    backgroundColor: colors.primary
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center'
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.mediumGrey,
    textAlign: 'center',
    marginTop: 4
  },
  reviewSection: {
    marginBottom: 16
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mediumGrey,
    marginBottom: 4
  },
  reviewValue: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16
  },
  navButton: {
    flex: 1
  },
  fullWidthButton: {
    flex: 1
  },
  submitButton: {
    backgroundColor: colors.primary
  },
  mainAddressContainer: {
    position: 'relative',
    zIndex: 999999999,
    elevation: 999999999,
  },
  multipleLocationsContainer: {
    position: 'relative',
    zIndex: 1,
    elevation: 1,
  }
};

export default CreateVenueScreen;