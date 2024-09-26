/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, OverlayView, DirectionsRenderer } from '@react-google-maps/api';
import SearchBar from '../../components/search/searchBar';
import { getLocation } from '../../components/getLocation/getLocation';
import LocationButton from '../../components/getLocation/locationButton';
import Download from '../../components/download/download';

const containerStyle = {
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
};

const indiaBounds = {
  north: 37.0902,
  south: 8.0889,
  east: 97.4026,
  west: 68.1766,
};

const MapView: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLng | null>(null);
  const [isGeolocation, setIsGeolocation] = useState<boolean>(false);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  
  const mapRef = useRef<google.maps.Map | null>(null);

  const handlePlaceSelect = (location: { lat: number; lng: number }, bounds: { northeast: { lat: number; lng: number }, southwest: { lat: number; lng: number } }) => {
    const selectedLocation = new google.maps.LatLng(location.lat, location.lng);
    setCurrentLocation(selectedLocation);
    setIsGeolocation(false);

    const mapBounds = new window.google.maps.LatLngBounds(bounds.southwest, bounds.northeast);
    mapRef.current?.fitBounds(mapBounds);

    // Fetch directions from currentLocation to the selectedLocation

  };



  const handleLocationSuccess = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const newLocation = new google.maps.LatLng(latitude, longitude);
    setCurrentLocation(newLocation);
    setIsGeolocation(true);
    
    if (mapRef.current) {
      mapRef.current.panTo(newLocation);
      mapRef.current.setZoom(15);
    }
  };

  const handleLocationError = (error: GeolocationPositionError) => {
    console.error('Error fetching location:', error);
    setCurrentLocation(null);
    setIsGeolocation(false);
    if (mapRef.current) {
      mapRef.current.fitBounds(indiaBounds); 
    }
  };

  useEffect(() => {
    const handleGetLocation = () => {
      getLocation(handleLocationSuccess, handleLocationError);
    };

    handleGetLocation();

    return () => {};
  }, []);

  return (
    <div id="map-container" style={containerStyle}>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentLocation || { lat: 20.5937, lng: 78.9629 }} 
          zoom={5} 
          options={{
            disableDefaultUI: true,
            zoomControl: false,
            fullscreenControl: false,
            scaleControl: true,
            minZoom: 3,
            maxZoom: 20,
            restriction: {
              latLngBounds: {
                north: 85,
                south: -85,
                west: -180,
                east: 180,
              },
              strictBounds: true,
            },
            scrollwheel: true,
          }}
          onLoad={(map) => {
            mapRef.current = map;
            map.fitBounds(indiaBounds); 
          }}
        >
          {isGeolocation && currentLocation && (
            <OverlayView
              position={currentLocation}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="dot" />
            </OverlayView>
          )}
          {directions && (
            <DirectionsRenderer directions={directions} />
          )}
        </GoogleMap>
      </LoadScript>
      <Download />
      <SearchBar onPlaceSelect={handlePlaceSelect} />
      <LocationButton onSuccess={handleLocationSuccess} onError={handleLocationError} />
    </div>
  );
};

export default MapView;
