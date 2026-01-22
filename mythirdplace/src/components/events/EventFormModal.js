import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { colors } from '../../styles/theme';
import { createEvent, updateEvent } from '../../services/events';
import { Timestamp } from 'firebase/firestore';

const EventFormModal = ({
  visible,
  onClose,
  onSave,
  venueId,
  venueName,
  editingEvent = null
}) => {
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingRequired, setBookingRequired] = useState(true);
  const [bookingButtonText, setBookingButtonText] = useState('');
  const [bookingLink, setBookingLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [eventImage, setEventImage] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('weekly');

  // Populate form when editing
  useEffect(() => {
    if (editingEvent) {
      setEventName(editingEvent.eventName || '');

      // Convert Firestore timestamps to date strings for input
      if (editingEvent.startDate) {
        const date = editingEvent.startDate instanceof Timestamp
          ? editingEvent.startDate.toDate()
          : new Date(editingEvent.startDate);
        setStartDate(formatDateForInput(date));
      }

      if (editingEvent.endDate) {
        const date = editingEvent.endDate instanceof Timestamp
          ? editingEvent.endDate.toDate()
          : new Date(editingEvent.endDate);
        setEndDate(formatDateForInput(date));
      }

      setBookingRequired(editingEvent.bookingRequired !== undefined ? editingEvent.bookingRequired : true);
      setBookingButtonText(editingEvent.bookingButtonText || '');
      setBookingLink(editingEvent.bookingLink || '');
      setEventImagePreview(editingEvent.eventImageURL || null);
      setEventImage(null);
      setRemoveImage(false);
      setIsRecurring(editingEvent.isRecurring || false);
      setRecurrenceFrequency(editingEvent.recurrenceFrequency || 'weekly');
    } else {
      // Reset form for new event
      setEventName('');
      setStartDate('');
      setEndDate('');
      setBookingRequired(true);
      setBookingButtonText('');
      setBookingLink('');
      setEventImagePreview(null);
      setEventImage(null);
      setRemoveImage(false);
      setIsRecurring(false);
      setRecurrenceFrequency('weekly');
    }
    setErrors({});
  }, [editingEvent, visible]);

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Alert.alert('Error', 'Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Alert.alert('Error', 'Image must be less than 5MB');
        return;
      }

      setEventImage(file);
      setEventImagePreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setEventImage(null);
    setEventImagePreview(null);
    setRemoveImage(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!eventName.trim()) {
      newErrors.eventName = 'Event name is required';
    } else if (eventName.length > 100) {
      newErrors.eventName = 'Event name must be 100 characters or less';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);

      if (start < today) {
        newErrors.startDate = 'Start date must be today or in the future';
      }
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (bookingRequired) {
      if (!bookingButtonText.trim()) {
        newErrors.bookingButtonText = 'Button text is required';
      }

      if (!bookingLink.trim()) {
        newErrors.bookingLink = 'Booking link is required';
      } else {
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(bookingLink)) {
          newErrors.bookingLink = 'Must be a valid URL (http:// or https://)';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!venueId || !venueName) {
      Alert.alert('Error', 'Venue information is missing');
      return;
    }

    setSaving(true);

    try {
      const eventData = {
        venueId,
        venueName,
        eventName: eventName.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bookingRequired,
        bookingButtonText: bookingRequired ? bookingButtonText.trim() : null,
        bookingLink: bookingRequired ? bookingLink.trim() : null,
        isRecurring,
        recurrenceFrequency: isRecurring ? recurrenceFrequency : null
      };

      if (editingEvent) {
        // Update existing event
        await updateEvent(editingEvent.id, eventData, editingEvent.createdBy, eventImage, removeImage);
        Alert.alert('Success', 'Event updated successfully');
      } else {
        // Create new event - onSave prop will handle getting userId and passing image
        if (onSave) {
          await onSave(eventData, eventImage);
        }
      }

      handleClose();
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', error.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setEventName('');
    setStartDate('');
    setEndDate('');
    setBookingRequired(true);
    setBookingButtonText('');
    setBookingLink('');
    setEventImagePreview(null);
    setEventImage(null);
    setRemoveImage(false);
    setIsRecurring(false);
    setRecurrenceFrequency('weekly');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <Text style={styles.modalTitle}>
              {editingEvent ? 'Edit Event' : 'Add Event'}
            </Text>
            <Text style={styles.venueNameText}>at {venueName}</Text>

            {/* Event Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Event Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.eventName && styles.inputError]}
                value={eventName}
                onChangeText={setEventName}
                placeholder="e.g. Live Jazz Night"
                maxLength={100}
              />
              {errors.eventName && (
                <Text style={styles.errorText}>{errors.eventName}</Text>
              )}
            </View>

            {/* Start Date */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Start Date <Text style={styles.required}>*</Text>
              </Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    ...webInputStyle,
                    ...(errors.startDate && webInputErrorStyle)
                  }}
                />
              ) : (
                <TextInput
                  style={[styles.input, errors.startDate && styles.inputError]}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                />
              )}
              {errors.startDate && (
                <Text style={styles.errorText}>{errors.startDate}</Text>
              )}
            </View>

            {/* End Date */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                End Date <Text style={styles.required}>*</Text>
              </Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    ...webInputStyle,
                    ...(errors.endDate && webInputErrorStyle)
                  }}
                />
              ) : (
                <TextInput
                  style={[styles.input, errors.endDate && styles.inputError]}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                />
              )}
              {errors.endDate && (
                <Text style={styles.errorText}>{errors.endDate}</Text>
              )}
            </View>

            {/* Recurring Event Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsRecurring(!isRecurring)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isRecurring && styles.checkboxChecked]}>
                {isRecurring && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Recurring event</Text>
            </TouchableOpacity>

            {/* Recurrence Frequency */}
            {isRecurring && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Frequency</Text>
                {Platform.OS === 'web' ? (
                  <select
                    value={recurrenceFrequency}
                    onChange={(e) => setRecurrenceFrequency(e.target.value)}
                    style={webInputStyle}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                ) : (
                  <View style={styles.frequencyButtons}>
                    <TouchableOpacity
                      style={[styles.frequencyButton, recurrenceFrequency === 'weekly' && styles.frequencyButtonActive]}
                      onPress={() => setRecurrenceFrequency('weekly')}
                    >
                      <Text style={[styles.frequencyButtonText, recurrenceFrequency === 'weekly' && styles.frequencyButtonTextActive]}>Weekly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.frequencyButton, recurrenceFrequency === 'monthly' && styles.frequencyButtonActive]}
                      onPress={() => setRecurrenceFrequency('monthly')}
                    >
                      <Text style={[styles.frequencyButtonText, recurrenceFrequency === 'monthly' && styles.frequencyButtonTextActive]}>Monthly</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* No Booking Required Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setBookingRequired(!bookingRequired)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, !bookingRequired && styles.checkboxChecked]}>
                {!bookingRequired && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>No booking required</Text>
            </TouchableOpacity>

            {/* Booking Button Text */}
            {bookingRequired && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Booking Button Text <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.bookingButtonText && styles.inputError]}
                  value={bookingButtonText}
                  onChangeText={setBookingButtonText}
                  placeholder="e.g. Book Tickets"
                />
                {errors.bookingButtonText && (
                  <Text style={styles.errorText}>{errors.bookingButtonText}</Text>
                )}
              </View>
            )}

            {/* Booking Link */}
            {bookingRequired && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Booking Link <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.bookingLink && styles.inputError]}
                  value={bookingLink}
                  onChangeText={setBookingLink}
                  placeholder="https://example.com/booking"
                  keyboardType="url"
                  autoCapitalize="none"
                />
                {errors.bookingLink && (
                  <Text style={styles.errorText}>{errors.bookingLink}</Text>
                )}
              </View>
            )}

            {/* Event Image Upload */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Event Image (Optional)</Text>
              {Platform.OS === 'web' ? (
                <View>
                  {eventImagePreview ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: eventImagePreview }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={handleRemoveImage}
                      >
                        <Text style={styles.removeImageText}>Remove Image</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <label htmlFor="event-image-upload" style={webImageUploadLabelStyle}>
                      <input
                        id="event-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                      />
                      <View style={styles.uploadButton}>
                        <Text style={styles.uploadButtonText}>Choose Image</Text>
                      </View>
                    </label>
                  )}
                  <Text style={styles.helperText}>Recommended: 1200x600px, max 5MB</Text>
                </View>
              ) : (
                <Text style={styles.helperText}>Image upload is available on web only</Text>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingEvent ? 'Update' : 'Save'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const webInputStyle = {
  width: '100%',
  padding: '12px',
  fontSize: '16px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#ddd',
  borderRadius: '8px',
  backgroundColor: '#fff',
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};

const webInputErrorStyle = {
  borderColor: '#e74c3c'
};

const webImageUploadLabelStyle = {
  display: 'block',
  cursor: 'pointer'
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 24
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4
  },
  venueNameText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24
  },
  fieldContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  required: {
    color: '#e74c3c'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fff'
  },
  inputError: {
    borderColor: '#e74c3c'
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 4
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center'
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  imagePreviewContainer: {
    marginBottom: 12
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8
  },
  removeImageButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center'
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic'
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 12
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  frequencyButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  frequencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  frequencyButtonTextActive: {
    color: '#fff'
  }
});

export default EventFormModal;
