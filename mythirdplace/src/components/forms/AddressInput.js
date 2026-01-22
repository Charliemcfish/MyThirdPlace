import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';
import geocodingService from '../../services/geocoding';
import { waitForGoogleMapsAPI } from '../../utils/googleMapsLoader';

const AddressInput = ({
  value = '',
  onAddressSelect,
  onValidationChange,
  placeholder = 'Start typing an address...',
  error = null,
  disabled = false,
  style = {},
  showPreview = true
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [geocodingStatus, setGeocodingStatus] = useState('idle'); // idle, validating, valid, invalid
  const [isInteractingWithSuggestions, setIsInteractingWithSuggestions] = useState(false);

  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Report validation status to parent
    if (onValidationChange) {
      onValidationChange({
        isValid: geocodingStatus === 'valid',
        status: geocodingStatus,
        address: selectedAddress
      });
    }
  }, [geocodingStatus, selectedAddress, onValidationChange]);

  const handleInputChange = (text) => {
    setInputValue(text);
    setSelectedAddress(null);
    setGeocodingStatus('idle');
    setShowSuggestions(text.length > 0);

    // Clear address data in parent when input is cleared
    if (text.trim() === '' && onAddressSelect) {
      onAddressSelect({
        street: '',
        city: '',
        postcode: '',
        country: '',
        fullAddress: '',
        coordinates: null,
        placeId: null,
        geocodedAt: null
      });
    }

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search for very short inputs
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    // Debounce search requests
    searchTimeoutRef.current = setTimeout(async () => {
      await searchAddresses(text);
    }, 300);
  };

  const searchAddresses = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      
      // Wait for Google Maps API to be available
      const apiAvailable = await waitForGoogleMapsAPI(5000); // 5 second timeout
      
      if (!apiAvailable) {
        console.warn('Google Maps API not available - skipping autocomplete');
        setSuggestions([]);
        return;
      }

      const results = await geocodingService.getAddressSuggestions(query, {
        types: ['establishment', 'geocode']
        // Removed country restriction to allow global venue creation
      });
      
      setSuggestions(results);
    } catch (error) {
      console.warn('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = async (suggestion) => {
    try {
      setIsLoading(true);
      setGeocodingStatus('validating');
      setShowSuggestions(false);
      setInputValue(suggestion.description);

      // Get detailed place information
      const placeDetails = await geocodingService.getPlaceDetails(suggestion.place_id);
      
      // Format address data for venue creation
      const formattedAddress = formatPlaceDetailsForVenue(placeDetails);
      setSelectedAddress(formattedAddress);
      setGeocodingStatus('valid');

      if (onAddressSelect) {
        onAddressSelect(formattedAddress);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      setGeocodingStatus('invalid');
      setSelectedAddress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPlaceDetailsForVenue = (placeDetails) => {
    const addressComponents = placeDetails.address_components || [];
    
    const getComponent = (types) => {
      const component = addressComponents.find(comp => 
        types.some(type => comp.types.includes(type))
      );
      return component?.long_name || '';
    };

    const streetNumber = getComponent(['street_number']);
    const route = getComponent(['route']);
    const street = streetNumber && route ? `${streetNumber} ${route}` : (route || streetNumber);
    
    // Get city with fallbacks
    const city = getComponent(['locality']) || 
                 getComponent(['administrative_area_level_2']) || 
                 getComponent(['administrative_area_level_1']) ||
                 getComponent(['sublocality_level_1']) ||
                 getComponent(['postal_town']);
    
    // Get country
    const country = getComponent(['country']);

    // Ensure we have minimum required fields
    const finalStreet = street || placeDetails.name || 'Address';
    const finalCity = city || 'Unknown City';
    const finalCountry = country || 'Unknown Country';

    return {
      street: finalStreet,
      city: finalCity,
      postcode: getComponent(['postal_code']),
      country: finalCountry,
      fullAddress: placeDetails.formatted_address,
      coordinates: placeDetails.coordinates,
      placeId: placeDetails.place_id,
      placeName: placeDetails.name,
      geocodedAt: new Date().toISOString()
    };
  };

  const handleInputBlur = () => {
    // Clear any existing blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    // Only hide suggestions if not currently interacting with them
    blurTimeoutRef.current = setTimeout(() => {
      if (!isInteractingWithSuggestions) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  const handleInputFocus = () => {
    // Clear blur timeout when input regains focus
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    // Show suggestions if we have some and there's input
    if (suggestions.length > 0 && inputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  const validateManualInput = async () => {
    if (!inputValue.trim() || selectedAddress) return;

    try {
      setIsLoading(true);
      setGeocodingStatus('validating');
      
      const geocodeResult = await geocodingService.geocodeAddress(inputValue);
      const formattedAddress = {
        street: '',
        city: '',
        postcode: '',
        country: '',
        fullAddress: geocodeResult.formatted_address,
        coordinates: geocodeResult.coordinates,
        placeId: geocodeResult.place_id,
        geocodedAt: new Date().toISOString()
      };

      // Parse address components
      if (geocodeResult.address_components) {
        const getComponent = (types) => {
          const component = geocodeResult.address_components.find(comp => 
            types.some(type => comp.types.includes(type))
          );
          return component?.long_name || '';
        };

        const streetNumber = getComponent(['street_number']);
        const route = getComponent(['route']);
        formattedAddress.street = streetNumber && route ? `${streetNumber} ${route}` : (route || streetNumber);
        formattedAddress.city = getComponent(['locality', 'administrative_area_level_1']);
        formattedAddress.postcode = getComponent(['postal_code']);
        formattedAddress.country = getComponent(['country']);
      }

      setSelectedAddress(formattedAddress);
      setGeocodingStatus('valid');

      if (onAddressSelect) {
        onAddressSelect(formattedAddress);
      }
    } catch (error) {
      console.error('Manual address validation error:', error);
      setGeocodingStatus('invalid');
    } finally {
      setIsLoading(false);
    }
  };

  const getInputBorderColor = () => {
    if (error) return colors.error;
    if (geocodingStatus === 'valid') return colors.success || colors.primary;
    if (geocodingStatus === 'invalid') return colors.error;
    return colors.border;
  };

  const getStatusIcon = () => {
    switch (geocodingStatus) {
      case 'validating': return '⏳';
      case 'valid': return '✅';
      case 'invalid': return '❌';
      default: return null;
    }
  };

  const renderSuggestion = ({ item, index }) => (
    <TouchableOpacity
      key={`${item.place_id}-${index}`}
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
      onPressIn={() => setIsInteractingWithSuggestions(true)}
      onPressOut={() => setIsInteractingWithSuggestions(false)}
      onMouseDown={() => setIsInteractingWithSuggestions(true)}
      onMouseUp={() => setIsInteractingWithSuggestions(false)}
      onMouseLeave={() => setIsInteractingWithSuggestions(false)}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionMainText}>
          {item.structured_formatting?.main_text || item.description}
        </Text>
        {item.structured_formatting?.secondary_text && (
          <Text style={styles.suggestionSecondaryText}>
            {item.structured_formatting.secondary_text}
          </Text>
        )}
      </View>
      <Text style={styles.suggestionIcon}>📍</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { borderColor: getInputBorderColor() },
            disabled && styles.inputDisabled
          ]}
          value={inputValue}
          onChangeText={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          onEndEditing={validateManualInput}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          editable={!disabled}
          autoCapitalize="words"
          autoCorrect={false}
        />
        
        {isLoading && (
          <View style={styles.statusIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        
        {!isLoading && getStatusIcon() && (
          <View style={styles.statusIndicator}>
            <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          </View>
        )}
      </View>

      {/* Error Display */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Geocoding Status */}
      {geocodingStatus === 'invalid' && (
        <Text style={[styles.validationText, styles.validationTextError]}>
          Unable to verify this address. Please check the spelling or try a different format.
        </Text>
      )}

      {geocodingStatus === 'valid' && selectedAddress && (
        <Text style={[styles.validationText, styles.validationTextSuccess]}>
          ✅ Address verified and ready to save
        </Text>
      )}

      {/* Address Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer} data-testid="suggestions-container">
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `${item.place_id}-${index}`}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            maxToRenderPerBatch={5}
            initialNumToRender={5}
          />
        </View>
      )}

      {/* Address Preview */}
      {showPreview && selectedAddress && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Selected Address:</Text>
          <Text style={styles.previewText}>{selectedAddress.fullAddress}</Text>
          {selectedAddress.coordinates && (
            <Text style={styles.previewCoordinates}>
              📍 {selectedAddress.coordinates.lat.toFixed(6)}, {selectedAddress.coordinates.lng.toFixed(6)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 999999999,
    overflow: 'visible',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    ...typography.body1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingRight: 40, // Space for status indicator
    minHeight: 48,
  },
  inputDisabled: {
    backgroundColor: colors.backgroundLight,
    color: colors.textSecondary,
  },
  statusIndicator: {
    position: 'absolute',
    right: spacing.sm,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  validationText: {
    ...typography.caption,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  validationTextError: {
    color: colors.error,
  },
  validationTextSuccess: {
    color: colors.success || colors.primary,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.sm,
    zIndex: 99999999,
    elevation: 99999999,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    maxHeight: 200,
    ...Platform.select({
      web: {
        position: 'absolute',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '999999999',
      },
    }),
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 60,
    width: '100%',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionMainText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
  },
  suggestionSecondaryText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  suggestionIcon: {
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  previewContainer: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  previewLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  previewText: {
    ...typography.body2,
    color: colors.text,
    lineHeight: 20,
  },
  previewCoordinates: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});

export default AddressInput;