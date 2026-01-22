import { Loader } from '@googlemaps/js-api-loader';
import { mapsConfig, defaultMapOptions, categoryColors, categoryIcons } from '../config/maps';
import geocodingService from './geocoding';

class MapsService {
  constructor() {
    this.isLoaded = false;
    this.loadPromise = null;
    this.markerClusterer = null;
  }

  // Load Google Maps API
  async loadGoogleMaps() {
    if (this.isLoaded && window.google && window.google.maps) {
      return window.google.maps;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise(async (resolve, reject) => {
      try {
        const loader = new Loader({
          apiKey: mapsConfig.apiKey,
          version: mapsConfig.version,
          libraries: mapsConfig.libraries,
          region: mapsConfig.region,
          language: mapsConfig.language
        });

        const google = await loader.load();
        this.isLoaded = true;
        
        // Initialize geocoding service after maps load
        geocodingService.initialize();
        
        resolve(google.maps);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        reject(error);
      }
    });

    return this.loadPromise;
  }

  // Initialize map instance
  async initializeMap(container, options = {}) {
    const maps = await this.loadGoogleMaps();
    
    const mapOptions = {
      ...defaultMapOptions,
      center: options.center || { lat: 51.5074, lng: -0.1278 }, // Default to London
      zoom: options.zoom || 10,
      ...options
    };

    return new maps.Map(container, mapOptions);
  }

  // Add venue pins to map
  addVenuePins(map, venues, options = {}) {
    if (!map || !venues || venues.length === 0) {
      return [];
    }

    const markers = [];
    const { onVenueClick, showInfoWindows = true } = options;

    // Create info window for venue details
    let infoWindow = null;
    if (showInfoWindows) {
      infoWindow = new window.google.maps.InfoWindow();
    }

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
        icon: this.createCustomMarkerIcon(venue.category, options.markerStyle)
      });

      // Add click listener
      marker.addListener('click', () => {
        if (showInfoWindows && infoWindow) {
          const infoContent = this.createInfoWindowContent(venue);
          infoWindow.setContent(infoContent);
          infoWindow.open(map, marker);
        }

        if (onVenueClick) {
          onVenueClick(venue, marker);
        }
      });

