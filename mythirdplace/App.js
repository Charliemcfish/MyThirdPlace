import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { loadGoogleMapsAPI } from './src/utils/googleMapsLoader';
import { initializeAdminUsers } from './src/services/admin';

export default function App() {
  useEffect(() => {
    // Initialize admin users
    initializeAdminUsers().then(() => {
      console.log('Admin users initialized');
    }).catch(error => {
      console.error('Error initializing admin users:', error);
    });

    // Load Google Maps API and fonts on web platform
    if (Platform.OS === 'web') {
      // Add meta description for SEO
      const metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      metaDescription.content = 'Discover, read and write about your favorite Third Place';
      document.head.appendChild(metaDescription);

      // Update page title
      document.title = 'MyThirdPlace - Discover Your Third Place';

      // Load Google Fonts
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Load FontAwesome
      const fontAwesome = document.createElement('link');
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      fontAwesome.rel = 'stylesheet';
      document.head.appendChild(fontAwesome);



      loadGoogleMapsAPI().then((loaded) => {
        if (loaded) {
          console.log('Google Maps API loaded successfully in App');
        } else {
          console.warn('Failed to load Google Maps API in App');
        }
      });

      // Add custom scrollbar styles for desktop only
      const style = document.createElement('style');
      style.textContent = `
        /* Custom scrollbar for desktop only */
        @media (min-width: 768px) {
          body::-webkit-scrollbar {
            width: 16px;
          }

          body::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 8px;
          }

          body::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 8px;
            border: 2px solid #f1f1f1;
          }

          body::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }

          /* For all scrollable containers */
          *::-webkit-scrollbar {
            width: 12px;
          }

          *::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 6px;
          }

          *::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 6px;
            border: 1px solid #f1f1f1;
          }

          *::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }

          /* Force scrollbars to always show on specific containers */
          #root {
            overflow-y: auto;
          }

          /* Ensure scrollbars appear on main content containers */
          div[style*="overflow"] {
            overflow-y: auto !important;
          }

          /* Force scrollbar visibility for scrollable containers */
          .scrollable-container,
          [data-scrollable="true"] {
            overflow-y: auto;
          }

          /* Hide Google Maps UI elements that might appear as gray buttons */
          .gm-ui-hover-effect {
            display: none !important;
          }

          .gm-fullscreen-control,
          .gm-svpc,
          .gm-control-active,
          .gm-bundled-control,
          .gmnoprint {
            display: none !important;
          }

          .gm-style .gm-style-cc {
            display: none !important;
          }

          /* Hide the default transparent marker button that Google Maps creates */
          div[role="button"][title*="venue location"],
          div[aria-label*="venue location"],
          div[title*="Your venue location"],
          div[aria-label*="Your venue location"] {
            display: none !important;
          }

          /* Hide transparent.png markers */
          img[src*="transparent.png"] {
            display: none !important;
          }

          /* Hide any default marker buttons */
          div[role="button"] img[src*="transparent.png"] {
            display: none !important;
          }

          /* Force address suggestions to appear on top */
          [data-testid="suggestions-container"],
          div[style*="position: absolute"][style*="top: 100%"] {
            z-index: 999999999 !important;
          }

          /* Force center alignment for blog image captions */
          span[style*="font-style: italic"][style*="color: rgb(102, 102, 102)"],
          div[class*="css-text"] span[style*="font-style: italic"],
          .css-textHasAncestor-1jxf684[style*="font-style: italic"] {
            text-align: center !important;
            display: block !important;
            width: 100% !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }

          /* Override React Native Web text alignment classes for captions */
          .r-textAlign-fdjqy7 span[style*="font-style: italic"],
          div[dir="auto"] span[style*="font-style: italic"] {
            text-align: center !important;
          }

          /* Hide scrollbars from Google Maps and containers */
          .gm-style,
          .gm-style > div,
          .gm-style iframe,
          div[style*="overflow"] {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }

          .gm-style::-webkit-scrollbar,
          .gm-style > div::-webkit-scrollbar,
          .gm-style iframe::-webkit-scrollbar,
          div[style*="overflow"]::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }

          /* Contact form styling */
          form input:focus,
          form textarea:focus {
            border-color: #006548 !important;
            box-shadow: 0 0 0 3px rgba(0, 101, 72, 0.1) !important;
            outline: none !important;
          }

          form input::placeholder,
          form textarea::placeholder {
            color: #999 !important;
            font-style: italic !important;
          }

          form button:hover {
            background-color: #005040 !important;
            box-shadow: 0 6px 16px rgba(0, 101, 72, 0.4) !important;
            transform: translateY(-2px) !important;
          }

          form button:active {
            transform: translateY(0) !important;
            box-shadow: 0 2px 8px rgba(0, 101, 72, 0.3) !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}
