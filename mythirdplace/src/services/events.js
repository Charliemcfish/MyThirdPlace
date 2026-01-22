import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

/**
 * Validate event dates
 * @param {Date|Timestamp} startDate - Event start date
 * @param {Date|Timestamp} endDate - Event end date
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateEventDates = (startDate, endDate) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to start of day for fair comparison

  // Convert Timestamp to Date if needed
  const start = startDate instanceof Timestamp ? startDate.toDate() : new Date(startDate);
  const end = endDate instanceof Timestamp ? endDate.toDate() : new Date(endDate);

  // Start date must be today or in the future
  if (start < now) {
    return { valid: false, error: 'Start date must be today or in the future' };
  }

  // End date must be after start date
  if (end < start) {
    return { valid: false, error: 'End date must be after start date' };
  }

  return { valid: true, error: null };
};

/**
 * Check if user can manage events for a venue
 * @param {string} userId - User ID
 * @param {string} venueId - Venue ID
 * @returns {Promise<boolean>} - True if user can manage events
 */
export const canManageVenueEvents = async (userId, venueId) => {
  if (!userId || !venueId) return false;

  try {
    const venueRef = doc(db, 'venues', venueId);
    const venueSnap = await getDoc(venueRef);

    if (!venueSnap.exists()) {
      return false;
    }

    const venue = venueSnap.data();

    // Check if user is the creator or verified owner
    const isCreator = venue.createdBy === userId;
    const isVerifiedOwner = venue.verifiedOwner === userId;

    return isCreator || isVerifiedOwner;
  } catch (error) {
    console.error('Error checking venue management permissions:', error);
    return false;
  }
};

/**
 * Upload event image to Firebase Storage
 * @param {File|Blob} imageFile - Image file to upload
 * @param {string} eventId - Event ID (for unique path)
 * @returns {Promise<string>} - Download URL of uploaded image
 */
export const uploadEventImage = async (imageFile, eventId) => {
  if (!imageFile) return null;

  try {
    const timestamp = Date.now();
    const fileName = `event_${eventId}_${timestamp}.jpg`;
    const storageRef = ref(storage, `events/${fileName}`);

    await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading event image:', error);
    throw new Error('Failed to upload event image');
  }
};

/**
 * Delete event image from Firebase Storage
 * @param {string} imageURL - URL of image to delete
 * @returns {Promise<void>}
 */
export const deleteEventImage = async (imageURL) => {
  if (!imageURL) return;

  try {
    // Extract path from URL
    const pathMatch = imageURL.match(/events%2F(.+?)\?/);
    if (pathMatch) {
      const fileName = decodeURIComponent(pathMatch[1]);
      const storageRef = ref(storage, `events/${fileName}`);
      await deleteObject(storageRef);
    }
  } catch (error) {
    console.error('Error deleting event image:', error);
    // Don't throw - image deletion is not critical
  }
};

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @param {string} userId - User ID creating the event
 * @param {File|Blob} imageFile - Optional event image file
 * @returns {Promise<string>} - Created event ID
 */
