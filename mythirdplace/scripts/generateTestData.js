const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
require('dotenv').config();

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyDfcEu1yH_Q6-MFileyWucKN4i1mwQttnM",
  authDomain: "mythirdplace-b5bc3.firebaseapp.com",
  projectId: "mythirdplace-b5bc3",
  storageBucket: "mythirdplace-b5bc3.firebasestorage.app",
  messagingSenderId: "981438537885",
  appId: "1:981438537885:web:d2688b5a31a2eee9cfb474",
  measurementId: "G-PL9F0Z92QL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Test data arrays
const firstNames = [
  'Emma', 'Oliver', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Benjamin',
  'Charlotte', 'Lucas', 'Amelia', 'Henry', 'Mia', 'Alexander', 'Harper', 'Sebastian',
  'Evelyn', 'Jack', 'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Matthew',
  'Sofia', 'Samuel', 'Avery', 'David', 'Ella', 'Joseph', 'Madison', 'Carter',
  'Scarlett', 'Owen', 'Victoria', 'Wyatt', 'Aria', 'John', 'Grace', 'Luke'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const venueNames = [
  'The Cozy Corner', 'Riverside Retreat', 'The Local Hub', 'Community Central', 
  'The Gathering Place', 'Harmony Haven', 'The Common Ground', 'Social Sanctuary',
  'The Meeting Point', 'Unity Lounge', 'The Neighborhood Nook', 'Collective Cafe',
  'The Village Green', 'Connection Corner', 'The Social Sphere', 'Community Compass',
  'The Third Space', 'Gathering Ground', 'The People Place', 'Social Station',
  'The Community Corner', 'Together Tavern', 'The Junction', 'Meeting Meadow',
  'The Shared Space', 'Collective Corner', 'The Hangout Hub', 'Social Springs',
  'The Commons', 'Unity Gardens', 'The Town Square', 'Community Crossroads',
  'The Social Hub', 'Gathering Grove', 'The Meeting House', 'Connection Cafe',
  'The Local Lounge', 'Community Kitchen', 'The Social Garden', 'Together Terrace'
];

const venueDescriptions = [
  'A warm and welcoming space where locals come together to share stories and build lasting connections.',
  'An inclusive community hub that celebrates diversity and fosters meaningful relationships among neighbors.',
  'A vibrant gathering place where people of all ages can relax, socialize, and feel truly at home.',
  'Your friendly neighborhood spot for conversation, community, and genuine human connection.',
  'A cozy retreat from the hustle and bustle, perfect for meeting new friends and catching up with old ones.',
  'Where community spirit thrives and every visitor becomes part of our extended family.',
  'A unique space dedicated to bringing people together through shared experiences and mutual support.',
  'The heart of the neighborhood, where strangers become friends and friends become family.',
  'A welcoming environment that encourages social interaction and community engagement.',
  'Your local sanctuary for meaningful conversations and authentic connections.'
];

const categories = [
  'cafe', 'library', 'gym', 'sauna', 'community-center', 'coworking', 
  'park', 'restaurant', 'pub', 'bookstore', 'art-gallery', 'church', 'museum'
];

// Blog categories as defined in CLAUDE.md
const blogCategories = [
  'Third Place Experiences', 'Community Stories', 'Local Culture and History',
  'Venue Spotlights', 'Community Building', 'Social Connection',
  'Urban Planning and Public Space'
];

// Blog title templates
const blogTitleTemplates = [
  'Discovering {venue} - A Hidden Gem in {city}',
  'Why {venue} Has Become My Favorite Third Place',
  'The Community Spirit of {venue}',
  'Finding Connection at {venue}',
  'A Local\'s Guide to {venue}',
  'The Story Behind {venue}',
  'How {venue} Brings {city} Together',
  'My Experience as a Regular at {venue}',
  'The Magic of {venue} - More Than Just a {category}',
  'Building Community One Coffee at a Time: {venue}',
  'From Stranger to Regular: My Journey at {venue}',
  'The Heart of {city}: Exploring {venue}'
];

// Blog content paragraphs for realistic content generation
const blogContentParagraphs = [
  "Walking into this place for the first time, I wasn't sure what to expect. But from the moment I stepped through the door, I felt a warmth that goes beyond the physical space. There's something special about places that make you feel instantly welcome.",
  
  "The community here is what really sets this place apart. You'll often find regulars engaged in deep conversations, newcomers being welcomed with genuine smiles, and an atmosphere that encourages connection rather than isolation.",
  
  "What strikes me most is how this space serves as a true third place - that essential social environment outside of home and work where community thrives. It's become clear why sociologist Ray Oldenburg emphasized the importance of such spaces in building social capital.",
  
  "The staff here understand their role in fostering community. They remember your name, your usual order, and somehow always seem to know exactly what kind of day you're having. It's these personal touches that transform a simple transaction into a meaningful interaction.",
  
  "I've witnessed countless moments of connection here - from impromptu chess games between strangers to study groups that have formed organically. The space seems to naturally facilitate these encounters in ways that feel authentic rather than forced.",
  
  "The design and layout contribute significantly to the community feel. Comfortable seating arrangements encourage lingering, communal tables invite conversation with neighbors, and the overall atmosphere promotes interaction rather than isolation.",
  
  "Over the months I've been coming here, I've seen how this place adapts to serve different community needs throughout the day. Morning regulars grab their coffee and catch up on local news, afternoon visitors settle in for work or study sessions, and evening crowds gather for more social interactions.",
  
  "There's an unspoken code of mutual respect here that creates a safe space for everyone. People look out for each other's belongings, hold doors open, and strike up conversations with genuine interest rather than obligation.",
  
  "The local events and community initiatives that originate from this space are remarkable. From book clubs to skill-sharing sessions, it's clear that the venue serves as more than just a business - it's a community catalyst.",
  
  "As someone who has moved to this area relatively recently, finding this place has been instrumental in helping me establish roots in the community. It's provided a social anchor that has made this city feel like home."
];

const tags = [
  'Free Wi-Fi', 'Charging points', 'Accessible entrance', 'Accessible toilet',
  'Baby changing facilities', 'On-site parking', 'Bike parking', 'Lockers available',
  'Outdoor seating', 'Indoor seating', 'Pet-friendly', 'Family-friendly',
  'High chairs available', 'Takeaway service', 'Table service', 'Vegetarian options',
  'Vegan options', 'Gluten-free options', 'Alcohol served', 'Non-alcoholic options'
];

// English cities and coordinates
const englishLocations = [
  { city: 'London', lat: 51.5074, lng: -0.1278 },
  { city: 'Birmingham', lat: 52.4862, lng: -1.8904 },
  { city: 'Manchester', lat: 53.4808, lng: -2.2426 },
  { city: 'Liverpool', lat: 53.4084, lng: -2.9916 },
  { city: 'Leeds', lat: 53.8008, lng: -1.5491 },
  { city: 'Sheffield', lat: 53.3811, lng: -1.4701 },
  { city: 'Bristol', lat: 51.4545, lng: -2.5879 },
  { city: 'Newcastle', lat: 54.9783, lng: -1.6178 },
  { city: 'Nottingham', lat: 52.9548, lng: -1.1581 },
  { city: 'Leicester', lat: 52.6369, lng: -1.1398 },
  { city: 'Brighton', lat: 50.8225, lng: -0.1372 },
  { city: 'Oxford', lat: 51.7520, lng: -1.2577 },
  { city: 'Cambridge', lat: 52.2053, lng: 0.1218 },
  { city: 'Bath', lat: 51.3758, lng: -2.3599 },
  { city: 'York', lat: 53.9600, lng: -1.0873 },
  { city: 'Canterbury', lat: 51.2802, lng: 1.0789 },
  { city: 'Exeter', lat: 50.7184, lng: -3.5339 },
  { city: 'Chester', lat: 53.1906, lng: -2.8837 },
  { city: 'Coventry', lat: 52.4068, lng: -1.5197 },
  { city: 'Plymouth', lat: 50.3755, lng: -4.1427 }
];

// Street name suffixes for realistic addresses
const streetSuffixes = ['Street', 'Road', 'Lane', 'Avenue', 'Close', 'Drive', 'Gardens', 'Place', 'Square'];
const streetNames = [
  'High', 'Church', 'Main', 'Park', 'Mill', 'Victoria', 'Queen', 'King', 'Oak',
  'School', 'Station', 'Market', 'New', 'Old', 'West', 'East', 'North', 'South',
  'Rose', 'Castle', 'Hill', 'Green', 'Bridge', 'Manor', 'Crown', 'Royal', 'Grove'
];

// Utility functions
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateRandomCoordinate = (baseLocation, radiusKm = 20) => {
  // Generate random coordinates within radius of base location
  const earthRadius = 6371; // km
  const maxLat = radiusKm / earthRadius * (180 / Math.PI);
  const maxLng = radiusKm / earthRadius * (180 / Math.PI) / Math.cos(baseLocation.lat * Math.PI / 180);
  
  const deltaLat = (Math.random() - 0.5) * 2 * maxLat;
  const deltaLng = (Math.random() - 0.5) * 2 * maxLng;
  
  return {
    lat: baseLocation.lat + deltaLat,
    lng: baseLocation.lng + deltaLng
  };
};

const generateAddress = (location) => {
  const houseNumber = Math.floor(Math.random() * 200) + 1;
  const streetName = getRandomItem(streetNames);
  const streetSuffix = getRandomItem(streetSuffixes);
  const street = `${houseNumber} ${streetName} ${streetSuffix}`;
  
  return {
    street,
    city: location.city,
    country: 'United Kingdom',
    fullAddress: `${street}, ${location.city}, United Kingdom`,
    coordinates: generateRandomCoordinate(location)
  };
};

// Realistic person avatars using various placeholder services
const generateAvatarUrl = (gender, index) => {
  const services = [
    // This Person Does Not Exist style URLs (placeholder people)
    () => `https://images.unsplash.com/photo-${1500000000 + (index * 123) % 100000000}?w=200&h=200&fit=crop&crop=face`,
    // UI Avatars as fallback with person initials
    () => {
      const names = gender === 'male' ? ['John Doe', 'Mike Smith', 'David Wilson'] : ['Jane Doe', 'Sarah Johnson', 'Emma Brown'];
      const name = names[index % names.length];
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=006548&color=ffffff&bold=true&format=png`;
    },
    // Pravatar - realistic face generator
    () => `https://i.pravatar.cc/200?img=${(index % 70) + 1}`,
    // DiceBear human-like avatars
    () => `https://api.dicebear.com/7.x/personas/png?seed=${index}&size=200`,
    // Placeholder.pics for diverse people
    () => `https://randomuser.me/api/portraits/${gender}/${(index % 99) + 1}.jpg`
  ];

  // Use index to ensure variety but consistency per user
  const serviceIndex = index % services.length;
  return services[serviceIndex]();
};

// User badges/levels for community engagement
const userBadges = [
  { name: 'New Member', description: 'Welcome to MyThirdPlace!', level: 1 },
  { name: 'Contributor', description: 'Active community member', level: 2 },
  { name: 'Regular', description: 'Frequent visitor to third places', level: 3 },
  { name: 'Community Builder', description: 'Helps others discover third places', level: 4 },
  { name: 'Local Expert', description: 'Knowledgeable about local venues', level: 5 },
  { name: 'Third Place Ambassador', description: 'Champions the third place movement', level: 6 }
];

// Extended bio templates for more variety
const bioTemplates = [
  "I'm {firstName}, a {profession} who loves discovering and sharing amazing third places around {city}. Always excited to connect with fellow community builders!",
  "Community enthusiast from {city} with a passion for {interest}. I believe in the power of third places to bring people together and create lasting connections.",
  "Local {city} resident who enjoys exploring cafes, libraries, and community spaces. I'm always looking for new places to work, relax, and meet interesting people.",
  "Third place advocate and {profession}. I spend my free time discovering hidden gems in {city} and sharing them with the community through reviews and recommendations.",
  "Born and raised in {city}, I have a deep appreciation for the community spaces that make our neighborhoods special. Love to share my discoveries!",
  "Digital nomad currently based in {city}. I'm passionate about finding great workspaces and community hubs wherever I go. Coffee lover and people person!",
  "Freelance {profession} who works from various third places around {city}. I believe these spaces are essential for creativity, productivity, and human connection.",
  "Community organizer and local {city} enthusiast. I'm always scouting for venues that could host events, meetings, or just provide a great space for neighbors to connect."
];

const professions = [
  'designer', 'writer', 'developer', 'teacher', 'consultant', 'photographer', 'marketer',
  'architect', 'journalist', 'researcher', 'artist', 'therapist', 'engineer', 'student'
];

const interests = [
  'urban planning', 'sustainable communities', 'local culture', 'social innovation',
  'community organizing', 'public spaces', 'neighborhood development', 'local history',
  'environmental sustainability', 'social entrepreneurship', 'civic engagement'
];

// Custom venue categories for more variety
const customCategories = [
  'coworking-space', 'maker-space', 'meditation-center', 'dance-studio', 'pottery-studio',
  'community-garden', 'farmers-market', 'book-club-venue', 'music-venue', 'art-studio',
  'wellness-center', 'learning-hub', 'social-enterprise', 'cultural-center'
];

// Reliable placeholder image URLs using Lorem Picsum and Picsum Photos
const getVenueImages = (category, venueIndex) => {
  // Using Lorem Picsum which provides reliable placeholder images
  // Each venue gets consistent images based on its index
  const baseIndex = venueIndex * 100; // Spread out the image IDs
  
  const images = [];
  for (let i = 0; i < 3; i++) {
    const imageId = baseIndex + i + 10; // Offset to avoid very low IDs
    images.push(`https://picsum.photos/800/600?random=${imageId}`);
  }
  
  return images;
};

// Create test user with comprehensive profile
const createTestUser = async (index) => {
  const firstName = getRandomItem(firstNames);
  const lastName = getRandomItem(lastNames);
  const displayName = `${firstName} ${lastName}`;
  const email = `testuser${index}@mythirdplace.test`;
  const password = 'TestPassword123!';

  // Determine gender for avatar (simple heuristic based on name)
  const maleNames = ['Oliver', 'William', 'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Sebastian', 'Jack', 'Michael', 'Daniel', 'Matthew', 'Samuel', 'David', 'Joseph', 'Carter', 'Owen', 'Wyatt', 'John', 'Luke'];
  const gender = maleNames.includes(firstName) ? 'men' : 'women';

  const location = getRandomItem(englishLocations);
  const profession = getRandomItem(professions);
  const interest = getRandomItem(interests);
  const badge = getRandomItem(userBadges);

  // Generate personalized bio
  const bioTemplate = getRandomItem(bioTemplates);
  const bio = bioTemplate
    .replace('{firstName}', firstName)
    .replace('{profession}', profession)
    .replace('{city}', location.city)
    .replace('{interest}', interest);

  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const profilePhotoURL = generateAvatarUrl(gender, index);

    // Update user profile
    await updateProfile(user, {
      displayName,
      photoURL: profilePhotoURL
    });

    // Create comprehensive user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      displayName,
      firstName,
      lastName,
      bio,
      profilePhotoURL,
      location: location.city,
      profession,
      badge: badge,
      linkedinURL: Math.random() > 0.4 ? `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}` : null,
      portfolioURL: Math.random() > 0.6 ? `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.com` : null,
      publicEmail: Math.random() > 0.5 ? email : null,
      showPublicEmail: Math.random() > 0.5,
      joinedDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      isVerified: Math.random() > 0.7, // 30% chance of being verified
      venuesCreated: 0,
      blogsPublished: 0,
      regularAtCount: 0,
      profileCompleteness: 85 + Math.floor(Math.random() * 15) // 85-100% complete
    };

    // Use setDoc with the user's UID as the document ID
    await setDoc(doc(db, 'users', user.uid), userDoc);

    console.log(`✅ Created user: ${displayName} (${email}) - ${badge.name} from ${location.city}`);
    return { user, location, badge };

  } catch (error) {
    console.error(`❌ Error creating user ${displayName}:`, error.message);
    return null;
  }
};

