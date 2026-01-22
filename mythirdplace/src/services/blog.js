import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  increment 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { getUserProfile } from './user';
import { compressBlogFeaturedImage } from '../utils/imageCompression';

// Import venue categories to use the same system
import { venueCategories } from './venue';

// Blog Categories - Use the same categories as venues for consistency
export const blogCategories = venueCategories();

// Content Processing Utilities
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

export const generateExcerpt = (content, maxLength = 300) => {
  if (!content) return '';

  // Use the improved extractPlainText function that handles markdown
  const extractPlainText = (richContent) => {
    if (!richContent) return '';

    // Remove markdown image syntax first
    let cleanedContent = richContent
      // Remove markdown images: ![alt](url)
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      // Remove markdown links but keep text: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown headers: # ## ###
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown bold/italic: **text** *text*
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove markdown strikethrough: ~~text~~
      .replace(/~~([^~]+)~~/g, '$1')
      // Remove markdown blockquotes: > text
      .replace(/^>\s+/gm, '')
      // Remove markdown code: `code`
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown lists: * item or 1. item
      .replace(/^[\s]*[*\-+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '');

    // Remove all HTML tags and decode HTML entities
    const plainText = cleanedContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    return plainText;
  };

  const plainText = extractPlainText(content);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }

  return truncated + '...';
};

// Enrich blog with author data and generate excerpt if missing
export const enrichBlogWithAuthor = async (blog) => {
  try {
    if (blog.authorUID && !blog.authorName) {
      const authorProfile = await getUserProfile(blog.authorUID);
      if (authorProfile) {
        blog.authorName = authorProfile.displayName || 'Anonymous';
        blog.authorPhotoURL = authorProfile.profilePhotoURL || '';
      }
    }

    // Generate clean excerpt if missing or contains markdown
    if (!blog.excerpt || blog.excerpt.includes('![') || blog.excerpt.includes('##')) {
      blog.excerpt = generateExcerpt(blog.content, 150);
    }

    return blog;
  } catch (error) {
    console.error('Error enriching blog with author data:', error);
    return blog;
  }
};

export const calculateReadTime = (content) => {
  if (!content) return 0;
  
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.trim().split(/\s+/).length;
  const averageWPM = 200;
  
  return Math.max(1, Math.round(wordCount / averageWPM));
};

export const getWordCount = (content) => {
  if (!content) return 0;
  
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.trim().split(/\s+/).length;
};