export const createEvent = async (eventData, userId, imageFile = null) => {
  if (!userId) {
    throw new Error('User must be authenticated to create events');
  }

  // Validate required fields
  if (!eventData.eventName || eventData.eventName.trim().length === 0) {
    throw new Error('Event name is required');
  }

  if (eventData.eventName.length > 100) {
    throw new Error('Event name must be 100 characters or less');
  }

  if (!eventData.startDate || !eventData.endDate) {
    throw new Error('Start date and end date are required');
  }

  if (!eventData.venueId) {
    throw new Error('Venue ID is required');
  }

  // Validate dates
  const dateValidation = validateEventDates(eventData.startDate, eventData.endDate);
  if (!dateValidation.valid) {
    throw new Error(dateValidation.error);
  }

  // Check permissions
  const canManage = await canManageVenueEvents(userId, eventData.venueId);
  if (!canManage) {
    throw new Error('You do not have permission to add events to this venue');
  }

  // Validate booking information
  if (eventData.bookingRequired) {
    if (!eventData.bookingButtonText || eventData.bookingButtonText.trim().length === 0) {
      throw new Error('Booking button text is required when booking is required');
    }

    if (!eventData.bookingLink || eventData.bookingLink.trim().length === 0) {
      throw new Error('Booking link is required when booking is required');
    }

    // Validate URL format
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(eventData.bookingLink)) {
      throw new Error('Booking link must be a valid URL starting with http:// or https://');
    }
  }

  try {
    // Convert date strings to Timestamps if needed
    const startDate = eventData.startDate instanceof Timestamp
      ? eventData.startDate
      : Timestamp.fromDate(new Date(eventData.startDate));

    const endDate = eventData.endDate instanceof Timestamp
      ? eventData.endDate
      : Timestamp.fromDate(new Date(eventData.endDate));

    const event = {
      venueId: eventData.venueId,
      venueName: eventData.venueName,
      eventName: eventData.eventName.trim(),
      startDate: startDate,
      endDate: endDate,
      bookingRequired: eventData.bookingRequired || false,
      bookingButtonText: eventData.bookingButtonText?.trim() || null,
      bookingLink: eventData.bookingLink?.trim() || null,
      eventImageURL: null,
      isRecurring: eventData.isRecurring || false,
      recurrenceFrequency: eventData.recurrenceFrequency || null,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };

    const docRef = await addDoc(collection(db, 'events'), event);

    // Upload image if provided
    if (imageFile) {
      try {
        const imageURL = await uploadEventImage(imageFile, docRef.id);
        if (imageURL) {
          await updateDoc(doc(db, 'events', docRef.id), {
            eventImageURL: imageURL,
            updatedAt: serverTimestamp()
          });
        }
      } catch (imageError) {
        console.error('Error uploading event image:', imageError);
        // Event is still created, just without image
      }
    }

    console.log('Event created successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event: ' + error.message);
  }
};

/**
 * Update an existing event
 * @param {string} eventId - Event ID
 * @param {Object} eventData - Updated event data
 * @param {string} userId - User ID updating the event
 * @param {File|Blob} imageFile - Optional new event image file
 * @param {boolean} removeImage - Whether to remove existing image
 * @returns {Promise<void>}
 */
