import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { mapsConfig, defaultMapOptions, categoryColors, categoryIcons } from '../../config/maps';
import { styles } from './InteractiveMap.styles';

const MapComponent = ({ 
  venues = [], 
  center = { lat: 51.5074, lng: -0.1278 }, // Default to London
  zoom = 10,
  height = 400,
  onVenueClick,
  showInfoWindows = true,
  enableClustering = false,
  mapStyle = {},
  onMapLoad
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const mapOptions = {
      ...defaultMapOptions,
      center,
      zoom,
      ...mapStyle
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Create info window
    if (showInfoWindows) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    // Add venue markers
    addVenueMarkers(map);

    // Call onMapLoad callback
    if (onMapLoad) {
      onMapLoad(map);
    }

    // Fit bounds to show all venues if more than one venue
    if (venues.length > 1) {
      fitMapToBounds(map, venues);
    }
  }, [center, zoom, venues, showInfoWindows, mapStyle, onMapLoad]);

  const addVenueMarkers = (map) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    venues.forEach(venue => {
      if (!venue.coordinates || !venue.coordinates.lat || !venue.coordinates.lng) {
        return;
      }

      const marker = new window.google.maps.Marker({
        position: {
          lat: venue.coordinates.lat,
          lng: venue.coordinates.lng
        },
        map,
        title: venue.name,
        icon: createCustomMarkerIcon(venue.category),
        optimized: false,
        zIndex: 1000
      });

      markersRef.current.push(marker);

      // Add click listener
      marker.addListener('click', () => {
        if (showInfoWindows && infoWindowRef.current) {
          const infoContent = createInfoWindowContent(venue);
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(map, marker);
        }

        if (onVenueClick) {
          onVenueClick(venue);
        }
      });
    });
  };

  const createCustomMarkerIcon = (category) => {
    const brandGreen = '#006548'; // MyThirdPlace brand color
    
    // Category symbols matching the existing emoji system
    const categorySymbols = {
      'cafe': '☕',
      'library': '📚',
      'gym': '💪',
      'sauna': '🧖',
      'community-center': '🏛️',
      'coworking': '💼',
      'park': '🌳',
      'restaurant': '🍽️',
      'pub': '🍺',
      'bookstore': '📖',
      'art-gallery': '🎨',
      'church': '⛪',
      'museum': '🏛️',
      'other': '📍'
    };
    
    const symbol = categorySymbols[category] || categorySymbols.other;
    
    // Create a clean green circle marker with white emoji
    const svgMarker = `
      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="13" fill="${brandGreen}" stroke="none"/>
        <text x="15" y="20" text-anchor="middle" font-size="14" fill="#FFFFFF" font-family="Arial, sans-serif">${symbol}</text>
      </svg>
    `;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgMarker),
      scaledSize: new window.google.maps.Size(30, 30),
      anchor: new window.google.maps.Point(15, 15),
      origin: new window.google.maps.Point(0, 0),
      labelOrigin: new window.google.maps.Point(15, 15)
    };
  };

  const createInfoWindowContent = (venue) => {
    return `
      <div style="padding: 10px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #006548; font-size: 16px;">${venue.name}</h3>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${venue.description || ''}</p>
        <p style="margin: 0 0 8px 0; color: #888; font-size: 12px;">
          ${venue.address.street}, ${venue.address.city}
        </p>
        <div style="text-align: right; margin-top: 10px;">
          <button 
            onclick="window.dispatchEvent(new CustomEvent('venueNavigate', { detail: '${venue.id}' }))"
            style="
              background: #006548; 
              color: white; 
              border: none; 
              padding: 6px 12px; 
              border-radius: 4px; 
              font-size: 12px; 
              cursor: pointer;
            "
          >
            View Details
          </button>
        </div>
      </div>
    `;
  };

  const fitMapToBounds = (map, venues) => {
    const bounds = new window.google.maps.LatLngBounds();
    
    venues.forEach(venue => {
      if (venue.coordinates && venue.coordinates.lat && venue.coordinates.lng) {
        bounds.extend({
          lat: venue.coordinates.lat,
          lng: venue.coordinates.lng
        });
      }
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
      // Ensure minimum zoom level
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
  };

  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap();
    }
  }, [initMap]);

  // Update markers when venues change
  useEffect(() => {
    if (mapInstanceRef.current && window.google) {
      addVenueMarkers(mapInstanceRef.current);
      if (venues.length > 1) {
        fitMapToBounds(mapInstanceRef.current, venues);
      }
    }
  }, [venues]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: `${height}px`,
        borderRadius: 8,
        overflow: 'hidden',
        ...mapStyle
      }}
    />
  );
};

const LoadingComponent = ({ height = 400 }) => (
  <View style={[styles.loadingContainer, { height }]}>
    <ActivityIndicator size="large" color="#006548" />
    <Text style={styles.loadingText}>Loading map...</Text>
  </View>
);

const ErrorComponent = ({ error, height = 400 }) => (
  <View style={[styles.errorContainer, { height }]}>
    <Text style={styles.errorText}>Failed to load map</Text>
    <Text style={styles.errorDetail}>
      {error?.message || 'Please check your internet connection'}
    </Text>
  </View>
);

const InteractiveMap = (props) => {
  const [error, setError] = useState(null);

  const renderMap = (status) => {
    switch (status) {
      case Status.LOADING:
        return <LoadingComponent height={props.height} />;
      case Status.FAILURE:
        return <ErrorComponent error={error} height={props.height} />;
      case Status.SUCCESS:
        return <MapComponent {...props} />;
      default:
        return <LoadingComponent height={props.height} />;
    }
  };

  useEffect(() => {
    // Listen for venue navigation events from info windows
    const handleVenueNavigate = (event) => {
      const venueId = event.detail;
      if (props.onVenueClick) {
        const venue = props.venues.find(v => v.id === venueId);
        if (venue) {
          props.onVenueClick(venue);
        }
      } else {
        // Default navigation behavior when no onVenueClick prop
        if (typeof window !== 'undefined') {
          window.location.href = `/venues/${venueId}`;
        }
      }
    };

    window.addEventListener('venueNavigate', handleVenueNavigate);
    return () => {
      window.removeEventListener('venueNavigate', handleVenueNavigate);
    };
  }, [props.venues, props.onVenueClick]);

  if (!mapsConfig.apiKey || mapsConfig.apiKey === 'your_google_maps_api_key_here') {
    return (
      <View style={[styles.errorContainer, { height: props.height || 400 }]}>
        <Text style={styles.errorText}>Google Maps API Key Required</Text>
        <Text style={styles.errorDetail}>
          Please add your Google Maps API key to the environment configuration
        </Text>
      </View>
    );
  }

  return (
    <Wrapper
      apiKey={mapsConfig.apiKey}
      libraries={mapsConfig.libraries}
      render={renderMap}
      callback={(status, loader) => {
        if (status === Status.FAILURE) {
          console.error('Google Maps failed to load:', loader);
          setError(new Error('Google Maps API failed to load'));
        }
      }}
    />
  );
};

export default InteractiveMap;