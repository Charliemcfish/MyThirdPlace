import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';
import AddressInput from '../forms/AddressInput';
import InteractiveMap from '../maps/InteractiveMap';

const AddressForm = ({
  address,
  onAddressChange,
  errors = {},
  style = {}
}) => {
  const [useAutocomplete, setUseAutocomplete] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [validationStatus, setValidationStatus] = useState({ isValid: false, status: 'idle' });

  const handleAddressSelect = useCallback((formattedAddress) => {
    // Clear selected address if coordinates are null (indicating cleared input)
    if (!formattedAddress.coordinates) {
      setSelectedAddress(null);
    } else {
      setSelectedAddress(formattedAddress);
    }

    // Update the parent with the formatted address
    onAddressChange({
      street: formattedAddress.street || '',
      city: formattedAddress.city || '',
      postcode: formattedAddress.postcode || '',
      country: formattedAddress.country || '',
      fullAddress: formattedAddress.fullAddress || '',
      coordinates: formattedAddress.coordinates,
      placeId: formattedAddress.placeId,
      geocodedAt: formattedAddress.geocodedAt
    });
  }, [onAddressChange]);

  const handleValidationChange = useCallback((validation) => {
    setValidationStatus(validation);
  }, []);

  const toggleInputMode = () => {
    setUseAutocomplete(!useAutocomplete);
    setSelectedAddress(null);
    onAddressChange({
      street: '',
      city: '',
      postcode: '',
      country: '',
      fullAddress: '',
      coordinates: null
    });
  };

  const formatCurrentAddress = () => {
    if (selectedAddress?.fullAddress) {
      return selectedAddress.fullAddress;
    }
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.postcode) parts.push(address.postcode);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ') || '';
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>
          Address Information
        </Text>
        
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleInputMode}
        >
          <Text style={styles.toggleButtonText}>
            {useAutocomplete ? '📝 Manual Entry' : '🔍 Smart Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {useAutocomplete ? (
        <View style={styles.autocompleteContainer}>
          <Text style={styles.fieldLabel}>
            Search for your venue address *
          </Text>
          <Text style={styles.fieldHint}>
            Start typing and we'll help you find the exact address
          </Text>
          
          <View style={styles.addressInputWrapper}>
            <AddressInput
              value={formatCurrentAddress()}
              onAddressSelect={handleAddressSelect}
              onValidationChange={handleValidationChange}
              placeholder="Start typing an address..."
              error={errors.address || errors.addressStreet}
              showPreview={true}
            />
          </View>

          {/* Validation Status */}
          {validationStatus.status === 'invalid' && (
            <View style={styles.validationWarning}>
              <Text style={styles.warningText}>
                ⚠️ We couldn't verify this address. Please check the spelling or try manual entry.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ManualAddressForm
          address={address}
          onAddressChange={onAddressChange}
          errors={errors}
        />
      )}

      {/* Map Preview */}
      {selectedAddress?.coordinates && (
        <View style={styles.mapPreviewContainer}>
          <Text style={styles.mapPreviewTitle}>📍 Location Preview</Text>
          <View style={styles.mapPreview}>
            <InteractiveMap
              venues={[{
                id: 'preview',
                name: 'Your venue location',
                coordinates: selectedAddress.coordinates,
                address: selectedAddress,
                category: 'other'
              }]}
              center={selectedAddress.coordinates}
              zoom={15}
              height={200}
              showInfoWindows={false}
              enableClustering={false}
              mapStyle={{ disableDefaultUI: true }}
            />
          </View>
          <View style={styles.coordinatesInfo}>
            <Text style={styles.coordinatesText}>
              Coordinates: {selectedAddress.coordinates.lat.toFixed(6)}, {selectedAddress.coordinates.lng.toFixed(6)}
            </Text>
          </View>
        </View>
      )}

      {/* Address Summary */}
      {validationStatus.isValid && selectedAddress && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>✅ Address Confirmed</Text>
          <Text style={styles.summaryText}>
            Your venue will be located at: {selectedAddress.fullAddress}
          </Text>
        </View>
      )}
    </View>
  );
};

// Manual address form component for fallback
const ManualAddressForm = ({ address, onAddressChange, errors }) => {
  const updateAddressField = (field, value) => {
    const updatedAddress = {
      ...address,
      [field]: value
    };
    onAddressChange(updatedAddress);
  };

  return (
    <View style={styles.manualForm}>
      <Text style={styles.fieldLabel}>Manual Address Entry</Text>
      <Text style={styles.fieldHint}>
        Enter address details manually (geocoding will happen after submission)
      </Text>

      {/* Street Address */}
      <View style={styles.fieldContainer}>
        <Text style={styles.inputLabel}>Street Address *</Text>
        <TextInput
          style={[
            styles.input,
            errors.addressStreet && styles.errorInput
          ]}
          placeholder="e.g., 123 High Street"
          value={address.street || ''}
          onChangeText={(value) => updateAddressField('street', value)}
          autoCapitalize="words"
        />
        {errors.addressStreet && (
          <Text style={styles.errorText}>{errors.addressStreet}</Text>
        )}
      </View>

      {/* City */}
      <View style={styles.fieldContainer}>
        <Text style={styles.inputLabel}>City *</Text>
        <TextInput
          style={[
            styles.input,
            errors.addressCity && styles.errorInput
          ]}
          placeholder="e.g., London, Manchester, Edinburgh"
          value={address.city || ''}
          onChangeText={(value) => updateAddressField('city', value)}
          autoCapitalize="words"
        />
        {errors.addressCity && (
          <Text style={styles.errorText}>{errors.addressCity}</Text>
        )}
      </View>

      {/* Postcode */}
      <View style={styles.fieldContainer}>
        <Text style={styles.inputLabel}>Postcode</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., SW1A 1AA"
          value={address.postcode || ''}
          onChangeText={(value) => updateAddressField('postcode', value.toUpperCase())}
          autoCapitalize="characters"
          maxLength={10}
        />
      </View>

      {/* Country */}
      <View style={styles.fieldContainer}>
        <Text style={styles.inputLabel}>Country *</Text>
        <TextInput
          style={[
            styles.input,
            errors.addressCountry && styles.errorInput
          ]}
          placeholder="United Kingdom"
          value={address.country || ''}
          onChangeText={(value) => updateAddressField('country', value)}
          autoCapitalize="words"
        />
        {errors.addressCountry && (
          <Text style={styles.errorText}>{errors.addressCountry}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  autocompleteContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  fieldHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  validationWarning: {
    backgroundColor: colors.errorLight || '#ffebee',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  warningText: {
    ...typography.caption,
    color: colors.error,
    lineHeight: 18,
  },
  manualForm: {
    marginTop: spacing.sm,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  errorInput: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  mapPreviewContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  mapPreviewTitle: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  mapPreview: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  coordinatesInfo: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.sm,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  coordinatesText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  summaryContainer: {
    backgroundColor: colors.successLight || '#e8f5e8',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  summaryTitle: {
    ...typography.body2,
    color: colors.success || colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  summaryText: {
    ...typography.body2,
    color: colors.text,
    lineHeight: 20,
  },
  addressInputWrapper: {
    position: 'relative',
    zIndex: 99999999,
    elevation: 99999999,
  },
});

export default AddressForm;