export const updateEvent = async (eventId, eventData, userId, imageFile = null, removeImage = false) => {
  if (!userId) {
    throw new Error('User must be authenticated to update events');
  }

  if (!eventId) {
    throw new Error('Event ID is required');
  }

  try {
    // Get existing event
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      throw new Error('Event not found');
    }

    const existingEvent = eventSnap.data();

    // Check if user is the creator
    if (existingEvent.createdBy !== userId) {
      throw new Error('You do not have permission to update this event');
    }

    // Validate required fields if provided
    if (eventData.eventName !== undefined) {
      if (eventData.eventName.trim().length === 0) {
        throw new Error('Event name cannot be empty');
      }
      if (eventData.eventName.length > 100) {
        throw new Error('Event name must be 100 characters or less');
      }
    }

    // Validate dates if provided
    if (eventData.startDate || eventData.endDate) {
      const startDate = eventData.startDate || existingEvent.startDate;
      const endDate = eventData.endDate || existingEvent.endDate;

      const dateValidation = validateEventDates(startDate, endDate);
      if (!dateValidation.valid) {
        throw new Error(dateValidation.error);
      }
    }

    // Validate booking information if bookingRequired is true
    const bookingRequired = eventData.bookingRequired !== undefined
      ? eventData.bookingRequired
      : existingEvent.bookingRequired;

    if (bookingRequired) {
      const buttonText = eventData.bookingButtonText !== undefined
        ? eventData.bookingButtonText
        : existingEvent.bookingButtonText;

      const link = eventData.bookingLink !== undefined
        ? eventData.bookingLink
        : existingEvent.bookingLink;

      if (!buttonText || buttonText.trim().length === 0) {
        throw new Error('Booking button text is required when booking is required');
      }

      if (!link || link.trim().length === 0) {
        throw new Error('Booking link is required when booking is required');
      }

      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(link)) {
        throw new Error('Booking link must be a valid URL starting with http:// or https://');
      }
    }

    // Build update object
    const updateData = {
      updatedAt: serverTimestamp()
    };

    if (eventData.eventName !== undefined) {
      updateData.eventName = eventData.eventName.trim();
    }

    if (eventData.startDate !== undefined) {
      updateData.startDate = eventData.startDate instanceof Timestamp
        ? eventData.startDate
        : Timestamp.fromDate(new Date(eventData.startDate));
    }

    if (eventData.endDate !== undefined) {
      updateData.endDate = eventData.endDate instanceof Timestamp
        ? eventData.endDate
        : Timestamp.fromDate(new Date(eventData.endDate));
    }

    if (eventData.bookingRequired !== undefined) {
      updateData.bookingRequired = eventData.bookingRequired;
    }

    if (eventData.bookingButtonText !== undefined) {
      updateData.bookingButtonText = eventData.bookingButtonText?.trim() || null;
    }

    if (eventData.bookingLink !== undefined) {
      updateData.bookingLink = eventData.bookingLink?.trim() || null;
    }

    // Handle image updates
    if (removeImage && existingEvent.eventImageURL) {
      // Delete old image and remove URL
      await deleteEventImage(existingEvent.eventImageURL);
      updateData.eventImageURL = null;
    } else if (imageFile) {
      // Upload new image
      try {
        // Delete old image if exists
        if (existingEvent.eventImageURL) {
          await deleteEventImage(existingEvent.eventImageURL);
        }

        const imageURL = await uploadEventImage(imageFile, eventId);
        if (imageURL) {
          updateData.eventImageURL = imageURL;
        }
      } catch (imageError) {
        console.error('Error updating event image:', imageError);
        // Continue with update even if image fails
      }
    }

    await updateDoc(eventRef, updateData);
    console.log('Event updated successfully:', eventId);
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event: ' + error.message);
  }
};

/**
 * Delete an event (soft delete)
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID deleting the event
 * @returns {Promise<void>}
 */
export const deleteEvent = async (eventId, userId) => {
  if (!userId) {
    throw new Error('User must be authenticated to delete events');
  }

  if (!eventId) {
    throw new Error('Event ID is required');
  }

  try {
    // Get existing event
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      throw new Error('Event not found');
    }

    const existingEvent = eventSnap.data();

    // Check if user is the creator
    if (existingEvent.createdBy !== userId) {
      throw new Error('You do not have permission to delete this event');
    }

    // Delete event image if exists
    if (existingEvent.eventImageURL) {
      await deleteEventImage(existingEvent.eventImageURL);
    }

    // Soft delete by setting isActive to false
    await updateDoc(eventRef, {
      isActive: false,
      eventImageURL: null,
      updatedAt: serverTimestamp()
    });

    console.log('Event deleted successfully:', eventId);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event: ' + error.message);
  }
};

/**
 * Generate recurring event instances for the next 2 weeks
 * @param {Object} event - Base recurring event
 * @returns {Array} - Array of event instances
 */
