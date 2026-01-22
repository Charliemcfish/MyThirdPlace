import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const ClaimListingForm = ({ venue, user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    businessEmail: '',
    businessPhone: '',
    businessName: venue?.name || '',
    businessRole: 'Owner',
    claimReason: '',
    additionalInfo: ''
  });

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessEmail) {
      newErrors.businessEmail = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Please enter a valid email address';
    }

    if (!formData.businessPhone) {
      newErrors.businessPhone = 'Business phone is required';
    }

    if (!formData.businessName) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.claimReason || formData.claimReason.length < 50) {
      newErrors.claimReason = 'Please provide at least 50 characters explaining why you are claiming this listing';
    }

    if (documents.length === 0) {
      newErrors.documents = 'Please upload at least one verification document';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        multiple: true,
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets) {
        const newDocs = result.assets.filter(asset => {
          const sizeInMB = asset.size / (1024 * 1024);
          return sizeInMB <= 10;
        });

        if (newDocs.length < result.assets.length) {
          Alert.alert('File Size', 'Some files were too large (max 10MB per file)');
        }

        setDocuments([...documents, ...newDocs]);
        // Clear document error if documents are added
        if (newDocs.length > 0) {
          setErrors({ ...errors, documents: null });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      console.error(error);
    }
  };

  const handleRemoveDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Form Incomplete', 'Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        claimantUID: user.uid,
        claimantName: user.displayName || 'Unknown User',
        claimantEmail: user.email
      }, documents);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit claim. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Claim Venue Listing</Text>
        <Text style={styles.subtitle}>
          Claiming: <Text style={styles.venueName}>{venue?.name}</Text>
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Official Business Email *</Text>
          <TextInput
            style={[styles.input, errors.businessEmail && styles.inputError]}
            placeholder="business@example.com"
            value={formData.businessEmail}
            onChangeText={(text) => setFormData({ ...formData, businessEmail: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.businessEmail && (
            <Text style={styles.errorText}>{errors.businessEmail}</Text>
          )}
          <Text style={styles.helpText}>Use your official business email address</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Phone Number *</Text>
          <TextInput
            style={[styles.input, errors.businessPhone && styles.inputError]}
            placeholder="+1 (555) 123-4567"
            value={formData.businessPhone}
            onChangeText={(text) => setFormData({ ...formData, businessPhone: text })}
            keyboardType="phone-pad"
          />
          {errors.businessPhone && (
            <Text style={styles.errorText}>{errors.businessPhone}</Text>
          )}
          <Text style={styles.helpText}>Primary business contact number</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Official Business Name *</Text>
          <TextInput
            style={[styles.input, errors.businessName && styles.inputError]}
            placeholder="Legal business name"
            value={formData.businessName}
            onChangeText={(text) => setFormData({ ...formData, businessName: text })}
          />
          {errors.businessName && (
            <Text style={styles.errorText}>{errors.businessName}</Text>
          )}
          <Text style={styles.helpText}>Legal name as registered</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Role *</Text>
          <View style={styles.roleButtons}>
            {['Owner', 'Manager', 'Authorized Representative'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleButton,
                  formData.businessRole === role && styles.roleButtonActive
                ]}
                onPress={() => setFormData({ ...formData, businessRole: role })}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    formData.businessRole === role && styles.roleButtonTextActive
                  ]}
                >
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verification</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Why are you claiming this listing? *</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              errors.claimReason && styles.inputError
            ]}
            placeholder="Explain your connection to this business and why you should be granted ownership of this listing..."
            value={formData.claimReason}
            onChangeText={(text) => setFormData({ ...formData, claimReason: text })}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
          {errors.claimReason && (
            <Text style={styles.errorText}>{errors.claimReason}</Text>
          )}
          <Text style={styles.helpText}>
            {formData.claimReason.length}/1000 characters (minimum 50)
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ownership Verification Documents *</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handlePickDocument}>
            <Text style={styles.uploadIcon}>📎</Text>
            <Text style={styles.uploadButtonText}>Upload Documents</Text>
          </TouchableOpacity>
          {errors.documents && (
            <Text style={styles.errorText}>{errors.documents}</Text>
          )}
          <Text style={styles.helpText}>
            Business license, lease agreement, or other proof (max 10MB per file, up to 5 files)
          </Text>

          {documents.length > 0 && (
            <View style={styles.documentsList}>
              {documents.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveDocument(index)}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Additional Information (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any other relevant details..."
            value={formData.additionalInfo}
            onChangeText={(text) => setFormData({ ...formData, additionalInfo: text })}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.helpText}>{formData.additionalInfo.length}/500 characters</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.termsText}>
          By submitting this claim, you confirm that the information provided is accurate and you
          have the authority to represent this business.
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Claim</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#006548',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  venueName: {
    fontWeight: '600',
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#006548',
    backgroundColor: 'white',
  },
  roleButtonActive: {
    backgroundColor: '#006548',
  },
  roleButtonText: {
    color: '#006548',
    fontSize: 14,
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: 'white',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#006548',
  },
  documentsList: {
    marginTop: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    fontSize: 18,
    color: '#d32f2f',
    paddingHorizontal: 8,
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
    marginBottom: 40,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#006548',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ClaimListingForm;
