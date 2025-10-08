import React, { useState, useEffect, useRef, useContext } from 'react';
import { Info, Phone, Video, Image, Camera, Send, Copy, Trash, CornerUpLeft, Menu, X, ZoomIn, User } from 'lucide-react';
import { EmailContext } from '../utils/EmailContext';

// Import custom hooks
import { useAuth } from '../hooks/client/useAuth';
import { useWebSocket } from '../hooks/client/useWebSocket';
import { useMessages } from '../hooks/client/useMessages';
import { useAdmins } from '../hooks/client/useAdmins';
import { useCamera } from '../hooks/client/useCamera';
import { useMessageActions } from '../hooks/client/useMessageActions';
import { useUserInterface } from '../hooks/client/useUserInterface';

export default function ClientMessages() {
  const [message, setMessage] = useState('');
  const { email } = useContext(EmailContext);
  const messagesEndRef = useRef(null);

  // Custom hooks
  const { userId, isLoggedIn, loading: authLoading, error: authError, setError: setAuthError } = useAuth(email);
  const { socket, isConnected, processedMessageIds } = useWebSocket(userId);
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    messageCount,
    addMessage,
    removeMessage,
    clearMessages,
    setError: setMessagesError
  } = useMessages(userId, null);

  const {
    admins,
    selectedAdmin,
    setSelectedAdmin,
    markMessagesAsRead,
  } = useAdmins(userId);

  const {
    showCamera,
    selectedFile,
    previewUrl,
    error: cameraError,
    videoRef,
    canvasRef,
    fileInputRef,
    startCamera,
    closeCamera,
    capturePhoto,
    handleFileChange,
    clearFile,
    setError: setCameraError
  } = useCamera();

  const {
    loading: messageActionLoading,
    error: messageActionError,
    sendMessage: sendMessageAction,
    sendImageMessage: sendImageMessageAction,
    unsendMessage,
    copyMessage,
    setError: setMessageActionError
  } = useMessageActions(socket, isConnected, userId, processedMessageIds);

  const {
    selectedMessage,
    enlargedImage,
    showSidebar,
    handleMessageClick,
    handleImageClick,
    closeEnlargedImage,
    toggleSidebar,
    setShowSidebar
  } = useUserInterface();

  // Update messages hook with selectedAdmin
  const {
    messages: currentMessages,
    loading: currentMessagesLoading,
    error: currentMessagesError,
    messageCount: currentMessageCount,
    addMessage: currentAddMessage,
    removeMessage: currentRemoveMessage,
    clearMessages: currentClearMessages,
    countMessages,
    markAsRead: currentMarkAsRead,
    setError: setCurrentMessagesError
  } = useMessages(userId, selectedAdmin);

  // WebSocket message handler
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message' && !data.isOwnMessage) {
        const messageId = data.messageId || `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        if (processedMessageIds.has(messageId)) {
          console.log(`Skipping duplicate message with ID: ${messageId}`);
          return;
        }

        processedMessageIds.add(messageId);

        const newMessage = {
          id: messageId,
          text: data.message,
          sender: 'admin',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageUrl: data.imageUrl || null
        };

        currentAddMessage(newMessage);
      }

      // Handle message deletion from admin
      if (data.type === 'message_deleted') {
        currentRemoveMessage(data.messageId);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, processedMessageIds, currentAddMessage, currentRemoveMessage]);

  useEffect(() => {
    if (selectedAdmin && userId && currentMessages.length > 0) {
      // Mark messages as read after viewing
      const hasUnreadMessages = currentMessages.some(msg =>
        msg.sender === 'admin' && !msg.isRead
      );

      if (hasUnreadMessages) {
        markMessagesAsRead(selectedAdmin.id, userId);
        currentMarkAsRead();
      }
    }
  }, [selectedAdmin, userId, currentMessages, markMessagesAsRead, currentMarkAsRead]);

  // Handle admin selection
  const handleAdminClick = (admin) => {
    setSelectedAdmin(admin);
    currentClearMessages();
    processedMessageIds.clear();
    setShowSidebar(false);

    // Mark messages as read in the backend
    markMessagesAsRead(admin.id, userId);

    if (userId) {
      countMessages(admin.id, userId);
    }
  };

  // Message sending functions
  const sendMessage = async () => {
    if (!message.trim()) return;

    const success = await sendMessageAction(
      message,
      selectedAdmin,
      currentAddMessage,
      countMessages
    );

    if (success) {
      setMessage('');
    }
  };

  const sendImageMessage = async () => {
    const success = await sendImageMessageAction(
      message,
      selectedFile,
      selectedAdmin,
      currentAddMessage,
      countMessages
    );

    if (success) {
      setMessage('');
      clearFile();
    }
  };

  // Event handlers
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

  const handleCopyMessage = (text) => {
    copyMessage(text);
  };

  const handleUnsendMessage = async (msg) => {
    // Only allow deleting user's own messages
    if (msg.sender !== 'me') {
      setMessageActionError('You can only delete your own messages');
      return;
    }

    await unsendMessage(msg.id, currentRemoveMessage);
  };

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Camera effect
  useEffect(() => {
    if (showCamera) {
      startCamera();
    }
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera, startCamera, videoRef]);

  // Escape key handler for enlarged image
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && enlargedImage) {
        closeEnlargedImage();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [enlargedImage, closeEnlargedImage]);

  // Combine all errors for display
  const currentError = authError || messagesError || currentMessagesError || cameraError || messageActionError;
  const currentLoading = authLoading || messagesLoading || currentMessagesLoading || messageActionLoading;

  // Clear error function
  const clearError = () => {
    setAuthError(null);
    setMessagesError(null);
    setCurrentMessagesError(null);
    setCameraError(null);
    setMessageActionError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
        <button
          className="md:hidden mr-2"
          onClick={toggleSidebar}
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
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
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
            {currentError && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
                <p>Error: {currentError}</p>
                <button
                  className="text-red-700 underline ml-2"
                  onClick={clearError}
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
                      onClick={clearFile}
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
                {currentLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  currentMessages.map((msg) => (
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

                        {msg.isReply && (
                          <div className={`text-xs opacity-75 mb-1 border-l-2 ${msg.sender === 'me' ? 'border-blue-200' : 'border-blue-400'} pl-2 ${msg.sender === 'me' ? 'text-blue-200' : 'text-gray-600'}`}>
                            Replying to: {msg.replyToPreview}
                          </div>
                        )}
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
                        <div className="flex items-center justify-start mt-1">
                          {msg.time && (
                            <span className={`text-xs ${msg.sender === 'me' ? 'text-white' : 'text-black'} text-left`}>
                              {msg.time}
                            </span>
                          )}
                        </div>

                        {selectedMessage === msg && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white p-2 rounded shadow flex space-x-2 border border-gray-300 z-10">
                            <button
                              onClick={() => handleCopyMessage(msg.text)}
                              title="Copy message"
                            >
                              <Copy size={18} className="text-gray-900" />
                            </button>
                            <button
                              onClick={() => {
                                // Truncate long messages for the reply prefix
                                const originalText = msg.text;
                                const previewText = originalText.length > 30
                                  ? `${originalText.substring(0, 30)}...`
                                  : originalText;

                                // Set the message with reply context and move cursor to end
                                setMessage(`Replying to: "${previewText}"\n\n`);

                                // Focus on the input field after a brief delay
                                setTimeout(() => {
                                  const input = document.querySelector('input[type="text"]');
                                  if (input) {
                                    input.focus();
                                    // Move cursor to end (after the reply prefix)
                                    input.setSelectionRange(input.value.length, input.value.length);
                                  }
                                }, 100);
                              }}
                              title="Reply to this message"
                            >
                              <CornerUpLeft size={18} className="text-gray-900" />
                            </button>
                            {/* Only show delete button for user's own messages */}
                            {msg.sender === 'me' && (
                              <button
                                onClick={() => handleUnsendMessage(msg)}
                                title="Delete message"
                              >
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
                    setMessageActionError('Please select an admin first');
                    return;
                  }
                  startCamera();
                }}
                className="p-2 rounded-full hover:bg-gray-200"
                disabled={!selectedAdmin}
              >
                <Camera size={24} className={selectedAdmin ? "text-blue-800" : "text-gray-400"} />
              </button>
              <button
                onClick={() => {
                  if (!selectedAdmin) {
                    setMessageActionError('Please select an admin first');
                    return;
                  }
                  fileInputRef.current?.click();
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
              ) : null}
            </div>
          </div>
        </div>
      </div>

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
  );
}