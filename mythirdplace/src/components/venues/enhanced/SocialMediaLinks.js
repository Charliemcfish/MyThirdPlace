import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { globalStyles } from '../../../styles/globalStyles';
import { colors } from '../../../styles/theme';
import FontAwesomeIcon from '../../common/FontAwesomeIcon';

const SocialMediaLinks = ({ socialMedia = {}, onSocialMediaChange, errors = {} }) => {
  const socialPlatforms = [
    {
      key: 'instagram',
      label: 'Instagram',
      placeholder: '@yourhandle or full URL',
      icon: 'fa-instagram'
    },
    {
      key: 'facebook',
      label: 'Facebook',
      placeholder: 'Facebook page URL',
      icon: 'fa-facebook-f'
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      placeholder: 'LinkedIn company page URL',
      icon: 'fa-linkedin-in'
    },
    {
      key: 'twitter',
      label: 'Twitter/X',
      placeholder: '@handle or URL',
      icon: 'fa-twitter',
      optional: true
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      placeholder: '@handle or URL',
      icon: 'fa-tiktok',
      optional: true
    }
  ];

  const handleChange = (platform, value) => {
    const trimmedValue = value.trim();
    
    // Only include non-empty values
    const updatedSocialMedia = { ...socialMedia };
    
    if (trimmedValue) {
      updatedSocialMedia[platform] = trimmedValue;
    } else {
      // Remove the field if it's empty
      delete updatedSocialMedia[platform];
    }
    
    onSocialMediaChange(updatedSocialMedia);
  };

  return (
    <View style={styles.container}>
      <Text style={[globalStyles.heading4, styles.title]}>
        Social Media Links
      </Text>
      <Text style={[globalStyles.captionText, styles.subtitle]}>
        Help customers connect with your business online
      </Text>

      {socialPlatforms.map((platform) => (
        <View key={platform.key} style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <FontAwesomeIcon
              name={platform.icon}
              size={16}
              color={colors.primary}
              style={styles.platformIcon}
            />
            <Text style={styles.inputLabelText}>
              {platform.label}
              {!platform.optional && <Text style={styles.optional}> (Optional)</Text>}
            </Text>
          </View>
          <TextInput
            style={[
              globalStyles.input,
              errors[platform.key] && { borderColor: colors.error }
            ]}
            placeholder={platform.placeholder}
            value={socialMedia[platform.key] || ''}
            onChangeText={(value) => handleChange(platform.key, value)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {errors[platform.key] && (
            <Text style={globalStyles.errorText}>{errors[platform.key]}</Text>
          )}
        </View>
      ))}

      <View style={styles.helpBox}>
        <Text style={styles.helpTitle}>💡 Tips:</Text>
        <Text style={styles.helpText}>
          • You can enter just your handle (like @yourname) or the full URL{'\n'}
          • These links will appear as clickable icons on your venue page{'\n'}
          • Social media helps customers discover and connect with your business
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
    marginBottom: 20
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  inputLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  platformIcon: {
    marginRight: 8
  },
  optional: {
    fontWeight: 'normal',
    color: colors.mediumGrey
  },
  helpBox: {
    backgroundColor: '#f0f9f4',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  helpText: {
    fontSize: 13,
    color: colors.mediumGrey,
    lineHeight: 18
  }
};

export default SocialMediaLinks;