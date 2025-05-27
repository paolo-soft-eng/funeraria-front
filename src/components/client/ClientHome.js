import React from 'react';
import { Calendar, FileText, Users, MessageSquare, Clock, MapPin, ChevronRight } from 'lucide-react';

const ClientHome = () => {
    // Sample data
    const upcomingAppointments = [
        {
            id: 1,
            date: '2023-06-15',
            time: '10:00 AM',
            type: 'Planning Session',
            location: 'Main Chapel'
        },
        {
            id: 2,
            date: '2023-06-20',
            time: '2:00 PM',
            type: 'Memorial Service',
            location: 'Garden View'
        }
    ];

    const recentOrders = [
        {
            id: 101,
            service: 'Traditional Funeral',
            date: '2023-06-18',
            status: 'Confirmed',
            amount: '$3,500'
        },
        {
            id: 102,
            service: 'Cremation Package',
            date: '2023-05-30',
            status: 'Completed',
            amount: '$2,200'
        }
    ];

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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gomez Funeraria Dashboard</h1>
            
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome, Maria</h2>
                <p className="text-gray-600">We're here to help you through this difficult time. Below you'll find all your funeral arrangements and resources.</p>
            </div>
            
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                        Upcoming Appointments
                    </h2>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View All
                    </button>
                </div>
                
                <div className="space-y-4">
                    {upcomingAppointments.map(appointment => (
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
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-green-500" />
                        Recent Orders
                    </h2>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View All
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.service}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                              order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : 
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button className="text-blue-600 hover:text-blue-900">Details</button>
                                    </td>
                                </tr>
                            ))}
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