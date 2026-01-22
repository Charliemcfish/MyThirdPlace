import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';
import Navigation from '../../components/common/Navigation';
import Footer from '../../components/homepage/Footer';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const CookiePolicyScreen = ({ navigation }) => {
  useDocumentTitle('Cookie Policy');

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <Text style={styles.title}>Cookie Policy</Text>
          <Text style={styles.date}>Last updated: 31 August 2025</Text>

          <Text style={styles.paragraph}>
            This Cookie Policy explains how MyThirdPlace uses cookies and similar technologies to recognize you when
            you visit our platform.
          </Text>

          <Text style={styles.sectionTitle}>What Are Cookies?</Text>
          <Text style={styles.paragraph}>
            Cookies are small text files that are placed on your device when you visit a website. They are widely used
            to make websites work more efficiently and to provide information to website owners.
          </Text>

          <Text style={styles.sectionTitle}>How We Use Cookies</Text>
          <Text style={styles.paragraph}>
            We use cookies for the following purposes:
          </Text>

          <Text style={styles.subSectionTitle}>Essential Cookies</Text>
          <Text style={styles.paragraph}>
            These cookies are necessary for the platform to function properly. They enable you to navigate our site and
            use its features, such as accessing secure areas and managing your account.
          </Text>

          <Text style={styles.subSectionTitle}>Performance Cookies</Text>
          <Text style={styles.paragraph}>
            These cookies collect information about how visitors use our platform, such as which pages are visited most
            often. This helps us improve the performance and user experience of our site.
          </Text>

          <Text style={styles.subSectionTitle}>Functionality Cookies</Text>
          <Text style={styles.paragraph}>
            These cookies allow our platform to remember choices you make (such as your username or language preference)
            and provide enhanced, personalized features.
          </Text>

          <Text style={styles.sectionTitle}>Third-Party Cookies</Text>
          <Text style={styles.paragraph}>
            We may use third-party services that set cookies on your device. These include:
          </Text>
          <Text style={styles.bulletPoint}>• Google Maps for location services</Text>
          <Text style={styles.bulletPoint}>• Firebase for authentication and data storage</Text>
          <Text style={styles.bulletPoint}>• Social media platforms when you share content</Text>

          <Text style={styles.sectionTitle}>Managing Cookies</Text>
          <Text style={styles.paragraph}>
            Most web browsers allow you to control cookies through their settings. You can choose to block or delete
            cookies, but this may affect your ability to use certain features of our platform.
          </Text>

          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated
            revision date.
          </Text>

          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about our use of cookies, please contact us at joshuachan@mythirdplace.co.uk
          </Text>
        </View>
        <Footer navigation={navigation} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  date: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  subSectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  paragraph: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  bulletPoint: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
    lineHeight: 24,
  },
});

export default CookiePolicyScreen;
