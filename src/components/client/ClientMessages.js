import React, { useState, useEffect, useRef, useContext } from 'react';
import { Info, Phone, Video, Image, Camera, Send, Copy, Trash, CornerUpLeft, Menu, X, ZoomIn } from 'lucide-react';
import { EmailContext } from '../utils/EmailContext';

export default function ClientMessages() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // New state for image enlargement
  const [enlargedImage, setEnlargedImage] = useState(null);
  
  const { email } = useContext(EmailContext);

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  // Track sent messages to prevent duplicates
  const [processedMessageIds] = useState(new Set());

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = 'http://localhost/apii/components/send_message.php';

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Image enlargement functions
  const handleImageClick = (imageSrc) => {
    setEnlargedImage(imageSrc);
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

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

  // Get user ID from email
  const getUserId = async () => {
    if (!email) {
      setError('Email is missing from context');
      setLoading(false);
      return null;
    }

    try {
      const userIdResponse = await fetch(`${API_BASE_URL}?email=${encodeURIComponent(email)}`);
      if (!userIdResponse.ok) {
        throw new Error('Failed to retrieve user ID');
      }
      const userIdData = await userIdResponse.json();
      console.log('User ID response:', userIdData); // Debug log
      if (userIdData.status !== 'success') {
        throw new Error('Failed to retrieve user ID');
      }

      setUserId(userIdData.user_id);
      return userIdData.user_id;
    } catch (error) {
      console.error('Failed to get user ID:', error);
      setError(`Failed to get user ID: ${error.message}`);
      return null;
    }
  };

  const countMessages = async (adminId, clientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}?count_messages=true&admin_id=${adminId}&client_id=${clientId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setMessageCount(data.message_count);
        console.log(`Total messages between admin and client: ${data.message_count}`);
      } else {
        console.error('Error counting messages:', data.message);
      }
    } catch (error) {
      console.error('Failed to count messages:', error);
    }
  };

  // Fetch messages from API