      // Store venue data with marker for reference
      marker.venueData = venue;
      markers.push(marker);
    });

    return markers;
  }

  // Create custom marker icon
  createCustomMarkerIcon(category, style = {}) {
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
    
    // Create a green circle marker with white emoji
    const svgMarker = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${brandGreen}" stroke="#FFFFFF" stroke-width="2"/>
        <text x="16" y="21" text-anchor="middle" font-size="16" fill="#FFFFFF">${symbol}</text>
      </svg>
    `;
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgMarker),
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16),
      origin: new window.google.maps.Point(0, 0),
      ...style
    };
  }

  // Create info window content
  createInfoWindowContent(venue) {
    const imageUrl = venue.photos && venue.photos.length > 0 
      ? venue.photos[0] 
      : '/assets/venue-placeholder.png';

    return `
      <div style="padding: 12px; min-width: 250px; max-width: 300px;">
        ${venue.photos && venue.photos.length > 0 ? `
          <img 
            src="${imageUrl}" 
            style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;"
            alt="${venue.name}"
          />
        ` : ''}
        <h3 style="margin: 0 0 8px 0; color: #006548; font-size: 16px; font-weight: 600;">
          ${venue.name}
        </h3>
        ${venue.description ? `
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; line-height: 1.4;">
            ${venue.description.length > 100 ? venue.description.substring(0, 100) + '...' : venue.description}
          </p>
        ` : ''}
        <p style="margin: 0 0 8px 0; color: #888; font-size: 13px;">
          📍 ${venue.address.street}, ${venue.address.city}
        </p>
        ${venue.category ? `
          <span style="
            display: inline-block;
            background: ${categoryColors[venue.category] || categoryColors.default};
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            text-transform: capitalize;
            margin-bottom: 10px;
          ">
            ${venue.category.replace('-', ' ')}
          </span>
        ` : ''}
        <div style="text-align: right; margin-top: 12px;">
          <button 
            onclick="window.dispatchEvent(new CustomEvent('venueNavigate', { detail: '${venue.id}' }))"
            style="
              background: #006548; 
              color: white; 
              border: none; 
              padding: 8px 16px; 
              border-radius: 4px; 
              font-size: 13px; 
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s;
            "
            onmouseover="this.style.backgroundColor='#004a36'"
            onmouseout="this.style.backgroundColor='#006548'"
          >
            View Details
          </button>
        </div>
      </div>
    `;
  }

  // Fit map to bounds to show all venues
  fitMapToBounds(map, venues, padding = 50) {
    if (!map || !venues || venues.length === 0) {
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidCoordinates = false;
    
    venues.forEach(venue => {
      if (venue.coordinates && venue.coordinates.lat && venue.coordinates.lng) {
        bounds.extend({
          lat: venue.coordinates.lat,
          lng: venue.coordinates.lng
        });
        hasValidCoordinates = true;
      }
    });

    if (hasValidCoordinates && !bounds.isEmpty()) {
      map.fitBounds(bounds, padding);
      
      // Ensure minimum zoom level for single venues
      if (venues.length === 1) {
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom() > 15) map.setZoom(15);
          window.google.maps.event.removeListener(listener);
        });
      }
    }
  }

  // Get current user location
  async getCurrentLocation() {
    return geocodingService.getCurrentLocation();
  }

  // Calculate distances from user location to venues
  calculateDistancesToVenues(userLocation, venues) {
    if (!userLocation || !venues) {
      return venues;
    }

    return venues.map(venue => ({
      ...venue,
      distance: venue.coordinates 
        ? geocodingService.calculateDistance(userLocation, venue.coordinates)
        : null
    }));
  }

  // Sort venues by distance
  sortVenuesByDistance(venues, userLocation) {
    if (!userLocation) {
      return venues;
    }

    const venuesWithDistance = this.calculateDistancesToVenues(userLocation, venues);
    
    return venuesWithDistance.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }

  // Get venues within radius
  getVenuesWithinRadius(center, radius, venues, unit = 'km') {
    if (!center || !venues || !radius) {
      return venues;
    }

    return venues.filter(venue => {
      if (!venue.coordinates) return false;
      
      const distance = geocodingService.calculateDistance(center, venue.coordinates, unit);
      return distance !== null && distance <= radius;
    });
  }

  // Create directions URL
  createDirectionsUrl(destination, origin = null) {
    if (!destination || !destination.coordinates) {
      return null;
    }

    const { lat, lng } = destination.coordinates;
    const destParam = `${lat},${lng}`;
    
    if (origin) {
      const originParam = `${origin.lat},${origin.lng}`;
      return `https://www.google.com/maps/dir/${originParam}/${destParam}`;
    }
    
    return `https://www.google.com/maps/search/?api=1&query=${destParam}`;
  }

  // Open directions in maps app
  openDirections(destination, origin = null) {
    const url = this.createDirectionsUrl(destination, origin);
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Clear markers from map
  clearMarkers(markers) {
    if (markers && markers.length > 0) {
      markers.forEach(marker => marker.setMap(null));
    }
    return [];
  }

  // Update markers visibility based on filters
  filterMarkers(markers, filterFunction) {
    if (!markers || !filterFunction) {
      return markers;
    }

    markers.forEach(marker => {
      const isVisible = filterFunction(marker.venueData);
      marker.setVisible(isVisible);
    });

    return markers.filter(marker => marker.getVisible());
  }

  // Create marker clusterer for better performance with many venues
  async createMarkerClusterer(map, markers, options = {}) {
    // Note: Would need to install @googlemaps/markerclusterer for clustering
    // For now, return the markers as-is
    return markers;
  }

  // Add search control to map
  addSearchControl(map, onPlaceSelect) {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search for places...';
    searchInput.style.cssText = `
      margin: 10px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      width: 250px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    const searchBox = new window.google.maps.places.SearchBox(searchInput);
    map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(searchInput);

    // Bias search results towards current map bounds
    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      if (onPlaceSelect) {
        onPlaceSelect(places[0]);
      }

      // Focus map on first result
      const place = places[0];
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(15);
      }
    });

    return searchInput;
  }

  // Format distance for display
  formatDistance(distance, unit = 'km') {
    return geocodingService.formatDistance(distance, unit);
  }

  // Check if Google Maps API is loaded
  isApiLoaded() {
    return this.isLoaded && window.google && window.google.maps;
  }

  // Get map bounds as coordinates
  getMapBounds(map) {
    if (!map) return null;
    
    const bounds = map.getBounds();
    if (!bounds) return null;
    
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    return {
      northeast: { lat: ne.lat(), lng: ne.lng() },
      southwest: { lat: sw.lat(), lng: sw.lng() }
    };
  }

  // Convert address to coordinates
  async geocodeAddress(address) {
    return geocodingService.geocodeAddress(address);
  }

  // Get address from coordinates
  async reverseGeocode(lat, lng) {
    return geocodingService.reverseGeocode(lat, lng);
  }
}

// Create and export singleton instance
const mapsService = new MapsService();
export default mapsService;