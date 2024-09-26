// getLocation.tsx
export const getLocation = (
    onSuccess: (position: GeolocationPosition) => void,
    onError: (error: GeolocationPositionError) => void
  ) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
      console.error('Geolocation is not supported by this browser.');
  
      // Create a custom GeolocationPositionError
      const error: GeolocationPositionError = {
        code: 0, // 0 for unknown error
        message: 'Geolocation is not supported by this browser.',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };
  
      onError(error);
    }
  };


  
  