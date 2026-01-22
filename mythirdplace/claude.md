# MyThirdPlace Platform Documentation

## Project Overview

MyThirdPlace is a web-first community platform that connects people with "third places" - social environments outside of home and work where people gather and build community. The platform combines venue discovery, community blogging, and social networking features to help users find and connect with local gathering spaces.

## Platform Concept

Based on sociologist Ray Oldenburg's "third place" theory, the platform showcases vital community spaces like cafes, libraries, gyms, saunas, and other social hubs. Unlike traditional review sites, MyThirdPlace focuses on blogs and community stories rather than ratings, creating authentic connections between people and places.

## Technical Architecture

### Core Technology Stack
- **Frontend Framework**: Expo with React Native Web (web-first approach)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Maps Integration**: Google Maps API
- **Deployment**: Web-first with future mobile app capability
- **Development Tool**: Claude Code for primary development

### Database Structure (Firebase Firestore)
```
users/
  - uid (string)
  - email (string)
  - displayName (string)
  - bio (string)
  - profilePhotoURL (string)
  - linkedinURL (string, optional)
  - portfolioURL (string, optional)
  - publicEmail (string, optional)
  - createdAt (timestamp)
  - isVerified (boolean)

venues/
  - id (string)
  - name (string)
  - description (string)
  - category (string) // cafe, sauna, gym, library, etc.
  - tags (array) // Free Wi-Fi, Pet-friendly, Accessible entrance, etc.
  - address (object)
    - street (string)
    - city (string)
    - country (string)
    - coordinates (geopoint)
  - photos (array of strings) // Firebase Storage URLs
  - contactInfo (object)
    - website (string, optional)
    - phone (string, optional)
    - email (string, optional)
    - socialMedia (object)
      - instagram (string, optional)
      - facebook (string, optional)
      - linkedin (string, optional)
  - createdBy (string) // user UID
  - createdAt (timestamp)
  - isOwnerCreated (boolean)
  - isVerified (boolean)
  - ownerClaimed (boolean)
  - multipleLocations (array, optional)

blogs/
  - id (string)
  - title (string)
  - content (string) // rich text content
  - category (string)
  - featuredImageURL (string, optional)
  - authorUID (string)
  - linkedVenues (array) // venue IDs this blog references
  - createdAt (timestamp)
  - isPublished (boolean)
  - isFeatured (boolean)

userVenueRelationships/
  - id (string)
  - userUID (string)
  - venueID (string)
  - relationshipType (string) // "regular", "owner", "creator"
  - createdAt (timestamp)

tags/
  - id (string)
  - name (string)
  - category (string) // amenity, accessibility, service, etc.
  - usageCount (number)

categories/
  - id (string)
  - name (string)
  - iconURL (string, optional)
  - usageCount (number)
```

## Core Features

### 1. User Authentication & Profiles
- Firebase Authentication for secure login/registration
- Comprehensive user profiles with photos, bios, and professional links
- "My Third Places" section showing created venues and regular status
- "My Blogs" section displaying authored content
- Public/private profile information controls

### 2. Venue Listing System
- Dual creation paths: venue owners vs. community visitors
- Comprehensive venue information (photos, contact, social media)
- Tag system for amenities (Free Wi-Fi, Pet-friendly, etc.)
- Multiple location support for venue chains
- Interactive Google Maps integration with global geocoding
- "Claim listing" functionality for owner verification

### 3. Blog System
- Rich text blog creation and editing
- Blog categorization and tagging
- Author profile integration
- Cross-linking between blogs and venues
- Featured blog capability
- "Blogs about [Venue Name]" sections on venue pages

### 4. Social Networking Features
- "I am a Regular" functionality for users to mark favorite venues
- "See all Regulars" feature showing community at each venue
- Regular count display and social proof elements
- User activity tracking and community engagement

### 5. Search & Discovery
- Venue search by name, category, tags, and location
- Blog search and filtering by category and author
- Distance-based sorting from user location
- Popular venues and trending content discovery
- Advanced filtering combinations

