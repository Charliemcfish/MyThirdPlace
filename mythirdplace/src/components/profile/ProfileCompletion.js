import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/theme';
import Button from '../common/Button';

const ProfileCompletion = ({ profile, onEditPress }) => {
  const calculateCompletion = (profile) => {
    if (!profile) return { percentage: 0, missing: [] };
    
    const checks = [
      { field: 'displayName', label: 'Display Name', value: profile.displayName },
      { field: 'bio', label: 'Bio', value: profile.bio },
      { field: 'profilePhotoURL', label: 'Profile Photo', value: profile.profilePhotoURL }
    ];
    
    const completed = checks.filter(check => 
      check.value && check.value.toString().trim().length > 0
    );
    
    const missing = checks.filter(check => 
      !check.value || check.value.toString().trim().length === 0
    ).map(check => check.label);
    
    return {
      percentage: Math.round((completed.length / checks.length) * 100),
      missing,
      completed: completed.length,
      total: checks.length
    };
  };

  const completion = calculateCompletion(profile);

  if (completion.percentage === 100) {
    return null;
  }

  return (
    <View style={[globalStyles.card, styles.card]}>
      <View style={styles.header}>
        <Text style={globalStyles.heading4}>Complete Your Profile</Text>
        <Text style={styles.percentage}>{completion.percentage}%</Text>
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${completion.percentage}%` }
          ]} 
        />
      </View>
      
      <Text style={[globalStyles.bodyText, styles.description]}>
        Complete your profile to help others connect with you and discover your interests.
      </Text>
      
      {completion.missing.length > 0 && (
        <View style={styles.missingSection}>
          <Text style={[globalStyles.bodyText, styles.missingTitle]}>
            Still needed:
          </Text>
          {completion.missing.map((item, index) => (
            <Text key={index} style={styles.missingItem}>
              • {item}
            </Text>
          ))}
        </View>
      )}
      
      <Button onPress={onEditPress} style={styles.editButton}>
        Complete Profile
      </Button>
    </View>
  );
};

const styles = {
  card: {
    marginBottom: 20
  },
  completedCard: {
    backgroundColor: colors.lightGreen,
    borderColor: colors.primary,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20
  },
  completedIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  completedTitle: {
    color: colors.primary,
    marginBottom: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  percentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGrey,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4
  },
  description: {
    marginBottom: 16,
    color: colors.mediumGrey
  },
  missingSection: {
    marginBottom: 16
  },
  missingTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: colors.darkGrey
  },
  missingItem: {
    fontSize: 14,
    color: colors.mediumGrey,
    marginBottom: 4
  },
  editButton: {
    alignSelf: 'stretch'
  }
};

export default ProfileCompletion;