// Create test blog post
const createTestBlog = async (user, venue = null, index) => {
  if (!user) return;
  
  const category = getRandomItem(blogCategories);
  let title, content;
  
  if (venue) {
    // Create venue-specific blog
    const titleTemplate = getRandomItem(blogTitleTemplates);
    title = titleTemplate
      .replace('{venue}', venue.name)
      .replace('{city}', venue.address.city)
      .replace('{category}', venue.category);
    
    // Generate content with venue context
    const selectedParagraphs = getRandomItems(blogContentParagraphs, 3 + Math.floor(Math.random() * 3));
    const introText = `I've spent considerable time at ${venue.name} in ${venue.address.city}, and I wanted to share what makes this ${venue.category} such a special third place in our community.\n\n`;
    content = introText + selectedParagraphs.join('\n\n');
  } else {
    // Create general third place blog
    const generalTitles = [
      'The Importance of Third Places in Modern Communities',
      'How I Discovered the Power of Community Spaces',
      'Building Connections Beyond Home and Work',
      'The Art of Being a Good Regular',
      'Why We Need More Third Places in Our Cities',
      'Creating Inclusive Community Spaces',
      'The Social Architecture of Great Third Places'
    ];
    title = getRandomItem(generalTitles);
    
    const selectedParagraphs = getRandomItems(blogContentParagraphs, 4 + Math.floor(Math.random() * 3));
    content = selectedParagraphs.join('\n\n');
  }
  
  const blog = {
    title,
    content,
    category,
    featuredImageURL: venue ? getRandomItem(venue.photos) : `https://picsum.photos/800/400?random=${index + 1000}`,
    authorUID: user.uid,
    linkedVenues: venue ? [venue.id] : [],
    createdAt: serverTimestamp(),
    isPublished: Math.random() > 0.1, // 90% chance of being published
    isFeatured: Math.random() > 0.9, // 10% chance of being featured
    viewCount: Math.floor(Math.random() * 500),
    likeCount: Math.floor(Math.random() * 50)
  };
  
  try {
    const blogRef = await addDoc(collection(db, 'blogs'), blog);
    const venueText = venue ? ` about ${venue.name}` : '';
    console.log(`✅ Created blog: "${title}"${venueText} by ${user.displayName}`);
    return blogRef;
  } catch (error) {
    console.error(`❌ Error creating blog "${title}":`, error.message);
    return null;
  }
};