### 6. Administrative System
- User management and moderation tools
- Venue listing approval workflow
- Blog content moderation
- Tag and category management
- Analytics and reporting dashboard
- Featured content selection tools

## Design System

### Brand Colors
- **Primary Green**: #006548 (MyThirdPlace brand color)
- **Text**: Black (changed from grey for better readability)
- **Background**: White/light colors for clean presentation

### Visual Elements
- **Semi-circle styling**: Signature design element for headings and sections
- **Hero sections**: Rounded bottom borders with semi-circle shape
- **Consistent typography**: Professional, web-optimized fonts
- **Responsive design**: Desktop-first with mobile responsiveness

### Component Library
- Semi-circle headers for sections
- Venue preview cards
- Blog preview cards
- User profile components
- Interactive carousels/sliders
- Search and filter interfaces
- Modal dialogs and forms

## User Experience Flow

### New User Journey
1. **Homepage**: Hero section with search, featured content, and clear value proposition
2. **Registration**: Simple signup process with profile creation
3. **Discovery**: Browse venues and blogs to understand platform value
4. **Engagement**: Mark venues as "regular," create content, or claim listings
5. **Community**: Connect with other users through shared third places

### Content Creator Flow
1. **Profile Setup**: Complete profile with professional links
2. **Blog Creation**: Write about third places and experiences
3. **Venue Linking**: Connect blogs to specific venues for cross-discovery
4. **Community Building**: Build following through quality content

### Venue Owner Flow
1. **Discovery**: Find their venue listed by community member
2. **Claim Process**: Submit verification information
3. **Profile Management**: Update venue information and contact details
4. **Community Engagement**: Interact with regulars and blog content

## Platform Unique Value Propositions

### vs. Traditional Review Sites
- **Stories over Ratings**: Blogs and narratives instead of star ratings
- **Community Building**: Focus on regulars and social connections
- **Authentic Experiences**: Real user stories about meaningful places

### vs. Social Networks
- **Location-Centric**: Built around physical places and real-world community
- **Purpose-Driven**: Focused on third place discovery and community building
- **Quality Content**: Emphasis on thoughtful blog content over quick posts

### vs. Directory Sites
- **Community-Generated**: Users create content about places they love
- **Cross-Platform Integration**: Blogs and venues interconnected
- **Social Elements**: Regulars system creates ongoing community engagement

## Technical Considerations

### Performance Requirements
- **Page Load Times**: Under 3 seconds for all major pages
- **Image Optimization**: Compressed and cached images
- **Search Performance**: Results under 1 second
- **Mobile Web**: Optimized for mobile browser experience

### SEO Strategy
- **Target Keywords**: "Third Places near me", "Find a Third Place"
- **Dynamic Meta Tags**: Venue and blog-specific SEO optimization
- **Structured Data**: Schema.org markup for business listings
- **Sitemap Generation**: Automated XML sitemap for search engines

### Security & Privacy
- **Firebase Security Rules**: Protect user data and prevent unauthorized access
- **User Privacy**: Control over public/private profile information
- **Content Moderation**: Admin tools for inappropriate content management
- **Data Protection**: Compliance with privacy regulations

## Development Approach

### Web-First Strategy
- **Primary Platform**: Responsive web application
- **Technology**: Expo with React Native Web
- **Browser Support**: Chrome, Firefox, Safari, Edge
- **Mobile Compatibility**: Testing throughout development

### Phased Development
The platform is built in 16 phases, each with specific deliverables:
1. Foundation & Authentication
2. Homepage Structure (Hero, Map, Carousels, FAQ)
3. User Profiles
4. Venue Listings
5. Google Maps Integration
6. Blog System
7. Enhanced Listing Features (Tags, Owner/Visitor paths)
8. Social Networking (Regulars system)
9. Blog-Venue Integration
10. Homepage & Navigation Polish
11. Search & Filtering
12. Claim Listing & Verification
13. Admin Panel Foundation
14. Advanced Admin Features
15. SEO & Performance Optimization
16. Data Migration & Launch

