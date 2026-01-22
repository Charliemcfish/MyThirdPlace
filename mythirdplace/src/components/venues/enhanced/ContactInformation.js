import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { globalStyles } from '../../../styles/globalStyles';
import { colors } from '../../../styles/theme';

const ContactInformation = ({ contactInfo = {}, onContactInfoChange, errors = {} }) => {
  const handleChange = (field, value) => {
    onContactInfoChange({
      ...contactInfo,
      [field]: value.trim()
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.heading4, styles.title]}>
        Business Contact Information
      </Text>
      <Text style={[globalStyles.captionText, styles.subtitle]}>
        This information will be publicly visible to help customers contact your business
      </Text>

      <View style={styles.warningBox}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>
          This information will be displayed publicly on your venue listing
        </Text>
      </View>

      {/* Work Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Business Email *
        </Text>
        <TextInput
          style={[
            globalStyles.input,
            errors.workEmail && { borderColor: colors.error }
          ]}
          placeholder="business@example.com"
          value={contactInfo.workEmail || ''}
          onChangeText={(value) => handleChange('workEmail', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors.workEmail && (
          <Text style={globalStyles.errorText}>{errors.workEmail}</Text>
        )}
        <Text style={styles.fieldHelp}>
          This email will be publicly visible for customer inquiries
        </Text>
      </View>

      {/* Work Phone */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Business Phone <Text style={styles.optional}>(Optional)</Text>
        </Text>
        <TextInput
          style={[
            globalStyles.input,
            errors.workPhone && { borderColor: colors.error }
          ]}
          placeholder="+44 20 1234 5678"
          value={contactInfo.workPhone || ''}
          onChangeText={(value) => handleChange('workPhone', value)}
          keyboardType="phone-pad"
        />
        {errors.workPhone && (
          <Text style={globalStyles.errorText}>{errors.workPhone}</Text>
        )}
        <Text style={styles.fieldHelp}>
          Phone number will be displayed publicly for customer contact
        </Text>
      </View>

      {/* Website */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Website <Text style={styles.optional}>(Optional)</Text>
        </Text>
        <TextInput
          style={[
            globalStyles.input,
            errors.website && { borderColor: colors.error }
          ]}
          placeholder="https://www.yourwebsite.com"
          value={contactInfo.website || ''}
          onChangeText={(value) => handleChange('website', value)}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors.website && (
          <Text style={globalStyles.errorText}>{errors.website}</Text>
        )}
        <Text style={styles.fieldHelp}>
          Your venue's official website
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ About Public Information:</Text>
        <Text style={styles.infoText}>
          • Business email and phone will be displayed on your venue page{'\n'}
          • This helps potential customers get in touch with your business{'\n'}
          • You can update this information anytime from your venue settings{'\n'}
          • We recommend using your business contact details, not personal ones
        </Text>
      </View>
    </View>
  );
};

const styles = {
  container: {
    marginBottom: 16
  },
  title: {
    marginBottom: 8
  },
  subtitle: {
    color: colors.mediumGrey,
    marginBottom: 16
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107'
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
    lineHeight: 18
  },
  inputGroup: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6
  },
  optional: {
    fontWeight: 'normal',
    color: colors.mediumGrey
  },
  fieldHelp: {
    fontSize: 12,
    color: colors.mediumGrey,
    marginTop: 4,
    fontStyle: 'italic'
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  infoText: {
    fontSize: 13,
    color: colors.mediumGrey,
    lineHeight: 18
  }
};

export default ContactInformation;