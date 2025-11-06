import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { MessageSquare, Trash2, Send, ArrowLeft, X, ZoomIn, Image, Camera, CornerUpLeft, Copy } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { EmailContext } from '../utils/EmailContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost/funeraria/api/components/admin_messages.php';

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

  // Image handling states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  // Reply functionality states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const { email } = useContext(EmailContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Activity logging function
  const addActivity = async (activityType, description, relatedId = null) => {
    try {
      await axios.post('http://localhost/funeraria/api/components/addActivity.php', {
        activity_type: activityType,
        description: description,
        related_id: relatedId,
        user_id: userId,
        user_name: userName
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Login validation
  useEffect(() => {
    if (email) {
      fetch(`http://localhost/funeraria/api/components/getUserId.php?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => {
          if (data.userId) {
            setUserId(data.userId);
            setUserName(data.userName || 'Admin');
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            navigate('/gomez/auth');
          }
        })
        .catch(error => {
          console.error('Error fetching user ID:', error);
          setIsLoggedIn(false);
          navigate('/gomez/auth');
        });
    } else {
      setIsLoggedIn(false);
      navigate('/gomez/auth');
    }
  }, [email, navigate]);

  // Fetch senders and establish WebSocket
  useEffect(() => {
    fetchSenders();

    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setSocket(ws);

      if (userId) {
        const registerMessage = {
          type: 'register',
          userId: 'admin_' + userId,
          isAdmin: true
        };
        ws.send(JSON.stringify(registerMessage));
      }
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
        // Check if this message is for the current conversation
        const isForCurrentUser = selectedUser &&
          ((data.isAdmin && data.senderId === 'admin_' + userId && selectedUser.user_id === data.receiverId) ||
            (!data.isAdmin && data.senderId === selectedUser.user_id));

        if (isForCurrentUser || data.isOwnMessage) {
          setMessages(prev => {
            // If this is a confirmation for our optimistic update, replace the temp message
            if (data.tempId) {
              const filtered = prev.filter(msg => msg.id !== data.tempId);
              return [...filtered, {
                id: data.id,
                message: data.message,
                timestamp: data.timestamp,
                image_path: data.imageUrl,
                is_admin_message: data.is_admin_message ? 1 : 0,
                reply_to_id: data.replyToId,
                reply_to_message: data.replyToMessage,
                reply_sender_name: data.replySenderName
              }];
            }

            // Avoid duplicates for regular messages
            if (prev.some(msg => msg.id === data.id)) {
              return prev;
            }
            return [...prev, {
              id: data.id,
              message: data.message,
              timestamp: data.timestamp,
              image_path: data.imageUrl,
              is_admin_message: data.is_admin_message ? 1 : 0,
              reply_to_id: data.replyToId,
              reply_to_message: data.replyToMessage,
              reply_sender_name: data.replySenderName
            }];
          });
        }
      }
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [userId]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch user messages when selected
  useEffect(() => {
    if (selectedUser) {
      fetchUserMessages(selectedUser.user_id);
    }
  }, [selectedUser]);

  // Close enlarged image on Escape
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
          adminEmail: email
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
    setReplyingTo(null);
    setSelectedMessage(null);
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  // Message interaction functions
  const handleMessageClick = (message) => {
    setSelectedMessage(selectedMessage?.id === message.id ? null : message);
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Message copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy message: ', err);
    });
  };

  const handleReplyToMessage = (message) => {
    const isAdminMsg = message.is_admin_message === "1" || message.is_admin_message === 1;

    setReplyingTo({
      id: message.id,
      text: message.message,
      sender: isAdminMsg ? 'You' : selectedUser.name,
      senderName: isAdminMsg ? 'You' : selectedUser.name
    });

    setSelectedMessage(null);

    // Focus on input
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.focus();
      }
    }, 100);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
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

      const formData = new FormData();
      formData.append('image', selectedFile);

      const uploadResponse = await fetch('http://localhost/funeraria/api/components/upload.php', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.status !== 'success') {
        throw new Error(uploadData.message || 'Failed to upload image');
      }

      const imageUrl = uploadData.imageUrl;

      const messageData = {
        action: 'reply',
        userId: selectedUser.user_id,
        message: replyText || 'Image message',
        adminEmail: email,
        imageUrl: imageUrl
      };

      // Add reply reference if replying
      if (replyingTo) {
        messageData.replyTo = replyingTo.id;
      }

      const response = await axios.post(API_URL, messageData);

      if (response.data.success) {
        fetchUserMessages(selectedUser.user_id);
        setReplyText('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setReplyingTo(null);

        addActivity(
          'Message',
          `Sent image message to client '${selectedUser.name}'`,
          selectedUser.user_id
        );

        // Send via WebSocket
        if (socket && isConnected) {
          socket.send(JSON.stringify({
            type: 'message',
            senderId: 'admin_' + userId,
            receiverId: selectedUser.user_id,
            message: replyText || 'Image message',
            imageUrl: imageUrl,
            isAdmin: true,
            timestamp: new Date().toISOString(),
            replyToId: replyingTo?.id || null
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
      await sendImageMessage();
      return;
    }

    if (!replyText.trim()) return;

    try {
      const messageId = 'temp-' + Date.now();

      // OPTIMISTIC UPDATE: Add message to UI immediately
      const tempMessage = {
        id: messageId,
        message: replyText,
        timestamp: new Date().toISOString(),
        is_admin_message: 1,
        reply_to_id: replyingTo?.id || null,
        sender_name: "You",
        // Include reply information for display
        reply_to_message: replyingTo?.text || null,
        reply_sender_name: replyingTo?.senderName || null
      };

      setMessages(prev => [...prev, tempMessage]);
      const messageText = replyText;
      const replyToId = replyingTo?.id || null;

      // Clear input immediately for better UX
      setReplyText('');
      setReplyingTo(null);

      // Ensure WebSocket is connected and registered
      if (socket && isConnected) {
        const registerMessage = {
          type: 'register',
          userId: 'admin_' + userId,
          isAdmin: true
        };
        socket.send(JSON.stringify(registerMessage));

        // Send the actual message
        const messageData = {
          type: 'message',
          senderId: 'admin_' + userId,
          receiverId: selectedUser.user_id,
          message: messageText,
          isAdmin: true,
          timestamp: new Date().toISOString(),
          replyToId: replyToId,
          tempId: messageId // Include temp ID to replace optimistic update
        };

        socket.send(JSON.stringify(messageData));

        addActivity(
          'Message',
          `Sent message to client '${selectedUser.name}': "${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}"`,
          selectedUser.user_id
        );
      } else {
        // Fallback to HTTP if WebSocket fails
        // Remove temp message before HTTP request
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        await sendViaHTTP(messageText, replyToId, messageId);
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
      // Refresh messages on error
      fetchUserMessages(selectedUser.user_id);
    }
  };

  const sendViaHTTP = async (messageText, replyToId, tempMessageId) => {
  const messageData = {
    action: 'reply',
    userId: selectedUser.user_id,
    message: messageText,
    adminEmail: email
  };

  if (replyToId) {
    messageData.replyTo = replyToId;
  }

  const response = await axios.post(API_URL, messageData);

  if (response.data.success) {
    // Remove the temp message and refresh to get the real message
    setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
    fetchUserMessages(selectedUser.user_id);

    addActivity(
      'Message',
      `Sent message to client '${selectedUser.name}': "${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}"`,
      selectedUser.user_id
    );
  }
};

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const messageToDelete = messages.find(msg => msg.id === messageId);
      const isAdminMsg = messageToDelete?.is_admin_message === "1" || messageToDelete?.is_admin_message === 1;

      if (!isAdminMsg) {
        setError('You can only delete your own messages');
        return;
      }

      const response = await axios.delete(`${API_URL}/${messageId}`);

      if (response.data.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));

        if (messageToDelete) {
          addActivity(
            'Message',
            `Deleted message in conversation with '${selectedUser.name}': "${messageToDelete.message?.substring(0, 50) || 'Image message'}${messageToDelete.message?.length > 50 ? '...' : ''}"`,
            selectedUser.user_id
          );
        }
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to delete message. Please try again.');
      }
    }
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setMessages([]);
    setSelectedFile(null);
    setPreviewUrl(null);
    setReplyingTo(null);
    setSelectedMessage(null);
    fetchSenders();
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
                href="/gomez/auth"
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

        <div>
          {!selectedUser ? (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Client Messages</h2>
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
                            <img src={`http://localhost/funeraria/api/components/${sender.profile_image}`} alt="Profile" className="rounded-full w-10 h-10 object-cover" />
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

              {/* Reply Indicator */}
              {replyingTo && (
                <div className="p-3 bg-blue-50 border-l-4 border-blue-500 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center text-xs text-blue-600 font-medium mb-1">
                      <CornerUpLeft size={14} className="mr-1" />
                      Replying to {replyingTo.sender}
                    </div>
                    <p className="text-sm text-blue-600">
                      {replyingTo.text.length > 60
                        ? `${replyingTo.text.substring(0, 60)}...`
                        : replyingTo.text
                      }
                    </p>
                  </div>
                  <button
                    onClick={cancelReply}
                    className="ml-2 text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                    title="Cancel reply"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

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
                  messages.map((msg, index) => {
                    const isAdminMsg = msg.is_admin_message === "1" || msg.is_admin_message === 1;

                    return (
                      <div
                        key={msg.id || `msg-${index}`}
                        className={`flex ${isAdminMsg ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 relative ${isAdminMsg ? "bg-blue-500 text-white" : "bg-gray-100 text-black"
                            }`}
                          onClick={() => handleMessageClick(msg)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">
                              {isAdminMsg ? "You" : selectedUser.name}
                            </span>
                            {isAdminMsg && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMessage(msg.id);
                                }}
                                className="ml-2 opacity-50 hover:opacity-100"
                                title="Delete message"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          {/* Reply Preview */}
                          {msg.reply_to_id && msg.reply_to_message && (
                            <div className={`text-xs mb-2 border-l-2 pl-2 ${isAdminMsg ? 'border-blue-200 text-blue-200' : 'border-blue-400 text-gray-600'}`}>
                              <div className="font-medium">
                                Replying to {msg.reply_sender_id === userId ? 'yourself' : msg.reply_sender_name}
                              </div>
                              <div className="truncate opacity-75">
                                {msg.reply_to_message.length > 50
                                  ? `${msg.reply_to_message.substring(0, 50)}...`
                                  : msg.reply_to_message
                                }
                              </div>
                            </div>
                          )}

                          <p className="whitespace-pre-line">{msg.message}</p>
                          {msg.image_path && (
                            <div className="relative mt-2 group">
                              <img
                                src={`${msg.image_path}`}
                                alt="Attached"
                                className="w-60 h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageClick(msg.image_path);
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageClick(msg.image_path);
                                }}>
                                <ZoomIn size={24} className="text-white" />
                              </div>
                            </div>
                          )}
                          <div
                            className={`text-xs mt-1 ${isAdminMsg ? "text-white" : "text-black"
                              }`}
                          >
                            {formatDate(msg.timestamp)}
                          </div>

                          {/* Message actions menu */}
                          {selectedMessage?.id === msg.id && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white p-2 rounded shadow flex space-x-2 border border-gray-300 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyMessage(msg.message);
                                  setSelectedMessage(null);
                                }}
                                title="Copy message"
                              >
                                <Copy size={18} className="text-gray-900" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReplyToMessage(msg);
                                }}
                                title="Reply to this message"
                              >
                                <CornerUpLeft size={18} className="text-gray-900" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReplySubmit} className="p-4 border-t">
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
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <Camera size={20} className="text-gray-600" />
                  </button>

                  <button
                    type="button"
                    onClick={handleFileInputClick}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <Image size={20} className="text-gray-600" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <input
                    type="text"
                    value={replyText}
                    onChange={handleReplyChange}
                    placeholder={
                      replyingTo
                        ? "Type your reply..."
                        : "Type your message..."
                    }
                    className="flex-1 border rounded-l-lg px-4 py-2"
                  />

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
              <button
                onClick={closeEnlargedImage}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors mt-4"
                title="Close (ESC)"
              >
                <X size={32} />
              </button>

              <img
                src={enlargedImage}
                alt="Enlarged view"
                className="max-w-[70vw] max-h-[70vh] object-contain rounded-lg shadow-2xl"
                onClick={closeEnlargedImage}
              />

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