### Quality Assurance
- **Comprehensive Checklists**: Each phase has detailed completion requirements
- **Cross-Browser Testing**: Ensure compatibility across web browsers
- **Performance Monitoring**: Regular speed and optimization testing
- **User Testing**: Feedback collection at key development milestones

## Content Strategy

### Venue Categories
- Cafes and Coffee Shops
- Libraries and Bookstores
- Gyms and Fitness Centers
- Saunas and Wellness Spaces
- Community Centers
- Co-working Spaces
- Parks and Public Spaces
- Restaurants and Pubs
- Churches and Spiritual Spaces
- Cultural Centers and Museums

### Blog Categories
- Third Place Experiences
- Community Stories
- Local Culture and History
- Venue Spotlights
- Community Building
- Social Connection
- Urban Planning and Public Space

### Tag System (20 Predefined Tags)
- Free Wi-Fi
- Charging points
- Accessible entrance
- Accessible toilet
- Baby changing facilities
- On-site parking
- Bike parking
- Lockers available
- Outdoor seating
- Indoor seating
- Pet-friendly
- Family-friendly
- High chairs available
- Takeaway service
- Table service
- Vegetarian options
- Vegan options
- Gluten-free options
- Alcohol served
- Non-alcoholic options

## Migration from Existing Platform

### Current State
- WordPress-based website at mythirdplace.co.uk
- Existing users, venue listings, and blog content
- Basic functionality for venue listing and blog reading

### Migration Plan
- **Data Export**: Extract all content from WordPress
- **User Migration**: Transfer accounts to Firebase Authentication
- **Content Migration**: Move venues and blogs to new platform
- **URL Preservation**: Maintain SEO rankings through redirects
- **Domain Migration**: Move to new domain (.net or .com)

## Future Enhancements

### Post-Launch Features
- **Mobile Apps**: Native iOS and Android apps using existing Expo codebase
- **Push Notifications**: Engagement and community updates
- **Advanced Social Features**: Messaging, events, meetups
- **API Development**: Third-party integrations and partnerships
- **Analytics Dashboard**: Detailed insights for venue owners and community managers

### Scalability Considerations
- **International Expansion**: Multi-language support
- **Advanced Search**: AI-powered recommendations
- **Premium Features**: Enhanced tools for venue owners
- **Partnership Integrations**: Local business and tourism board connections

## Success Metrics

### User Engagement
- User registration and retention rates
- Venue creation and claiming activity
- Blog publishing frequency and quality
- Regular status adoption and community building

### Content Quality
- Venue completeness and accuracy
- Blog engagement and readability
- Community interaction and feedback
- Search and discovery effectiveness

### Technical Performance
- Page load speeds and user experience
- Search functionality effectiveness
- Cross-browser compatibility
- Mobile web performance

## Development Guidelines for Claude Code

### Code Style & Standards
- **Component Structure**: Reusable, well-documented React components
- **State Management**: Context API for global state, local state for components
- **Navigation**: React Navigation for web-optimized routing
- **Styling**: StyleSheet with responsive design patterns
- **Error Handling**: Comprehensive error boundaries and user feedback

### Firebase Integration
- **Authentication**: Use Firebase Auth for all user management
- **Database**: Firestore for real-time data with offline support
- **Storage**: Firebase Storage for images with optimization
- **Security**: Implement proper security rules for data protection

### Performance Optimization
- **Image Loading**: Lazy loading and caching strategies
- **Data Fetching**: Efficient queries and pagination
- **Bundle Size**: Code splitting and optimization
- **Caching**: Strategic caching for improved performance

### Testing Strategy
- **Unit Testing**: Component and function testing
- **Integration Testing**: Feature workflow testing
- **Cross-Browser Testing**: Web compatibility verification
- **Performance Testing**: Load time and responsiveness validation

This documentation serves as the complete reference for MyThirdPlace development. All development decisions should align with these specifications while maintaining flexibility for improvements and optimizations discovered during the development process.