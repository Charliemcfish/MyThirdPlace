import React, { useState, useEffect, useRef } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { createBlog, createBlogWithVenues, updateBlog, getBlog } from '../../services/blog';
import { getUserProfile } from '../../services/user';
import {
  validateBlogTitle,
  validateBlogExcerpt,
  validateBlogCategory,
  validateAndFormatContent,
  processTagsInput,
  generateContentPreview
} from '../../services/content';
import Navigation from '../../components/common/Navigation';
import WYSIWYGBlogEditor from '../../components/blogs/WYSIWYGBlogEditor';
import CategorySelector from '../../components/venues/CategorySelector';
import VenueMultiSelect from '../../components/forms/VenueMultiSelect';
import { blogCategories } from '../../services/blog';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

const CreateBlogScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { blogId, mode = 'create', preselectedVenues = [], suggestedTitle = '' } = route.params || {};

  useDocumentTitle(mode === 'edit' ? 'Edit Blog' : 'Create Blog');

  const [formData, setFormData] = useState({
    title: suggestedTitle || '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featuredImage: null,
    linkedVenues: preselectedVenues || []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [originalBlog, setOriginalBlog] = useState(null);
  
  const scrollViewRef = useRef(null);
  const isEditMode = mode === 'edit' && blogId;

  useEffect(() => {
    loadUserProfile();
    if (isEditMode) {
      loadBlogForEdit();
    }
  }, []);

  useEffect(() => {
    // Auto-save draft functionality
    if (formData.title || formData.content) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      
      const timeout = setTimeout(() => {
        autoSaveDraft();
      }, 30000); // Auto-save every 30 seconds
      
      setAutoSaveTimeout(timeout);
    }
    
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [formData.title, formData.content]);

  const loadUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadBlogForEdit = async () => {
    try {
      setLoading(true);

      const blog = await getBlog(blogId);

      if (!blog) {
        Alert.alert('Error', 'Blog post not found');
        navigation.goBack();
        return;
      }

      // Check if current user is the author
      const user = auth.currentUser;
      if (!user || blog.authorUID !== user.uid) {
        Alert.alert('Error', 'You can only edit your own blog posts');
        navigation.goBack();
        return;
      }

      // Populate form with blog data
      console.log('Loading blog data for edit:', {
        title: blog.title,
        contentLength: blog.content?.length || 0,
        content: blog.content?.substring(0, 100) + '...', // First 100 chars of content
        excerpt: blog.excerpt,
        category: blog.category,
        tags: blog.tags,
        featuredImageURL: blog.featuredImageURL,
        linkedVenues: blog.linkedVenues,
        isPublished: blog.isPublished
      });

      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        category: blog.category || '',
        tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (typeof blog.tags === 'string' ? blog.tags : ''),
        featuredImage: blog.featuredImageURL ? { uri: blog.featuredImageURL } : null,
        linkedVenues: Array.isArray(blog.linkedVenues) ? blog.linkedVenues : []
      });

      // Store the original blog data for editing
      setOriginalBlog(blog);

    } catch (error) {
      console.error('Error loading blog for edit:', error);
      Alert.alert('Error', 'Could not load blog for editing');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const autoSaveDraft = async () => {
    if (!formData.title && !formData.content) return;
    
    try {
      // Auto-save as draft - implementation would go here
      console.log('Auto-saving draft...');
    } catch (error) {
      console.error('Error auto-saving draft:', error);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate title
    const titleValidation = validateBlogTitle(formData.title);
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error;
    }
    
    // Validate content
    const contentValidation = validateAndFormatContent(formData.content);
    if (!contentValidation.isValid) {
      newErrors.content = contentValidation.error;
    }
    
    // Validate category
    const categoryValidation = validateBlogCategory(formData.category, blogCategories);
    if (!categoryValidation.isValid) {
      newErrors.category = categoryValidation.error;
    }
    
    // Validate excerpt (optional)
    if (formData.excerpt) {
      const excerptValidation = validateBlogExcerpt(formData.excerpt);
      if (!excerptValidation.isValid) {
        newErrors.excerpt = excerptValidation.error;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }
    
    await saveBlog(false);
  };

  const handlePublish = async () => {
    console.log('🚀 Publish button clicked');
    console.log('📝 Form data:', formData);

    const isValid = validateForm();
    console.log('✅ Form validation result:', isValid);
    console.log('❌ Form errors:', errors);

    if (!isValid) {
      console.log('❌ Validation failed, showing alert');
      Alert.alert('Validation Error', 'Please fix the errors before publishing');
      return;
    }

    console.log('✅ Validation passed, calling saveBlog');
    await saveBlog(true);
  };

  const saveBlog = async (isPublished) => {
    console.log('💾 saveBlog called with isPublished:', isPublished);
    try {
      setSaving(true);

      const user = auth.currentUser;
      console.log('👤 Current user:', user?.uid);
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🏷️ Processing tags:', formData.tags);
      const tags = processTagsInput(formData.tags);
      console.log('🏷️ Processed tags:', tags);

      console.log('📄 Generating excerpt from content length:', formData.content?.length);
      const excerpt = formData.excerpt || generateContentPreview(formData.content);
      console.log('📄 Generated excerpt:', excerpt);

      const blogData = {
        title: formData.title.trim(),
        content: formData.content,
        excerpt: excerpt,
        category: formData.category,
        tags: tags,
        isPublished: isPublished,
        authorUID: user.uid,
        authorName: userProfile?.displayName || user.displayName || 'Anonymous',
        authorPhotoURL: userProfile?.profilePhotoURL || ''
      };

      // Prepare image for upload if present
      let imageToUpload = null;
      if (formData.featuredImage) {
        // Check if this is already a Firebase Storage URL (for edit mode)
        if (formData.featuredImage.uri && formData.featuredImage.uri.includes('firebasestorage.googleapis.com')) {
          // Image is already uploaded, no need to re-upload
          console.log('🖼️ Image already uploaded to Firebase Storage, skipping upload');
          imageToUpload = null;
        } else {
          // New image that needs to be uploaded - pass the image picker asset directly
          console.log('🖼️ Preparing new image for upload');
          imageToUpload = formData.featuredImage;
        }
      }

      let result;
      if (isEditMode) {
        // Pass venue relationships for edit mode as well
        const linkedVenues = Array.isArray(formData.linkedVenues) ? formData.linkedVenues : [];
        result = await updateBlog(blogId, blogData, imageToUpload, linkedVenues);
      } else {
        // Use enhanced blog creation with venue relationships
        const linkedVenues = Array.isArray(formData.linkedVenues) ? formData.linkedVenues : [];
        if (linkedVenues.length > 0) {
          result = await createBlogWithVenues(blogData, linkedVenues, imageToUpload);
        } else {
          result = await createBlog(blogData, imageToUpload);
        }
      }

      console.log('🎯 Final result after blog creation:', result);
      console.log('🎯 isPublished flag:', isPublished);

      if (isPublished) {
        console.log('🎯 Blog published successfully, showing success popup');

        // Check if we have a valid result with ID
        if (!result || !result.id) {
          console.error('❌ Blog creation failed - no result or ID');
          Alert.alert('Error', 'Blog was created but navigation failed. Please check My Blogs to find your post.');
          return;
        }

        console.log('🎯 Blog ID confirmed:', result.id);

        // Show celebratory success message for published blogs
        const celebratoryTitle = `🎉 Your "${formData.title}" is ready to read! 🎉`;

        // Direct navigation approach - navigate immediately and show success on blog page
        console.log('🚨 Navigating directly to blog detail page');
        navigation.navigate('BlogDetail', {
          blogId: result.id,
          showSuccessMessage: true,
          blogTitle: formData.title
        });

        // Also show a brief alert as backup
        setTimeout(() => {
          console.log('🚨 About to show Alert.alert popup as backup');
          Alert.alert(
            celebratoryTitle,
            'Your blog post has been published! You\'ve been taken to your live post.',
            [{ text: 'OK', onPress: () => console.log('🎯 OK button pressed') }],
            { cancelable: true }
          );
        }, 500);
      } else {
        // Simple success message for drafts
        Alert.alert('Success', 'Blog saved as draft!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('MyBlogs');
            }
          }
        ]);
      }
      
    } catch (error) {
      console.error('❌ Error saving blog:', error);
      console.error('❌ Error stack:', error.stack);
      Alert.alert('Error', error.message || 'Failed to save blog');
    } finally {
      console.log('🔄 Setting saving to false');
      setSaving(false);
    }
  };


  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateFormData('featuredImage', result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Navigation navigation={navigation} />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <>
            {/* Blog Guidance Section */}
            <View style={styles.guidanceContainer}>
              <View style={styles.guidanceTextSection}>
                <Text style={styles.guidanceTitle}>Guidance</Text>
                <Text style={styles.guidanceText}>
                  We love hearing your authentic voice and what makes your Third Place special. Here are a few simple guidelines to help your story shine:
                </Text>
                <Text style={styles.guidanceBullet}>• Length: Aim for around 800 words – enough to dive into your experience while keeping it engaging.</Text>
                <Text style={styles.guidanceBullet}>• Photos: Please use your own original photos if you're including images.</Text>
                <Text style={styles.guidanceBullet}>• Originality: Blogs should be original to MyThirdPlace. If you'd like to also share your story elsewhere, just let us know first.</Text>
                <Text style={styles.guidanceBullet}>• Community Spotlight: If your piece meets our guidelines, we'll feature it on our social media to help more people discover your work.</Text>
                <Text style={styles.guidanceClosing}>Happy writing—we can't wait to hear your story!</Text>
              </View>
              <View style={styles.guidanceImageSection}>
                <Image
                  source={require('../../../assets/blogguidance.png')}
                  style={styles.guidanceImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Title Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.titleInput, errors.title && styles.inputError]}
                value={formData.title}
                onChangeText={(text) => updateFormData('title', text)}
                placeholder="Enter your blog post title..."
                placeholderTextColor="#999"
                maxLength={200}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>

            {/* Category Selector */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <CategorySelector
                selectedCategory={formData.category}
                onCategorySelect={(category) => updateFormData('category', category)}
                showAllOption={false}
                showCreateOption={true}
                layout="horizontal"
              />
              {errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}
            </View>

            {/* Content Editor */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Content <Text style={styles.required}>*</Text>
              </Text>
              <WYSIWYGBlogEditor
                value={formData.content}
                onChangeText={(text) => updateFormData('content', text)}
                placeholder="Start writing your blog post..."
                minHeight={500}
                showWordCount={true}
                maxWords={10000}
              />
              {errors.content && (
                <Text style={styles.errorText}>{errors.content}</Text>
              )}
            </View>

            {/* Optional Excerpt */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Excerpt (Optional)</Text>
              <Text style={styles.helperText}>
                Leave blank to auto-generate from your content
              </Text>
              <TextInput
                style={[styles.excerptInput, errors.excerpt && styles.inputError]}
                value={formData.excerpt}
                onChangeText={(text) => updateFormData('excerpt', text)}
                placeholder="Brief summary of your blog post..."
                placeholderTextColor="#999"
                multiline
                maxLength={300}
              />
              {errors.excerpt && (
                <Text style={styles.errorText}>{errors.excerpt}</Text>
              )}
            </View>

            {/* Featured Image Upload */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Featured Image (Optional)</Text>
              <Text style={styles.helperText}>
                Add a compelling image to make your blog post stand out
              </Text>
              
              {formData.featuredImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: formData.featuredImage.uri || formData.featuredImage }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => updateFormData('featuredImage', null)}
                  >
                    <Text style={styles.removeImageText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleImagePicker}
                >
                  <Text style={styles.uploadButtonText}>Choose Image</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Venue Connections */}
            <VenueMultiSelect
              selectedVenues={formData.linkedVenues}
              onVenuesChange={(venues) => updateFormData('linkedVenues', venues)}
              maxSelections={5}
              label="Connect to an existing Third Place listing"
              required={false}
            />

            {/* Tags Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Tags (Optional)</Text>
              <Text style={styles.helperText}>
                Separate tags with commas (e.g., community, wellness, coworking)
              </Text>
              <TextInput
                style={styles.tagsInput}
                value={formData.tags}
                onChangeText={(text) => updateFormData('tags', text)}
                placeholder="community, wellness, third places..."
                placeholderTextColor="#999"
              />
            </View>
        </>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.draftButton]}
          onPress={handleSaveDraft}
          disabled={saving}
        >
          <Text style={styles.draftButtonText}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.publishButton]}
          onPress={handlePublish}
          disabled={saving}
        >
          <Text style={styles.publishButtonText}>
            {saving ? 'Publishing...' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  helperText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 18,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  excerptInput: {
    fontSize: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tagsInput: {
    fontSize: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  draftButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  publishButton: {
    backgroundColor: colors.primary,
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Featured Image Styles
  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Guidance Section Styles
  guidanceContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'stretch',
    minHeight: 200,
    ...Platform.select({
      web: {
        '@media (max-width: 768px)': {
          flexDirection: 'column',
          alignItems: 'center',
        },
      },
    }),
  },
  guidanceTextSection: {
    flex: 2,
    paddingRight: 16,
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        '@media (max-width: 768px)': {
          paddingRight: 0,
          paddingBottom: 16,
          flex: 'none',
        },
      },
    }),
  },
  guidanceImageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        '@media (max-width: 768px)': {
          flex: 'none',
          width: '100%',
          height: 150,
        },
      },
    }),
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  guidanceText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  guidanceBullet: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
    paddingLeft: 8,
  },
  guidanceClosing: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 8,
    fontStyle: 'italic',
  },
  guidanceImage: {
    width: '100%',
    height: '100%',
    maxWidth: 200,
    ...Platform.select({
      web: {
        '@media (max-width: 768px)': {
          height: 150,
          maxWidth: '100%',
        },
      },
    }),
  },
});

export default CreateBlogScreen;