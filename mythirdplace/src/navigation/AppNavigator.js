import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { onAuthStateChange } from '../services/auth';
import { globalStyles } from '../styles/globalStyles';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import ContactScreen from '../screens/ContactScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ViewProfileScreen from '../screens/profile/ViewProfileScreen';
import VenueListingsScreen from '../screens/venues/VenueListingsScreen';
import CreateVenueScreen from '../screens/venues/CreateVenueScreen';
import VenueDetailScreen from '../screens/venues/VenueDetailScreen';
import BlogListingsScreen from '../screens/blogs/BlogListingsScreen';
import CreateBlogScreen from '../screens/blogs/CreateBlogScreen';
import BlogDetailScreen from '../screens/blogs/BlogDetailScreen';
import MyBlogsScreen from '../screens/blogs/MyBlogsScreen';
import VenueRegularsScreen from '../screens/social/VenueRegularsScreen';
import CreatePortfolioScreen from '../screens/portfolio/CreatePortfolioScreen';
import PrivacyPolicyScreen from '../screens/legal/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/legal/TermsOfServiceScreen';
import CookiePolicyScreen from '../screens/legal/CookiePolicyScreen';
import DataProtectionScreen from '../screens/legal/DataProtectionScreen';
import NotFoundScreen from '../screens/NotFoundScreen';

// Admin screens
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminVenuesScreen from '../screens/admin/AdminVenuesScreen';
import AdminBlogsScreen from '../screens/admin/AdminBlogsScreen';
import AdminContentScreen from '../screens/admin/AdminContentScreen';
import AdminSEOScreen from '../screens/admin/AdminSEOScreen';
import AdminTagsScreen from '../screens/admin/AdminTagsScreen';
import AdminFeaturedScreen from '../screens/admin/AdminFeaturedScreen';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
import AdminClaimsScreen from '../screens/admin/AdminClaimsScreen';

// Claims screens
import ClaimListingScreen from '../screens/claims/ClaimListingScreen';
import OwnerDashboardScreen from '../screens/claims/OwnerDashboardScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#006548" />
      </View>
    );
  }

  const linking = {
    prefixes: [
      'http://localhost:8081', 
      'http://localhost:8082', 
      'http://localhost:19006',
      'https://yourapp.com'
    ],
    config: {
      screens: {
        Home: '',
        About: 'about',
        Contact: 'contact',
        Profile: 'profile',
        EditProfile: 'profile/edit',
        ViewProfile: {
          path: 'profile/:userId',
          parse: {
            userId: (userId) => userId,
          },
        },
        VenueListings: 'venues',
        CreateVenue: 'venues/create',
        VenueDetail: {
          path: 'venues/:venueId',
          parse: {
            venueId: (venueId) => venueId,
          },
        },
        VenueRegulars: {
          path: 'venues/:venueId/regulars',
          parse: {
            venueId: (venueId) => venueId,
          },
        },
        BlogListings: 'blogs',
        CreateBlog: 'blogs/create',
        BlogDetail: {
          path: 'blogs/:blogId',
          parse: {
            blogId: (blogId) => blogId,
          },
        },
        MyBlogs: 'my-blogs',
        CreatePortfolio: 'portfolio/create',
        Login: 'login',
        Register: 'register',
        ResetPassword: 'reset-password',
        PrivacyPolicy: 'privacy-policy',
        TermsOfService: 'terms-of-service',
        CookiePolicy: 'cookie-policy',
        DataProtection: 'data-protection',
        AdminLogin: 'admin-dashboard',
        AdminHome: 'admin-dashboard/home',
        AdminUsers: 'admin-dashboard/users',
        AdminVenues: 'admin-dashboard/venues',
        AdminBlogs: 'admin-dashboard/blogs',
        AdminContent: 'admin-dashboard/content',
        AdminSEO: 'admin-dashboard/seo',
        AdminTags: 'admin-dashboard/tags',
        AdminFeatured: 'admin-dashboard/featured',
        AdminAnalytics: 'admin-dashboard/analytics',
        AdminClaims: 'admin-dashboard/claims',
        ClaimListing: 'claims/venue/:venueId',
        OwnerDashboard: 'business-dashboard',
        NotFound: '*',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        {/* Public screens - always available */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
        />
        <Stack.Screen
          name="Contact"
          component={ContactScreen}
        />
        <Stack.Screen
          name="VenueListings"
          component={VenueListingsScreen}
        />
        <Stack.Screen
          name="VenueDetail"
          component={VenueDetailScreen}
          initialParams={{ venueId: undefined }}
        />
        <Stack.Screen
          name="VenueRegulars"
          component={VenueRegularsScreen}
          initialParams={{ venueId: undefined }}
        />
        <Stack.Screen 
          name="BlogListings" 
          component={BlogListingsScreen}
        />
        <Stack.Screen 
          name="BlogDetail" 
          component={BlogDetailScreen}
          initialParams={{ blogId: undefined }}
        />
        <Stack.Screen 
          name="ViewProfile" 
          component={ViewProfileScreen}
          initialParams={{ userId: undefined }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
        />
        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreen}
        />
        <Stack.Screen
          name="CookiePolicy"
          component={CookiePolicyScreen}
        />
        <Stack.Screen
          name="DataProtection"
          component={DataProtectionScreen}
        />

        {/* Admin screens */}
        <Stack.Screen
          name="AdminLogin"
          component={AdminLoginScreen}
        />
        <Stack.Screen
          name="AdminHome"
          component={AdminHomeScreen}
        />
        <Stack.Screen
          name="AdminUsers"
          component={AdminUsersScreen}
        />
        <Stack.Screen
          name="AdminVenues"
          component={AdminVenuesScreen}
        />
        <Stack.Screen
          name="AdminBlogs"
          component={AdminBlogsScreen}
        />
        <Stack.Screen
          name="AdminContent"
          component={AdminContentScreen}
        />
        <Stack.Screen
          name="AdminSEO"
          component={AdminSEOScreen}
        />
        <Stack.Screen
          name="AdminTags"
          component={AdminTagsScreen}
        />
        <Stack.Screen
          name="AdminFeatured"
          component={AdminFeaturedScreen}
        />
        <Stack.Screen
          name="AdminAnalytics"
          component={AdminAnalyticsScreen}
        />
        <Stack.Screen
          name="AdminClaims"
          component={AdminClaimsScreen}
        />

        {/* Protected screens - only when authenticated */}
        {user && (
          <>
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
            />
            <Stack.Screen 
              name="CreateVenue" 
              component={CreateVenueScreen}
            />
            <Stack.Screen 
              name="CreateBlog" 
              component={CreateBlogScreen}
            />
            <Stack.Screen
              name="MyBlogs"
              component={MyBlogsScreen}
            />
            <Stack.Screen
              name="CreatePortfolio"
              component={CreatePortfolioScreen}
            />
            <Stack.Screen
              name="ClaimListing"
              component={ClaimListingScreen}
            />
            <Stack.Screen
              name="OwnerDashboard"
              component={OwnerDashboardScreen}
            />
          </>
        )}

        {/* 404 fallback - always at the end */}
        <Stack.Screen
          name="NotFound"
          component={NotFoundScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;