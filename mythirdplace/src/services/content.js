// Content processing utilities for blog system

export const sanitizeRichText = (content) => {
  if (!content) return '';
  
  // Remove potentially dangerous elements and attributes
  const sanitized = content
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove event handlers (onclick, onmouseover, etc.)
    .replace(/on\w+\s*=/gi, '')
    // Remove style attributes that could contain malicious CSS
    .replace(/style\s*=\s*"[^"]*"/gi, '')
    // Allow basic HTML formatting tags only
    .replace(/<(?!\/?(?:p|br|strong|b|em|i|u|h1|h2|h3|h4|h5|h6|ul|ol|li|blockquote|a|img)\b)[^>]+>/gi, '');
    
  return sanitized.trim();
};

export const extractPlainText = (richContent) => {
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

export const processImagesInContent = (content, blogId) => {
  if (!content || !blogId) return content;
  
  // This function can be enhanced later to handle inline images
  // For now, it just returns the content as-is
  return content;
};

export const validateAndFormatContent = (content) => {
  if (!content) return { isValid: false, error: 'Content is required' };
  
  const plainText = extractPlainText(content);
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  
  if (wordCount < 100) {
    return { 
      isValid: false, 
      error: 'Blog post must be at least 100 words long',
      wordCount: wordCount
    };
  }
  
  if (wordCount > 10000) {
    return { 
      isValid: false, 
      error: 'Blog post cannot exceed 10,000 words',
      wordCount: wordCount
    };
  }
  
  const sanitizedContent = sanitizeRichText(content);
  
  return {
    isValid: true,
    content: sanitizedContent,
    wordCount: wordCount,
    plainText: plainText
  };
};

export const generateContentPreview = (content, length = 150) => {
  const plainText = extractPlainText(content);

  // If content is too short, return as-is
  if (plainText.length <= length) {
    return plainText;
  }

  // Truncate and find word boundary
  const truncated = plainText.substring(0, length);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  // If we found a good word boundary, use it
  if (lastSpaceIndex > length * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }

  return truncated + '...';
};

export const estimateReadingTime = (content) => {
  const plainText = extractPlainText(content);
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  const averageWPM = 200; // Average words per minute
  
  return Math.max(1, Math.round(wordCount / averageWPM));
};

export const extractMetadata = (content) => {
  const plainText = extractPlainText(content);
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = plainText.length;
  const readingTime = estimateReadingTime(content);
  
  // Extract first image URL if present
  const imageRegex = /<img[^>]+src="([^">]+)"/i;
  const imageMatch = content.match(imageRegex);
  const firstImage = imageMatch ? imageMatch[1] : null;
  
  return {
    wordCount,
    characterCount,
    readingTime,
    firstImage,
    plainTextLength: plainText.length
  };
};

export const formatContentForDisplay = (content) => {
  if (!content) return '';
  
  // Ensure proper paragraph spacing and formatting
  const formatted = content
    .replace(/\n/g, '<br>')
    .replace(/<\/p>\s*<p>/g, '</p><p>')
    .replace(/(<h[1-6][^>]*>)/g, '$1')
    .replace(/(<\/h[1-6]>)/g, '$1');
    
  return formatted;
};

export const validateBlogTitle = (title) => {
  if (!title) return { isValid: false, error: 'Title is required' };

  const trimmedTitle = title.trim();

  if (trimmedTitle.length < 10) {
    return { isValid: false, error: 'Title must be at least 10 characters long' };
  }

  if (trimmedTitle.length > 200) {
    return { isValid: false, error: 'Title cannot exceed 200 characters' };
  }

  // Allow all characters except potentially dangerous ones for XSS
  // Block only script tags, HTML brackets, and null characters
  const dangerousPattern = /<script|<\/script>|javascript:|null|\0/i;
  if (dangerousPattern.test(trimmedTitle)) {
    return { isValid: false, error: 'Title contains invalid characters' };
  }

  return { isValid: true, title: trimmedTitle };
};

export const validateBlogExcerpt = (excerpt) => {
  if (!excerpt) return { isValid: true, excerpt: '' }; // Excerpt is optional
  
  const trimmedExcerpt = excerpt.trim();
  
  if (trimmedExcerpt.length > 300) {
    return { isValid: false, error: 'Excerpt cannot exceed 300 characters' };
  }
  
  return { isValid: true, excerpt: trimmedExcerpt };
};

export const validateBlogCategory = (category, validCategories) => {
  if (!category) return { isValid: false, error: 'Category is required' };

  // Trim and validate the category string
  const trimmedCategory = category.trim();

  if (trimmedCategory.length === 0) {
    return { isValid: false, error: 'Category cannot be empty' };
  }

  if (trimmedCategory.length > 50) {
    return { isValid: false, error: 'Category name cannot exceed 50 characters' };
  }

  // Allow custom categories - just validate the format
  // Categories should be alphanumeric with hyphens and spaces
  const validFormat = /^[a-zA-Z0-9\s-]+$/;
  if (!validFormat.test(trimmedCategory)) {
    return { isValid: false, error: 'Category can only contain letters, numbers, spaces, and hyphens' };
  }

  // If validCategories array is provided, check if it's in the predefined list
  // Otherwise, accept any valid custom category
  if (Array.isArray(validCategories) && validCategories.length > 0) {
    const categoryIds = validCategories.map(cat => cat.id);
    const isPredef = categoryIds.includes(category);
    console.log(isPredef ? '✅ Using predefined category' : '✅ Using custom category:', trimmedCategory);
  }

  return { isValid: true, category: trimmedCategory };
};

export const processTagsInput = (tagsInput) => {
  if (!tagsInput) return [];
  
  const tags = tagsInput
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= 50)
    .slice(0, 10); // Maximum 10 tags
    
  return [...new Set(tags)]; // Remove duplicates
};

export const formatRelativeDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  
  return date.toLocaleDateString();
};

export const formatReadingTime = (minutes) => {
  if (!minutes || minutes < 1) return '1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
};

export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + suffix;
  }
  
  return truncated + suffix;
};

export default {
  sanitizeRichText,
  extractPlainText,
  processImagesInContent,
  validateAndFormatContent,
  generateContentPreview,
  estimateReadingTime,
  extractMetadata,
  formatContentForDisplay,
  validateBlogTitle,
  validateBlogExcerpt,
  validateBlogCategory,
  processTagsInput,
  formatRelativeDate,
  formatReadingTime,
  truncateText
};