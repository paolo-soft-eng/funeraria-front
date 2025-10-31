import React, { useState, useContext } from 'react';
import { Calendar, FileText, Users, MessageSquare, Clock, MapPin, ChevronRight, X, Mail, LogOutIcon } from 'lucide-react';
import { EmailContext } from '../utils/EmailContext';
import { useUser } from '../hooks/client/useUser';
import { useAppointmentsAndOrders } from '../hooks/client/useOrdersAndAppointments';
import { useProfileImage } from '../hooks/client/useProfileImage';
import { useRecentMessages } from '../hooks/client/useRecentMessages';

const ClientHome = () => {
    const { email } = useContext(EmailContext);
    
    // Custom hooks
    const { userId, username, setUsername, isLoggedIn, error: userError } = useUser(email);
    const { firstName, upcomingAppointments, recentOrders, loading: dataLoading, error: dataError } = useAppointmentsAndOrders(email);
    const { recentMessages, loading: messagesLoading, error: messagesError, markAsRead } = useRecentMessages(email);
    useProfileImage(email, setUsername);
    
    // Local state
    const [appointmentFilter, setAppointmentFilter] = useState('all');
    const [orderFilter, setOrderFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

    // Combine loading states and errors
    const loading = dataLoading || messagesLoading;
    const error = userError || dataError || messagesError;

    // Filter appointments based on status and date
    const filteredAppointments = upcomingAppointments.filter(apt => {
        if (!apt.datetimeRaw) return false;
        
        const appointmentDate = new Date(apt.datetimeRaw);
        const now = new Date();
        
        if (appointmentFilter === 'upcoming') {
            return appointmentDate >= now && apt.status !== 'finished';
        } else if (appointmentFilter === 'past') {
            return appointmentDate < now || apt.status === 'finished';
        }
        return true;
    });

     const handleMessageClick = async (message) => {
        setSelectedMessage(message);
        setIsMessageModalOpen(true);
        
        // Mark as read if it's a received message and unread
        if (message.message_direction === 'received' && !message.is_read) {
            await markAsRead(message.id);
        }
    };

    const closeMessageModal = () => {
        setIsMessageModalOpen(false);
        setSelectedMessage(null);
    };

     const unreadCount = recentMessages.filter(msg => 
        msg.message_direction === 'received' && !msg.is_read
    ).length;

    // Filter orders based on status
    const filteredOrders = recentOrders.filter(order => {
        if (orderFilter === 'pending') {
            return order.status.toLowerCase() === 'pending';
        } else if (orderFilter === 'completed') {
            return order.status.toLowerCase() === 'completed';
        }
        return true;
    });

    const handleOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const griefResources = [
        {
            title: 'Coping with Loss',
            type: 'Article',
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Losing a loved one is one of the most challenging experiences in life. It's important to allow yourself to feel your emotions and seek support when needed.
                    </p>
                    <h4 className="font-semibold text-gray-800">Tips for Coping:</h4>
                    <ul className="list-disc list-inside text-gray-600">
                        <li>Allow yourself to grieve in your own way and time.</li>
                        <li>Talk to friends, family, or a counselor about your feelings.</li>
                        <li>Take care of your physical health with proper nutrition and rest.</li>
                        <li>Consider joining a support group to connect with others who understand.</li>
                    </ul>
                    <p className="text-gray-700">
                        If you need immediate help, please contact our 24/7 support line at <strong>1-800-GRIEF-HELP</strong>.
                    </p>
                </div>
            )
        },
        {
            title: 'Local Support Groups',
            type: 'Directory',
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Local support groups provide a safe space to share your feelings and connect with others who are also grieving.
                    </p>
                    <h4 className="font-semibold text-gray-800">Available Groups:</h4>
                    <ul className="list-disc list-inside text-gray-600">
                        <li><strong>Manila Grief Support:</strong> Meets every Tuesday at 6 PM, St. Mary's Church.</li>
                        <li><strong>Cebu Bereavement Circle:</strong> Meets every Thursday at 5 PM, Cebu Community Center.</li>
                        <li><strong>Davao Healing Hearts:</strong> Meets every Saturday at 10 AM, Davao City Hall.</li>
                    </ul>
                    <p className="text-gray-700">
                        For more information, visit our <a href="#" className="text-blue-600 hover:underline">website</a>.
                    </p>
                </div>
            )
        },
        {
            title: 'Grief Counseling',
            type: 'Service',
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Professional grief counseling can help you process your emotions and find healthy ways to cope with loss.
                    </p>
                    <h4 className="font-semibold text-gray-800">Our Counseling Services:</h4>
                    <ul className="list-disc list-inside text-gray-600">
                        <li>One-on-one sessions with licensed counselors.</li>
                        <li>Family counseling for collective healing.</li>
                        <li>Online counseling for remote support.</li>
                    </ul>
                    <p className="text-gray-700">
                        To schedule a session, call us at <strong>1-800-GRIEF-CARE</strong> or email <strong>support@gomezfuneraria.com</strong>.
                    </p>
                </div>
            )
        }
    ];

    const handleResourceClick = (resource) => {
        setSelectedResource(resource);
        setIsResourceModalOpen(true);
    };

    const closeResourceModal = () => {
        setIsResourceModalOpen(false);
        setSelectedResource(null);
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
                        <p className="mt-2 text-gray-600">Please log in to access your dashboard.</p>
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-xl text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Funeraria Gomez - Udtohan</h1>
            
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome, {username || firstName}</h2>
                <p className="text-gray-600">We're here to help you through this difficult time. Below you'll find all your funeral arrangements and resources.</p>
            </div>

             <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                        <Mail className="mr-2 h-5 w-5 text-blue-500" />
                        Recent Messages
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {unreadCount} new
                            </span>
                        )}
                    </h2>
                </div>
                
                <div className="space-y-3">
                    {recentMessages.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No messages found</p>
                    ) : (
                        recentMessages.slice(0, 5).map(message => (
                            <div 
                                key={message.id}
                                className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                    message.message_direction === 'received' && !message.is_read 
                                        ? 'border-blue-300 bg-blue-50' 
                                        : 'border-gray-200'
                                }`}
                                onClick={() => handleMessageClick(message)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-800">
                                                {message.message_direction === 'sent' 
                                                    ? `To: ${message.receiver_username}` 
                                                    : `From: ${message.sender_username}`
                                                }
                                            </h3>
                                            <span className="text-xs text-gray-500">
                                                {message.formatted_time}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {message.message}
                                        </p>
                                        <div className="flex items-center mt-2 space-x-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                message.message_direction === 'sent' 
                                                    ? 'bg-gray-100 text-gray-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {message.message_direction === 'sent' ? 'Sent' : 'Received'}
                                            </span>
                                            {message.message_direction === 'received' && !message.is_read && (
                                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* Appointments Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                        Appointments
                    </h2>
                    <div className="flex space-x-2">
                        <select 
                            value={appointmentFilter}
                            onChange={(e) => setAppointmentFilter(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="all">All Appointments</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="past">Past</option>
                        </select>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {filteredAppointments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No appointments found</p>
                    ) : (
                        filteredAppointments.map(appointment => (
                            <div key={appointment.id} className="border border-blue-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-gray-800">{appointment.type}</h3>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <Clock className="mr-1 h-4 w-4" />
                                            <span>{appointment.date}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <MapPin className="mr-1 h-4 w-4" />
                                            <span>{appointment.location}</span>
                                        </div>
                                        <div className="mt-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                appointment.status === 'finished' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* Orders Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-green-500" />
                        Orders
                    </h2>
                    <div className="flex space-x-2">
                        <select 
                            value={orderFilter}
                            onChange={(e) => setOrderFilter(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No orders found</td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.service}
                                            {order.items && order.items.length > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {order.items.map(item => item.name).join(', ')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                  'bg-gray-100 text-gray-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex flex-col">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mb-1
                                                    ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {order.payment_status.toUpperCase()}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {order.payment_method.toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button 
                                                onClick={() => handleOrderDetails(order)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Order Details</h3>
                            <button 
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Service Type</p>
                                    <p className="font-medium">{selectedOrder.service}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium">{selectedOrder.date}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="font-medium">
                                        <span className={`px-2 py-1 text-xs rounded-full 
                                            ${selectedOrder.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                              selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-gray-100 text-gray-800'}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="font-medium">{selectedOrder.amount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Status</p>
                                    <p className="font-medium">
                                        <span className={`px-2 py-1 text-xs rounded-full 
                                            ${selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {selectedOrder.payment_status.toUpperCase()}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Method</p>
                                    <p className="font-medium">{selectedOrder.payment_method.toUpperCase()}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Delivery Address</p>
                                    <p className="font-medium">{selectedOrder.address}</p>
                                </div>
                            </div>

                            {/* Items Section */}
                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedOrder.items.map((item) => (
                                                    <tr key={`item-${item.id}`}>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">₱{item.price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Funeral Service Section */}
                            {selectedOrder.service_details && (
                                <div className="mt-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Funeral Service Details</h4>
                                    <div className="border rounded-lg p-4">
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-sm text-gray-500">Package Name</p>
                                                <p className="font-medium">{selectedOrder.service_details.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Description</p>
                                                <p className="font-medium">{selectedOrder.service_details.description}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Inclusions</p>
                                                <ul className="list-disc list-inside">
                                                    {JSON.parse(selectedOrder.service_details.inclusions).map((inclusion, index) => (
                                                        <li key={`inclusion-${index}-${inclusion.substring(0, 10)}`} className="text-sm text-gray-700">{inclusion}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Price Range</p>
                                                <p className="font-medium">₱{selectedOrder.service_details.price_range}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Grief Resources */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                        <Users className="mr-2 h-5 w-5 text-purple-500" />
                        Grief Support Resources
                    </h2>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View All
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {griefResources.map((resource, index) => (
                        <div
                            key={index}
                            className="border border-purple-300 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleResourceClick(resource)}
                        >
                            <div className="flex items-center mb-2">
                                <MessageSquare className="h-5 w-5 text-purple-400 mr-2" />
                                <h3 className="font-medium text-gray-800">{resource.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{resource.type}</p>
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Explore Resource
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resource Modal */}
            {isResourceModalOpen && selectedResource && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                <MessageSquare className="mr-2 h-5 w-5 text-purple-500" />
                                {selectedResource.title}
                            </h3>
                            <button
                                onClick={closeResourceModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {selectedResource.content}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeResourceModal}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isMessageModalOpen && selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                <Mail className="mr-2 h-5 w-5 text-blue-500" />
                                Message Details
                            </h3>
                            <button 
                                onClick={closeMessageModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">From</p>
                                    <p className="font-medium">{selectedMessage.sender_username}</p>
                                    <p className="text-sm text-gray-600">{selectedMessage.sender_email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">To</p>
                                    <p className="font-medium">{selectedMessage.receiver_username}</p>
                                    <p className="text-sm text-gray-600">{selectedMessage.receiver_email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date & Time</p>
                                    <p className="font-medium">{selectedMessage.formatted_time}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="font-medium">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            selectedMessage.message_direction === 'sent' 
                                                ? 'bg-gray-100 text-gray-800' 
                                                : selectedMessage.is_read 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {selectedMessage.message_direction === 'sent' 
                                                ? 'Sent' 
                                                : selectedMessage.is_read 
                                                    ? 'Read' 
                                                    : 'Unread'
                                            }
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-500 mb-2">Message</p>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeMessageModal}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientHome;