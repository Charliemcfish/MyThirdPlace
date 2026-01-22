import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { compressImage } from '../utils/imageCompression';

/**
 * Upload an image to Firebase Storage
 * @param {Blob|File} file - The image file to upload
 * @param {string} folder - The folder to store the image in
 * @param {function} onProgress - Progress callback function
 * @param {Object} compressionOptions - Image compression options
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadImageToFirebase = async (file, folder = 'images', onProgress = null, compressionOptions = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file, compressionOptions);

      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
      const storagePath = `${folder}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    } catch (error) {
      console.error('Image compression error:', error);
      reject(error);
    }
  });
};

/**
 * Delete an image from Firebase Storage
 * @param {string} imageUrl - The full URL of the image to delete
 * @returns {Promise<void>}
 */
export const deleteImageFromFirebase = async (imageUrl) => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Firebase Storage
 * @param {Array<Blob|File>} files - Array of image files to upload
 * @param {string} folder - The folder to store the images in
 * @param {function} onProgress - Progress callback function
 * @returns {Promise<Array<string>>} - Array of download URLs
 */
export const uploadMultipleImages = async (files, folder = 'images', onProgress = null) => {
  const uploadPromises = files.map((file, index) => {
    return uploadImageToFirebase(file, folder, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    });
  });

  return Promise.all(uploadPromises);
};