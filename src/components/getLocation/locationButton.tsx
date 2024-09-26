import React from 'react';
import { getLocation } from './getLocation';

const LocationButton: React.FC<{ onSuccess: (position: GeolocationPosition) => void; onError: (error: GeolocationPositionError) => void; }> = ({ onSuccess, onError }) => {
  const handleClick = () => {
    getLocation(onSuccess, onError);
  };

  return (
    <button className="location-button" onClick={handleClick}>
  <i className="fa fa-compass" aria-hidden="true"></i>
  </button>
  );
};

export default LocationButton;
