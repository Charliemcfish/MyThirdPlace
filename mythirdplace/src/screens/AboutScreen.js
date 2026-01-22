import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { colors, typography, spacing, breakpoints } from '../styles/theme';
import Navigation from '../components/common/Navigation';
import useDocumentTitle from '../hooks/useDocumentTitle';

const AboutScreen = ({ navigation }) => {
  useDocumentTitle('About');

  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState({
    members: 0,
    blogs: 0,
    connectionRate: 0,
    venues: 0
  });
  const [statsVisible, setStatsVisible] = useState(false);

  const isMobile = screenWidth < breakpoints.tablet;
  const scrollViewRef = useRef(null);
  const statsRef = useRef(null);
  const animatedValues = useRef({
    members: new Animated.Value(0),
    blogs: new Animated.Value(0),
    connectionRate: new Animated.Value(0),
    venues: new Animated.Value(0)
  }).current;

  const testimonials = [
    "Since joining MyThirdPlace, we've seen a 40% increase in new customers who specifically come to work and socialize. It's wonderful seeing people form genuine friendships over coffee in our space.",
    "MyThirdPlace helped us connect with freelancers and remote workers who were looking for more than just a desk – they wanted community. Our member retention has improved dramatically.",
    "We doubled our evening event attendance after listing with MyThirdPlace. People are hungry for authentic community spaces, and this platform helps them find us."
  ];

  const thirdPlaceExamples = [
    {
      title: "Neighborhood Fitness Centers",
      subtitle: "Community building through shared wellness goals",
      link: "View All Gyms",
      image: require('../../assets/aboutPage/Gym-rafiki.webp')
    },
    {
      title: "Local Coffee Houses",
      subtitle: "Casual social interaction venues for conversation and connection",
      link: "View All Coffee Shops",
      image: require('../../assets/aboutPage/Coffee-break-amico.webp')
    },
    {
      title: "Public Libraries",
      subtitle: "Inclusive community hubs offering resources and gathering space",
      link: "View All Libraries",
      image: require('../../assets/aboutPage/Library-rafiki.webp')
    },
    {
      title: "Recreational & Sports Clubs",
      subtitle: "Active community spaces fostering teamwork and friendship",
      link: "View All Sports Clubs",
      image: require('../../assets/aboutPage/Sport-family-amico.webp')
    },
    {
      title: "Faith Communities",
      subtitle: "Welcoming spaces supporting spiritual and social connection",
      link: "View All Churches",
      image: require('../../assets/aboutPage/Bible-teaching-rafiki-e1721904924995.webp')
    },
    {
      title: "Wellness Studios",
      subtitle: "Mindful community centers promoting holistic wellbeing",
      link: "View All Yoga Studios",
      image: require('../../assets/aboutPage/Meditation-rafiki-e1721905017584.webp')
    },
    {
      title: "Social Venues",
      subtitle: "Relaxed environments for building community ties",
      link: "View All Bars",
      image: require('../../assets/aboutPage/Beer-Celebration-rafiki.webp')
    },
    {
      title: "Volunteer Organisations",
      subtitle: "Collaborative spaces for community-focused service",
      link: "View All Volunteer Spaces",
      image: require('../../assets/aboutPage/Volunteering-amico.webp')
    },
    {
      title: "Coworking Spaces in the UK",
      subtitle: "Modern third places combining productivity with community connection",
      link: "View All Co-Working Spaces",
      image: require('../../assets/aboutPage/Team-work-amico.png')
    }
  ];

  const whyThirdPlacesMatter = [
    {
      title: "Fostering Social Connections",
      content: "Third places provide a space for people to meet, interact, and form meaningful relationships. In a world where digital communication often replaces face-to-face interaction, these physical spaces are crucial for fostering genuine connections and a sense of belonging.",
      image: require('../../assets/aboutPage/Team-spirit.gif')
    },
    {
      title: "Building Community",
      content: "These spaces serve as communal hubs where individuals from diverse backgrounds can come together. By offering a neutral ground for social interaction, third places help build a sense of community and solidarity, bridging social gaps and promoting inclusivity.",
      image: require('../../assets/aboutPage/Social-interaction.gif')
    },
    {
      title: "Enhancing Mental and Emotional Well-being",
      content: "Regular social interactions in third places contribute significantly to mental health and emotional well-being. These environments provide an outlet for relaxation, stress relief, and the joy of companionship, which are vital for maintaining a healthy and balanced life.",
      image: require('../../assets/aboutPage/Mental-health.gif')
    },
    {
      title: "Encouraging Civic Engagement",
      content: "Third places often become centers of local culture and civic life, where people engage in discussions, share ideas, and participate in community activities. This civic engagement fosters a more informed, active, and connected citizenry.",
      image: require('../../assets/aboutPage/Community.gif')
    },
    {
      title: "Supporting Local Businesses",
      content: "By frequenting third places such as coffee shops, gyms, and restaurants, we support local businesses and contribute to the local economy. These businesses, in turn, provide jobs, sponsor local events, and invest in the community, creating a positive economic cycle.",
      image: require('../../assets/aboutPage/Shopping-amico-1024x1024.webp')
    },
    {
      title: "Creating Safe and Welcoming Environments",
      content: "Third places offer safe and welcoming environments where individuals can feel comfortable and accepted. These spaces are designed to be inclusive, providing everyone with a sense of safety and community, regardless of their background or status.",
      image: require('../../assets/aboutPage/Hello-1.gif')
    }
  ];

  const benefits = [
    {
      number: "1",
      title: "Enhanced Social Connections",
      content: "They offer a space for people to meet, interact, and form meaningful relationships."
    },
    {
      number: "2",
      title: "Community Building",
      content: "These places help to build a sense of community and belonging."
    },
    {
      number: "3",
      title: "Mental and Emotional Well-being",
      content: "Regular social interactions in third places contribute to improved mental health and emotional well-being."
    },
    {
      number: "4",
      title: "Support Local Businesses",
      content: "By frequenting third places, you support local businesses and contribute to the local economy."
    }
  ];

  const faqs = [
    {
      question: 'What makes a business or location qualify as a "third place"?',
      answer: 'A true third place provides a welcoming, accessible environment where community connection naturally occurs. These social spaces prioritise conversation, offer comfortable seating arrangements, maintain regular patrons, remain accessible with reasonable price points, and foster an inclusive atmosphere where everyone feels welcome regardless of background or status.'
    },
    {
      question: 'How can I find coworking space near me that functions as a third place?',
      answer: 'MyThirdPlace features community-oriented coworking UK spaces that balance productivity with social interaction. Our platform lets you search for "coworking space near me" while filtering for those that emphasize community hub features like communal areas, regular social events, and neighborhood integration.'
    },
    {
      question: 'Are third places only found in urban areas, or can they exist in smaller communities?',
      answer: 'Third places thrive in communities of all sizes. While cities may offer more variety, rural and suburban areas often feature deeply rooted local gathering places like community centers near me, local business hubs, and neighborhood social spaces that serve as vital connection points for residents.'
    },
    {
      question: 'How do businesses benefit from positioning themselves as third places?',
      answer: 'Businesses that implement a third place business strategy often see increased customer loyalty through community building. Our case studies demonstrate that community-focused businesses experience stronger word-of-mouth referrals, longer customer visit duration, and enhanced brand reputation within their neighborhoods.'
    },
    {
      question: "What's the difference between a community center and a third place?",
      answer: 'While community centers are structured spaces with organized programming, third places offer more informal, organic social interaction. Many community centers near you can function as third places when they create relaxed environments for spontaneous gathering alongside their scheduled activities.'
    },
    {
      question: 'How has the concept of third places evolved in recent years?',
      answer: 'Post-pandemic community spaces have adapted to changing social needs while preserving core third place principles. Digital technology now complements rather than replaces physical gathering, with many social interaction spaces incorporating elements that support both online and in-person community building.'
    },
    {
      question: "What role do men's social spaces play in the third place ecosystem?",
      answer: "Men's social spaces address unique challenges in male social connection. Research shows many men struggle to form friendships outside structured environments, making third places particularly valuable for male mental wellbeing. These spaces offer low-pressure environments where meaningful connections can develop naturally."
    },
    {
      question: 'How can I document local gathering places in my community?',
      answer: 'Bloggers and community advocates can document third places by capturing their distinctive characteristics, interviewing regular patrons, and highlighting their community impact. Our resources on community space case studies provide frameworks for telling compelling stories about these vital social environments.'
    },
    {
      question: 'Can I list my business as a third place on your platform?',
      answer: 'Absolutely! If your business prioritises social connection and community engagement, you can create a third place business listing UK on our platform. We offer resources on how to create a third place atmosphere that attracts customers while contributing to neighborhood vitality.'
    },
    {
      question: 'How does the third place concept connect to social infrastructure theory?',
      answer: "Ray Oldenburg's third place theory forms the foundation of modern social infrastructure thinking. These community connection spaces represent physical environments that foster social capital and civic engagement. By supporting third places, communities invest in the social foundations necessary for collective resilience and wellbeing."
    }
  ];

  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', updateScreenWidth);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (statsVisible) {
      animateStats();
    }
  }, [statsVisible]);

  const animateStats = () => {
    const animations = [
      Animated.timing(animatedValues.members, {
        toValue: 100,
        duration: 2000,
        useNativeDriver: false,
      }),
      Animated.timing(animatedValues.blogs, {
        toValue: 55,
        duration: 2000,
        useNativeDriver: false,
      }),
      Animated.timing(animatedValues.connectionRate, {
        toValue: 89,
        duration: 2000,
        useNativeDriver: false,
      }),
      Animated.timing(animatedValues.venues, {
        toValue: 50,
        duration: 2000,
        useNativeDriver: false,
      }),
    ];

    Animated.parallel(animations).start();

    animatedValues.members.addListener(({ value }) => {
      setStats(prev => ({ ...prev, members: Math.floor(value) }));
    });
    animatedValues.blogs.addListener(({ value }) => {
      setStats(prev => ({ ...prev, blogs: Math.floor(value) }));
    });
    animatedValues.connectionRate.addListener(({ value }) => {
      setStats(prev => ({ ...prev, connectionRate: Math.floor(value) }));
    });
    animatedValues.venues.addListener(({ value }) => {
      setStats(prev => ({ ...prev, venues: Math.floor(value) }));
    });
  };

  const handleLinkedInPress = () => {
    Linking.openURL('https://www.linkedin.com/in/joshua-chansdac/');
  };

  const handleViewAllPress = () => {
    navigation.navigate('VenueListings');
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const onScrollViewLayout = () => {
    if (statsRef.current && !statsVisible) {
      statsRef.current.measureInWindow((x, y, width, height) => {
        const windowHeight = Dimensions.get('window').height;
        if (y < windowHeight && y + height > 0) {
          setStatsVisible(true);
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <Navigation navigation={navigation} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={onScrollViewLayout}
        scrollEventThrottle={400}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, isMobile && styles.heroSectionMobile, styles.heroSectionPadding]}>
          <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
            Welcome to MyThirdPlace
          </Text>
          <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
            MyThirdPlace: Connecting Communities Through Social Spaces Across the UK
          </Text>
          <Image
            source={require('../../assets/aboutPage/Add-a-subheading.png')}
            style={[styles.heroImageLarger, isMobile && styles.heroImageLargerMobile]}
            resizeMode="contain"
          />
        </View>

        {/* Founder Section */}
        <View style={[styles.section, isMobile && styles.sectionMobile]}>
          <View style={[styles.founderSection, isMobile && styles.founderSectionMobile]}>
            <View style={[styles.founderContent, isMobile && styles.founderContentMobile]}>
              <Text style={[styles.founderText, isMobile && styles.founderTextMobile]}>
                MyThirdPlace, founded by Joshua Chan, is dedicated to revitalising social infrastructure across the UK. We identify, promote, and connect people with vital community spaces that exist beyond home and work – the essential "third places" that foster social connection and community wellbeing.
              </Text>
              <TouchableOpacity onPress={handleLinkedInPress} style={styles.linkedinButton}>
                <Image
                  source={require('../../assets/aboutPage/I-own-a-ThirdPlace-2.png')}
                  style={[styles.linkedinImage, isMobile && styles.linkedinImageMobile]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.founderImageContainer, isMobile && styles.founderImageContainerMobile]}>
              <Image
                source={require('../../assets/aboutPage/Untitled-design-12.png')}
                style={[styles.founderImage, isMobile && styles.founderImageMobile]}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Ray Oldenburg Section - Flipped */}
        <View style={[styles.section, styles.sectionSpacing, isMobile && styles.sectionMobile]}>
          <View style={[styles.founderSection, styles.flippedSection, isMobile && styles.founderSectionMobile]}>
            <View style={[styles.founderImageContainer, isMobile && styles.founderImageContainerMobile]}>
              <Image
                source={require('../../assets/aboutPage/ray (1).png')}
                style={[styles.founderImage, isMobile && styles.founderImageMobile]}
                resizeMode="contain"
              />
            </View>
            <View style={[styles.founderContent, isMobile && styles.founderContentMobile]}>
              <Text style={[styles.rayTitle, isMobile && styles.rayTitleMobile]}>
                What is a Third Place?
              </Text>
              <Text style={[styles.founderText, isMobile && styles.founderTextMobile]}>
                The third place concept, introduced by sociologist Ray Oldenburg, refers to those community-focused gathering spots that complement our homes (first places) and workplaces (second places). These public spaces—ranging from coworking hubs and coffee shops to libraries and volunteer spaces—create the social fabric that binds neighbourhoods together.
              </Text>
            </View>
          </View>
        </View>

        {/* Testimonials Carousel
        <View style={[styles.section, styles.sectionSpacing, isMobile && styles.sectionMobile]}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            Testimonials From The MyThirdPlace Community
          </Text>
          <View style={[styles.testimonialContainer, isMobile && styles.testimonialContainerMobile]}>
            <TouchableOpacity style={[styles.testimonialArrow, styles.testimonialArrowLeft]} onPress={prevTestimonial}>
              <Text style={styles.testimonialArrowText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.testimonialContent}>
              <Text style={[styles.testimonialText, isMobile && styles.testimonialTextMobile]}>
                "{testimonials[currentTestimonial]}"
              </Text>
            </View>
            <TouchableOpacity style={[styles.testimonialArrow, styles.testimonialArrowRight]} onPress={nextTestimonial}>
              <Text style={styles.testimonialArrowText}>›</Text>
            </TouchableOpacity>
            <View style={styles.testimonialDots}>
              {testimonials.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.testimonialDot,
                    index === currentTestimonial && styles.testimonialDotActive
                  ]}
                />
              ))}
            </View>
          </View>
        </View> */}

        {/* Stats Section */}
        <View style={[styles.section, styles.statsSection, styles.sectionSpacing, isMobile && styles.sectionMobile]} ref={statsRef}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            Stats from MyThirdPlace
          </Text>
          <View style={[styles.statsContainer, isMobile && styles.statsContainerMobile]}>
            <View style={[styles.statItem, isMobile && styles.statItemMobile]}>
              <Text style={[styles.statNumber, isMobile && styles.statNumberMobile]}>
                {stats.members}+
              </Text>
              <Text style={[styles.statLabel, isMobile && styles.statLabelMobile]}>
                members
              </Text>
            </View>
            <View style={[styles.statItem, isMobile && styles.statItemMobile]}>
              <Text style={[styles.statNumber, isMobile && styles.statNumberMobile]}>
                {stats.blogs}+
              </Text>
              <Text style={[styles.statLabel, isMobile && styles.statLabelMobile]}>
                blogs posted
              </Text>
            </View>
            {/* <View style={[styles.statItem, isMobile && styles.statItemMobile]}>
              <Text style={[styles.statNumber, isMobile && styles.statNumberMobile]}>
                {stats.connectionRate}%
              </Text>
              <Text style={[styles.statLabel, isMobile && styles.statLabelMobile]}>
                of members feel more connected after discovering us
              </Text>
            </View> */}
            <View style={[styles.statItem, isMobile && styles.statItemMobile]}>
              <Text style={[styles.statNumber, isMobile && styles.statNumberMobile]}>
                {stats.venues}+
              </Text>
              <Text style={[styles.statLabel, isMobile && styles.statLabelMobile]}>
                venues
              </Text>
            </View>
          </View>
        </View>

        {/* Community Recognition Section */}
        <View style={[styles.section, styles.sectionSpacing, isMobile && styles.sectionMobile]}>
          <View style={styles.communityImageContainer}>
            <Image
              source={require('../../assets/aboutPage/11_20250112_183327_0010-1024x514.png')}
              style={[styles.communityImageSmaller, isMobile && styles.communityImageSmallerMobile]}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.communityText, isMobile && styles.communityTextMobile]}>
            MyThirdPlace is dedicated to showcasing Third Places - gathering spots outside the home (first place) and work (second place) - and the stories they inspire. By supporting writers and showcasing spaces, we aim to build a global map of connection: a platform where authentic, human stories bring communities closer, highlight the value of social spaces, and ensure these places continue to thrive.
          </Text>
        </View>

        {/* Examples of Third Places */}
        <View style={[styles.section, styles.sectionSpacing, isMobile && styles.sectionMobile]}>
          <View style={styles.examplesHeader}>
            <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
              Examples of Third Places
            </Text>
            <View style={styles.greenLine} />
          </View>
          <View style={[styles.examplesGrid, isMobile && styles.examplesGridMobile]}>
            {thirdPlaceExamples.map((example, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.exampleCard,
                  isMobile && styles.exampleCardMobile,
                  hoveredCard === index && styles.exampleCardHovered
                ]}
                onPress={handleViewAllPress}
                onPressIn={() => setHoveredCard(index)}
                onPressOut={() => setHoveredCard(null)}
                {...(Platform.OS === 'web' && {
                  onMouseEnter: () => setHoveredCard(index),
                  onMouseLeave: () => setHoveredCard(null),
                })}
                activeOpacity={0.8}
              >
                <Image
                  source={example.image}
                  style={[styles.exampleImage, isMobile && styles.exampleImageMobile]}
                  resizeMode="contain"
                />
                <Text style={[
                  styles.exampleTitle,
                  isMobile && styles.exampleTitleMobile,
                  hoveredCard === index && styles.exampleTitleHovered
                ]}>
                  {example.title}
                </Text>
                <Text style={[styles.exampleSubtitle, isMobile && styles.exampleSubtitleMobile]}>
                  {example.subtitle}
                </Text>
                <TouchableOpacity onPress={handleViewAllPress}>
                  <Text style={[styles.exampleLink, isMobile && styles.exampleLinkMobile]}>
                    {example.link}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Why Third Places Matter */}
        <View style={[styles.section, styles.sectionSpacing, isMobile && styles.sectionMobile]}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            Why third places matter
          </Text>
          <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]}>
            Third places are essential to the fabric of our society, offering numerous benefits that enrich our lives and strengthen our communities. Here are some key reasons why we need third places:
          </Text>
          <View style={[styles.whyMatterGrid, isMobile && styles.whyMatterGridMobile]}>
            {whyThirdPlacesMatter.map((item, index) => (
              <View key={index} style={[styles.whyMatterCard, isMobile && styles.whyMatterCardMobile]}>
                <Image
                  source={item.image}
                  style={[styles.whyMatterImage, isMobile && styles.whyMatterImageMobile]}
                  resizeMode="contain"
                />
                <Text style={[styles.whyMatterTitle, isMobile && styles.whyMatterTitleMobile]}>
                  {item.title}
                </Text>
                <Text style={[styles.whyMatterContent, isMobile && styles.whyMatterContentMobile]}>
                  {item.content}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits of Third Places */}
        <View style={[styles.section, styles.sectionSpacing, isMobile && styles.sectionMobile]}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            The Benefits of Third Places
          </Text>
          <View style={[styles.benefitsContainer, isMobile && styles.benefitsContainerMobile]}>
            {benefits.map((benefit, index) => (
              <View key={index} style={[styles.benefitCard, isMobile && styles.benefitCardMobile]}>
                <View style={styles.benefitNumber}>
                  <Text style={styles.benefitNumberText}>{benefit.number}</Text>
                </View>
                <View style={styles.benefitContent}>
                  <Text style={[styles.benefitTitle, isMobile && styles.benefitTitleMobile]}>
                    {benefit.title}
                  </Text>
                  <Text style={[styles.benefitText, isMobile && styles.benefitTextMobile]}>
                    {benefit.content}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={[styles.section, styles.sectionSpacing, isMobile && styles.sectionMobile]}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            Frequently asked questions
          </Text>
          <View style={[styles.faqContainer, isMobile && styles.faqContainerMobile]}>
            {faqs.map((faq, index) => (
              <View key={index} style={[styles.faqItem, isMobile && styles.faqItemMobile]}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(index)}
                >
                  <Text style={[styles.faqQuestionText, isMobile && styles.faqQuestionTextMobile]}>
                    {faq.question}
                  </Text>
                  <Text style={styles.faqToggle}>
                    {expandedFAQ === index ? '−' : '+'}
                  </Text>
                </TouchableOpacity>
                {expandedFAQ === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={[styles.faqAnswerText, isMobile && styles.faqAnswerTextMobile]}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
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

  // Hero Section
  heroSection: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  heroSectionMobile: {
    padding: spacing.lg,
  },
  heroSectionPadding: {
    paddingTop: spacing.xxl * 2,
  },
  heroTitle: {
    ...typography.h1,
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  heroTitleMobile: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.h3,
    fontSize: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 800,
  },
  heroSubtitleMobile: {
    fontSize: 18,
    marginBottom: spacing.lg,
  },
  heroImage: {
    width: 600,
    height: 300,
    marginTop: spacing.lg,
  },
  heroImageMobile: {
    width: '100%',
    height: 200,
    marginTop: spacing.md,
  },
  heroImageLarger: {
    width: 800,
    height: 400,
    marginTop: spacing.lg,
  },
  heroImageLargerMobile: {
    width: '100%',
    height: 250,
    marginTop: spacing.md,
  },

  // Common Section Styles
  section: {
    padding: spacing.xl,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  sectionMobile: {
    padding: spacing.lg,
  },
  sectionSpacing: {
    marginBottom: spacing.xxl * 2,
  },
  graySection: {
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionTitleMobile: {
    fontSize: 24,
    marginBottom: spacing.lg,
  },
  sectionSubtitle: {
    ...typography.body1,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 800,
    alignSelf: 'center',
  },
  sectionSubtitleMobile: {
    fontSize: 16,
    marginBottom: spacing.lg,
  },

  // Founder Section
  founderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  founderSectionMobile: {
    flexDirection: 'column',
    gap: spacing.lg,
  },
  flippedSection: {
    flexDirection: 'row-reverse',
  },
  founderContent: {
    flex: 1,
  },
  founderContentMobile: {
    width: '100%',
  },
  founderText: {
    ...typography.body1,
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  founderTextMobile: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  rayTitle: {
    ...typography.h2,
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  rayTitleMobile: {
    fontSize: 24,
    marginBottom: spacing.md,
  },
  founderImageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  founderImageContainerMobile: {
    width: '100%',
    alignItems: 'center',
  },
  founderImage: {
    width: 400,
    height: 300,
  },
  founderImageMobile: {
    width: '100%',
    height: 200,
  },
  linkedinButton: {
    alignSelf: 'flex-start',
  },
  linkedinImage: {
    width: 200,
    height: 60,
  },
  linkedinImageMobile: {
    width: 150,
    height: 45,
  },

  // Testimonials
  testimonialContainer: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    position: 'relative',
    marginTop: spacing.xl,
  },
  testimonialContainerMobile: {
    padding: spacing.lg,
  },
  testimonialContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  testimonialArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  testimonialArrowLeft: {
    left: spacing.md,
  },
  testimonialArrowRight: {
    right: spacing.md,
  },
  testimonialArrowText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
    textAlign: 'center',
  },
  testimonialText: {
    ...typography.body1,
    fontSize: 20,
    color: colors.white,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.lg,
    lineHeight: 30,
  },
  testimonialTextMobile: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  testimonialDots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  testimonialDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  testimonialDotActive: {
    backgroundColor: colors.white,
  },

  // Stats Section
  statsSection: {
    backgroundColor: '#f8f9fa',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  statsContainerMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 200,
  },
  statItemMobile: {
    minWidth: 'auto',
    width: '100%',
  },
  statNumber: {
    ...typography.h1,
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statNumberMobile: {
    fontSize: 36,
  },
  statLabel: {
    ...typography.body1,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  statLabelMobile: {
    fontSize: 14,
  },

  // Community Recognition
  communityImageContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  communityImage: {
    width: 600,
    height: 300,
  },
  communityImageMobile: {
    width: '100%',
    height: 200,
  },
  communityImageSmaller: {
    width: 300,
    height: 150,
  },
  communityImageSmallerMobile: {
    width: '100%',
    height: 120,
  },
  communityText: {
    ...typography.body1,
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
    textAlign: 'center',
    maxWidth: 800,
    alignSelf: 'center',
  },
  communityTextMobile: {
    fontSize: 16,
    lineHeight: 24,
  },

  // Examples of Third Places
  examplesHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greenLine: {
    width: 60,
    height: 4,
    backgroundColor: colors.primary,
    marginTop: spacing.md,
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  examplesGridMobile: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  exampleCard: {
    width: '30%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  exampleCardMobile: {
    width: '100%',
    padding: spacing.md,
  },
  exampleCardHovered: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  exampleImage: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
  },
  exampleImageMobile: {
    width: 60,
    height: 60,
    marginBottom: spacing.sm,
  },
  exampleTitle: {
    ...typography.h4,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  exampleTitleMobile: {
    fontSize: 16,
  },
  exampleTitleHovered: {
    color: colors.primary,
  },
  exampleSubtitle: {
    ...typography.body2,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  exampleSubtitleMobile: {
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  exampleLink: {
    ...typography.body2,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  exampleLinkMobile: {
    fontSize: 13,
  },

  // Why Third Places Matter
  whyMatterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  whyMatterGridMobile: {
    flexDirection: 'column',
    gap: spacing.lg,
  },
  whyMatterCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  whyMatterCardMobile: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  whyMatterImage: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
  },
  whyMatterImageMobile: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },
  whyMatterTitle: {
    ...typography.h4,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  whyMatterTitleMobile: {
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  whyMatterContent: {
    ...typography.body1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  whyMatterContentMobile: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Benefits
  benefitsContainer: {
    gap: spacing.lg,
  },
  benefitsContainerMobile: {
    gap: spacing.md,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitCardMobile: {
    padding: spacing.md,
  },
  benefitNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  benefitNumberText: {
    ...typography.h4,
    color: colors.white,
    fontWeight: 'bold',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...typography.h4,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  benefitTitleMobile: {
    fontSize: 18,
  },
  benefitText: {
    ...typography.body1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  benefitTextMobile: {
    fontSize: 14,
    lineHeight: 20,
  },

  // FAQ
  faqContainer: {
    gap: spacing.md,
  },
  faqContainerMobile: {
    gap: spacing.sm,
  },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  faqItemMobile: {
    borderRadius: 8,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#f8f9fa',
  },
  faqQuestionText: {
    ...typography.body1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  faqQuestionTextMobile: {
    fontSize: 14,
  },
  faqToggle: {
    ...typography.h3,
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  faqAnswer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  faqAnswerText: {
    ...typography.body1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  faqAnswerTextMobile: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AboutScreen;