const generateRecurringInstances = (event) => {
  if (!event.isRecurring || !event.recurrenceFrequency) {
    return [event];
  }

  const instances = [];
  const baseStart = event.startDate instanceof Timestamp ? event.startDate.toDate() : new Date(event.startDate);
  const baseEnd = event.endDate instanceof Timestamp ? event.endDate.toDate() : new Date(event.endDate);
  const eventDuration = baseEnd.getTime() - baseStart.getTime();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate 2 weeks from today
  const twoWeeksOut = new Date(today);
  twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);

  // Find the next occurrence from today
  let currentDate = new Date(baseStart);

  // If base date is in the past, advance to first future occurrence
  if (currentDate < today) {
    if (event.recurrenceFrequency === 'weekly') {
      const daysDiff = Math.ceil((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeksToAdd = Math.ceil(daysDiff / 7);
      currentDate.setDate(currentDate.getDate() + (weeksToAdd * 7));
    } else if (event.recurrenceFrequency === 'monthly') {
      while (currentDate < today) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
  }

  // Generate instances for next 2 weeks
  while (currentDate <= twoWeeksOut) {
    const instanceStart = new Date(currentDate);
    const instanceEnd = new Date(currentDate.getTime() + eventDuration);

    instances.push({
      ...event,
      id: `${event.id}_${instanceStart.getTime()}`,
      startDate: Timestamp.fromDate(instanceStart),
      endDate: Timestamp.fromDate(instanceEnd),
      isRecurringInstance: true,
      masterEventId: event.id
    });

    // Move to next occurrence
    if (event.recurrenceFrequency === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (event.recurrenceFrequency === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return instances;
};

/**
 * Get all active events for a venue
 * @param {string} venueId - Venue ID
 * @returns {Promise<Array>} - Array of events
 */
export const getVenueEvents = async (venueId) => {
  if (!venueId) {
    return [];
  }

  try {
    const eventsQuery = query(
      collection(db, 'events'),
      where('venueId', '==', venueId),
      where('isActive', '==', true),
      orderBy('startDate', 'asc')
    );

    const querySnapshot = await getDocs(eventsQuery);
    const allEvents = [];

    querySnapshot.forEach((doc) => {
      const event = {
        id: doc.id,
        ...doc.data()
      };

      // Generate recurring instances or add single event
      const instances = generateRecurringInstances(event);
      allEvents.push(...instances);
    });

    // Sort by start date after generating all instances
    allEvents.sort((a, b) => {
      const aDate = a.startDate instanceof Timestamp ? a.startDate.toDate() : new Date(a.startDate);
      const bDate = b.startDate instanceof Timestamp ? b.startDate.toDate() : new Date(b.startDate);
      return aDate - bDate;
    });

    return allEvents;
  } catch (error) {
    console.error('Error getting venue events:', error);
    return [];
  }
};

/**
 * Get all active events for venues owned by a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of events
 */
export const getUserEvents = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    // First, get all venues owned by the user
    const venuesQuery = query(
      collection(db, 'venues'),
      where('createdBy', '==', userId)
    );

    const venuesSnapshot = await getDocs(venuesQuery);
    const venueIds = [];

    venuesSnapshot.forEach((doc) => {
      venueIds.push(doc.id);
    });

    // Also check for verified owner
    const verifiedVenuesQuery = query(
      collection(db, 'venues'),
      where('verifiedOwner', '==', userId)
    );

    const verifiedVenuesSnapshot = await getDocs(verifiedVenuesQuery);
    verifiedVenuesSnapshot.forEach((doc) => {
      if (!venueIds.includes(doc.id)) {
        venueIds.push(doc.id);
      }
    });

    if (venueIds.length === 0) {
      return [];
    }

    // Get all events for these venues
    // Note: Firestore has a limit of 10 items in 'in' queries, so we'll query each venue separately
    const allEvents = [];

    for (const venueId of venueIds) {
      const eventsQuery = query(
        collection(db, 'events'),
        where('venueId', '==', venueId),
        where('isActive', '==', true),
        orderBy('startDate', 'asc')
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      eventsSnapshot.forEach((doc) => {
        const event = {
          id: doc.id,
          ...doc.data()
        };

        // Generate recurring instances or add single event
        const instances = generateRecurringInstances(event);
        allEvents.push(...instances);
      });
    }

    // Sort all events by start date
    allEvents.sort((a, b) => {
      const aDate = a.startDate instanceof Timestamp ? a.startDate.toDate() : new Date(a.startDate);
      const bDate = b.startDate instanceof Timestamp ? b.startDate.toDate() : new Date(b.startDate);
      return aDate - bDate;
    });

    return allEvents;
  } catch (error) {
    console.error('Error getting user events:', error);
    return [];
  }
};
