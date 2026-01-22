import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const ClaimListingButton = ({ onPress, hasExistingClaim, isVerified, isOwner }) => {
  // Don't show button if venue is already verified or user already has a claim
  if (isVerified || hasExistingClaim) {
    return null;
  }

  // Don't show to owners who created the listing
  if (isOwner) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.claimButton} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✓</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.buttonText}>Own this venue?</Text>
        <Text style={styles.buttonSubtext}>Claim your listing</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#006548',
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#006548',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#006548',
    marginBottom: 2,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default ClaimListingButton;
