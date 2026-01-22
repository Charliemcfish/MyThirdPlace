import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { globalStyles } from '../../../styles/globalStyles';
import { colors } from '../../../styles/theme';

const OwnershipSelector = ({ selectedOwnership, onOwnershipSelect, error }) => {
  const options = [
    {
      value: 'owner',
      title: 'Yes, I own or manage this venue',
      subtitle: 'Business contact information will be displayed publicly',
      icon: '🏢'
    },
    {
      value: 'visitor',
      title: 'No, I\'m a community member sharing this place',
      subtitle: 'Share a place you love with the community',
      icon: '👥'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.heading4, styles.questionText]}>
        Do you own this Third Place?
      </Text>
      <Text style={[globalStyles.captionText, styles.helpText]}>
        This will determine what information we collect and display
      </Text>
      
      {options.map((option) => (
        <Pressable
          key={option.value}
          style={[
            styles.optionCard,
            selectedOwnership === option.value && styles.optionCardSelected,
            error && !selectedOwnership && styles.optionCardError
          ]}
          onPress={() => onOwnershipSelect(option.value)}
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <View style={styles.optionText}>
              <Text style={[
                styles.optionTitle,
                selectedOwnership === option.value && styles.optionTitleSelected
              ]}>
                {option.title}
              </Text>
              <Text style={[
                styles.optionSubtitle,
                selectedOwnership === option.value && styles.optionSubtitleSelected
              ]}>
                {option.subtitle}
              </Text>
            </View>
          </View>
          <View style={[
            styles.radioButton,
            selectedOwnership === option.value && styles.radioButtonSelected
          ]}>
            {selectedOwnership === option.value && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </Pressable>
      ))}
      
      {error && <Text style={globalStyles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = {
  container: {
    marginBottom: 16
  },
  questionText: {
    marginBottom: 8,
    textAlign: 'center'
  },
  helpText: {
    textAlign: 'center',
    marginBottom: 24,
    color: colors.mediumGrey
  },
  optionCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.lightGrey,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f0f9f4'
  },
  optionCardError: {
    borderColor: colors.error
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16
  },
  optionText: {
    flex: 1
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  optionTitleSelected: {
    color: colors.primary
  },
  optionSubtitle: {
    fontSize: 14,
    color: colors.mediumGrey,
    lineHeight: 18
  },
  optionSubtitleSelected: {
    color: colors.primary
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.mediumGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12
  },
  radioButtonSelected: {
    borderColor: colors.primary
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary
  }
};

export default OwnershipSelector;