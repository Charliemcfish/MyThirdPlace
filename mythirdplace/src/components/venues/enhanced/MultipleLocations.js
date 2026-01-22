import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { globalStyles } from '../../../styles/globalStyles';
import { colors } from '../../../styles/theme';
import AddressForm from '../AddressForm';

const MultipleLocations = ({ 
  hasMultipleLocations, 
  onHasMultipleLocationsChange,
  additionalLocations = [], 
  onAdditionalLocationsChange,
  errors = {} 
}) => {
  const [expandedLocation, setExpandedLocation] = useState(null);

  const handleToggleMultipleLocations = (enabled) => {
    onHasMultipleLocationsChange(enabled);
    if (!enabled) {
      onAdditionalLocationsChange([]);
      setExpandedLocation(null);
    }
  };

  const handleAddLocation = () => {
    if (additionalLocations.length >= 19) {
      Alert.alert('Limit Reached', 'You can add up to 20 locations total.');
      return;
    }

    const newLocation = {
      id: Date.now().toString(),
      name: '',
      address: {
        street: '',
        city: '',
        postcode: '',
        country: 'United Kingdom'
      },
      isMain: false
    };
    
    onAdditionalLocationsChange([...additionalLocations, newLocation]);
    setExpandedLocation(newLocation.id);
  };

  const handleRemoveLocation = (locationId) => {
    Alert.alert(
      'Remove Location',
      'Are you sure you want to remove this location?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            const updated = additionalLocations.filter(loc => loc.id !== locationId);
            onAdditionalLocationsChange(updated);
            if (expandedLocation === locationId) {
              setExpandedLocation(null);
            }
          }
        }
      ]
    );
  };

  const handleUpdateLocation = (locationId, field, value) => {
    const updated = additionalLocations.map(location => {
      if (location.id === locationId) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          return {
            ...location,
            [parent]: {
              ...location[parent],
              [child]: value
            }
          };
        }
        return { ...location, [field]: value };
      }
      return location;
    });
    onAdditionalLocationsChange(updated);
  };

  const toggleLocationExpansion = (locationId) => {
    setExpandedLocation(expandedLocation === locationId ? null : locationId);
  };

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.heading4, styles.title]}>
        Multiple Locations
      </Text>
      
      {/* Enable/Disable Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleOption,
            !hasMultipleLocations && styles.toggleOptionActive
          ]}
          onPress={() => handleToggleMultipleLocations(false)}
        >
          <View style={[
            styles.radioButton,
            !hasMultipleLocations && styles.radioButtonActive
          ]}>
            {!hasMultipleLocations && <View style={styles.radioButtonInner} />}
          </View>
          <Text style={[
            styles.toggleText,
            !hasMultipleLocations && styles.toggleTextActive
          ]}>
            Single location only
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.toggleOption,
            hasMultipleLocations && styles.toggleOptionActive
          ]}
          onPress={() => handleToggleMultipleLocations(true)}
        >
          <View style={[
            styles.radioButton,
            hasMultipleLocations && styles.radioButtonActive
          ]}>
            {hasMultipleLocations && <View style={styles.radioButtonInner} />}
          </View>
          <Text style={[
            styles.toggleText,
            hasMultipleLocations && styles.toggleTextActive
          ]}>
            This venue has multiple locations
          </Text>
        </Pressable>
      </View>

      {hasMultipleLocations && (
        <View style={styles.multipleLocationsSection}>
          <Text style={[globalStyles.captionText, styles.description]}>
            Add other locations for this venue or chain. The main location is the address you entered above.
          </Text>

          {/* Additional Locations List */}
          {additionalLocations.map((location, index) => (
            <View key={location.id} style={styles.locationCard}>
              <Pressable
                style={styles.locationHeader}
                onPress={() => toggleLocationExpansion(location.id)}
              >
                <View style={styles.locationHeaderLeft}>
                  <Text style={styles.locationNumber}>📍 Location {index + 2}</Text>
                  {location.name && (
                    <Text style={styles.locationName}>{location.name}</Text>
                  )}
                </View>
                <View style={styles.locationHeaderRight}>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => handleRemoveLocation(location.id)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                  <Text style={styles.expandIcon}>
                    {expandedLocation === location.id ? '▼' : '▶'}
                  </Text>
                </View>
              </Pressable>

              {expandedLocation === location.id && (
                <View style={styles.locationDetails}>
                  {/* Location Name */}
                  <Text style={styles.fieldLabel}>Location Name</Text>
                  <TextInput
                    style={globalStyles.input}
                    placeholder="e.g., 'Manchester City Centre', 'Birmingham Branch'"
                    value={location.name}
                    onChangeText={(value) => handleUpdateLocation(location.id, 'name', value)}
                  />

                  {/* Address Form */}
                  <View style={styles.addressFormWrapper}>
                    <AddressForm
                      address={location.address}
                      onAddressChange={(address) => handleUpdateLocation(location.id, 'address', address)}
                      errors={errors[`location_${location.id}`] || {}}
                    />
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Add Location Button */}
          <Pressable
            style={styles.addLocationButton}
            onPress={handleAddLocation}
            disabled={additionalLocations.length >= 19}
          >
            <Text style={styles.addLocationIcon}>➕</Text>
            <Text style={styles.addLocationText}>
              Add Another Location ({additionalLocations.length + 1}/20)
            </Text>
          </Pressable>

          {additionalLocations.length >= 19 && (
            <Text style={styles.limitText}>
              Maximum of 20 locations allowed
            </Text>
          )}
        </View>
      )}

      {errors.multipleLocations && (
        <Text style={globalStyles.errorText}>{errors.multipleLocations}</Text>
      )}
    </View>
  );
};

const styles = {
  container: {
    marginBottom: 16
  },
  title: {
    marginBottom: 16
  },
  toggleContainer: {
    marginBottom: 20
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    marginBottom: 8
  },
  toggleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#f0f9f4'
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.mediumGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  radioButtonActive: {
    borderColor: colors.primary
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary
  },
  toggleText: {
    fontSize: 16,
    color: colors.text
  },
  toggleTextActive: {
    color: colors.primary,
    fontWeight: '600'
  },
  multipleLocationsSection: {
    marginTop: 8
  },
  description: {
    color: colors.mediumGrey,
    marginBottom: 16,
    lineHeight: 18
  },
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    marginBottom: 12
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  locationHeaderLeft: {
    flex: 1
  },
  locationNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  locationName: {
    fontSize: 13,
    color: colors.mediumGrey,
    marginTop: 2
  },
  locationHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8
  },
  removeButtonText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500'
  },
  expandIcon: {
    fontSize: 12,
    color: colors.mediumGrey
  },
  locationDetails: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    position: 'relative',
    zIndex: 999999999,
    elevation: 999999999,
    overflow: 'visible'
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: 12
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGrey,
    borderRadius: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.mediumGrey,
    borderStyle: 'dashed'
  },
  addLocationIcon: {
    fontSize: 16,
    marginRight: 8
  },
  addLocationText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500'
  },
  limitText: {
    fontSize: 12,
    color: colors.mediumGrey,
    textAlign: 'center',
    marginTop: 8
  },
  addressFormWrapper: {
    position: 'relative',
    zIndex: 999999999,
    elevation: 999999999,
    overflow: 'visible',
  }
};

export default MultipleLocations;