export const sanitizeContent = (content) => {
  if (!content) return '';
  
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Blog CRUD Operations
export const createBlogWithVenues = async (blogData, venueRelationships = [], featuredImage = null) => {
  try {
    // Create the blog first
    const blog = await createBlog(blogData, featuredImage);

    // Link to venues if relationships provided
    if (venueRelationships && venueRelationships.length > 0) {
      const { linkBlogToVenues } = require('./blogVenueIntegration');
      await linkBlogToVenues(blog.id, venueRelationships);

      // Fetch and return updated blog data
      return await getBlog(blog.id);
    }

    return blog;
  } catch (error) {
    console.error('Error creating blog with venues:', error);
    throw error;
  }
};

export const createBlog = async (blogData, featuredImage = null) => {
  try {
    let featuredImageURL = '';
    
    if (featuredImage) {
      featuredImageURL = await uploadFeaturedImage(featuredImage);
    }
    
    const slug = generateSlug(blogData.title);
    const content = sanitizeContent(blogData.content);
    const excerpt = blogData.excerpt || generateExcerpt(content);
    const readTime = calculateReadTime(content);
    const wordCount = getWordCount(content);
    
    const blogDoc = {
      title: blogData.title.trim(),
      content: content,
      excerpt: excerpt,
      category: blogData.category,
      featuredImageURL: featuredImageURL,
      
      authorUID: blogData.authorUID,
      authorName: blogData.authorName || '',
      authorPhotoURL: blogData.authorPhotoURL || '',
      
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      publishedAt: blogData.isPublished ? Timestamp.now() : null,
      isPublished: blogData.isPublished || false,
      isDraft: !blogData.isPublished,
      
      viewCount: 0,
      readTime: readTime,
      wordCount: wordCount,
      
      isFeatured: false,
      tags: blogData.tags || [],
      slug: slug,
      
      // Venue relationship system
      linkedVenues: blogData.linkedVenues || [],
      venueRelationships: blogData.venueRelationships || [],
      primaryVenue: blogData.primaryVenue || null,

      // Enhanced discovery and categorization
      venueCategories: blogData.venueCategories || [],
      locationTags: blogData.locationTags || [],

      // Cross-platform metadata
      crossPlatformReferences: {
        mentionedVenues: [],
        relatedVenues: [],
        venueConnections: 0
      },

      likes: 0,
      comments: []
    };
    
    const docRef = await addDoc(collection(db, 'blogs'), blogDoc);
    return { id: docRef.id, ...blogDoc };
    
  } catch (error) {
    console.error('Error creating blog:', error);
    throw new Error('Failed to create blog post');
  }
};

export const updateBlog = async (blogId, blogData, featuredImage = null, venueRelationships = null) => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    const blogDoc = await getDoc(blogRef);

    if (!blogDoc.exists()) {
      throw new Error('Blog post not found');
    }

    const existingData = blogDoc.data();
    let featuredImageURL = existingData.featuredImageURL;

    if (featuredImage) {
      if (featuredImageURL) {
        await deleteFeaturedImage(featuredImageURL);
      }
      featuredImageURL = await uploadFeaturedImage(featuredImage, blogId);
    }

    const slug = blogData.title ? generateSlug(blogData.title) : existingData.slug;
    const content = blogData.content ? sanitizeContent(blogData.content) : existingData.content;
    const excerpt = blogData.excerpt || generateExcerpt(content);
    const readTime = calculateReadTime(content);
    const wordCount = getWordCount(content);

    const updateData = {
      updatedAt: Timestamp.now(),
      ...(blogData.title && { title: blogData.title.trim(), slug: slug }),
      ...(blogData.content && {
        content: content,
        excerpt: excerpt,
        readTime: readTime,
        wordCount: wordCount
      }),
      ...(blogData.category && { category: blogData.category }),
      ...(featuredImage && { featuredImageURL: featuredImageURL }),
      ...(blogData.tags && { tags: blogData.tags }),
      ...(blogData.hasOwnProperty('isPublished') && {
        isPublished: blogData.isPublished,
        isDraft: !blogData.isPublished,
        publishedAt: blogData.isPublished ? (existingData.publishedAt || Timestamp.now()) : null
      })
    };

    await updateDoc(blogRef, updateData);

    // Update venue relationships if provided
    if (venueRelationships !== null) {
      console.log('🔗 Updating venue relationships for blog:', blogId);
      console.log('🔗 Venue relationships data:', venueRelationships);
      const { linkBlogToVenues } = require('./blogVenueIntegration');
      await linkBlogToVenues(blogId, venueRelationships);
      console.log('🔗 Venue relationships updated successfully');
    }

    const updatedDoc = await getDoc(blogRef);
    return { id: blogId, ...updatedDoc.data() };

  } catch (error) {
    console.error('Error updating blog:', error);
    throw new Error('Failed to update blog post');
  }
};

export const deleteBlog = async (blogId) => {
  try {
    console.log('deleteBlog called with blogId:', blogId);

    // Ensure user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('deleteBlog: User not authenticated');
      throw new Error('User not authenticated');
    }
    console.log('deleteBlog: User authenticated:', currentUser.uid);

    const blogRef = doc(db, 'blogs', blogId);
    const blogDoc = await getDoc(blogRef);

    if (!blogDoc.exists()) {
      console.error('deleteBlog: Blog post not found');
      throw new Error('Blog post not found');
    }
    console.log('deleteBlog: Blog document found');

    const blogData = blogDoc.data();

    // Verify user owns the blog
    if (blogData.authorUID !== currentUser.uid) {
      console.error('deleteBlog: User does not own this blog post');
      throw new Error('You can only delete your own blog posts');
    }
    console.log('deleteBlog: User ownership verified');

    // Delete featured image if it exists
    if (blogData.featuredImageURL) {
      try {
        console.log('deleteBlog: Deleting featured image');
        await deleteFeaturedImage(blogData.featuredImageURL);
        console.log('deleteBlog: Featured image deleted successfully');
      } catch (imageError) {
        console.warn('Failed to delete featured image:', imageError);
        // Continue with blog deletion even if image deletion fails
      }
    }

    // Delete the blog document
    console.log('deleteBlog: Deleting blog document');
    await deleteDoc(blogRef);
    console.log('deleteBlog: Blog document deleted successfully');
    return true;

  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error; // Throw the original error to preserve the message
  }
};

