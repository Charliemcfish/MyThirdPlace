import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';
import Navigation from '../../components/common/Navigation';
import Footer from '../../components/homepage/Footer';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const TermsOfServiceScreen = ({ navigation }) => {
  useDocumentTitle('Terms of Service');

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.date}>Last updated: 31 August 2025</Text>

          <Text style={styles.paragraph}>
            Welcome to MyThirdPlace. By accessing or using our platform, you agree to be bound by these Terms of Service.
          </Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By creating an account or using MyThirdPlace, you agree to comply with these Terms of Service and all applicable
            laws and regulations. If you do not agree with these terms, please do not use our service.
          </Text>

          <Text style={styles.sectionTitle}>2. User Accounts</Text>
          <Text style={styles.paragraph}>
            To access certain features of MyThirdPlace, you must create an account. You are responsible for maintaining the
            confidentiality of your account credentials and for all activities that occur under your account.
          </Text>

          <Text style={styles.sectionTitle}>3. User Content</Text>
          <Text style={styles.paragraph}>
            You retain ownership of any content you submit to MyThirdPlace, including blogs, venue listings, and profile
            information. By posting content, you grant us a non-exclusive, worldwide license to use, display, and distribute
            your content on our platform.
          </Text>

          <Text style={styles.sectionTitle}>4. Prohibited Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to:
          </Text>
          <Text style={styles.bulletPoint}>• Post false, misleading, or defamatory content</Text>
          <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>
          <Text style={styles.bulletPoint}>• Infringe on the intellectual property rights of others</Text>
          <Text style={styles.bulletPoint}>• Harass, abuse, or harm other users</Text>
          <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to our systems</Text>

          <Text style={styles.sectionTitle}>5. Content Moderation</Text>
          <Text style={styles.paragraph}>
            We reserve the right to review, edit, or remove any content that violates these Terms of Service or that we
            deem inappropriate for our platform.
          </Text>

          <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The MyThirdPlace platform, including its design, features, and functionality, is owned by MyThirdPlace and
            protected by copyright, trademark, and other intellectual property laws.
          </Text>

          <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            MyThirdPlace is provided "as is" without warranties of any kind. We are not liable for any damages arising from
            your use of the platform or inability to access our services.
          </Text>

          <Text style={styles.sectionTitle}>8. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate your account at any time if you violate these Terms of Service or
            engage in conduct that we deem harmful to our community.
          </Text>

          <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may update these Terms of Service from time to time. We will notify users of significant changes, and your
            continued use of the platform constitutes acceptance of the updated terms.
          </Text>

          <Text style={styles.sectionTitle}>10. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms of Service, please contact us at joshuachan@mythirdplace.co.uk
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

export default TermsOfServiceScreen;
