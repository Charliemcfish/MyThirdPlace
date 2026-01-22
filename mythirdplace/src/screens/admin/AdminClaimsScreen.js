import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Linking,
  Image,
  Platform
} from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getAllClaims,
  getClaimsByStatus,
  updateClaimStatus
} from '../../services/claimsManagement';
import { sendClaimEmail } from '../../services/claimEmails';
import { auth } from '../../services/firebase';

const AdminClaimsScreen = ({ navigation }) => {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadClaims();
  }, [filter]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const claimsData = await getClaimsByStatus(filter, 100);
      setClaims(claimsData);
      setFilteredClaims(claimsData);
    } catch (error) {
      console.error('Error loading claims:', error);
      Alert.alert('Error', 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPress = (claim) => {
    setSelectedClaim(claim);
    setAdminNotes(claim.adminNotes || '');
    setModalVisible(true);
  };

  const handleApprove = async () => {
    if (!selectedClaim) return;

    console.log('Approve button clicked for claim:', selectedClaim.id);
    console.log('Current admin user:', auth.currentUser?.email);

    // Use window.confirm for web, Alert.alert for native
    const confirmed = Platform.OS === 'web'
      ? window.confirm(`Are you sure you want to approve this claim? This will grant ${selectedClaim.claimantName} ownership of ${selectedClaim.venueName}.`)
      : await new Promise(resolve => {
          Alert.alert(
            'Approve Claim',
            `Are you sure you want to approve this claim? This will grant ${selectedClaim.claimantName} ownership of ${selectedClaim.venueName}.`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Approve', style: 'default', onPress: () => resolve(true) }
            ]
          );
        });

    if (!confirmed) return;

    try {
      console.log('Starting approval process...');
      setProcessing(true);
      await updateClaimStatus(
        selectedClaim.id,
        'approved',
        adminNotes,
        auth.currentUser?.email
      );
      console.log('Claim approved successfully');

      // Send approval email
      try {
        await sendClaimEmail('claimApproved', selectedClaim.claimantEmail, {
          claimantName: selectedClaim.claimantName,
          venueName: selectedClaim.venueName,
          venueUrl: `https://mythirdplace.com/venues/${selectedClaim.venueId}`
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      if (Platform.OS === 'web') {
        alert('Claim approved successfully');
      } else {
        Alert.alert('Success', 'Claim approved successfully');
      }
      setModalVisible(false);
      loadClaims();
    } catch (error) {
      console.error('Error approving claim:', error);
      if (Platform.OS === 'web') {
        alert('Failed to approve claim');
      } else {
        Alert.alert('Error', 'Failed to approve claim');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;

    console.log('Reject button clicked for claim:', selectedClaim.id);
    console.log('Admin notes:', adminNotes);

    if (!adminNotes.trim()) {
      if (Platform.OS === 'web') {
        alert('Please provide a reason for rejection');
      } else {
        Alert.alert('Rejection Reason Required', 'Please provide a reason for rejection');
      }
      return;
    }

    // Use window.confirm for web, Alert.alert for native
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to reject this claim?')
      : await new Promise(resolve => {
          Alert.alert(
            'Reject Claim',
            'Are you sure you want to reject this claim?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Reject', style: 'destructive', onPress: () => resolve(true) }
            ]
          );
        });

    if (!confirmed) return;

    try {
      console.log('Starting rejection process...');
      setProcessing(true);
      await updateClaimStatus(
        selectedClaim.id,
        'rejected',
        adminNotes,
        auth.currentUser?.email
      );
      console.log('Claim rejected successfully');

      // Send rejection email
      try {
        await sendClaimEmail('claimRejected', selectedClaim.claimantEmail, {
          claimantName: selectedClaim.claimantName,
          venueName: selectedClaim.venueName,
          reason: adminNotes
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

      if (Platform.OS === 'web') {
        alert('Claim rejected successfully');
      } else {
        Alert.alert('Success', 'Claim rejected');
      }
      setModalVisible(false);
      loadClaims();
    } catch (error) {
      console.error('Error rejecting claim:', error);
      if (Platform.OS === 'web') {
        alert('Failed to reject claim');
      } else {
        Alert.alert('Error', 'Failed to reject claim');
      }
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  const FilterButton = ({ value, label, count }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterButtonText, filter === value && styles.filterButtonTextActive]}>
        {label}
      </Text>
      {count !== undefined && (
        <View style={[styles.badge, filter === value && styles.badgeActive]}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <AdminLayout navigation={navigation} title="Claims Management" currentScreen="AdminClaims">
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <FilterButton
            value="pending"
            label="Pending"
            count={claims.filter(c => c.claimStatus === 'pending').length}
          />
          <FilterButton value="approved" label="Approved" />
          <FilterButton value="rejected" label="Rejected" />
          <FilterButton value="all" label="All Claims" />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#006548" style={styles.loader} />
      ) : filteredClaims.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No claims found</Text>
        </View>
      ) : (
        <ScrollView style={styles.claimsList}>
          {filteredClaims.map((claim) => (
            <TouchableOpacity
              key={claim.id}
              style={styles.claimCard}
              onPress={() => handleClaimPress(claim)}
            >
              <View style={styles.claimHeader}>
                <View style={styles.claimInfo}>
                  <Text style={styles.venueName}>{claim.venueName}</Text>
                  <Text style={styles.claimantName}>by {claim.claimantName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.claimStatus) }]}>
                  <Text style={styles.statusText}>{claim.claimStatus}</Text>
                </View>
              </View>
              <View style={styles.claimDetails}>
                <Text style={styles.detailText}>Business: {claim.businessName}</Text>
                <Text style={styles.detailText}>Role: {claim.businessRole}</Text>
                <Text style={styles.detailText}>Submitted: {formatDate(claim.submittedAt)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Claim Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedClaim && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Claim Review</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Venue Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Venue Information</Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Venue:</Text> {selectedClaim.venueName}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Category:</Text> {selectedClaim.venueCategory}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Venue ID:</Text> {selectedClaim.venueId}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('VenueDetail', { venueId: selectedClaim.venueId });
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.link}>View Venue Page →</Text>
                </TouchableOpacity>
              </View>

              {/* Claimant Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Claimant Information</Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Name:</Text> {selectedClaim.claimantName}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Email:</Text> {selectedClaim.claimantEmail}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>User ID:</Text> {selectedClaim.claimantUID}
                </Text>
              </View>

              {/* Business Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Business Information</Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Business Name:</Text> {selectedClaim.businessName}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Role:</Text> {selectedClaim.businessRole}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Business Email:</Text> {selectedClaim.businessEmail}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Business Phone:</Text> {selectedClaim.businessPhone}
                </Text>
              </View>

              {/* Claim Reason */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Claim Reason</Text>
                <Text style={styles.reasonText}>{selectedClaim.claimReason}</Text>
              </View>

              {/* Additional Info */}
              {selectedClaim.additionalInfo && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Additional Information</Text>
                  <Text style={styles.reasonText}>{selectedClaim.additionalInfo}</Text>
                </View>
              )}

              {/* Documents */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Verification Documents</Text>
                {selectedClaim.ownershipProof && selectedClaim.ownershipProof.length > 0 ? (
                  selectedClaim.ownershipProof.map((doc, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.documentItem}
                      onPress={() => Linking.openURL(doc.url)}
                    >
                      <Text style={styles.documentIcon}>📄</Text>
                      <Text style={styles.documentName}>{doc.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.infoText}>No documents uploaded</Text>
                )}
              </View>

              {/* Submission Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Submission Details</Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Submitted:</Text> {formatDate(selectedClaim.submittedAt)}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.label}>Status:</Text> {selectedClaim.claimStatus}
                </Text>
                {selectedClaim.processedAt && (
                  <>
                    <Text style={styles.infoText}>
                      <Text style={styles.label}>Processed:</Text> {formatDate(selectedClaim.processedAt)}
                    </Text>
                    <Text style={styles.infoText}>
                      <Text style={styles.label}>Processed By:</Text> {selectedClaim.processedBy}
                    </Text>
                  </>
                )}
              </View>

              {/* Admin Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Admin Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add notes about this claim review..."
                  value={adminNotes}
                  onChangeText={setAdminNotes}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Actions */}
              {selectedClaim.claimStatus === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={handleReject}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.actionButtonText}>Reject Claim</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={handleApprove}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.actionButtonText}>Approve Claim</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: '#006548',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  badge: {
    backgroundColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  claimsList: {
    flex: 1,
  },
  claimCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  claimInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  claimantName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  claimDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#006548',
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
  link: {
    fontSize: 14,
    color: '#006548',
    fontWeight: '600',
    marginTop: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  documentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4caf50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminClaimsScreen;