export const getBlog = async (blogId) => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    const blogDoc = await getDoc(blogRef);
    
    if (!blogDoc.exists()) {
      throw new Error('Blog post not found');
    }
    
    return { id: blogId, ...blogDoc.data() };
    
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw new Error('Failed to fetch blog post');
  }
};

export const getBlogs = async (page = 1, pageLimit = 20, filters = {}) => {
  try {
    let q = collection(db, 'blogs');
    
    const constraints = [where('isPublished', '==', true)];
    
    if (filters.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }
    
    if (filters.authorUID) {
      constraints.push(where('authorUID', '==', filters.authorUID));
    }
    
    // Use createdAt instead of publishedAt to avoid null value issues
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(pageLimit));
    
    if (filters.startAfter) {
      constraints.push(startAfter(filters.startAfter));
    }
    
    q = query(q, ...constraints);
    
    const querySnapshot = await getDocs(q);
    const blogs = [];
    let lastDoc = null;
    
    const enrichPromises = [];
    querySnapshot.forEach((doc) => {
      const blogData = { id: doc.id, ...doc.data() };
      blogs.push(blogData);
      enrichPromises.push(enrichBlogWithAuthor(blogData));
      lastDoc = doc;
    });

    // Enrich all blogs with author data
    await Promise.all(enrichPromises);

    return {
      blogs,
      hasMore: blogs.length === pageLimit,
      lastDoc: lastDoc
    };
    
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error('Failed to fetch blogs');
  }
};

