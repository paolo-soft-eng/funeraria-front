import React, { useState, useRef, useEffect, useContext } from 'react';
import { Calendar, FileText, Users, MessageSquare, Clock, MapPin, ChevronRight } from 'lucide-react';
import {EmailContext} from '../EmailContext'

const ClientHome = () => {
    const {email} = useContext(EmailContext);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [appointmentFilter, setAppointmentFilter] = useState('all'); // 'all', 'upcoming', 'past'
    const [orderFilter, setOrderFilter] = useState('all'); // 'all', 'pending', 'completed'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost/apii/components/get_upcoming.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }

                setFirstName(data.firstName);

                // Transform appointments data
                const transformedAppointments = data.appointments.map(apt => ({
                    id: apt.id,
                    date: apt.appointment_date,
                    time: apt.appointment_time,
                    type: apt.purpose,
                    location: 'Main Office', // Default location
                    status: apt.status
                }));

                // Transform orders data
                const transformedOrders = data.orders.map(order => ({
                    id: order.id,
                    service: 'Funeral Service', // Default service name
                    date: order.delivery_date,
                    status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
                    amount: `$${order.total_amount}`,
                    payment_status: order.payment_status,
                    payment_method: order.payment_method
                }));

                setUpcomingAppointments(transformedAppointments);
                setRecentOrders(transformedOrders);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (email) {
            fetchData();
        }
    }, [email]);

    // Filter appointments based on status and date
    const filteredAppointments = upcomingAppointments.filter(apt => {
        const appointmentDate = new Date(`${apt.date}T${apt.time}`);
        const now = new Date();
        
        if (appointmentFilter === 'upcoming') {
            return appointmentDate >= now;
        } else if (appointmentFilter === 'past') {
            return appointmentDate < now;
        }
        return true;
    });

    // Filter orders based on status
    const filteredOrders = recentOrders.filter(order => {
        if (orderFilter === 'pending') {
            return order.status.toLowerCase() === 'pending';
        } else if (orderFilter === 'completed') {
            return order.status.toLowerCase() === 'completed';
        }
        return true;
    });

    const griefResources = [
        {
            title: 'Coping with Loss',
            type: 'Article'
        },
        {
            title: 'Local Support Groups',
            type: 'Directory'
        },
        {
            title: 'Grief Counseling',
            type: 'Service'
        }
    ];

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
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gomez Funeraria Dashboard</h1>
            
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome, {firstName}</h2>
                <p className="text-gray-600">We're here to help you through this difficult time. Below you'll find all your funeral arrangements and resources.</p>
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
                            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-gray-800">{appointment.type}</h3>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <Clock className="mr-1 h-4 w-4" />
                                            <span>{appointment.date} at {appointment.time}</span>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.service}</td>
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
                                            <button className="text-blue-600 hover:text-blue-900">Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
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
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
        </div>
    );
};

export default ClientHome;