// Create test venue with enhanced variety
const createTestVenue = async (userData, index) => {
  if (!userData) return;

  const { user, location } = userData;

  // Mix of standard and custom categories
  const allCategories = [...categories, ...customCategories];
  const category = getRandomItem(allCategories);
  const venueName = getRandomItem(venueNames);
  const description = getRandomItem(venueDescriptions);
  const address = generateAddress(location);
  const photos = getVenueImages(category, index);
  const venueTags = getRandomItems(tags, Math.floor(Math.random() * 6) + 3); // 3-8 tags

  // Determine if this is business or visitor created
  const isOwnerCreated = Math.random() > 0.6; // 40% business, 60% visitor

  const venue = {
    name: venueName,
    description,
    category,
    tags: venueTags,
    address,
    coordinates: {
      lat: address.coordinates.lat,
      lng: address.coordinates.lng
    },
    photos,
    primaryPhotoURL: photos[0] || '',
    contactInfo: {
      website: Math.random() > 0.4 ? `https://www.${venueName.toLowerCase().replace(/\s+/g, '')}.co.uk` : null,
      phone: Math.random() > 0.5 ? `+44 ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 900000 + 100000)}` : null,
      email: Math.random() > 0.6 ? `info@${venueName.toLowerCase().replace(/\s+/g, '')}.co.uk` : null,
      socialMedia: {
        instagram: Math.random() > 0.5 ? `@${venueName.toLowerCase().replace(/\s+/g, '')}` : null,
        facebook: Math.random() > 0.6 ? venueName : null,
        linkedin: Math.random() > 0.8 ? venueName : null
      }
    },
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    isOwnerCreated,
    isVerified: Math.random() > 0.5, // 50% chance of being verified
    ownerClaimed: isOwnerCreated ? true : Math.random() > 0.7, // Owners claim their venues, 30% chance for others
    viewCount: Math.floor(Math.random() * 2000),
    regularCount: Math.floor(Math.random() * 50),
    multipleLocations: Math.random() > 0.85 ? [address] : null, // 15% chance of multiple locations
    openingHours: Math.random() > 0.3 ? {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 8:00 PM',
      friday: '8:00 AM - 8:00 PM',
      saturday: '9:00 AM - 7:00 PM',
      sunday: '10:00 AM - 5:00 PM'
    } : null
  };

  try {
    const venueRef = await addDoc(collection(db, 'venues'), venue);
    console.log(`✅ Created venue: ${venueName} in ${location.city} by ${user.displayName} (${isOwnerCreated ? 'Business' : 'Visitor'} created)`);

    // Create user-venue relationship
    const relationship = {
      userUID: user.uid,
      venueID: venueRef.id,
      relationshipType: venue.isOwnerCreated ? 'owner' : 'creator',
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'userVenueRelationships'), relationship);

    // 40% chance user becomes a regular at their own venue
    if (Math.random() > 0.6) {
      const regularRelationship = {
        userUID: user.uid,
        venueID: venueRef.id,
        relationshipType: 'regular',
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'userVenueRelationships'), regularRelationship);
    }

    // Return both the reference and the venue data
    return {
      ref: venueRef,
      data: { ...venue, id: venueRef.id }
    };

  } catch (error) {
    console.error(`❌ Error creating venue ${venueName}:`, error.message);
    return null;
  }
};