export const getBlogsByAuthor = async (authorUID, includeDrafts = false) => {
  try {
    let q = collection(db, 'blogs');

    const constraints = [where('authorUID', '==', authorUID)];

    if (!includeDrafts) {
      constraints.push(where('isPublished', '==', true));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    q = query(q, ...constraints);

    const querySnapshot = await getDocs(q);
    const blogs = [];
    const enrichPromises = [];

    querySnapshot.forEach((doc) => {
      const blogData = { id: doc.id, ...doc.data() };
      blogs.push(blogData);
      enrichPromises.push(enrichBlogWithAuthor(blogData));
    });

    // Enrich all blogs with author data and excerpts
    await Promise.all(enrichPromises);

    return blogs;

  } catch (error) {
    console.error('Error fetching author blogs:', error);
    throw new Error('Failed to fetch author blogs');
  }
};

export const getBlogsByCategory = async (category, pageLimit = 20) => {
  try {
    const q = query(
      collection(db, 'blogs'),
      where('category', '==', category),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(pageLimit)
    );

    const querySnapshot = await getDocs(q);
    const blogs = [];
    const enrichPromises = [];

    querySnapshot.forEach((doc) => {
      const blogData = { id: doc.id, ...doc.data() };
      blogs.push(blogData);
      enrichPromises.push(enrichBlogWithAuthor(blogData));
    });

    // Enrich all blogs with author data and excerpts
    await Promise.all(enrichPromises);

    return blogs;

  } catch (error) {
    console.error('Error fetching blogs by category:', error);
    throw new Error('Failed to fetch blogs by category');
  }
};

export const getFeaturedBlogs = async (pageLimit = 6) => {
  try {
    const q = query(
      collection(db, 'blogs'),
      where('isFeatured', '==', true),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      limit(pageLimit)
    );

    const querySnapshot = await getDocs(q);
    const blogs = [];
    const enrichPromises = [];

    querySnapshot.forEach((doc) => {
      const blogData = { id: doc.id, ...doc.data() };
      blogs.push(blogData);
      enrichPromises.push(enrichBlogWithAuthor(blogData));
    });

    // Enrich all blogs with author data and excerpts
    await Promise.all(enrichPromises);

    return blogs;

  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    throw new Error('Failed to fetch featured blogs');
  }
};

export const getPopularBlogs = async (pageLimit = 10) => {
  try {
    const q = query(
      collection(db, 'blogs'),
      where('isPublished', '==', true),
      orderBy('viewCount', 'desc'),
      limit(pageLimit)
    );

    const querySnapshot = await getDocs(q);
    const blogs = [];
    const enrichPromises = [];

    querySnapshot.forEach((doc) => {
      const blogData = { id: doc.id, ...doc.data() };
      blogs.push(blogData);
      enrichPromises.push(enrichBlogWithAuthor(blogData));
    });

    // Enrich all blogs with author data and excerpts
    await Promise.all(enrichPromises);

    return blogs;

  } catch (error) {
    console.error('Error fetching popular blogs:', error);
    throw new Error('Failed to fetch popular blogs');
  }
};

export const incrementViewCount = async (blogId) => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      viewCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

// Image Upload Functions
const uploadFeaturedImage = async (image, blogId = null) => {
  try {
    let fileToCompress;

    // Handle different image input types
    if (image.uri) {
      // Handle expo-image-picker asset with URI
      console.log('Converting image URI to blob for compression:', image.uri);
      const response = await fetch(image.uri);
      fileToCompress = await response.blob();
    } else if (image instanceof Blob || image instanceof File) {
      // Handle direct File/Blob input
      fileToCompress = image;
    } else {
      throw new Error('Invalid image format');
    }

    // Compress image before upload
    console.log('Compressing image...');
    const compressedImage = await compressBlogFeaturedImage(fileToCompress);

    const timestamp = Date.now();
    const fileName = `blog-featured-${blogId || 'temp'}-${timestamp}.jpg`;
    const imageRef = ref(storage, `blogs/featured/${fileName}`);

    console.log('Uploading compressed image to Firebase Storage...');
    const snapshot = await uploadBytes(imageRef, compressedImage);
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('Image uploaded successfully:', downloadURL);
    return downloadURL;

  } catch (error) {
    console.error('Error uploading featured image:', error);
    throw new Error('Failed to upload image');
  }
};

const deleteFeaturedImage = async (imageURL) => {
  try {
    if (!imageURL) return;
    
    const imageRef = ref(storage, imageURL);
    await deleteObject(imageRef);
    
  } catch (error) {
    console.error('Error deleting featured image:', error);
  }
};

// Search Functions
export const searchBlogs = async (searchQuery, filters = {}) => {
  try {
    let q = collection(db, 'blogs');

    const constraints = [where('isPublished', '==', true)];

    if (filters.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    q = query(q, ...constraints);

    const querySnapshot = await getDocs(q);
    const blogs = [];

    const enrichPromises = [];

    querySnapshot.forEach((doc) => {
      const blogData = { id: doc.id, ...doc.data() };

      const searchTerm = searchQuery.toLowerCase();
      const titleMatch = blogData.title?.toLowerCase().includes(searchTerm);
      const contentMatch = blogData.content?.toLowerCase().includes(searchTerm);
      const authorMatch = blogData.authorName?.toLowerCase().includes(searchTerm);

      if (titleMatch || contentMatch || authorMatch) {
        blogs.push(blogData);
        enrichPromises.push(enrichBlogWithAuthor(blogData));
      }
    });

    // Enrich all matched blogs with author data and excerpts
    await Promise.all(enrichPromises);

    return blogs;
    
  } catch (error) {
    console.error('Error searching blogs:', error);
    throw new Error('Failed to search blogs');
  }
};

export default {
  blogCategories,
  createBlog,
  createBlogWithVenues,
  updateBlog,
  deleteBlog,
  getBlog,
  getBlogs,
  getBlogsByAuthor,
  getBlogsByCategory,
  getFeaturedBlogs,
  getPopularBlogs,
  incrementViewCount,
  searchBlogs,
  generateSlug,
  generateExcerpt,
  calculateReadTime,
  getWordCount
};