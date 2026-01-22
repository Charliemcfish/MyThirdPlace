import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import ClaimListingForm from '../../components/claims/ClaimListingForm';
import { submitVenueClaim } from '../../services/claimsManagement';
import { sendClaimEmail } from '../../services/claimEmails';

const ClaimListingScreen = ({ route, navigation }) => {
  const { venue, user } = route.params;
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (claimData, documents) => {
    try {
      setSubmitting(true);

      // Submit the claim
      const result = await submitVenueClaim(venue.id, claimData, documents);

      // Send confirmation email
      try {
        await sendClaimEmail('claimReceived', claimData.claimantEmail, {
          claimantName: claimData.claimantName,
          venueName: venue.name,
          claimId: result.claimId
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the whole submission if email fails
      }

      // Navigate back to venue with success flag
      navigation.navigate('VenueDetail', {
        venueId: venue.id,
        showClaimSuccess: true
      });
    } catch (error) {
      console.error('Error submitting claim:', error);
      Alert.alert(
        'Submission Failed',
        'Failed to submit your claim. Please try again or contact support if the problem persists.'
      );
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ClaimListingForm
        venue={venue}
        user={user}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default ClaimListingScreen;
