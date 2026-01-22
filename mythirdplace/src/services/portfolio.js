import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

const COLLECTION_NAME = 'portfolios';

export const createPortfolioItem = async (portfolioData, imageBlob = null) => {
  try {
    console.log('Creating portfolio item:', portfolioData);

    let imageURL = null;

    if (imageBlob) {
      console.log('Uploading portfolio image...');
      const imageRef = ref(storage, `portfolios/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      const snapshot = await uploadBytes(imageRef, imageBlob);
      imageURL = await getDownloadURL(snapshot.ref);
      console.log('Portfolio image uploaded:', imageURL);
    }

    const portfolioWithTimestamps = {
      ...portfolioData,
      featuredImageURL: imageURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isVisible: true
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), portfolioWithTimestamps);
    console.log('Portfolio item created with ID:', docRef.id);

    return {
      id: docRef.id,
      ...portfolioWithTimestamps
    };
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    throw new Error(`Failed to create portfolio item: ${error.message}`);
  }
};

export const updatePortfolioItem = async (portfolioId, portfolioData, imageBlob = null) => {
  try {
    console.log('Updating portfolio item:', portfolioId, portfolioData);

    const portfolioRef = doc(db, COLLECTION_NAME, portfolioId);
    let updateData = {
      ...portfolioData,
      updatedAt: serverTimestamp()
    };

    if (imageBlob) {
      console.log('Uploading new portfolio image...');

      // Get current portfolio to delete old image if exists
      const currentDoc = await getDoc(portfolioRef);
      const currentData = currentDoc.data();

      // Delete old image if it exists
      if (currentData?.featuredImageURL) {
        try {
          const oldImageRef = ref(storage, currentData.featuredImageURL);
          await deleteObject(oldImageRef);
          console.log('Old portfolio image deleted');
        } catch (deleteError) {
          console.log('Could not delete old image (may not exist):', deleteError);
        }
      }

      // Upload new image
      const imageRef = ref(storage, `portfolios/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      const snapshot = await uploadBytes(imageRef, imageBlob);
      updateData.featuredImageURL = await getDownloadURL(snapshot.ref);
      console.log('New portfolio image uploaded:', updateData.featuredImageURL);
    }

    await updateDoc(portfolioRef, updateData);
    console.log('Portfolio item updated successfully');

    return {
      id: portfolioId,
      ...updateData
    };
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    throw new Error(`Failed to update portfolio item: ${error.message}`);
  }
};

export const deletePortfolioItem = async (portfolioId) => {
  try {
    console.log('Deleting portfolio item:', portfolioId);

    const portfolioRef = doc(db, COLLECTION_NAME, portfolioId);

    // Get portfolio data to delete associated image
    const portfolioDoc = await getDoc(portfolioRef);
    const portfolioData = portfolioDoc.data();

    // Delete associated image if it exists
    if (portfolioData?.featuredImageURL) {
      try {
        const imageRef = ref(storage, portfolioData.featuredImageURL);
        await deleteObject(imageRef);
        console.log('Portfolio image deleted from storage');
      } catch (deleteError) {
        console.log('Could not delete portfolio image (may not exist):', deleteError);
      }
    }

    await deleteDoc(portfolioRef);
    console.log('Portfolio item deleted successfully');

    return true;
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    throw new Error(`Failed to delete portfolio item: ${error.message}`);
  }
};

export const getUserPortfolios = async (userUID, maxResults = 50) => {
  try {
    console.log('Fetching portfolios for user:', userUID);

    const portfoliosQuery = query(
      collection(db, COLLECTION_NAME),
      where('userUID', '==', userUID),
      where('isVisible', '==', true),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(portfoliosQuery);
    const portfolios = [];

    querySnapshot.forEach((doc) => {
      portfolios.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`Found ${portfolios.length} portfolio items for user`);
    return portfolios;
  } catch (error) {
    console.error('Error fetching user portfolios:', error);
    throw new Error(`Failed to fetch user portfolios: ${error.message}`);
  }
};

export const getPortfolioItem = async (portfolioId) => {
  try {
    console.log('Fetching portfolio item:', portfolioId);

    const portfolioRef = doc(db, COLLECTION_NAME, portfolioId);
    const portfolioDoc = await getDoc(portfolioRef);

    if (!portfolioDoc.exists()) {
      throw new Error('Portfolio item not found');
    }

    const portfolioData = {
      id: portfolioDoc.id,
      ...portfolioDoc.data()
    };

    console.log('Portfolio item fetched successfully');
    return portfolioData;
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    throw new Error(`Failed to fetch portfolio item: ${error.message}`);
  }
};

export const validatePortfolioData = (portfolioData) => {
  const errors = {};

  if (!portfolioData.title || portfolioData.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (portfolioData.title.length > 200) {
    errors.title = 'Title must be 200 characters or less';
  }

  if (!portfolioData.description || portfolioData.description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (portfolioData.description.length > 1000) {
    errors.description = 'Description must be 1000 characters or less';
  }

  if (!portfolioData.userUID) {
    errors.userUID = 'User ID is required';
  }

  // Validate buttons
  if (portfolioData.buttons && Array.isArray(portfolioData.buttons)) {
    portfolioData.buttons.forEach((button, index) => {
      if (!button.text || button.text.trim().length === 0) {
        errors[`button_${index}_text`] = `Button ${index + 1} text is required`;
      }
      if (!button.url || button.url.trim().length === 0) {
        errors[`button_${index}_url`] = `Button ${index + 1} URL is required`;
      } else {
        // Basic URL validation
        try {
          new URL(button.url);
        } catch {
          errors[`button_${index}_url`] = `Button ${index + 1} URL is not valid`;
        }
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};