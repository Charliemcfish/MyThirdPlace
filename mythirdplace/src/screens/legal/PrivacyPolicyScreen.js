import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';
import Navigation from '../../components/common/Navigation';
import Footer from '../../components/homepage/Footer';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const PrivacyPolicyScreen = ({ navigation }) => {
  useDocumentTitle('Privacy Policy');

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.subtitle}>MyThirdPlace Customer Privacy Notice</Text>
          <Text style={styles.date}>Last updated: 31 August 2025</Text>

          <Text style={styles.paragraph}>
            This privacy notice tells you what to expect us to do with your personal information.
          </Text>

          <Text style={styles.sectionTitle}>Contact Details</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Email:</Text> joshuachan@mythirdplace.co.uk
          </Text>

          <Text style={styles.sectionTitle}>What Information We Collect, Use, and Why</Text>
          <Text style={styles.paragraph}>
            We collect or use the following information for the operation of customer accounts and guarantees:
          </Text>
          <Text style={styles.bulletPoint}>• Names and contact details</Text>
          <Text style={styles.bulletPoint}>• Account information, including registration details</Text>

          <Text style={styles.sectionTitle}>Lawful Bases and Data Protection Rights</Text>
          <Text style={styles.paragraph}>
            Under UK data protection law, we must have a "lawful basis" for collecting and using your personal
            information. There is a list of possible lawful bases in the UK GDPR. You can find out more about
            lawful bases on the ICO's website.
          </Text>
          <Text style={styles.paragraph}>
            Which lawful basis we rely on may affect your data protection rights which are set out in brief below.
            You can find out more about your data protection rights and the exemptions which may apply on the ICO's website:
          </Text>

          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Your right of access</Text> - You have the right to ask us for copies of
            your personal information. You can request other information such as details about where we get personal
            information from and who we share personal information with. There are some exemptions which means you may
            not receive all the information you ask for.
          </Text>

          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Your right to rectification</Text> - You have the right to ask us to correct
            or delete personal information you think is inaccurate or incomplete.
          </Text>

          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Your right to erasure</Text> - You have the right to ask us to delete your
            personal information.
          </Text>

          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Your right to restriction of processing</Text> - You have the right to ask
            us to limit how we can use your personal information.
          </Text>

          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Your right to object to processing</Text> - You have the right to object to
            the processing of your personal data.
          </Text>

          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Your right to data portability</Text> - You have the right to ask that we
            transfer the personal information you gave us to another organisation, or to you.
          </Text>

          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Your right to withdraw consent</Text> - When we use consent as our lawful
            basis you have the right to withdraw your consent at any time.
          </Text>

          <Text style={styles.paragraph}>
            If you make a request, we must respond to you without undue delay and in any event within one month.
          </Text>

          <Text style={styles.paragraph}>
            To make a data protection rights request, please contact us using the contact details at the top of
            this privacy notice.
          </Text>

          <Text style={styles.sectionTitle}>Our Lawful Bases for the Collection and Use of Your Data</Text>
          <Text style={styles.paragraph}>
            Our lawful bases for collecting or using personal information for the operation of customer accounts
            and guarantees are:
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Legitimate interests</Text> – we're collecting or using your information
            because it benefits you, our organisation or someone else, without causing an undue risk of harm to
            anyone. All of your data protection rights may apply, except the right to portability. Our legitimate
            interests are:
          </Text>

          <Text style={styles.indentedParagraph}>
            We collect an individual's email address (and, if they choose, a profile photo) in order to create and
            manage their account on MyThirdPlace. This enables them to contribute blogs, create venue listings, and
            showcase their portfolio or social media links. This processing is necessary for the operation of the
            platform, as it ensures each account is unique, secure, and connected to a real person.
          </Text>

          <Text style={styles.indentedParagraph}>
            The benefits to users are significant: they gain a profile that allows them to share their work, connect
            with others, and participate fully in the community. The potential risks to individuals are minimal, as
            the only required data is an email address (not shared publicly), and profile photos are optional. We do
            not use this information for unrelated purposes, and users retain full control over what additional
            details they publish on their profile. We believe this limited data collection strikes a fair balance:
            it enables the platform to function effectively while respecting users' privacy.
          </Text>

          <Text style={styles.sectionTitle}>Where We Get Personal Information From</Text>
          <Text style={styles.bulletPoint}>• Directly from you</Text>
          <Text style={styles.bulletPoint}>• Publicly available sources</Text>

          <Text style={styles.sectionTitle}>How Long We Keep Information</Text>
          <Text style={styles.paragraph}>
            We keep your personal information for as long as you have an active account with MyThirdPlace. If you
            choose to close your account, we will delete or anonymise your personal information within 30 days.
          </Text>
          <Text style={styles.paragraph}>
            We may retain limited records (for example, your email address in a suppression list) if necessary to
            comply with our legal obligations or to prevent you from receiving unwanted communications in the future.
          </Text>

          <Text style={styles.sectionTitle}>Who We Share Information With</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Others we share personal information with:</Text>
          </Text>
          <Text style={styles.bulletPoint}>
            • Publicly on our website, social media or other marketing and information media
          </Text>

          <Text style={styles.sectionTitle}>How to Complain</Text>
          <Text style={styles.paragraph}>
            If you have any concerns about our use of your personal data, you can make a complaint to us using the
            contact details at the top of this privacy notice.
          </Text>
          <Text style={styles.paragraph}>
            If you remain unhappy with how we've used your data after raising a complaint with us, you can also
            complain to the ICO.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>The ICO's address:</Text>
          </Text>
          <Text style={styles.indentedParagraph}>
            Information Commissioner's Office{'\n'}
            Wycliffe House{'\n'}
            Water Lane{'\n'}
            Wilmslow{'\n'}
            Cheshire{'\n'}
            SK9 5AF
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Helpline number:</Text> 0303 123 1113
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Website:</Text> https://www.ico.org.uk/make-a-complaint
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
  subtitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
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
  indentedParagraph: {
    ...typography.body1,
    color: colors.text,
    marginBottom: spacing.md,
    marginLeft: spacing.lg,
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default PrivacyPolicyScreen;
