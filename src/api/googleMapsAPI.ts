// googleMapsAPI.ts

import axios from 'axios';

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface Location {
  lat: number;
  lng: number;
}

interface Viewport {
  northeast: Location;
  southwest: Location;
}

interface PlaceDetailsResponse {
  results: {
    geometry: {
      location: Location;
      viewport: Viewport;
    };
  }[];
}

export const getPlaceDetails = async (address: string): Promise<PlaceDetailsResponse | null> => {
  try {
    const response = await axios.get<PlaceDetailsResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};

export const getPlaceSuggestions = async (query: string): Promise<string[]> => {
  try {
    const response = await fetch(`/api/maps/api/place/autocomplete/json?input=${query}&key=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching suggestions: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.predictions.map((prediction: { description: string }) => prediction.description);
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
    return []; // Return an empty array on error
  }
}


export const getDirections = async (origin: string, destination: string, mode: 'driving' | 'bicycling' | 'transit' | 'walking' = 'driving') => {
  try {
    const response = await axios.get('http://localhost:5000/api/directions', {
      params: {
        origin,
        destination,
        mode,
      },
    });
    return response.data; // Return the directions data
  } catch (error) {
    console.error('Error fetching directions:', error);
    throw error; // Rethrow the error to handle it in the component
  }
};

