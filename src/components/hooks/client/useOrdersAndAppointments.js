import { useState, useEffect } from 'react';

export const useAppointmentsAndOrders = (email) => {
    const [firstName, setFirstName] = useState('');
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!email) return;

        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost/apii/components/get_upcoming.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (data.error) throw new Error(data.error);

                setFirstName(data.firstName);

                const transformedAppointments = data.appointments.map(apt => ({
                    id: apt.id,
                    date: apt.appointment_date_formatted,
                    time: apt.appointment_time,
                    type: apt.purpose,
                    location: 'Main Office',
                    status: apt.status,
                    datetimeRaw: apt.appointment_datetime_raw
                }));

                const transformedOrders = data.orders.map(order => ({
                    id: order.id,
                    service: order.services_id ? order.service_name || 'Funeral Service' : 'Items Order',
                    date: order.delivery_date,
                    status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
                    amount: `₱${order.total_amount}`,
                    payment_status: order.payment_status,
                    payment_method: order.payment_method,
                    address: order.address,
                    items: order.items ? order.items.map(item => ({
                        id: item.id,
                        name: item.item_name,
                        quantity: item.quantity,
                        price: item.item_price
                    })) : [],
                    service_details: order.services_id ? {
                        name: order.service_name,
                        description: order.service_description,
                        inclusions: order.service_inclusions,
                        price_range: order.service_price_range
                    } : null
                }));

                setUpcomingAppointments(transformedAppointments);
                setRecentOrders(transformedOrders);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [email]);

    return { firstName, upcomingAppointments, recentOrders, loading, error };
};
