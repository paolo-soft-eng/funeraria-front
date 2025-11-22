import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      // First, show the camera UI (this will mount the video element)
      setShowCamera(true);
      
      // Wait a bit for the video element to mount
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!videoRef.current) {
        throw new Error("Video element failed to mount");
      }

      // Stop any existing stream
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      videoRef.current.srcObject = stream;

      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(resolve)
            .catch(err => {
              console.error("Play error:", err);
              throw new Error("Could not play video stream");
            });
        };
      });

    } catch (err) {
      console.error("Camera Error:", err);
      setError(`Camera error: ${err.message}`);
      setShowCamera(false); // Hide camera UI on error
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(blob => {
        if (!blob) return;

        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        closeCamera();
      }, 'image/jpeg', 0.95);
    }
  }, [closeCamera]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
  }, []);

  return {
    showCamera,
    selectedFile,
    previewUrl,
    error,
    videoRef,
    canvasRef,
    fileInputRef,
    setShowCamera,
    startCamera,
    closeCamera,
    capturePhoto,
    handleFileChange,
    clearFile,
    setError
  };
};