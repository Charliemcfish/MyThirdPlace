import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import AdminLayout from '../../components/admin/AdminLayout';
import { getSystemSettings, updateSystemSetting } from '../../services/admin';

const AdminContentScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState({
    // Homepage Hero
    homeHeroTitle: '',
    homeHeroSubtitle: '',

    // Homepage Content Section
    homeWhatIsTitle: '',
    homeWhatIsContent: '',

    // About Page
    aboutHeroTitle: '',
    aboutHeroSubtitle: '',
    aboutFounderText: '',
    aboutRayTitle: '',
    aboutRayText: '',
    aboutMissionText: '',
    aboutStatsTitle: '',
    aboutWhyTheyMatterTitle: '',
    aboutWhyTheyMatterSubtitle: '',

    // Contact
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const settings = await getSystemSettings();
      setContent({
        homeHeroTitle: settings.homeHeroTitle?.value || 'Find a Third Place Near you',
        homeHeroSubtitle: settings.homeHeroSubtitle?.value || 'Or write about your favourite Third Place',
        homeWhatIsTitle: settings.homeWhatIsTitle?.value || 'What is a Third Place?',
        homeWhatIsContent: settings.homeWhatIsContent?.value || 'The Third Place concept, pioneered by sociologist Ray Oldenburg (1932-2022), highlights the vital gathering spots beyond home (the first place) and work (the second place). Cafes, pubs, libraries, parks, and coworking spaces are more than just physical locations - they are social anchors where community, belonging, and connection come to life.\n\nAt MyThirdPlace, we\'re building a community-driven map of these spaces and the human stories they inspire. Through venue listings, personal blogs, and shared experiences, we celebrate the value of Third Places worldwide and make it easier for people to discover and connect with them.',
        aboutHeroTitle: settings.aboutHeroTitle?.value || 'Welcome to MyThirdPlace',
        aboutHeroSubtitle: settings.aboutHeroSubtitle?.value || 'MyThirdPlace: Connecting Communities Through Social Spaces Across the UK',
        aboutFounderText: settings.aboutFounderText?.value || 'MyThirdPlace, founded by Joshua Chan, is dedicated to revitalising social infrastructure across the UK. We identify, promote, and connect people with vital community spaces that exist beyond home and work - the essential "third places" that foster social connection and community wellbeing.',
        aboutRayTitle: settings.aboutRayTitle?.value || 'What is a Third Place?',
        aboutRayText: settings.aboutRayText?.value || 'The third place concept, introduced by sociologist Ray Oldenburg, refers to those community-focused gathering spots that complement our homes (first places) and workplaces (second places). These public spaces - ranging from coworking hubs and coffee shops to libraries and volunteer spaces - create the social fabric that binds neighbourhoods together.',
        aboutMissionText: settings.aboutMissionText?.value || 'MyThirdPlace is dedicated to showcasing Third Places - gathering spots outside the home (first place) and work (second place) - and the stories they inspire. By supporting writers and showcasing spaces, we aim to build a global map of connection: a platform where authentic, human stories bring communities closer, highlight the value of social spaces, and ensure these places continue to thrive.',
        aboutStatsTitle: settings.aboutStatsTitle?.value || 'Stats from MyThirdPlace',
        aboutWhyTheyMatterTitle: settings.aboutWhyTheyMatterTitle?.value || 'Why third places matter',
        aboutWhyTheyMatterSubtitle: settings.aboutWhyTheyMatterSubtitle?.value || 'Third places are essential to the fabric of our society, offering numerous benefits that enrich our lives and strengthen our communities. Here are some key reasons why we need third places:',
        contactEmail: settings.contactEmail?.value || 'hello@mythirdplace.com',
        contactPhone: settings.contactPhone?.value || '',
      });
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(Object.keys(content).map(key =>
        updateSystemSetting(key, content[key])
      ));
      Alert.alert('Success', 'Content updated successfully. Refresh the pages to see changes.');
    } catch (error) {
      console.error('Error saving content:', error);
      Alert.alert('Error', 'Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout navigation={navigation} title="Page Content Editor" currentScreen="AdminContent">
        <ActivityIndicator size="large" color="#006548" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout navigation={navigation} title="Page Content Editor" currentScreen="AdminContent">
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Homepage Hero Section</Text>

          <Text style={styles.label}>Hero Title</Text>
          <TextInput
            style={styles.input}
            value={content.homeHeroTitle}
            onChangeText={(text) => setContent({ ...content, homeHeroTitle: text })}
            placeholder="Find a Third Place Near you"
          />

          <Text style={styles.label}>Hero Subtitle</Text>
          <TextInput
            style={styles.input}
            value={content.homeHeroSubtitle}
            onChangeText={(text) => setContent({ ...content, homeHeroSubtitle: text })}
            placeholder="Or write about your favourite Third Place"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Homepage "What is a Third Place?" Section</Text>

          <Text style={styles.label}>Section Title</Text>
          <TextInput
            style={styles.input}
            value={content.homeWhatIsTitle}
            onChangeText={(text) => setContent({ ...content, homeWhatIsTitle: text })}
            placeholder="What is a Third Place?"
          />

          <Text style={styles.label}>Section Content</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content.homeWhatIsContent}
            onChangeText={(text) => setContent({ ...content, homeWhatIsContent: text })}
            placeholder="Content explaining third places..."
            multiline
            numberOfLines={8}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Page Hero</Text>

          <Text style={styles.label}>Hero Title</Text>
          <TextInput
            style={styles.input}
            value={content.aboutHeroTitle}
            onChangeText={(text) => setContent({ ...content, aboutHeroTitle: text })}
            placeholder="Welcome to MyThirdPlace"
          />

          <Text style={styles.label}>Hero Subtitle</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content.aboutHeroSubtitle}
            onChangeText={(text) => setContent({ ...content, aboutHeroSubtitle: text })}
            placeholder="MyThirdPlace: Connecting Communities..."
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Page - Founder Section</Text>

          <Text style={styles.label}>Founder Text</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content.aboutFounderText}
            onChangeText={(text) => setContent({ ...content, aboutFounderText: text })}
            placeholder="MyThirdPlace, founded by..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Page - Ray Oldenburg Section</Text>

          <Text style={styles.label}>Section Title</Text>
          <TextInput
            style={styles.input}
            value={content.aboutRayTitle}
            onChangeText={(text) => setContent({ ...content, aboutRayTitle: text })}
            placeholder="What is a Third Place?"
          />

          <Text style={styles.label}>Section Content</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content.aboutRayText}
            onChangeText={(text) => setContent({ ...content, aboutRayText: text })}
            placeholder="The third place concept..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Page - Mission Statement</Text>

          <Text style={styles.label}>Mission Text</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content.aboutMissionText}
            onChangeText={(text) => setContent({ ...content, aboutMissionText: text })}
            placeholder="MyThirdPlace is dedicated to..."
            multiline
            numberOfLines={5}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Page - Section Titles</Text>

          <Text style={styles.label}>Stats Section Title</Text>
          <TextInput
            style={styles.input}
            value={content.aboutStatsTitle}
            onChangeText={(text) => setContent({ ...content, aboutStatsTitle: text })}
            placeholder="Stats from MyThirdPlace"
          />

          <Text style={styles.label}>"Why Third Places Matter" Title</Text>
          <TextInput
            style={styles.input}
            value={content.aboutWhyTheyMatterTitle}
            onChangeText={(text) => setContent({ ...content, aboutWhyTheyMatterTitle: text })}
            placeholder="Why third places matter"
          />

          <Text style={styles.label}>"Why Third Places Matter" Subtitle</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content.aboutWhyTheyMatterSubtitle}
            onChangeText={(text) => setContent({ ...content, aboutWhyTheyMatterSubtitle: text })}
            placeholder="Third places are essential to the fabric..."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <Text style={styles.label}>Contact Email</Text>
          <TextInput
            style={styles.input}
            value={content.contactEmail}
            onChangeText={(text) => setContent({ ...content, contactEmail: text })}
            placeholder="contact@mythirdplace.com"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contact Phone</Text>
          <TextInput
            style={styles.input}
            value={content.contactPhone}
            onChangeText={(text) => setContent({ ...content, contactPhone: text })}
            placeholder="+1 (555) 123-4567"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </Text>
        </TouchableOpacity>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Note: After saving changes, you may need to refresh the homepage and about page to see the updates.
          </Text>
        </View>
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#006548',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  note: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 40,
  },
  noteText: {
    fontSize: 14,
    color: '#2e7d32',
    fontStyle: 'italic',
  },
});

export default AdminContentScreen;
