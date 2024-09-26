import React, { useState, useCallback, useEffect } from 'react';

const MicrophoneControl: React.FC<{ toggleMic: (isOn: boolean) => void; isMicOn: boolean }> = ({ toggleMic, isMicOn }) => {
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startListening = useCallback(async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      setError(null);
      return audioStream;
    } catch (err) {
      setError('Error accessing microphone: ' + (err as Error).message);
      return null;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const handleToggle = useCallback(async () => {
    if (isMicOn) {
      stopListening();
      toggleMic(false);
    } else {
      const audioStream = await startListening();
      if (audioStream) {
        toggleMic(true);
      }
    }
  }, [isMicOn, startListening, stopListening, toggleMic]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return (
    <>
      <i
        className={`fa ${isMicOn ? 'fa-microphone-slash' : 'fa-microphone'}`}
        onClick={handleToggle}
      ></i>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </>
  );
};

export default MicrophoneControl;