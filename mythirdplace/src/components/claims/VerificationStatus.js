import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VerificationStatus = ({ venue, userClaim, isOwner }) => {
  const getStatusDisplay = () => {
    // Verified business
    if (venue?.claimStatus === 'verified' || venue?.isBusinessVerified) {
      return {
        show: true,
        icon: '✓',
        text: 'Verified Business',
        style: styles.verified,
        iconStyle: styles.verifiedIcon,
        textStyle: styles.verifiedText
      };
    }

    // Pending claim (only show to user who claimed)
    if (userClaim && userClaim.claimStatus === 'pending' && isOwner) {
      return {
        show: true,
        icon: '⏳',
        text: 'Verification Pending',
        style: styles.pending,
        iconStyle: styles.pendingIcon,
        textStyle: styles.pendingText,
        message: 'Your claim is being reviewed by our team'
      };
    }

    // No verification
    return { show: false };
  };

  const status = getStatusDisplay();

  if (!status.show) {
    return null;
  }

  return (
    <View style={[styles.container, status.style]}>
      <Text style={[styles.icon, status.iconStyle]}>{status.icon}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.text, status.textStyle]}>{status.text}</Text>
        {status.message && (
          <Text style={styles.message}>{status.message}</Text>
        )}
      </View>
    </View>
  );
};

// Compact badge for venue cards
export const VerificationBadge = ({ venue }) => {
  if (venue?.claimStatus !== 'verified' && !venue?.isBusinessVerified) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeIcon}>✓</Text>
      <Text style={styles.badgeText}>Verified</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  verified: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  pending: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  verifiedIcon: {
    color: '#4caf50',
  },
  pendingIcon: {
    color: '#ffc107',
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedText: {
    color: '#2e7d32',
  },
  pendingText: {
    color: '#f57c00',
  },
  message: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006548',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeIcon: {
    color: 'white',
    fontSize: 12,
    marginRight: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default VerificationStatus;
