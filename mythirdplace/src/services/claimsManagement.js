import { db, storage } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Submit venue claim
export const submitVenueClaim = async (venueId, claimData, documents) => {
  try {
    const claimRef = doc(collection(db, 'venueClaims'));

    // Upload documents to Firebase Storage
    const uploadedDocuments = [];
    for (const document of documents) {
      const docRef = ref(storage, `claims/${claimRef.id}/${document.name}`);
      await uploadBytes(docRef, document);
      const url = await getDownloadURL(docRef);
      uploadedDocuments.push({
        name: document.name,
        url,
        uploadedAt: new Date().toISOString()
      });
    }

    // Get venue and user data for caching
    const venueDoc = await getDoc(doc(db, 'venues', venueId));
    const venueData = venueDoc.data();

    const claimDocument = {
      id: claimRef.id,
      venueId,
      claimantUID: claimData.claimantUID,
      claimReason: claimData.claimReason,
      submittedAt: serverTimestamp(),
      claimStatus: 'pending',
      businessEmail: claimData.businessEmail,
      businessPhone: claimData.businessPhone,
      businessName: claimData.businessName,
      businessRole: claimData.businessRole,
      businessAddress: claimData.businessAddress || '',
      ownershipProof: uploadedDocuments,
      additionalInfo: claimData.additionalInfo || '',
      // Cached data
      venueName: venueData?.name || '',
      venueCategory: venueData?.category || '',
      claimantName: claimData.claimantName,
      claimantEmail: claimData.claimantEmail,
      emailsSent: [],
      adminNotes: '',
      rejectionReason: ''
    };

    await setDoc(claimRef, claimDocument);

    // Update venue with pending claim
    const venueRef = doc(db, 'venues', venueId);
    await updateDoc(venueRef, {
      claimStatus: 'pending_claim',
      pendingClaims: (venueData.pendingClaims || 0) + 1,
      lastClaimAt: serverTimestamp()
    });

    return { success: true, claimId: claimRef.id };
  } catch (error) {
    console.error('Error submitting venue claim:', error);
    throw error;
  }
};

