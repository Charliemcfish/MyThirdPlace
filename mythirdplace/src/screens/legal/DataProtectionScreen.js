import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';
import Navigation from '../../components/common/Navigation';
import Footer from '../../components/homepage/Footer';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const DataProtectionScreen = ({ navigation }) => {
  useDocumentTitle('Data Protection');

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
          <Text style={styles.title}>Data Protection Policy</Text>
          <Text style={styles.date}>Last updated: 31 August 2025</Text>

          <Text style={styles.paragraph}>
            MyThirdPlace is committed to protecting your personal data and respecting your privacy rights in accordance
            with UK data protection law, including the UK General Data Protection Regulation (UK GDPR).
          </Text>

          <Text style={styles.sectionTitle}>Our Commitment to Data Protection</Text>
          <Text style={styles.paragraph}>
            We are dedicated to ensuring that your personal information is protected and handled responsibly. This policy
            outlines our approach to data protection and how we comply with relevant legislation.
          </Text>

          <Text style={styles.sectionTitle}>Data Protection Principles</Text>
          <Text style={styles.paragraph}>
            We process personal data in accordance with the following principles:
          </Text>

          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Lawfulness, fairness, and transparency</Text> - We process data legally, fairly,
            and in a transparent manner
          </Text>
          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Purpose limitation</Text> - We collect data for specified, explicit, and legitimate
            purposes only
          </Text>
          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Data minimization</Text> - We only collect data that is adequate, relevant, and
            limited to what is necessary
          </Text>
          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Accuracy</Text> - We ensure personal data is accurate and kept up to date
          </Text>
          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Storage limitation</Text> - We keep personal data only for as long as necessary
          </Text>
          <Text style={styles.bulletPoint}>
            <Text style={styles.bold}>Integrity and confidentiality</Text> - We process data securely using appropriate
            technical and organizational measures
          </Text>

          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational security measures to protect your personal data against
            unauthorized access, alteration, disclosure, or destruction. These measures include:
          </Text>
          <Text style={styles.bulletPoint}>• Secure authentication systems using Firebase</Text>
          <Text style={styles.bulletPoint}>• Encrypted data transmission</Text>
          <Text style={styles.bulletPoint}>• Regular security assessments and updates</Text>
          <Text style={styles.bulletPoint}>• Access controls and user authentication</Text>
          <Text style={styles.bulletPoint}>• Data backup and recovery procedures</Text>

          <Text style={styles.sectionTitle}>Data Breach Procedures</Text>
          <Text style={styles.paragraph}>
            In the unlikely event of a data breach, we have procedures in place to:
          </Text>
          <Text style={styles.bulletPoint}>• Detect and respond to breaches promptly</Text>
          <Text style={styles.bulletPoint}>• Assess the risk to affected individuals</Text>
          <Text style={styles.bulletPoint}>
            • Notify the ICO within 72 hours if required by law
          </Text>
          <Text style={styles.bulletPoint}>
            • Inform affected users if the breach poses a high risk to their rights and freedoms
          </Text>

          <Text style={styles.sectionTitle}>Your Rights Under UK GDPR</Text>
          <Text style={styles.paragraph}>
            You have the following rights regarding your personal data:
          </Text>
          <Text style={styles.bulletPoint}>• The right to be informed about data processing</Text>
          <Text style={styles.bulletPoint}>• The right to access your personal data</Text>
          <Text style={styles.bulletPoint}>• The right to rectification of inaccurate data</Text>
          <Text style={styles.bulletPoint}>• The right to erasure (right to be forgotten)</Text>
          <Text style={styles.bulletPoint}>• The right to restrict processing</Text>
          <Text style={styles.bulletPoint}>• The right to data portability</Text>
          <Text style={styles.bulletPoint}>• The right to object to processing</Text>
          <Text style={styles.bulletPoint}>• Rights related to automated decision making</Text>

          <Text style={styles.sectionTitle}>International Data Transfers</Text>
          <Text style={styles.paragraph}>
            We primarily store and process data within the UK. If we need to transfer data internationally, we ensure
            appropriate safeguards are in place to protect your information in accordance with UK GDPR requirements.
          </Text>

          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our platform is not intended for children under the age of 13. We do not knowingly collect personal information
            from children. If you believe we have collected information from a child, please contact us immediately.
          </Text>

          <Text style={styles.sectionTitle}>Contact Our Data Protection Officer</Text>
          <Text style={styles.paragraph}>
            If you have any questions about our data protection practices or wish to exercise your rights, please contact us at:
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Email:</Text> joshuachan@mythirdplace.co.uk
          </Text>

          <Text style={styles.sectionTitle}>Supervisory Authority</Text>
          <Text style={styles.paragraph}>
            You have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK's supervisory
            authority for data protection:
          </Text>
          <Text style={styles.indentedParagraph}>
            Information Commissioner's Office{'\n'}
            Wycliffe House{'\n'}
            Water Lane{'\n'}
            Wilmslow{'\n'}
            Cheshire{'\n'}
            SK9 5AF{'\n\n'}
            Website: https://www.ico.org.uk
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

export default DataProtectionScreen;
