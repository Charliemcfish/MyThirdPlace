import { mapsConfig } from '../config/maps';

class GeocodingService {
  constructor() {
    this.geocoder = null;
    this.autocompleteService = null;
    this.placesService = null;
  }

  // Initialize Google Maps services
  initialize() {
    if (window.google && window.google.maps) {
      this.geocoder = new window.google.maps.Geocoder();
      this.autocompleteService = new window.google.maps.places.AutocompleteService();
      // PlacesService needs a map or div element, we'll initialize it when needed
    }
  }

  // Convert address string to coordinates
  async geocodeAddress(address) {
    return new Promise((resolve, reject) => {
      if (!this.geocoder) {
        this.initialize();
      }

      if (!this.geocoder) {
        reject(new Error('Google Maps Geocoder not available'));
        return;
      }

      this.geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const location = result.geometry.location;
          
          resolve({
            coordinates: {
              lat: location.lat(),
              lng: location.lng(),
              accuracy: result.geometry.location_type
            },
            formatted_address: result.formatted_address,
            place_id: result.place_id,
            address_components: result.address_components,
            types: result.types,
            viewport: result.geometry.viewport
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  // Convert coordinates to formatted address
  async reverseGeocode(lat, lng) {
    return new Promise((resolve, reject) => {
      if (!this.geocoder) {
        this.initialize();
      }

      if (!this.geocoder) {
        reject(new Error('Google Maps Geocoder not available'));
        return;
      }

      const latLng = { lat, lng };

      this.geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          
          resolve({
            formatted_address: result.formatted_address,
            address_components: result.address_components,
            place_id: result.place_id,
            types: result.types
          });
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }

  // Get address autocomplete suggestions
  async getAddressSuggestions(input, options = {}) {
    return new Promise((resolve, reject) => {
      // Check if Google Maps API is loaded
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        reject(new Error('Google Maps API not loaded yet'));
        return;
      }

      if (!this.autocompleteService) {
        this.initialize();
      }

      if (!this.autocompleteService) {
        reject(new Error('Google Maps Places service not available'));
        return;
      }

      const defaultOptions = {
        input,
        types: ['establishment', 'geocode'],
        componentRestrictions: options.country ? { country: options.country } : undefined
      };

      this.autocompleteService.getPlacePredictions(
        { ...defaultOptions, ...options },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions.map(prediction => ({
              place_id: prediction.place_id,
              description: prediction.description,
              structured_formatting: prediction.structured_formatting,
              types: prediction.types,
              terms: prediction.terms
            })));
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Places autocomplete failed: ${status}`));
          }
        }
      );
    });
  }

  // Get detailed place information by place ID
  async getPlaceDetails(placeId) {
    return new Promise((resolve, reject) => {
      // Create a temporary div for PlacesService if not exists
      if (!this.placesService) {
        const div = document.createElement('div');
        this.placesService = new window.google.maps.places.PlacesService(div);
      }

      const request = {
        placeId,
        fields: [
          'name', 'formatted_address', 'geometry', 'place_id',
          'address_components', 'types', 'website', 'formatted_phone_number',
          'opening_hours', 'photos'
        ]
      };

      this.placesService.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const location = place.geometry.location;
          
          resolve({
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address,
            coordinates: {
              lat: location.lat(),
              lng: location.lng()
            },
            address_components: place.address_components,
            types: place.types,
            website: place.website,
            phone: place.formatted_phone_number,
            opening_hours: place.opening_hours,
            photos: place.photos
          });
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      });
    });
  }

  // Validate address completeness
  validateAddress(addressComponents) {
    if (!addressComponents || !Array.isArray(addressComponents)) {
      return {
        isValid: false,
        errors: ['Address components missing']
      };
    }

    const hasStreetNumber = addressComponents.some(comp => 
      comp.types.includes('street_number')
    );
    const hasRoute = addressComponents.some(comp => 
      comp.types.includes('route')
    );
    const hasLocality = addressComponents.some(comp => 
      comp.types.includes('locality') || comp.types.includes('administrative_area_level_1')
    );
    const hasCountry = addressComponents.some(comp => 
      comp.types.includes('country')
    );

    const errors = [];
    if (!hasRoute) errors.push('Street name is required');
    if (!hasLocality) errors.push('City or locality is required');
    if (!hasCountry) errors.push('Country is required');

    return {
      isValid: errors.length === 0,
      errors,
      hasStreetNumber,
      hasRoute,
      hasLocality,
      hasCountry
    };
  }

  // Format address for consistent display
  formatDisplayAddress(addressData) {
    if (typeof addressData === 'string') {
      return addressData;
    }

    if (addressData.formatted_address) {
      return addressData.formatted_address;
    }

    if (addressData.address_components) {
      const components = addressData.address_components;
      const streetNumber = components.find(c => c.types.includes('street_number'))?.long_name || '';
      const route = components.find(c => c.types.includes('route'))?.long_name || '';
      const locality = components.find(c => c.types.includes('locality'))?.long_name || '';
      const country = components.find(c => c.types.includes('country'))?.long_name || '';

      const parts = [
        streetNumber && route ? `${streetNumber} ${route}` : route,
        locality,
        country
      ].filter(Boolean);

      return parts.join(', ');
    }

    return 'Address not available';
  }

  // Calculate bounds for multiple coordinates
  getBounds(coordinates) {
    if (!coordinates || coordinates.length === 0) {
      return null;
    }

    if (!window.google || !window.google.maps) {
      return null;
    }

    const bounds = new window.google.maps.LatLngBounds();
    
    coordinates.forEach(coord => {
      if (coord.lat && coord.lng) {
        bounds.extend({ lat: coord.lat, lng: coord.lng });
      }
    });

    return bounds.isEmpty() ? null : bounds;
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(point1, point2, unit = 'km') {
    if (!point1 || !point2 || !point1.lat || !point1.lng || !point2.lat || !point2.lng) {
      return null;
    }

    const R = unit === 'km' ? 6371 : 3959; // Earth's radius in km or miles
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLon = this.toRadians(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  // Format distance for display
  formatDistance(distance, unit = 'km') {
    if (!distance && distance !== 0) {
      return 'Distance unknown';
    }

    if (distance < 1) {
      const meters = Math.round(distance * 1000);
      return unit === 'km' ? `${meters}m` : `${Math.round(distance * 5280)}ft`;
    }

    return `${distance}${unit}`;
  }

  // Helper function to convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get current user location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Location access denied';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Batch geocode multiple addresses
  async batchGeocode(addresses) {
    const results = [];
    
    for (const address of addresses) {
      try {
        const result = await this.geocodeAddress(address);
        results.push({ address, result, success: true });
      } catch (error) {
        results.push({ address, error: error.message, success: false });
      }
    }
    
    return results;
  }
}

// Create and export singleton instance
const geocodingService = new GeocodingService();
export default geocodingService;