// Get claim status
export const getClaimStatus = async (claimId) => {
  try {
    const claimRef = doc(db, 'venueClaims', claimId);
    const claimDoc = await getDoc(claimRef);

    if (claimDoc.exists()) {
      return { id: claimDoc.id, ...claimDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting claim status:', error);
    return null;
  }
};

// Get user's claims
export const getUserClaims = async (userUID) => {
  try {
    const claimsRef = collection(db, 'venueClaims');
    const q = query(
      claimsRef,
      where('claimantUID', '==', userUID),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user claims:', error);
    return [];
  }
};

// Get venue claims
export const getVenueClaims = async (venueId) => {
  try {
    const claimsRef = collection(db, 'venueClaims');
    const q = query(
      claimsRef,
      where('venueId', '==', venueId),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting venue claims:', error);
    return [];
  }
};

// Check if user has pending claim for venue
export const hasUserClaimedVenue = async (userUID, venueId) => {
  try {
    const claimsRef = collection(db, 'venueClaims');
    const q = query(
      claimsRef,
      where('claimantUID', '==', userUID),
      where('venueId', '==', venueId),
      where('claimStatus', 'in', ['pending', 'approved'])
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking user claim:', error);
    return false;
  }
};

// Admin: Update claim status
export const updateClaimStatus = async (claimId, status, adminNotes, adminEmail) => {
  try {
    const claimRef = doc(db, 'venueClaims', claimId);
    const claimDoc = await getDoc(claimRef);
    const claimData = claimDoc.data();

    const updates = {
      claimStatus: status,
      processedAt: serverTimestamp(),
      processedBy: adminEmail,
      adminNotes: adminNotes || claimData.adminNotes
    };

    if (status === 'rejected') {
      updates.rejectionReason = adminNotes;
    }

    await updateDoc(claimRef, updates);

    // If approved, update venue ownership
    if (status === 'approved') {
      await transferVenueOwnership(claimData.venueId, claimData.claimantUID, claimData.businessName);
    }

    // Update venue claim status
    const venueRef = doc(db, 'venues', claimData.venueId);
    const venueDoc = await getDoc(venueRef);
    const venueData = venueDoc.data();

    await updateDoc(venueRef, {
      claimStatus: status === 'approved' ? 'verified' : 'unclaimed',
      pendingClaims: Math.max(0, (venueData.pendingClaims || 1) - 1)
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating claim status:', error);
    throw error;
  }
};

// Transfer venue ownership
export const transferVenueOwnership = async (venueId, newOwnerUID, businessName) => {
  try {
    const venueRef = doc(db, 'venues', venueId);

    await updateDoc(venueRef, {
      verifiedOwner: newOwnerUID,
      claimStatus: 'verified',
      verificationDate: serverTimestamp(),
      verificationMethod: 'admin_approval',
      isBusinessVerified: true,
      ownerClaimed: true,
      businessDetails: {
        legalName: businessName,
        verifiedEmail: '',
        verifiedPhone: ''
      }
    });

    // Create user-venue relationship
    const relationshipRef = doc(collection(db, 'userVenueRelationships'));
    await setDoc(relationshipRef, {
      userUID: newOwnerUID,
      venueID: venueId,
      relationshipType: 'owner',
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error transferring venue ownership:', error);
    throw error;
  }
};

// Admin: Get all claims
export const getAllClaims = async () => {
  try {
    const claimsRef = collection(db, 'venueClaims');
    const q = query(claimsRef, orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all claims:', error);
    return [];
  }
};

// Admin: Get pending claims count
export const getPendingClaimsCount = async () => {
  try {
    const claimsRef = collection(db, 'venueClaims');
    const q = query(claimsRef, where('claimStatus', '==', 'pending'));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting pending claims count:', error);
    return 0;
  }
};

// Admin: Get claims by status
export const getClaimsByStatus = async (status, limitCount = 50) => {
  try {
    const claimsRef = collection(db, 'venueClaims');
    let q;

    if (status === 'all') {
      q = query(claimsRef, orderBy('submittedAt', 'desc'), limit(limitCount));
    } else {
      q = query(
        claimsRef,
        where('claimStatus', '==', status),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const claims = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort in memory if filtered by status (to avoid compound index requirement)
    if (status !== 'all') {
      claims.sort((a, b) => {
        const dateA = a.submittedAt?.toMillis?.() || 0;
        const dateB = b.submittedAt?.toMillis?.() || 0;
        return dateB - dateA;
      });
    }

    return claims;
  } catch (error) {
    console.error('Error getting claims by status:', error);
    return [];
  }
};

// Admin: Get recent claim activity
export const getClaimActivityFeed = async (limitCount = 10) => {
  try {
    const claimsRef = collection(db, 'venueClaims');
    const q = query(claimsRef, orderBy('submittedAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting claim activity feed:', error);
    return [];
  }
};

// Check if user is verified owner of venue
export const isVerifiedOwner = async (userUID, venueId) => {
  try {
    const venueRef = doc(db, 'venues', venueId);
    const venueDoc = await getDoc(venueRef);

    if (venueDoc.exists()) {
      const venueData = venueDoc.data();
      return venueData.verifiedOwner === userUID && venueData.claimStatus === 'verified';
    }
    return false;
  } catch (error) {
    console.error('Error checking verified owner:', error);
    return false;
  }
};

// Get user's verified venues
export const getUserVerifiedVenues = async (userUID) => {
  try {
    const venuesRef = collection(db, 'venues');
    const q = query(
      venuesRef,
      where('verifiedOwner', '==', userUID),
      where('claimStatus', '==', 'verified')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user verified venues:', error);
    return [];
  }
};