const fetchMessages = async () => {
  if (!email) {
    setError('Email is missing from context');
    setLoading(false);
    return;
  }

  if (!selectedAdmin) {
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const currentUserId = userId || await getUserId();
    if (!currentUserId) {
      setError('Failed to retrieve user ID');
      setLoading(false);
      return;
    }

    // Use the correct parameter names
    const apiUrl = `${API_BASE_URL}?sender_id=${currentUserId}&admin_id=${selectedAdmin.id}`;
    console.log('Fetching messages from:', apiUrl); // Debug log
    
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Messages response:', data);
    if (data.status === 'success') {
      processedMessageIds.clear();

      // Ensure each message has a unique ID
      const messagesWithIds = data.messages.map(msg => ({
        ...msg,
        // Use the database ID if available, otherwise generate one
        id: msg.id || `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      setMessages(messagesWithIds);
    } else {
      setError(data.message || 'Failed to fetch messages');
    }
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    setError(`Failed to fetch messages: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  // Fetch admin messages
  const fetchAdminMessages = async () => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}?admin_messages=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setAdminMessages(data.adminMessages);
      } else {
        console.error('API error:', data.message);
        setError(`API error: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to fetch admin messages:', error);
      setError(`Failed to fetch admin messages: ${error.message}`);
    }
  };

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}?all_admins=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setAdmins(data.admins);
      } else {
        console.error('API error:', data.message);
        setError(`API error: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setError(`Failed to fetch admins: ${error.message}`);
    }
  };

  const sendImageMessage = async () => {
    if (!selectedFile) return;
    if (!selectedAdmin) {
      setError('Please select an admin first');
      return;
    }
    if (!socket || !isConnected) {
      setError('Connection lost. Trying to reconnect...');
      return;
    }

    try {
      setError(null);
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
      // Generate a unique message ID
      const messageId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Send message via WebSocket
      socket.send(JSON.stringify({
        type: 'message',
        messageId: messageId, // Include the messageId in the request
        senderId: userId,
        receiverId: selectedAdmin.id,
        message: message || 'Image message',
        isAdmin: false,
        imageUrl: imageUrl
      }));

      // Track this message ID as processed
      processedMessageIds.add(messageId);

      // Optimistically add the message to UI
      const newMessage = {
        id: messageId,
        text: message || 'Image message',
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: imageUrl
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setSelectedFile(null);
      setPreviewUrl(null);

      // Update message count
      if (selectedAdmin && userId) {
        countMessages(selectedAdmin.id, userId);
      }
    } catch (error) {
      console.error('Failed to send image message:', error);
      setError(`Failed to send image message: ${error.message}`);
    } finally {
      setLoading(false);
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

  useEffect(() => {
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
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        // You can add logic here to attempt to reconnect
      }, 5000);
    };

    ws.onerror = (error) => {
      // console.error('WebSocket error:', error);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        // You can add logic here to attempt to reconnect
      }, 5000);
    };

    // Improved WebSocket onmessage handler to prevent duplicates
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        // Skip if this is our own message (handled by optimistic update)
        if (data.isOwnMessage) {
          return;
        }

        // Use server-provided ID if available
        const messageId = data.messageId || `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Check for duplicates
        if (processedMessageIds.has(messageId)) {
          console.log(`Skipping duplicate message with ID: ${messageId}`);
          return;
        }

        processedMessageIds.add(messageId);

        const newMessage = {
          id: messageId,
          text: data.message,
          sender: 'admin', // Always 'admin' for messages received via WS
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageUrl: data.imageUrl || null
        };

        setMessages(prev => [...prev, newMessage]);
      }
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Register user with WebSocket server when userId is available
  useEffect(() => {
    if (socket && isConnected && userId) {
      socket.send(JSON.stringify({
        type: 'register',
        userId: userId
      }));
    }
  }, [socket, isConnected, userId]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (!selectedAdmin) {
      setError('Please select an admin first');
      return;
    }
    if (!socket || !isConnected) {
      setError('Connection lost. Trying to reconnect...');
      return;
    }

    try {
      setError(null);

      // Generate a unique message ID that will be used both for optimistic update and WS
      const messageId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Track this message ID as processed
      processedMessageIds.add(messageId);

      // Optimistic update
      const newMessage = {
        id: messageId,
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: null
      };

      setMessages(prev => {
        // Check if message with this ID already exists
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) {
          return prev;
        }
        return [...prev, newMessage];
      });
      setMessage('');

      // Send via WebSocket with the same ID
      socket.send(JSON.stringify({
        type: 'message',
        messageId: messageId,
        senderId: userId,
        receiverId: selectedAdmin.id,
        message: message,
        isAdmin: false,
        imageUrl: null,
        isOwnMessage: true // Add this flag to identify our own messages
      }));

      // Update message count
      if (selectedAdmin && userId) {
        countMessages(selectedAdmin.id, userId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(`Failed to send message: ${error.message}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (selectedFile) {
        sendImageMessage();
      } else {
        sendMessage();
      }
    }
  };

  const handleMessageClick = (msg) => {
    setSelectedMessage(selectedMessage === msg ? null : msg);
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Message copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy message: ', err);
    });
  };

  const handleUnsendMessage = async (messageId) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message_id: messageId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setMessages(messages.filter(msg => msg.id !== messageId));
      } else {
        console.error('Error unsending message:', data.message);
        setError(`Error unsending message: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to unsend message:', error);
      setError(`Failed to unsend message: ${error.message}`);
    }
  };

  const markMessagesAsRead = async (adminId) => {
    if (!userId || !adminId) return;

    try {
      const response = await fetch(`${API_BASE_URL}?mark_as_read=true`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_id: adminId,
          sender_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update the local admins state to reflect the read status
      setAdmins(prevAdmins =>
        prevAdmins.map(admin =>
          admin.id === adminId
            ? { ...admin, unreadCount: 0 }
            : admin
        )
      );
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Update the handleAdminClick function
const handleAdminClick = (admin) => {
  setSelectedAdmin(admin);
  setMessages([]);
  processedMessageIds.clear();
  setShowSidebar(false);
  markMessagesAsRead(admin.id);
  if (userId) {
    countMessages(admin.id, userId);
  }
  
  // Force a refresh of messages
  setTimeout(() => {
    fetchMessages();
  }, 100);
};

 useEffect(() => {
  if (selectedAdmin && userId) {
    fetchMessages();
  }
}, [selectedAdmin, userId]);

// Add this useEffect to handle initial setup
useEffect(() => {
  const initializeComponent = async () => {
    await getUserId();
    await fetchAdmins();
  };

  if (email) {
    initializeComponent();
  }
}, [email]);

  useEffect(() => {
    if (selectedAdmin && userId) {
      // Initial load of messages
      fetchMessages();
      countMessages(selectedAdmin.id, userId);
    }
  }, [selectedAdmin, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
            setError('Please log in to access messages');
          }
        })
        .catch(error => {
          console.error('Error fetching user ID:', error);
          setIsLoggedIn(false);
          setError('Failed to verify login status');
        });
    } else {
      setIsLoggedIn(false);
      setError('Please log in to access messages');
    }
  }, [email]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Login Required</h2>
            <p className="mt-2 text-gray-600">Please log in to access your messages.</p>
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
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-300 bg-white shadow-sm">
        {/* Mobile menu button - only shown on small screens */}
        <button
          className="md:hidden mr-2"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center">
          {selectedAdmin && (
            <>
              <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
              <span className="font-semibold text-lg text-black">{selectedAdmin.username}</span>
            </>
          )}
          {!selectedAdmin && (
            <span className="font-semibold text-lg text-black">Messages</span>
          )}
        </div>
        <div className="flex items-center ml-auto space-x-4">
          {selectedAdmin && (
            <>
              <Phone className="text-gray-600" size={20} />
              <Video className="text-gray-600" size={20} />
              <Info className="text-gray-600" size={20} />
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Admins List */}
        <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-1/3 lg:w-1/4 border-r border-gray-300 bg-white overflow-y-auto absolute md:relative z-10 h-full`}>
          <div className="p-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold">Admins</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {admins.map(admin => (
              <li
                key={`admin-${admin.id}`}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedAdmin?.id === admin.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleAdminClick(admin)}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full mr-3 relative">
                    {admin.image_path ? (
                      <img
                        src={`http://${window.location.hostname}/apii/components/${admin.image_path}`}
                        alt={admin.username}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                    )}
                    {admin.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {admin.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900">{admin.username}</p>
                    </div>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Admin Messages Header - Mobile only */}
          {selectedAdmin && (
            <div className="md:hidden p-4 border-b border-gray-300 bg-white">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h2 className="font-semibold">{selectedAdmin.username}</h2>
                  <p className="text-sm text-gray-500">{selectedAdmin.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {/* Error display */}
            {error && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
                <p>Error: {error}</p>
                <button
                  className="text-red-700 underline ml-2"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Admin selection prompt */}
            {!selectedAdmin && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="bg-white p-6 rounded-lg shadow-sm max-w-md text-center">
                  <h3 className="text-xl font-medium mb-2">Select an Admin</h3>
                  <p>Please select an admin from the list to start or continue a conversation.</p>
                  <button
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded md:hidden"
                    onClick={() => setShowSidebar(true)}
                  >
                    Show Admin List
                  </button>
                </div>
              </div>
            )}

            {/* Camera Preview */}
            {showCamera && (
              <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
                <div className="relative w-full max-w-2xl mx-4">
                  <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                    <video
                      key="camera-preview"
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
                      aria-label="Take photo"
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

            {/* Image Preview */}
            {previewUrl && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-96 object-contain"
                  />
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendImageMessage}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {selectedAdmin && (
              <div className="space-y-4">
                <div className="text-center text-gray-600 mb-4">
                  Total Messages: {messageCount}
                </div>
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={`msg-${msg.id}`} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender !== 'me' && (
                        <div className="h-8 w-8 bg-gray-300 rounded-full mr-3 flex-shrink-0 self-end overflow-hidden">
                          {selectedAdmin.image_path ? (
                            <img
                              src={`http://${window.location.hostname}/apii/components/${selectedAdmin.image_path}`}
                              alt={selectedAdmin.username}
                              className="h-8 w-8 object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                          )}
                        </div>
                      )}
                      <div className={`max-w-xs md:max-w-md p-3 rounded-lg relative ${msg.sender === 'me'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-black'
                        }`}
                        onClick={() => handleMessageClick(msg)}
                        style={{ wordWrap: 'break-word' }}
                      >
                        {msg.sender === 'me' ? 'You' : selectedAdmin.username}
                        {msg.imageUrl && (
                          <div className="relative mt-2 group">
                            <img
                              src={msg.imageUrl}
                              alt="Message attachment"
                              className="w-60 h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageClick(msg.imageUrl);
                              }}
                            />
                            {/* Hover overlay with zoom icon */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleImageClick(msg.imageUrl);
                                 }}>
                              <ZoomIn size={24} className="text-white" />
                            </div>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end mt-1">
                          {msg.time && (
                            <span className={`text-xs ${msg.sender === 'me' ? 'text-white' : 'text-black'}`}>
                              {msg.time}
                            </span>
                          )}
                        </div>
                        {selectedMessage === msg && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white p-2 rounded shadow flex space-x-2 border border-gray-300 z-10">
                            <button onClick={() => handleCopyMessage(msg.text)}>
                              <Copy size={18} className="text-gray-900" />
                            </button>
                            <button onClick={() => setMessage(`Reply to: ${msg.text}\n`)}>
                              <CornerUpLeft size={18} className="text-gray-900" />
                            </button>
                            {msg.sender === 'me' && (
                              <button onClick={() => handleUnsendMessage(msg.id)}>
                                <Trash size={18} className="text-red-500" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-300 bg-white">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (!selectedAdmin) {
                    setError('Please select an admin first');
                    return;
                  }
                  setShowCamera(true);
                }}
                className="p-2 rounded-full hover:bg-gray-200"
                disabled={!selectedAdmin}
              >
                <Camera size={24} className={selectedAdmin ? "text-blue-800" : "text-gray-400"} />
              </button>
              <button
                onClick={() => {
                  if (!selectedAdmin) {
                    setError('Please select an admin first');
                    return;
                  }
                  handleImageClick();
                }}
                disabled={!selectedAdmin}
              >
                <Image size={24} className={selectedAdmin ? "text-blue-800" : "text-gray-400"} />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedAdmin ? "Message" : "Select an admin to start messaging"}
                disabled={!selectedAdmin}
                className="flex-1 bg-gray-200 rounded-full py-2 px-4 focus:outline-none text-gray-800"
              />
              {message.trim() || selectedFile ? (
                <button
                  onClick={selectedFile ? sendImageMessage : sendMessage}
                  className="p-2 rounded-full hover:bg-gray-200"
                  disabled={!selectedAdmin}
                >
                  <Send size={24} className={selectedAdmin ? "text-blue-800" : "text-gray-400"} />
                </button>
              ) : (
                <>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
  );
}