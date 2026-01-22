import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { validatePortfolioData } from '../../services/portfolio';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

const PortfolioForm = ({
  portfolioData,
  onPortfolioDataChange,
  errors = {},
  onErrorsChange
}) => {
  const [localErrors, setLocalErrors] = useState(errors);

  const updateField = (field, value) => {
    const updatedData = {
      ...portfolioData,
      [field]: value
    };
    onPortfolioDataChange(updatedData);

    // Clear field-specific error
    if (localErrors[field]) {
      const newErrors = { ...localErrors };
      delete newErrors[field];
      setLocalErrors(newErrors);
      if (onErrorsChange) {
        onErrorsChange(newErrors);
      }
    }
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateField('featuredImage', result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const addButton = () => {
    const currentButtons = portfolioData.buttons || [];
    const newButtons = [
      ...currentButtons,
      { text: '', url: '' }
    ];
    updateField('buttons', newButtons);
  };

  const removeButton = (index) => {
    const currentButtons = portfolioData.buttons || [];
    const newButtons = currentButtons.filter((_, i) => i !== index);
    updateField('buttons', newButtons);

    // Clear button-specific errors
    const newErrors = { ...localErrors };
    delete newErrors[`button_${index}_text`];
    delete newErrors[`button_${index}_url`];
    setLocalErrors(newErrors);
    if (onErrorsChange) {
      onErrorsChange(newErrors);
    }
  };

  const updateButton = (index, field, value) => {
    const currentButtons = portfolioData.buttons || [];
    const newButtons = [...currentButtons];
    newButtons[index] = {
      ...newButtons[index],
      [field]: value
    };
    updateField('buttons', newButtons);

    // Clear button-specific error
    const errorKey = `button_${index}_${field}`;
    if (localErrors[errorKey]) {
      const newErrors = { ...localErrors };
      delete newErrors[errorKey];
      setLocalErrors(newErrors);
      if (onErrorsChange) {
        onErrorsChange(newErrors);
      }
    }
  };

  const validateForm = () => {
    const validation = validatePortfolioData(portfolioData);
    setLocalErrors(validation.errors);
    if (onErrorsChange) {
      onErrorsChange(validation.errors);
    }
    return validation.isValid;
  };

  React.useEffect(() => {
    setLocalErrors(errors);
  }, [errors]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Title Input */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Title <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.titleInput, localErrors.title && styles.inputError]}
          value={portfolioData.title || ''}
          onChangeText={(text) => updateField('title', text)}
          placeholder="Enter portfolio item title..."
          placeholderTextColor="#999"
          maxLength={200}
        />
        {localErrors.title && (
          <Text style={styles.errorText}>{localErrors.title}</Text>
        )}
      </View>

      {/* Description Input */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Description <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.descriptionInput, localErrors.description && styles.inputError]}
          value={portfolioData.description || ''}
          onChangeText={(text) => updateField('description', text)}
          placeholder="Describe your portfolio item..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={6}
          maxLength={1000}
          textAlignVertical="top"
        />
        {localErrors.description && (
          <Text style={styles.errorText}>{localErrors.description}</Text>
        )}
        <Text style={styles.helperText}>
          {(portfolioData.description || '').length}/1000 characters
        </Text>
      </View>

      {/* Featured Image Upload */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Featured Image</Text>
        <Text style={styles.helperText}>
          Add an image to showcase your portfolio item
        </Text>

        {portfolioData.featuredImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{
                uri: portfolioData.featuredImage.uri || portfolioData.featuredImage
              }}
              style={styles.imagePreview}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => updateField('featuredImage', null)}
            >
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImagePicker}
          >
            <Text style={styles.uploadButtonText}>Choose Image</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Custom Buttons Section */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Custom Buttons</Text>
        <Text style={styles.helperText}>
          Add buttons that link to your articles, blogs, or other content
        </Text>

        {(portfolioData.buttons || []).map((button, index) => (
          <View key={index} style={styles.buttonContainer}>
            <View style={styles.buttonHeader}>
              <Text style={styles.buttonTitle}>Button {index + 1}</Text>
              <TouchableOpacity
                style={styles.removeButtonButton}
                onPress={() => removeButton(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>

            {/* Button Text */}
            <View style={styles.buttonFieldContainer}>
              <Text style={styles.buttonLabel}>Button Text</Text>
              <TextInput
                style={[
                  styles.buttonInput,
                  localErrors[`button_${index}_text`] && styles.inputError
                ]}
                value={button.text || ''}
                onChangeText={(text) => updateButton(index, 'text', text)}
                placeholder="e.g., Read Article, View Project"
                placeholderTextColor="#999"
                maxLength={50}
              />
              {localErrors[`button_${index}_text`] && (
                <Text style={styles.errorText}>
                  {localErrors[`button_${index}_text`]}
                </Text>
              )}
            </View>

            {/* Button URL */}
            <View style={styles.buttonFieldContainer}>
              <Text style={styles.buttonLabel}>Button URL</Text>
              <TextInput
                style={[
                  styles.buttonInput,
                  localErrors[`button_${index}_url`] && styles.inputError
                ]}
                value={button.url || ''}
                onChangeText={(url) => updateButton(index, 'url', url)}
                placeholder="https://example.com"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="url"
              />
              {localErrors[`button_${index}_url`] && (
                <Text style={styles.errorText}>
                  {localErrors[`button_${index}_url`]}
                </Text>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButtonButton}
          onPress={addButton}
          disabled={(portfolioData.buttons || []).length >= 3}
        >
          <Text style={[
            styles.addButtonText,
            (portfolioData.buttons || []).length >= 3 && styles.disabledText
          ]}>
            + Add Button {(portfolioData.buttons || []).length >= 3 ? '(Max 3)' : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1
  },
  fieldContainer: {
    marginBottom: 24
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8
  },
  required: {
    color: colors.error
  },
  helperText: {
    fontSize: 14,
    color: colors.mediumGrey,
    marginBottom: 8
  },
  titleInput: {
    fontSize: 18,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: colors.black
  },
  descriptionInput: {
    fontSize: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: colors.black,
    minHeight: 120
  },
  inputError: {
    borderColor: colors.error
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4
  },
  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadButtonText: {
    fontSize: 16,
    color: colors.mediumGrey,
    fontWeight: '500'
  },
  imagePreviewContainer: {
    position: 'relative'
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover'
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  removeImageText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600'
  },
  buttonContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  buttonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black
  },
  removeButtonButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  removeButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600'
  },
  buttonFieldContainer: {
    marginBottom: 12
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 6
  },
  buttonInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: colors.black
  },
  addButtonButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500'
  },
  disabledText: {
    color: colors.mediumGrey
  }
};

export default PortfolioForm;