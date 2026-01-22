import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import { getSystemSettings, updateSystemSetting } from '../../services/admin';

const AdminSEOScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seo, setSeo] = useState({
    homeMetaTitle: '',
    homeMetaDescription: '',
    aboutMetaTitle: '',
    aboutMetaDescription: '',
    venuesMetaTitle: '',
    venuesMetaDescription: '',
    blogsMetaTitle: '',
    blogsMetaDescription: '',
    defaultMetaTitle: '',
    defaultMetaDescription: '',
  });

  useEffect(() => {
    loadSEO();
  }, []);

  const loadSEO = async () => {
    try {
      const settings = await getSystemSettings();
      setSeo({
        homeMetaTitle: settings.homeMetaTitle?.value || 'MyThirdPlace - Find Your Community',
        homeMetaDescription: settings.homeMetaDescription?.value || 'Discover third places near you',
        aboutMetaTitle: settings.aboutMetaTitle?.value || 'About MyThirdPlace',
        aboutMetaDescription: settings.aboutMetaDescription?.value || 'Learn about our mission',
        venuesMetaTitle: settings.venuesMetaTitle?.value || 'Explore Venues | MyThirdPlace',
        venuesMetaDescription: settings.venuesMetaDescription?.value || 'Browse community venues',
        blogsMetaTitle: settings.blogsMetaTitle?.value || 'Blog | MyThirdPlace',
        blogsMetaDescription: settings.blogsMetaDescription?.value || 'Read stories from our community',
        defaultMetaTitle: settings.defaultMetaTitle?.value || 'MyThirdPlace',
        defaultMetaDescription: settings.defaultMetaDescription?.value || 'Find your third place',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(Object.keys(seo).map(key => updateSystemSetting(key, seo[key])));
      Alert.alert('Success', 'SEO settings updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update SEO settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout navigation={navigation} title="SEO Settings" currentScreen="AdminSEO">
        <ActivityIndicator size="large" color="#006548" />
      </AdminLayout>
    );
  }

  const SEOSection = ({ title, titleKey, descKey }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.label}>Meta Title</Text>
      <TextInput
        style={styles.input}
        value={seo[titleKey]}
        onChangeText={(text) => setSeo({ ...seo, [titleKey]: text })}
        placeholder="Page title (50-60 characters)"
      />
      <Text style={styles.charCount}>{seo[titleKey].length} characters</Text>

      <Text style={styles.label}>Meta Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={seo[descKey]}
        onChangeText={(text) => setSeo({ ...seo, [descKey]: text })}
        placeholder="Page description (150-160 characters)"
        multiline
        numberOfLines={3}
      />
      <Text style={styles.charCount}>{seo[descKey].length} characters</Text>
    </View>
  );

  return (
    <AdminLayout navigation={navigation} title="SEO Settings" currentScreen="AdminSEO">
      <ScrollView>
        <SEOSection
          title="Homepage"
          titleKey="homeMetaTitle"
          descKey="homeMetaDescription"
        />
        <SEOSection
          title="About Page"
          titleKey="aboutMetaTitle"
          descKey="aboutMetaDescription"
        />
        <SEOSection
          title="Venues Page"
          titleKey="venuesMetaTitle"
          descKey="venuesMetaDescription"
        />
        <SEOSection
          title="Blogs Page"
          titleKey="blogsMetaTitle"
          descKey="blogsMetaDescription"
        />
        <SEOSection
          title="Default (Fallback)"
          titleKey="defaultMetaTitle"
          descKey="defaultMetaDescription"
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save All SEO Settings'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#006548',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#006548',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default AdminSEOScreen;
