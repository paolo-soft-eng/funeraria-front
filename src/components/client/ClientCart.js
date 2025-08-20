import React, { useState, useEffect, useContext } from 'react';
import {
    Elements,
    useStripe,
    useElements,
    PaymentElement
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { EmailContext } from '../EmailContext';
const stripePromise = loadStripe('pk_test_51REVEcRLZ2HeS19hcy1hxk9AHQNFv1kHPVcJzVIQEy7ATFJDazz34LLjnlJlsZjsHutNmyvmd44DT50GJ2vFV1Ks00o1LzMnAv');
const CheckoutForm = ({ totalAmount, cartItems, userId, onSuccess, onError, orderId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [clientSecret, setClientSecret] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [deliveryDate, setDeliveryDate] = useState(new Date());
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (totalAmount && userId) {
            if (totalAmount <= 10) {
                setErrorMessage('Service amount must be at least ₱100.00 to process payment');
                setIsLoading(false);
                return;
            }
            createPaymentIntent(orderId);
        }
    }, [totalAmount, userId, orderId]);

    const createPaymentIntent = async (orderId) => {
        setIsLoading(true);
        try {
            if (paymentMethod === 'cod') {
                setIsLoading(false);
                return;
            }

            const amountToCharge = parseFloat(totalAmount);

            if (totalAmount <= 10) {
                setErrorMessage('Service amount must be at least ₱10.00 to process payment');
                setIsLoading(false);
                return;
            }

            const payload = {
                amount: Math.round(amountToCharge),
                userId: userId,
                items: cartItems,
                paymentMethod: paymentMethod,
                deliveryDate: deliveryDate.toISOString(),
                address: address.trim()
            };

            if (orderId) {
                payload.orderId = orderId;
            }

            const response = await fetch('http://localhost/apii/components/create-payment.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Failed to create payment intent');
            }

            const data = await response.json();

            if (!data.clientSecret) {
                throw new Error(data.error || 'Invalid response from server');
            }

            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error('Payment intent error:', error);
            setErrorMessage(error.message || 'Payment initialization failed');
            onError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (paymentMethod === 'cod') {
            setProcessing(true);
            try {
                await recordCashOnDeliveryOrder();
            } catch (error) {
                setErrorMessage(error.message);
                onError(error.message);
            } finally {
                setProcessing(false);
            }
            return;
        }

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/payment-success',
                    payment_method_data: {
                        billing_details: {
                            name: 'Customer Name',
                        },
                    },
                },
                redirect: 'if_required'
            });

            if (error) {
                throw new Error(error.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                await recordSuccessfulPayment(paymentIntent.id);
            } else if (paymentIntent) {
                await checkPaymentStatus(paymentIntent.id);
            }
        } catch (error) {
            setErrorMessage(error.message);
            onError(error.message);
        } finally {
            setProcessing(false);
        }
    };

    const recordCashOnDeliveryOrder = async () => {
        try {
            const payload = {
                userId: parseInt(userId),
                amount: totalAmount,
                items: cartItems.map(item => ({
                    id: parseInt(item.product_id || item.item_id || item.id),
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                })),
                deliveryDate: deliveryDate.toISOString(),
                address: address.trim()
            };

            if (orderId) {
                payload.orderId = orderId;
            }

            const recordResponse = await fetch('http://localhost/apii/components/cod-order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            // Clone the response if you need to read it multiple times
            const recordResponseClone = recordResponse.clone();

            // First try to parse as JSON
            let recordData;
            try {
                recordData = await recordResponse.json();
            } catch (e) {
                // If JSON parsing fails, try to get the raw text from the clone
                const text = await recordResponseClone.text();
                throw new Error(text || 'Invalid server response');
            }

            if (!recordResponse.ok) {
                throw new Error(recordData.error || 'Order processing failed');
            }

            if (!recordData.success) {
                throw new Error(recordData.error || 'Order processing failed');
            }

            onSuccess({
                message: recordData.message || 'Your pay on collection order has been placed successfully!',
                orderId: recordData.orderId,
                isFuneralService: recordData.isFuneralService,
                deletedFuneralOrder: recordData.deletedFuneralOrder
            });

        } catch (error) {
            // Clean up any HTML tags from error message
            const cleanError = error.message.replace(/<[^>]*>?/gm, '');
            throw new Error(cleanError || 'Failed to place pay on collection order');
        }
    };


    const recordSuccessfulPayment = async (paymentIntentId) => {
        try {
            if (!address.trim()) {
                throw new Error('Please enter your delivery address');
            }

            const payload = {
                userId: parseInt(userId),
                paymentIntentId: paymentIntentId,
                amount: parseFloat(totalAmount),
                items: cartItems.map(item => ({
                    id: parseInt(item.product_id || item.item_id || item.id),
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                })),
                deliveryDate: deliveryDate.toISOString(),
                address: address.trim()
            };

            if (orderId) {
                payload.orderId = orderId;
            }

            const recordResponse = await fetch('http://localhost/apii/components/record-payment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseText = await recordResponse.text();
            let recordData;
            try {
                recordData = JSON.parse(responseText);
            } catch (e) {
                throw new Error(responseText || 'Invalid server response');
            }

            if (!recordResponse.ok) {
                throw new Error(recordData.error || 'Payment recording failed');
            }

            if (recordData.success) {
                onSuccess({
                    message: 'Payment recorded successfully!',
                    orderId: recordData.orderId,
                    isFuneralService: !!orderId,
                    deletedFuneralOrder: recordData.deletedFuneralOrder
                });
            } else {
                throw new Error(recordData.error || 'Payment recording failed');
            }
        } catch (error) {
            const cleanError = error.message.replace(/<[^>]*>?/gm, '');
            setErrorMessage('Payment recording failed: ' + cleanError);
            throw error;
        }
    };

    const checkPaymentStatus = async (paymentIntentId) => {
        try {
            const response = await fetch(`http://localhost/apii/components/check-payment-status.php?paymentIntentId=${paymentIntentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.status === 'succeeded') {
                await recordSuccessfulPayment(paymentIntentId);
            } else if (data.status === 'processing') {
                onSuccess('Your payment is processing. We will update you once completed.');
            } else {
                throw new Error(`Payment status: ${data.status}. Please try again.`);
            }
        } catch (error) {
            throw error;
        }
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        if (method !== 'cod') {
            createPaymentIntent(orderId);
        } else {
            setIsLoading(false);
        }
    };

    if (paymentMethod === 'cod') {
        return (
            <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto mt-6 bg-white p-6 rounded-lg shadow-md">
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Select Payment Method
                    </label>
                    <div className="flex flex-wrap mb-4">
                        <button
                            type="button"
                            className={`mr-2 mb-2 px-4 py-2 border rounded ${paymentMethod === 'card' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-white text-gray-700'}`}
                            onClick={() => handlePaymentMethodChange('card')}
                            style={{ visibility: 'visible' }}
                        >
                            Credit/Debit Card
                        </button>
                        <button
                            type="button"
                            className={`mr-2 mb-2 px-4 py-2 border rounded ${paymentMethod === 'cod' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-white text-gray-700'}`}
                            onClick={() => handlePaymentMethodChange('cod')}
                            style={{ visibility: 'visible' }}
                        >
                            Cash on delivery
                        </button>
                    </div>
                </div>

                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded">
                    <h3 className="text-lg mb-2 text-black">Cash on delivery</h3>
                    <p className="mb-2 text-black">You will pay the total amount of ₱{parseFloat(totalAmount).toFixed(2)} when you visit our office.</p>
                    <ul className="list-disc pl-5 mb-4 text-sm text-black">
                        <li>Please bring the exact amount</li>
                        <li>Payment will be collected by our staff</li>
                        <li>Please bring valid identification</li>
                        <li>Our hours for payment collection are 8am-5pm Monday through Saturday</li>
                    </ul>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Delivery Address
                    </label>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 border rounded text-sm"
                        placeholder="Enter your complete delivery address"
                        required
                        rows="3"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Select Delivery Date and Time
                    </label>
                    <input
                        type="datetime-local"
                        value={deliveryDate.toISOString().slice(0, 16)}
                        onChange={(e) => setDeliveryDate(new Date(e.target.value))}
                        className="w-full px-3 py-2 border rounded text-sm"
                    />
                </div>

                {errorMessage && (
                    <div className="mb-4 text-red-500 text-sm">
                        {errorMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className={`w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {processing ? 'Processing Order...' : `Confirm Service - ₱${parseFloat(totalAmount).toFixed(2)}`}
                </button>
            </form>
        );
    }

    if (isLoading || !clientSecret) {
        return <div className="text-center py-4">Loading payment options...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto mt-6 bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Select Payment Method
                </label>
                <div className="flex flex-wrap mb-4">
                    <button
                        type="button"
                        className={`mr-2 mb-2 px-4 py-2 border rounded ${paymentMethod === 'card' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-white text-gray-700'}`}
                        onClick={() => handlePaymentMethodChange('card')}
                        style={{ visibility: 'visible' }}
                    >
                        Credit/Debit Card
                    </button>
                    <button
                        type="button"
                        className={`mr-2 mb-2 px-4 py-2 border rounded ${paymentMethod === 'cod' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-white text-gray-700'}`}
                        onClick={() => handlePaymentMethodChange('cod')}
                        style={{ visibility: 'visible' }}
                    >
                        Cash on delivery
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Delivery Address
                </label>
                <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                    placeholder="Enter your complete delivery address"
                    required
                    rows="3"
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Payment Details
                </label>
                <div className="p-3 border rounded-md bg-white">
                    <PaymentElement
                        options={{
                            layout: {
                                type: 'tabs',
                                defaultCollapsed: false
                            }
                        }}
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Select Delivery Date and Time
                </label>
                <input
                    type="datetime-local"
                    value={deliveryDate.toISOString().slice(0, 16)}
                    onChange={(e) => setDeliveryDate(new Date(e.target.value))}
                    className="w-full px-3 py-2 border rounded text-sm"
                />
            </div>

            {errorMessage && (
                <div className="mb-4 text-red-500 text-sm">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || processing || !clientSecret}
                className={`w-full bg-gray-700 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded ${(!stripe || processing || !clientSecret) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {processing ? 'Processing Payment...' : `Pay ₱${parseFloat(totalAmount).toFixed(2)}`}
            </button>
        </form>
    );
}

const ClientCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(true);
    const [isOrderCart, setIsOrderCart] = useState(false);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const { email } = useContext(EmailContext);
    const [userId, setUserId] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingQuantity, setEditingQuantity] = useState(1);
    const [showCheckout, setShowCheckout] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [paymentIntentLoading, setPaymentIntentLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('cart');
    const [processingOrderId, setProcessingOrderId] = useState(null);
    const [isProcessingFuneralPayment, setIsProcessingFuneralPayment] = useState(false);
    useEffect(() => {
        if (email) {
            fetchUserId(email);
        } else {
            setLoading(false);
            setError('Please log in to view your services and memorial orders');
        }
    }, [email]);

    useEffect(() => {
        if (showCheckout && cartItems.length > 0 && !clientSecret) {
            createPaymentIntent();
        }
    }, [showCheckout]);

    const fetchOrders = async () => {
        if (!email) return;

        try {
            const response = await fetch(`http://localhost/apii/components/fetchOrders.php?customer_email=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const result = await response.json();

            // Set the orders to the data array from the response
            setOrders(result.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Error loading memorial services: ' + error.message);
            setOrders([]); // Set to empty array on error
        } finally {
            setOrdersLoading(false);
            setLoading(false);
        }
    };

    const fetchUserId = (userEmail) => {
        fetch(`http://localhost/apii/components/getUserId.php?email=${encodeURIComponent(userEmail)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user ID');
                }
                return response.json();
            })
            .then(data => {
                if (data.userId) {
                    setUserId(parseInt(data.userId));
                    fetchCartItems(parseInt(data.userId));
                    fetchOrders();
                } else {
                    throw new Error('User ID not found');
                }
            })
            .catch(error => {
                setError('Error: ' + error.message);
                setLoading(false);
            });
    };

    const fetchCartItems = (userId) => {
        setIsOrderCart(false)
        setCartLoading(true);
        fetch(`http://localhost/apii/components/fetchCart.php?userId=${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setCartItems(data || []);
                setCartLoading(false);
            })
            .catch(error => {
                setError('Error fetching selected services: ' + error.message);
                setCartLoading(false);
            });
    };

    const handleEditClick = (itemId, currentQuantity) => {
        setEditingItemId(itemId);
        setEditingQuantity(parseInt(currentQuantity) || 1);
    };

    const handleUpdateQuantity = (itemId) => {
        if (!userId || userId <= 0) {
            setError('Error: Invalid or missing user ID');
            setEditingItemId(null);
            return;
        }

        const payload = {
            userId: parseInt(userId),
            itemId: parseInt(itemId),
            quantity: parseInt(editingQuantity)
        };

        fetch(`http://localhost/apii/components/updatedCartItem.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || `HTTP error! Status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    fetchCartItems(userId);
                    setEditingItemId(null);
                    setSuccessMessage('Service quantity updated successfully!');
                } else {
                    throw new Error(data.error || 'Update failed');
                }
            })
            .catch(error => {
                console.error("Update error:", error);
                setError('Error updating service: ' + error.message);
                setEditingItemId(null);
            });
    };


    const handleDeleteClick = (itemId) => {
        if (window.confirm('Are you sure you want to remove this service from your cart?')) {
            const payload = {
                userId: parseInt(userId),
                itemId: parseInt(itemId)
            };

            fetch(`http://localhost/apii/components/deleteCartItem.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        setCartItems(cartItems.filter(item => item.id !== itemId));
                        setSuccessMessage('Service removed successfully!');
                    } else {
                        setError('Error removing service: ' + (data.error || 'Unknown error'));
                    }
                })
                .catch(error => {
                    console.error("Delete error:", error);
                    setError('Error removing service: ' + error.message);
                });
        }
    };

    const createPaymentIntent = async (orderId = null) => {
        setPaymentIntentLoading(true);
        try {
            // Calculate total amount based on current items in cart or use order data
            const totalAmount = cartItems.reduce((total, item) => {
                return total + (parseFloat(item.price) * parseInt(item.quantity));
            }, 0);

            const minAmount = Math.max(totalAmount, 10);

            console.log("Creating payment intent:", {
                amount: minAmount,
                userId: userId,
                items: cartItems,
                paymentMethod: 'card',
                orderId: orderId
            });

            const response = await fetch('http://localhost/apii/components/create-payment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: minAmount,
                    userId: userId,
                    items: cartItems,
                    paymentMethod: 'card',
                    orderId: orderId
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `Server error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.clientSecret) {
                throw new Error('Invalid response: missing client secret');
            }

            setClientSecret(data.clientSecret);
            setShowCheckout(true);
            return data;
        } catch (error) {
            console.error('Payment intent error:', error);
            throw error;
        } finally {
            setPaymentIntentLoading(false);
        }
    };

    const handleOrderPayment = (orderId) => {
        setProcessingOrderId(orderId);
        // Set active tab to cart first so UI updates properly
        setActiveTab('cart');
        setIsProcessingFuneralPayment(true);
        setIsOrderCart(true);
        setShowCheckout(false); // Reset checkout state
        setClientSecret(''); // Clear any existing client secret


        const order = orders.find(order => order.id === orderId);
        if (!order) {
            setError(`Could not find memorial service #${orderId}`);
            return;
        }

        // Debug logging
        console.log('Order data:', order);
        console.log('Service price range:', order.service_price_range);
        console.log('Caskets:', order.caskets);
        console.log('Flowers:', order.flowers);

        // Calculate total amount
        let totalAmount = 0;

        // Add base service price
        if (order.service_price_range) {
            const basePrice = parseFloat(order.service_price_range);
            console.log('Base price:', basePrice);
            totalAmount += basePrice;
        }

        // Add casket prices
        if (order.caskets && order.caskets.length > 0) {
            const casketTotal = order.caskets.reduce((sum, casket) => sum + parseFloat(casket.price), 0);
            console.log('Casket total:', casketTotal);
            totalAmount += casketTotal;
        }

        // Add flower prices
        if (order.flowers && order.flowers.length > 0) {
            const flowerTotal = order.flowers.reduce((sum, flower) => sum + parseFloat(flower.price), 0);
            console.log('Flower total:', flowerTotal);
            totalAmount += flowerTotal;
        }

        console.log('Final total amount:', totalAmount);

        // Ensure we have a valid amount
        if (totalAmount <= 0) {
            totalAmount = 100; // Minimum amount
        }

        // Create placeholder item for this order
        const orderItems = [{
            id: parseInt(order.id),
            product_id: parseInt(order.id),
            name: order.service_name || `Memorial Service #${orderId}`,
            price: totalAmount,
            quantity: 1,
            image_path: "uploads/default.jpg"
        }];

        // Update the cart items first
        setCartItems(orderItems);

        // Wait for cart items to update before showing checkout
        setTimeout(() => {
            setPaymentIntentLoading(true);

            // Create payment intent
            fetch('http://localhost/apii/components/create-payment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: totalAmount,
                    userId: userId,
                    items: orderItems,
                    paymentMethod: 'card',
                    orderId: orderId
                }),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => {
                            throw new Error(text || `Server error: ${response.status}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data.clientSecret) {
                        throw new Error('Invalid response: missing client secret');
                    }

                    // Set client secret and show checkout
                    setClientSecret(data.clientSecret);
                    setSuccessMessage(`Ready to process payment for Memorial Service #${orderId}`);
                    setShowCheckout(true);
                })
                .catch(error => {
                    setError('Payment setup failed: ' + error.message);
                    setShowCheckout(false);
                })
                .finally(() => {
                    setPaymentIntentLoading(false);
                });
        }, 100); // Small delay to ensure state updates properly
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0).toFixed(2);
    };

    const handleCheckoutSuccess = (result) => {
        setProcessingOrderId(null);
        setIsProcessingFuneralPayment(false)
        let message, orderId, isFuneralService, deletedFuneralOrder;

        if (typeof result === 'string') {
            message = result;
            isFuneralService = false;
        } else {
            message = result.message;
            orderId = result.orderId;
            isFuneralService = result.isFuneralService;
            deletedFuneralOrder = result.deletedFuneralOrder;
        }

        setSuccessMessage(message);

        if (isFuneralService && deletedFuneralOrder) {
            setOrders(prevOrders => prevOrders.filter(order => order.id !== deletedFuneralOrder));
        } else if (!isFuneralService) {
            setCartItems([]);
        }

        fetchCartItems(userId);
        fetchOrders();
        setShowCheckout(false);
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this memorial service?')) {
            try {
                const response = await fetch('http://localhost/apii/components/deleteOrder.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId: orderId,
                        userEmail: email // from your context
                    }),
                });

                // First check if we got any response at all
                if (!response.ok) {
                    // Try to get error message from response
                    let errorMsg = 'Failed to cancel service';
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.message || errorMsg;
                    } catch (e) {
                        // If JSON parsing fails, try to get text
                        const text = await response.text();
                        errorMsg = text || errorMsg;
                    }
                    throw new Error(errorMsg);
                }

                const result = await response.json();

                if (result.success) {
                    setOrders(orders.filter(order => order.id !== orderId));
                    setSuccessMessage(result.message || 'Memorial service cancelled successfully');
                } else {
                    throw new Error(result.message || 'Cancellation failed');
                }
            } catch (error) {
                console.error('Delete error:', error);
                // Clean up any HTML tags from error message
                const cleanError = error.message.replace(/<[^>]*>?/gm, '');
                setError(cleanError || 'Failed to cancel memorial service');
            }
        }
    };

    const handleCheckoutError = (errorMessage) => {
        setError('Payment error: ' + errorMessage);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatExpirationTime = (expirationDate) => {
        const now = new Date();
        const expiration = new Date(expirationDate);
        const diffInMinutes = Math.floor((expiration - now) / (1000 * 60));

        if (diffInMinutes <= 0) {
            return 'Expired';
        }

        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
        }

        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;

        if (minutes === 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        }

        return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };

    const getExpirationStyle = (expirationDate) => {
        const now = new Date();
        const expiration = new Date(expirationDate);
        const diffInMinutes = Math.floor((expiration - now) / (1000 * 60));

        if (diffInMinutes <= 0) {
            return 'text-red-600 font-semibold';
        }

        if (diffInMinutes < 5) {
            return 'text-red-500';
        }

        if (diffInMinutes < 15) {
            return 'text-orange-500';
        }

        return 'text-gray-600';
    };

    useEffect(() => {
        if (userId) {
            const interval = setInterval(() => {
                fetchCartItems(userId);
            }, 30000); // Refresh every 30 seconds

            return () => clearInterval(interval);
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6 min-h-[70vh]">
                <div className="text-xl text-gray-600">Loading your memorial services...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto p-4 flex-grow">
                <h1 className="text-3xl font-bold text-center mb-6 text-white-300">Gomez Funeraria Payment</h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow">
                        <p>{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded shadow">
                        <p>{successMessage}</p>
                    </div>
                )}

                <div className="flex border-b mb-6">
                    <button
                        className={`py-2 px-4 font-medium ${activeTab === 'cart' ? 'text-black border-b-2 border-black' : 'text-black'}`}
                        onClick={() => setActiveTab('cart')}
                    >
                        Item Menu ({cartItems?.length || 0})
                    </button>
                    <button
                        className={`py-2 px-4 font-medium ${activeTab === 'orders' ? 'text-black border-b-2 border-black' : 'text-black'}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Funeral Package Services ({orders?.length || 0})
                    </button>
                </div>

                {activeTab === 'cart' ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4">My Orders</h1>
                        {cartItems?.length === 0 ? (
                            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                                <p>Your cart is empty. Go to the menu to add items to your cart!</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                                    {/* Desktop version - visible on md screens and up */}
                                    <div className="hidden md:block">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Item</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantity</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Expires In</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {cartItems.map(item => (
                                                    <tr key={item.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    <img
                                                                        className="h-10 w-10 rounded-full object-cover"
                                                                        src={`http://localhost/apii/components/${item.image_path}`}
                                                                        alt={item.name}
                                                                    />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">₱{parseFloat(item.price).toFixed(2)}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {editingItemId === item.id ? (
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={editingQuantity}
                                                                    onChange={(e) => {
                                                                        if (!isOrderCart) {
                                                                            const value = parseInt(e.target.value);
                                                                            setEditingQuantity(isNaN(value) ? 1 : value);
                                                                        }
                                                                    }}
                                                                    className={`w-16 px-2 py-1 border rounded text-sm ${isOrderCart ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                    disabled={isOrderCart}
                                                                    readOnly={isOrderCart}
                                                                />
                                                            ) : (
                                                                <div className="text-sm text-gray-900">{item.quantity}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">₱{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {!isOrderCart && (
                                                                <div className={`text-sm ${getExpirationStyle(item.expiration_date)}`}>
                                                                    {formatExpirationTime(item.expiration_date)}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            {editingItemId === item.id ? (
                                                                <>
                                                                    <button
                                                                        className="text-green-600 hover:text-green-900 mr-2"
                                                                        onClick={() => handleUpdateQuantity(item.id)}
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        className="text-red-600 hover:text-red-900"
                                                                        onClick={() => setEditingItemId(null)}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        className={`text-indigo-600 hover:text-indigo-900 mr-2 ${isOrderCart || isProcessingFuneralPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        onClick={() => !isOrderCart && !isProcessingFuneralPayment && handleEditClick(item.id, item.quantity)}
                                                                        disabled={isOrderCart || isProcessingFuneralPayment}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        className={`text-red-600 hover:text-red-900 ${isProcessingFuneralPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        onClick={() => !isProcessingFuneralPayment && handleDeleteClick(item.id)}
                                                                        disabled={isProcessingFuneralPayment}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-50">
                                                    <td colSpan="3" className="px-6 py-4 text-right font-semibold">Total:</td>
                                                    <td className="px-6 py-4 font-bold">₱{calculateTotal()}</td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* Mobile version - visible on small screens */}
                                    <div className="md:hidden">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="border-b border-gray-200 p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={`http://localhost/apii/components/${item.image_path}`}
                                                                alt={item.name}
                                                            />
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                    </div>
                                                    <div>
                                                        <button
                                                            className="text-red-600 hover:text-red-900"
                                                            onClick={() => handleDeleteClick(item.id)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="font-medium text-gray-700">Price:</div>
                                                    <div className="text-gray-700">₱{parseFloat(item.price).toFixed(2)}</div>

                                                    <div className="font-medium text-gray-700">Quantity:</div>
                                                    <div className="text-gray-700">
                                                        {editingItemId === item.id ? (
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={editingQuantity}
                                                                    onChange={(e) => {
                                                                        if (!isOrderCart) {
                                                                            const value = parseInt(e.target.value);
                                                                            setEditingQuantity(isNaN(value) ? 1 : value);
                                                                        }
                                                                    }}
                                                                    className={`w-16 px-2 py-1 border rounded text-sm ${isOrderCart ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                    disabled={isOrderCart}
                                                                    readOnly={isOrderCart}
                                                                />
                                                            </div>
                                                        ) : (
                                                            item.quantity
                                                        )}
                                                    </div>

                                                    <div className="font-medium text-gray-700">Total:</div>
                                                    <div className="text-gray-700">₱{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</div>

                                                    <div className="font-medium text-gray-700">Expires In:</div>
                                                    <div className={`text-sm ${getExpirationStyle(item.expiration_date)}`}>
                                                        {!isOrderCart && (
                                                            <> 
                                                                <div className="font-medium text-gray-700">Expires In:</div>
                                                                <div className={`text-sm ${getExpirationStyle(item.expiration_date)}`}>
                                                                    {formatExpirationTime(item.expiration_date)}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex justify-end">
                                                    {editingItemId === item.id ? (
                                                        <>
                                                            <button
                                                                className="text-green-600 hover:text-green-900 mr-2 text-sm px-3 py-1 border border-green-600 rounded"
                                                                onClick={() => handleUpdateQuantity(item.id)}
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                className="text-red-600 hover:text-red-900 text-sm px-3 py-1 border border-red-600 rounded"
                                                                onClick={() => setEditingItemId(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className={`text-indigo-600 hover:text-indigo-900 text-sm px-3 py-1 border border-indigo-600 rounded ${isOrderCart || isProcessingFuneralPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={() => !isOrderCart && !isProcessingFuneralPayment && handleEditClick(item.id, item.quantity)}
                                                            disabled={isOrderCart || isProcessingFuneralPayment}
                                                        >
                                                            Edit Quantity
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="bg-gray-50 px-4 py-3 text-right">
                                            <span className="font-semibold mr-2">Total:</span>
                                            <span className="font-bold">₱{calculateTotal()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mb-6">
                                    <button
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
                                        onClick={() => setShowCheckout(!showCheckout)}
                                    >
                                        {showCheckout ? 'Hide Checkout' : 'Proceed to Checkout'}
                                    </button>
                                </div>

                                {showCheckout && cartItems.length > 0 && (
                                    <div className="mt-6 border-t pt-6">
                                        <h2 className="text-xl font-bold mb-4">
                                            {isOrderCart ? `Pay for Order #${cartItems[0]?.product_id || cartItems[0]?.id}` : "Payment Information"}
                                        </h2>

                                        {paymentIntentLoading ? (
                                            <div className="text-center py-4">Loading payment options...</div>
                                        ) : clientSecret ? (
                                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                                <CheckoutForm
                                                    totalAmount={parseFloat(calculateTotal())}
                                                    cartItems={cartItems}
                                                    userId={userId}
                                                    onSuccess={handleCheckoutSuccess}
                                                    onError={handleCheckoutError}
                                                    orderId={isOrderCart ? cartItems[0]?.product_id || cartItems[0]?.id : null}
                                                />
                                            </Elements>
                                        ) : (
                                            <div>
                                                <div className="text-red-500 mb-4">Failed to initialize payment. Please try again.</div>
                                                <button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                                    onClick={() => {
                                                        if (isOrderCart && cartItems[0]) {
                                                            handleOrderPayment(cartItems[0].product_id || cartItems[0].id);
                                                        } else {
                                                            createPaymentIntent();
                                                        }
                                                    }}
                                                >
                                                    Retry Payment Setup
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold mb-6">My Services</h1>

                        {ordersLoading ? (
                            <div className="flex justify-center items-center p-6">
                                <div className="text-xl text-gray-600">Loading your orders...</div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
                                <p>You haven't placed any orders yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="p-4 border-b">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-900">{order.service_name}</h2>
                                                    <p className="text-gray-600 text-sm">{order.service_description}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="bg-slate-400 text-gray-50 text-xs px-2 py-1 rounded">
                                                        Order #{order.id}
                                                    </span>
                                                    {!processingOrderId && (
                                                        <button
                                                            onClick={() => handleDeleteOrder(order.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                            title="Delete Order"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">Customer Details</h3>
                                                    <p className="text-sm text-gray-600">{order.customer_name}</p>
                                                    <p className="text-sm text-gray-600">{order.customer_email}</p>
                                                    <p className="text-sm text-gray-600">{order.customer_phone}</p>
                                                </div>

                                                <div>
                                                    <h3 className="font-medium text-gray-900">Order Information</h3>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium text-gray-900">Order Date:</span> {formatDate(order.order_date)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium text-gray-900">Price Range:</span> {order.service_price_range}
                                                    </p>
                                                </div>
                                            </div>

                                            {order.service_inclusions && (
                                                <div className="mt-4">
                                                    <h3 className="font-medium text-gray-900">Service Inclusions</h3>
                                                    <ul className="list-disc pl-5 text-sm text-gray-600">
                                                        {JSON.parse(order.service_inclusions).map((inclusion, index) => (
                                                            <li key={index}>{inclusion}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Add Caskets Section */}
                                            {order.caskets && order.caskets.length > 0 && (
                                                <div className="mt-4">
                                                    <h3 className="font-medium text-gray-900">Selected Caskets</h3>
                                                    <div className="mt-2 space-y-2">
                                                        {order.caskets.map((casket, index) => (
                                                            <div key={index} className="flex justify-between items-center text-sm">
                                                                <span className="text-gray-600">{casket.name}</span>
                                                                <span className="font-medium text-gray-900">₱{parseFloat(casket.price).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Add Flowers Section */}
                                            {order.flowers && order.flowers.length > 0 && (
                                                <div className="mt-4">
                                                    <h3 className="font-medium text-gray-900">Selected Flowers</h3>
                                                    <div className="mt-2 space-y-2">
                                                        {order.flowers.map((flower, index) => (
                                                            <div key={index} className="flex justify-between items-center text-sm">
                                                                <span className="text-gray-600">{flower.name}</span>
                                                                <span className="font-medium text-gray-900">₱{parseFloat(flower.price).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Calculate and Display Total */}
                                            {order.caskets && order.flowers && (
                                                <div className="mt-4 pt-4 border-t">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-900">Total Amount:</span>
                                                        <span className="font-bold text-lg text-gray-900">
                                                            ₱{(
                                                                parseFloat(order.service_price_range || 0) +
                                                                (order.caskets ? order.caskets.reduce((sum, casket) => sum + parseFloat(casket.price), 0) : 0) +
                                                                (order.flowers ? order.flowers.reduce((sum, flower) => sum + parseFloat(flower.price), 0) : 0)
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    className={`bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded ${processingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    onClick={() => handleOrderPayment(order.id)}
                                                    disabled={processingOrderId === order.id}
                                                >
                                                    {processingOrderId === order.id ? 'Processing...' : 'Pay Now'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ClientCart;
