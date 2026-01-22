import { auth, db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';

// Default admin users
const DEFAULT_ADMINS = [
  {
    email: "charlielfisher@hotmail.com",
    password: "1Pennymoo!",
    role: "super_admin",
    displayName: "Charlie Fisher"
  },
  {
    email: "admin@mythirdplace.co.uk",
    password: "AdminSecure2024!",
    role: "super_admin",
    displayName: "Joshua Chan"
  }
];

// Initialize default admin users
export const initializeAdminUsers = async () => {
  try {
    for (const adminData of DEFAULT_ADMINS) {
      const adminRef = doc(db, 'adminUsers', adminData.email);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        try {
          // Create auth user
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            adminData.email,
            adminData.password
          );

          // Create admin document
          await setDoc(adminRef, {
            uid: userCredential.user.uid,
            email: adminData.email,
            displayName: adminData.displayName,
            role: adminData.role,
            permissions: {
              canViewUsers: true,
              canEditUsers: true,
              canSuspendUsers: true,
              canDeleteUsers: true,
              canModerateVenues: true,
              canEditVenues: true,
              canModerateBlogs: true,
              canEditBlogs: true,
              canManageFeatured: true,
              canManageCategories: true,
              canManageTags: true,
              canEditSettings: true,
              canViewAnalytics: true,
              canExportData: true,
              canManageAdmins: true
            },
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            isActive: true,
            actionsCount: 0
          });

          console.log(`Admin user created: ${adminData.email}`);
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            console.log(`Admin user already exists in auth: ${adminData.email}`);
          } else {
            console.error(`Error creating admin user ${adminData.email}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error initializing admin users:', error);
  }
};

// Check if user is admin
export const checkIsAdmin = async (email) => {
  try {
    const adminRef = doc(db, 'adminUsers', email);
    const adminDoc = await getDoc(adminRef);
    return adminDoc.exists() && adminDoc.data().isActive;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get admin user data
export const getAdminUser = async (email) => {
  try {
    const adminRef = doc(db, 'adminUsers', email);
    const adminDoc = await getDoc(adminRef);

    if (adminDoc.exists()) {
      return { id: adminDoc.id, ...adminDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
};

// Update admin last login
export const updateAdminLastLogin = async (email) => {
  try {
    const adminRef = doc(db, 'adminUsers', email);
    await updateDoc(adminRef, {
      lastLogin: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating admin last login:', error);
  }
};

// Admin login
export const adminLogin = async (email, password) => {
  try {
    const isAdmin = await checkIsAdmin(email);
    if (!isAdmin) {
      throw new Error('Access denied. Not an admin user.');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await updateAdminLastLogin(email);

    return userCredential.user;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
};

// Get all users for admin management
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Update user data
export const updateUserData = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Get all venues for admin
export const getAllVenues = async () => {
  try {
    const venuesRef = collection(db, 'venues');
    const snapshot = await getDocs(venuesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all venues:', error);
    return [];
  }
};

// Delete venue
export const deleteVenue = async (venueId) => {
  try {
    await deleteDoc(doc(db, 'venues', venueId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting venue:', error);
    throw error;
  }
};

// Update venue data
export const updateVenueData = async (venueId, data) => {
  try {
    const venueRef = doc(db, 'venues', venueId);
    await updateDoc(venueRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating venue:', error);
    throw error;
  }
};

// Get all blogs for admin
export const getAllBlogs = async () => {
  try {
    const blogsRef = collection(db, 'blogs');
    const snapshot = await getDocs(blogsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting all blogs:', error);
    return [];
  }
};

// Delete blog
export const deleteBlog = async (blogId) => {
  try {
    await deleteDoc(doc(db, 'blogs', blogId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

// Update blog data
export const updateBlogData = async (blogId, data) => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
};

// System settings management
export const getSystemSettings = async () => {
  try {
    const settingsRef = collection(db, 'systemSettings');
    const snapshot = await getDocs(settingsRef);
    const settings = {};
    snapshot.docs.forEach(doc => {
      settings[doc.id] = doc.data();
    });
    return settings;
  } catch (error) {
    console.error('Error getting system settings:', error);
    return {};
  }
};

export const updateSystemSetting = async (key, value) => {
  try {
    const settingRef = doc(db, 'systemSettings', key);
    await setDoc(settingRef, {
      value,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating system setting:', error);
    throw error;
  }
};

// Get categories
export const getCategories = async () => {
  try {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

// Add/update category
export const saveCategory = async (categoryId, data) => {
  try {
    const categoryRef = categoryId
      ? doc(db, 'categories', categoryId)
      : doc(collection(db, 'categories'));

    await setDoc(categoryRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true, id: categoryRef.id };
  } catch (error) {
    console.error('Error saving category:', error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (categoryId) => {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Get tags
export const getTags = async () => {
  try {
    const tagsRef = collection(db, 'tags');
    const snapshot = await getDocs(tagsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting tags:', error);
    return [];
  }
};

// Add/update tag
export const saveTag = async (tagId, data) => {
  try {
    const tagRef = tagId
      ? doc(db, 'tags', tagId)
      : doc(collection(db, 'tags'));

    await setDoc(tagRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true, id: tagRef.id };
  } catch (error) {
    console.error('Error saving tag:', error);
    throw error;
  }
};

// Delete tag
export const deleteTag = async (tagId) => {
  try {
    await deleteDoc(doc(db, 'tags', tagId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

// Get user's content (venues and blogs)
export const getUserContent = async (userId) => {
  try {
    // Get user's venues
    const venuesRef = collection(db, 'venues');
    const venuesQuery = query(venuesRef, where('createdBy', '==', userId));
    const venuesSnapshot = await getDocs(venuesQuery);
    const venues = venuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get user's blogs
    const blogsRef = collection(db, 'blogs');
    const blogsQuery = query(blogsRef, where('authorUID', '==', userId));
    const blogsSnapshot = await getDocs(blogsQuery);
    const blogs = blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { venues, blogs };
  } catch (error) {
    console.error('Error getting user content:', error);
    return { venues: [], blogs: [] };
  }
};
