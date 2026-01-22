import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';
import SecondaryButton from '../common/SecondaryButton';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      question: 'What is a third place?',
      answer: 'A third place is a social environment outside of home (first place) and work (second place) where people gather and build community. These include cafes, libraries, gyms, parks, and other spaces that foster social connection.',
    },
    {
      question: 'How do I add my venue to MyThirdPlace?',
      answer: 'You can add your venue by clicking the "Put it on the Map" button or navigating to our venue submission form. We welcome both venue owners and community members to add their favorite third places.',
    },
    {
      question: 'Can I write blogs about venues?',
      answer: 'Yes! We encourage community members to share their experiences and stories about third places through our blog platform. You can write about venues, community experiences, and the impact of third places.',
    },
    {
      question: 'How do I become a "regular" at a venue?',
      answer: 'You can mark yourself as a regular at any venue on our platform. This helps build community connections and shows others who shares their third places with the local community.',
    },
    {
      question: 'Is MyThirdPlace free to use?',
      answer: 'Yes, MyThirdPlace is completely free to use for community members. You can browse venues, read blogs, mark yourself as a regular, and contribute content at no cost.',
    },
    {
      question: 'How do I claim my business listing?',
      answer: 'If you own or manage a venue that\'s been listed on MyThirdPlace, you can claim it by clicking the "Claim this listing" button on the venue page and providing verification information.',
    },
    {
      question: 'Can I edit venue information?',
      answer: 'Venue owners who have claimed their listings can edit most information. Community members can suggest edits, which are reviewed before being published to ensure accuracy.',
    },
    {
      question: 'How do I contact venue owners?',
      answer: 'You can find contact information on venue pages, including websites, phone numbers, and social media links. Some venues also have direct messaging features for verified owners.',
    },
    {
      question: 'What makes a good third place?',
      answer: 'Good third places are accessible, welcoming, and foster social interaction. They often have comfortable seating, are open to all, encourage regular visitors, and create a sense of community belonging.',
    },
    {
      question: 'How can I connect with other community members?',
      answer: 'You can connect through shared venues where you\'re both regulars, engage with blog posts, participate in community discussions, and attend events hosted at third places.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Frequently Asked Questions</Text>
        
        <View style={styles.faqContainer}>
          {faqData.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <SecondaryButton
                onPress={() => toggleFAQ(index)}
                style={[
                  styles.questionButton,
                  openIndex === index && styles.questionButtonActive
                ]}
                textStyle={[
                  styles.questionText,
                  openIndex === index && styles.questionTextActive
                ]}
              >
                <View style={styles.questionContainer}>
                  <Text style={[
                    styles.questionText,
                    openIndex === index && styles.questionTextActive
                  ]}>
                    {faq.question}
                  </Text>
                  <Text style={[
                    styles.chevron,
                    openIndex === index && styles.chevronOpen
                  ]}>
                    ▼
                  </Text>
                </View>
              </SecondaryButton>
              
              {openIndex === index && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xxl,
  },
  content: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  faqContainer: {
    // gap removed for React Native Web compatibility
  },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  questionButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    margin: 0,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  questionButtonActive: {
    backgroundColor: colors.backgroundLight,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  questionText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'left',
  },
  questionTextActive: {
    color: colors.primary,
  },
  chevron: {
    ...typography.body1,
    color: colors.textLight,
    marginLeft: spacing.md,
    transform: [{ rotate: '0deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
    color: colors.primary,
  },
  answerContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.backgroundLight,
  },
  answerText: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 24,
    paddingTop: spacing.md,
  },
});

export default FAQSection;