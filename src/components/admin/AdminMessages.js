import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { MessageSquare, Trash2, Send, ArrowLeft, X, ZoomIn, Image, Camera } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { EmailContext } from '../EmailContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost/apii/components/admin_messages.php';

const AdminMessages = () => {
  const [senders, setSenders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  
  // New states for image handling
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const { email } = useContext(EmailContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Add login validation
  useEffect(() => {
    if (email) {
      // Fetch user ID based on email
      fetch(`http://localhost/apii/components/getUserId.php?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => {
          if (data.userId) {
            setUserId(data.userId);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            navigate('/auth');
          }
        })
        .catch(error => {
          console.error('Error fetching user ID:', error);
          setIsLoggedIn(false);
          navigate('/auth');
        });
    } else {
      setIsLoggedIn(false);
      navigate('/auth');
    }
  }, [email, navigate]);

  // Fetch all message senders when component mounts
  useEffect(() => {
    fetchSenders();

    // Establish WebSocket connection
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      // console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages(prev => [...prev, data]);
      }
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch user messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchUserMessages(selectedUser.user_id);
    }
  }, [selectedUser]);

  // Close enlarged image when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && enlargedImage) {
        setEnlargedImage(null);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [enlargedImage]);

  // Camera management
  useEffect(() => {
    if (showCamera) {
      startCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera]);

  const fetchSenders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?action=senders`, {
        params: {
          adminEmail: email
        }
      });
      setSenders(response.data.senders || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching senders:', err);
      setError('Failed to load message senders. Please try again.');
      setLoading(false);
    }
  };

  const fetchUserMessages = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/user/${userId}`, {
        params: {
          adminEmail: email // Add admin email to the request
        }
      });
      setMessages(response.data.messages || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setError(null);
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  // Image handling functions
  const handleImageClick = (imageSrc) => {
    setEnlargedImage(imageSrc);
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const startCamera = async () => {
    try {
      if (!videoRef.current) {
        throw new Error("Video element not mounted yet");
      }

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

      setShowCamera(true);
    } catch (err) {
      console.error("Camera Error:", err);
      setError(`Camera error: ${err.message}`);
    }
  };

  const closeCamera = () => {
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
  };

  const capturePhoto = () => {
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
  };

  const sendImageMessage = async () => {
    if (!selectedFile || !selectedUser) return;

    try {
      setLoading(true);

      // Upload image first
      const formData = new FormData();
      formData.append('image', selectedFile);

      const uploadResponse = await fetch('http://localhost/apii/components/upload.php', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.status !== 'success') {
        throw new Error(uploadData.message || 'Failed to upload image');
      }

      const imageUrl = uploadData.imageUrl;

      // Send message with image
      const response = await axios.post(API_URL, {
        action: 'reply',
        userId: selectedUser.user_id,
        message: replyText || 'Image message',
        adminEmail: email,
        imageUrl: imageUrl
      });

      if (response.data.success) {
        fetchUserMessages(selectedUser.user_id);
        setReplyText('');
        setSelectedFile(null);
        setPreviewUrl(null);

        // Send message via WebSocket
        if (socket && isConnected) {
          socket.send(JSON.stringify({
            type: 'message',
            senderId: 'admin',
            receiverId: selectedUser.user_id,
            message: replyText || 'Image message',
            imageUrl: imageUrl,
            isAdmin: true,
            timestamp: new Date().toISOString()
          }));
        }
      }
    } catch (err) {
      console.error('Error sending image message:', err);
      setError('Failed to send image message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (selectedFile) {
      // If there's an image, send image message
      await sendImageMessage();
      return;
    }

    if (!replyText.trim()) return;

    try {
      const response = await axios.post(API_URL, {
        action: 'reply',
        userId: selectedUser.user_id,
        message: replyText,
        adminEmail: email
      });

      if (response.data.success) {
        fetchUserMessages(selectedUser.user_id);
        setReplyText('');

        // Send message via WebSocket
        if (socket && isConnected) {
          socket.send(JSON.stringify({
            type: 'message',
            senderId: 'admin',
            receiverId: selectedUser.user_id,
            message: replyText,
            isAdmin: true,
            timestamp: new Date().toISOString()
          }));
        }
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/${messageId}`);

      if (response.data.success) {
        // Remove the deleted message from the messages array
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message. Please try again.');
    }
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setMessages([]);
    setSelectedFile(null);
    setPreviewUrl(null);
    fetchSenders(); // Refresh senders list
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Login Required</h2>
            <p className="mt-2 text-gray-600">Please log in to access the admin dashboard.</p>
            <div className="mt-6">
              <a
                href="/auth"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout currentPage="messages">
      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {!selectedUser ? (
            // Senders List View
            <div>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Client Messages</h2>
                <p className="text-gray-600 text-sm">View and respond to client inquiries</p>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading messages...</p>
                </div>
              ) : senders.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No messages yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {senders.map((sender) => (
                    <li key={sender.user_id} className="hover:bg-gray-50">
                      <button
                        className="w-full text-left p-4 flex items-center"
                        onClick={() => handleUserSelect(sender)}
                      >
                        <div className="bg-indigo-100 text-indigo-800 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                          {sender.profile_image ? (
                            <img src={`http://localhost/apii/components/${sender.profile_image}`} alt="Profile" className="rounded-full w-10 h-10 object-cover" />
                          ) : (
                            sender.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{sender.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 truncate">
                              {sender.email}
                            </span>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">
                                {sender.message_count} messages
                              </span>
                              {parseInt(sender.unread_count) > 0 && (
                                <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
                                  {sender.unread_count} new
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            // Conversation View
            <div className="flex flex-col h-[calc(100vh-12rem)]">
              <div className="p-4 border-b flex items-center">
                <button
                  onClick={handleBackToList}
                  className="mr-3 p-1 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                  <p className="text-gray-600 text-sm">{selectedUser.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading conversation...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No messages in this conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdminMsg = msg.is_admin_message === "1" || msg.is_admin_message === 1;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isAdminMsg ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${isAdminMsg ? "bg-indigo-600 text-white" : "bg-gray-100 text-black"
                            }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">
                              {isAdminMsg ? "You" : selectedUser.name}
                            </span>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="ml-2 opacity-50 hover:opacity-100"
                              title="Delete message"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="whitespace-pre-line">{msg.message}</p>
                          {msg.image_path && (
                            <div className="relative mt-2 group">
                              <img
                                src={`${msg.image_path}`}
                                alt="Attached"
                                className="w-60 h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => handleImageClick(msg.image_path)}
                              />
                              {/* Hover overlay with zoom icon */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                                   onClick={() => handleImageClick(msg.image_path)}>
                                <ZoomIn size={24} className="text-white" />
                              </div>
                            </div>
                          )}
                          <div
                            className={`text-xs mt-1 ${isAdminMsg ? "text-indigo-200" : "text-gray-500"
                              }`}
                          >
                            {formatDate(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form with Image Support */}
              <form onSubmit={handleReplySubmit} className="p-4 border-t">
                {/* Image Preview */}
                {previewUrl && (
                  <div className="mb-4 relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-32 rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {/* Camera Button */}
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <Camera size={20} className="text-gray-600" />
                  </button>

                  {/* File Input Button */}
                  <button
                    type="button"
                    onClick={handleFileInputClick}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <Image size={20} className="text-gray-600" />
                  </button>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Text Input */}
                  <input
                    type="text"
                    value={replyText}
                    onChange={handleReplyChange}
                    placeholder="Type your reply..."
                    className="flex-1 border rounded-l-lg px-4 py-2"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg"
                    disabled={!replyText.trim() && !selectedFile}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
            <div className="relative w-full max-w-2xl mx-4">
              <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex justify-center space-x-6 mt-6">
                <button
                  onClick={capturePhoto}
                  className="bg-white rounded-full p-4 hover:bg-gray-200 transition"
                >
                  <Camera size={28} className="text-gray-800" />
                </button>
                <button
                  onClick={closeCamera}
                  className="bg-red-500 text-white rounded-full px-6 py-2 hover:bg-red-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Enlargement Modal */}
        {enlargedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-full max-h-full">
              {/* Close button */}
              <button
                onClick={closeEnlargedImage}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors mt-4"
                title="Close (ESC)"
              >
                <X size={32} />
              </button>
              
              {/* Enlarged image */}
              <img
                src={enlargedImage}
                alt="Enlarged view"
                className="max-w-[70vw] max-h-[70vh] object-contain rounded-lg shadow-2xl"
                onClick={closeEnlargedImage}
              />
              
              {/* Click outside overlay */}
              <div 
                className="absolute inset-0 -z-10"
                onClick={closeEnlargedImage}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;