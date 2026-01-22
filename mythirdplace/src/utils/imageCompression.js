/**
 * Image Compression Utility
 * Compresses and resizes images before uploading to Firebase Storage
 * Reduces storage costs and improves page load performance
 */

/**
 * Compress and resize an image
 * @param {File|Blob} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width in pixels (default: 1920)
 * @param {number} options.maxHeight - Maximum height in pixels (default: 1920)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.8)
 * @param {string} options.type - Output image type (default: 'image/jpeg')
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    type = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    // Create a file reader
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF'; // White background for JPEGs
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`Image compressed: ${(file.size / 1024).toFixed(2)}KB -> ${(blob.size / 1024).toFixed(2)}KB`);
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Compress image for profile photos (smaller, square)
 * @param {File|Blob} file - The image file
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressProfilePhoto = async (file) => {
  return compressImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.85,
    type: 'image/jpeg'
  });
};

/**
 * Compress image for venue photos
 * @param {File|Blob} file - The image file
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressVenuePhoto = async (file) => {
  return compressImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    type: 'image/jpeg'
  });
};

/**
 * Compress image for blog featured images
 * @param {File|Blob} file - The image file
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressBlogFeaturedImage = async (file) => {
  return compressImage(file, {
    maxWidth: 1600,
    maxHeight: 900,
    quality: 0.85,
    type: 'image/jpeg'
  });
};

/**
 * Compress image for claim documents
 * @param {File|Blob} file - The image file
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressClaimDocument = async (file) => {
  return compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.9, // Higher quality for documents
    type: 'image/jpeg'
  });
};

/**
 * Check if file is an image
 * @param {File} file - The file to check
 * @returns {boolean} - True if file is an image
 */
export const isImageFile = (file) => {
  if (!file || !file.type) return false;
  return file.type.startsWith('image/');
};

/**
 * Get image dimensions
 * @param {File|Blob} file - The image file
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export const getImageDimensions = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

export default {
  compressImage,
  compressProfilePhoto,
  compressVenuePhoto,
  compressBlogFeaturedImage,
  compressClaimDocument,
  isImageFile,
  getImageDimensions
};
