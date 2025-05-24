import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { MessageSquare, Trash2, Send, ArrowLeft } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { EmailContext } from '../EmailContext';

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
  const messagesEndRef = useRef(null);
  const { email } = useContext(EmailContext);

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
      console.error('WebSocket error:', error);
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

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) return;

    try {
      const response = await axios.post(API_URL, {
        action: 'reply',
        userId: selectedUser.user_id,
        message: replyText,
        adminEmail: email // Add the admin's email to the request
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
                            <img
                              src={`http://localhost/apii/components/${msg.image_path}`}
                              alt="Attached"
                              className="mt-2 w-60 h-auto rounded"
                            />
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

              {/* Reply Form */}
              <form onSubmit={handleReplySubmit} className="p-4 border-t">
                <div className="flex">
                  <input
                    type="text"
                    value={replyText}
                    onChange={handleReplyChange}
                    placeholder="Type your reply..."
                    className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={!replyText.trim()}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
