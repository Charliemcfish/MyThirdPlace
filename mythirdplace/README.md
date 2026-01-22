# MyThirdPlace - Phase 1 Foundation

A web-first community platform that connects people with "third places" - social environments outside of home and work where people gather and build community.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Firebase project (see setup instructions below)

### Installation

1. Clone and navigate to the project:
```bash
cd mythirdplace
npm install
```

2. Configure Firebase:
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase config and update `src/services/firebase.js`

3. Start the development server:
```bash
npm run web
```

The app will open at http://localhost:8081

## 🏗️ Phase 1 Features

### ✅ Completed Features
- **Project Foundation**: Expo with React Native Web
- **Firebase Integration**: Authentication, Firestore, Storage
- **Navigation**: React Navigation with auth-based routing
- **Authentication System**:
  - User registration with email/password
  - User login/logout
  - Password reset functionality
  - Form validation and error handling
- **User Profiles**:
  - Basic profile creation
  - Profile editing with bio, social links
  - Profile viewing
- **UI/UX**:
  - MyThirdPlace branding (#006548 green)
  - Responsive design for web
  - Global styling system
  - Semi-circle design elements

### 🔧 Technical Architecture
- **Frontend**: Expo + React Native Web
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Navigation**: React Navigation v7
- **Styling**: React Native StyleSheet with custom theme
- **State Management**: React hooks + Context API ready

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components (ready for future phases)
├── screens/
│   ├── auth/           # Authentication screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   └── ResetPasswordScreen.js
│   ├── profile/        # Profile management screens
│   │   ├── ProfileScreen.js
│   │   └── EditProfileScreen.js
│   └── HomeScreen.js   # Main landing page
├── services/
│   ├── firebase.js     # Firebase configuration
│   ├── auth.js         # Authentication service
│   └── user.js         # User profile service
├── navigation/
│   └── AppNavigator.js # Main navigation configuration
├── styles/
│   ├── theme.js        # Global theme and colors
│   └── globalStyles.js # Shared styles
└── utils/
    └── validation.js   # Form validation helpers
```

## 🔐 Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication, Firestore, and Storage

2. **Configure Authentication**
   - Enable Email/Password provider
   - Set up authorized domains for your web app

3. **Set up Firestore**
   - Create database in test mode initially
   - Import the security rules from `firestore.rules`

4. **Configure Storage**
   - Create storage bucket
   - Import the security rules from `storage.rules`

5. **Update Firebase Config**
   - Copy your Firebase config object
   - Update `src/services/firebase.js` with your credentials

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration works
- [ ] User login/logout functions
- [ ] Password reset emails are sent
- [ ] Profile creation and editing
- [ ] Navigation between screens
- [ ] Form validation displays errors
- [ ] Responsive design on different screen sizes

### Browser Compatibility
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 🚧 Coming in Future Phases

Phase 2-16 will add:
- Venue listing system
- Google Maps integration
- Blog system with rich text
- Social networking features ("I am a Regular")
- Search and filtering
- Admin panel
- SEO optimization
- Data migration tools

## 🎨 Design System

### Colors
- **Primary Green**: #006548
- **Text**: #000000 (black for readability)
- **Background**: #FFFFFF
- **Error**: #DC3545
- **Success**: #28A745

### Typography
- Web-optimized fonts
- Consistent heading hierarchy
- Responsive text sizes

### Components
- Semi-circle headers (signature design element)
- Rounded cards and containers
- Consistent button styles
- Form validation styling

## 📱 Mobile Web Support

The application is optimized for mobile web browsers:
- Responsive breakpoints (mobile: 320px+, tablet: 768px+, desktop: 1024px+)
- Touch-friendly interactions
- Optimized form inputs for mobile
- Proper viewport configuration

## 🔧 Development

### Available Scripts
- `npm run web` - Start web development server
- `npm run android` - Start Android development (requires setup)
- `npm run ios` - Start iOS development (requires macOS)

### Code Standards
- ES6+ JavaScript
- React hooks patterns
- Comprehensive error handling
- JSDoc comments for functions
- Consistent file naming conventions

## 📞 Support

For development questions or issues:
1. Check the `claude.md` file for complete platform documentation
2. Review Firebase documentation for backend setup
3. Check Expo documentation for React Native Web issues

---

**Phase 1 Status**: ✅ Complete and Ready for Phase 2
**Next Phase**: Homepage Structure (Hero, Map, Carousels, FAQ)