// Create regular relationships for users at random venues
const createRegularRelationships = async (users, venues) => {
  console.log('\nCreating regular relationships...');

  for (const userData of users) {
    const { user } = userData;
    const numRegularVenues = Math.floor(Math.random() * 10) + 1; // 1-10 venues

    // Get random venues (excluding ones they created)
    const otherVenues = venues.filter(v => v.data.createdBy !== user.uid);
    const selectedVenues = getRandomItems(otherVenues, Math.min(numRegularVenues, otherVenues.length));

    for (const venue of selectedVenues) {
      try {
        const regularRelationship = {
          userUID: user.uid,
          venueID: venue.ref.id,
          relationshipType: 'regular',
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'userVenueRelationships'), regularRelationship);
        console.log(`✅ ${user.displayName} is now a regular at ${venue.data.name}`);
      } catch (error) {
        console.error(`❌ Error creating regular relationship:`, error.message);
      }
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

// Main function to generate all test data
const generateTestData = async () => {
  console.log('🚀 Starting comprehensive test data generation for 30 users...\n');

  const users = [];
  const venues = [];
  const blogs = [];

  // Create 30 users and their venues/blogs
  for (let i = 1; i <= 30; i++) {
    console.log(`Creating test user, venue, and blog ${i}/30...`);

    const userData = await createTestUser(i);
    if (userData) {
      users.push(userData);

      // Create venue for this user
      const venue = await createTestVenue(userData, i);
      if (venue) {
        venues.push(venue);

        // Create a venue-specific blog post for this user's venue
        const venueBlog = await createTestBlog(userData.user, {
          id: venue.ref.id,
          name: venue.data.name,
          address: venue.data.address,
          category: venue.data.category,
          photos: venue.data.photos
        }, i);
        if (venueBlog) {
          blogs.push(venueBlog);
        }
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Create regular relationships (users become regulars at 1-10 venues)
  await createRegularRelationships(users, venues);

  // Create some additional cross-venue blogs (users writing about other venues)
  console.log('\nCreating cross-venue blog posts...');
  for (let i = 0; i < Math.min(15, users.length); i++) {
    const randomUserData = getRandomItem(users);
    const randomVenue = getRandomItem(venues);

    if (randomUserData && randomVenue && randomUserData.user.uid !== randomVenue.data.createdBy) {
      const crossBlog = await createTestBlog(randomUserData.user, {
        id: randomVenue.ref.id,
        name: randomVenue.data.name,
        address: randomVenue.data.address,
        category: randomVenue.data.category,
        photos: randomVenue.data.photos
      }, i + 500);

      if (crossBlog) {
        blogs.push(crossBlog);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🎉 Comprehensive test data generation complete!');
  console.log(`✅ Created ${users.length} users with comprehensive profiles`);
  console.log(`✅ Created ${venues.length} venues (mix of business/visitor created)`);
  console.log(`✅ Created ${blogs.length} blog posts with placeholder images`);
  console.log(`📍 Venues distributed across England with custom categories`);
  console.log(`👤 Users have realistic placeholder avatars`);
  console.log(`🏆 Users assigned random badges (New Member to Ambassador)`);
  console.log(`💼 Users have filled out profiles with bios, professions, locations`);
  console.log(`🖼️ Venues have placeholder images and detailed information`);
  console.log(`📝 Blogs include venue-specific and cross-venue content`);
  console.log(`❤️ Users are regulars at 1-10 venues each`);
  console.log(`🏢 Mix of business-created and visitor-created venues`);
  console.log('\nTest accounts can be accessed with:');
  console.log('📧 Email: testuser[1-30]@mythirdplace.test');
  console.log('🔑 Password: TestPassword123!');

  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the script
generateTestData().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});