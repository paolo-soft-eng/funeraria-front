import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import ClientCartItem from './ClientCartItem';
import PaymentForm from './ClientPaymentForm';

// Helper function to format currency (adapted from ClientPackageCart)
const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
};

// Helper function to format date (simplified for this context)
const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    // Assuming dateString is a valid ISO date or similar.
    // This is a placeholder; you should use a proper date formatting library 
    // like date-fns or moment.js for production.
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        }) + ' at ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        return dateString; // Fallback
    }
}

const ClientCart = () => {
    const {
        cartItems,
        setCartItems,
        loading,
        cartLoading,
        error: cartError,
        setError: setCartError,
        successMessage: cartSuccessMessage,
        setSuccessMessage: setCartSuccessMessage,
        userId,
        editingItemId,
        setEditingItemId,
        editingQuantity,
        setEditingQuantity,
        isOrderCart,
        setIsOrderCart,
        showDeleteConfirm,
        itemToDelete,
        fetchCartItems,
        handleEditClick,
        handleUpdateQuantity,
        handleDeleteClick,
        confirmDelete,
        cancelDelete,
        calculateTotal,
        clearMessages: clearCartMessages
    } = useCart();

    const [showCheckout, setShowCheckout] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [loadingUserInfo, setLoadingUserInfo] = useState(false);
    const [addressMissing, setAddressMissing] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const n = process.env.REACT_APP_API_URL;

    const error = cartError;
    const successMessage = cartSuccessMessage;
    const setError = setCartError;
    const setSuccessMessage = setCartSuccessMessage;

    useEffect(() => {
        if (userId) {
            fetchCartItems(userId);
            fetchCustomerName();
        }
    }, [userId]);

    // Update selected items when cart items change
    useEffect(() => {
        if (cartItems && cartItems.length > 0) {
            // Select all items by default
            setSelectedItems(cartItems.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    }, [cartItems]);

    const fetchCustomerName = async () => {
        try {
            const userEmail = sessionStorage.getItem('userEmail') ||
                localStorage.getItem('userEmail') ||
                sessionStorage.getItem('email') ||
                localStorage.getItem('email');

            if (!userEmail) {
                console.warn('No email found in storage');
                return;
            }

            const response = await fetch(
                `http://localhost/funeraria/api/components/get_user_details.php?email=${encodeURIComponent(userEmail)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    const name = data.user.username
                        ? data.user.username
                        : `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim();

                    setCustomerName(name || 'Customer');
                }
            }
        } catch (error) {
            console.error('Error fetching customer name:', error);
            setCustomerName('Customer');
        }
    };

    const fetchUserInfo = async () => {
        setLoadingUserInfo(true);
        setAddressMissing(false);
        try {
            const userEmail = sessionStorage.getItem('userEmail') ||
                localStorage.getItem('userEmail') ||
                sessionStorage.getItem('email') ||
                localStorage.getItem('email');

            if (!userEmail) {
                console.warn('No email found in storage');
                setLoadingUserInfo(false);
                return;
            }

            const response = await fetch(
                `${n}/api/components/get_user_details.php?email=${userEmail}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch user information');
            }

            const data = await response.json();

            if (data.success && data.user) {
                const userInfoData = {
                    name: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim(),
                    email: data.user.email || '',
                    phone: data.user.telephone || '',
                    address: data.user.address || ''
                };

                if (!userInfoData.address || userInfoData.address.trim() === '') {
                    setAddressMissing(true);
                    setError('Address is required. Please fill up your address in the settings before proceeding to checkout.');
                }

                setUserInfo(userInfoData);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            setError('Failed to load user information. Please try again.');
        } finally {
            setLoadingUserInfo(false);
        }
    };

    const handleCheckoutSuccess = (result) => {
        let message;

        if (typeof result === 'string') {
            message = result;
        } else {
            message = result.message;
        }

        setSuccessMessage(message);
        setCartItems([]);
        fetchCartItems(userId);
        setShowCheckout(false);
        setSelectedItems([]);
    };

    const handleCheckoutError = (errorMessage) => {
        setError('Payment error: ' + errorMessage);
    };

    const handleToggleCheckout = async () => {
        if (selectedItems.length === 0) {
            setError('Please select at least one item to checkout.');
            return;
        }

        if (!showCheckout) {
            await fetchUserInfo();
        } else {
            setAddressMissing(false);
            setError(null);
        }
        setShowCheckout(!showCheckout);
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    };

    // Add these functions at the top of your ClientCart component, before the return statement
    const formatExpirationTime = (expirationDate) => {
        if (!expirationDate) return 'N/A';

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
        if (!expirationDate) return 'text-gray-600';

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

    const handleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => item.id));
        }
    };

    const calculateSelectedTotal = () => {
        const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
        const total = selectedCartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);
        return total.toFixed(2);
    };

    const getSelectedCartItems = () => {
        return cartItems.filter(item => selectedItems.includes(item.id));
    };
    
    // RENDER CHECKOUT ITEM CARD FUNCTION
    const renderCheckoutItemCard = (item) => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        
        // This simulates a date string for the order date. Replace 'item.created_at' if you have a better field.
        const orderDateDisplay = item.created_at ? formatDateDisplay(item.created_at) : formatDateDisplay(new Date().toISOString());

        return (
            <div key={item.id} className="bg-white p-4 rounded-lg mb-4 border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 px-3 py-2 rounded-t-lg -mx-4 -mt-4 mb-4 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900 text-base">Service: {item.name}</h4>
                    <span className="text-sm font-medium text-gray-600 mt-1 sm:mt-0">Qty: {item.quantity}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className='col-span-2 sm:col-span-1'>
                        <p className="text-xs font-medium text-gray-600">Customer Name</p>
                        <p className="font-semibold text-gray-800">{customerName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-600">Order ID</p>
                        <p className="font-semibold text-gray-800">#{item.id}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-600">Order Date</p>
                        {/* Note: item.created_at is assumed or derived */}
                        <p className="font-semibold text-gray-800">{orderDateDisplay}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-600">Price per Unit</p>
                        <p className="font-semibold text-green-700">{formatCurrency(parseFloat(item.price))}</p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Subtotal for this service:</span>
                        <span className="text-lg font-bold text-green-600">
                            {formatCurrency(itemTotal)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };
    // END RENDER CHECKOUT ITEM CARD FUNCTION

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6 min-h-[70vh]">
                <div className="text-xl text-gray-600">Loading your cart...</div>
            </div>
        );
    }

    // Prepare items for checkout (to pass to PaymentForm and Order Details)
    const itemsForCheckout = getSelectedCartItems();
    const checkoutTotal = calculateSelectedTotal();

    return (
        <div className="flex flex-col min-h-screen">
            {/* ... (Delete Confirmation Modal - unchanged) ... */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="ml-4 text-lg font-semibold text-gray-900">Confirm Removal</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to remove this order from your cart? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <div className="container mx-auto p-4 flex-grow">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl text-center mb-6">
                    Customized Package Order
                </h1>

                {/* ... (Error/Success Messages - unchanged) ... */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow">
                        <div className="flex items-start">
                            <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <p>{error}</p>
                                {addressMissing && (
                                    <Link
                                        to="/gomez/dashboard-client/settings"
                                        className="inline-block mt-2 text-sm font-semibold text-red-800 hover:text-red-900 underline"
                                    >
                                        Go to Settings to update your address →
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded shadow">
                        <p>{successMessage}</p>
                    </div>
                )}

                {cartItems?.length === 0 ? (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                        <p>Your cart is empty. Go to the customized services to add items to your cart!</p>
                    </div>
                ) : (
                    <>
                        {/* ... (Selection Summary & Cart Table - unchanged) ... */}
                        {/* Selection Summary */}
                        <div className="bg-blue-50 border border-blue-200 p-3 mb-4 rounded flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="text-sm text-blue-800">
                                    {selectedItems.length} of {cartItems.length} item(s) selected
                                </span>
                                {customerName && (
                                    <span className="ml-4 text-sm text-blue-600 font-medium">
                                        | Customer: {customerName}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleSelectAll}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {selectedItems.length === cartItems.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                            {/* Desktop version */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.length === cartItems.length}
                                                    onChange={handleSelectAll}
                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Item Details</th>
                                            <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                                            <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantity</th>
                                            <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                                            <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Expires In</th>
                                            <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {cartItems.map(item => (
                                            <tr key={item.id} className={selectedItems.includes(item.id) ? 'bg-green-50' : 'hover:bg-gray-50'}>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(item.id)}
                                                        onChange={() => handleSelectItem(item.id)}
                                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-16 w-16">
                                                            <img
                                                                className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                                                src={`${n}/api/components/${item.image_path}`}
                                                                alt={item.name}
                                                                onError={(e) => {
                                                                    e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                                                                    e.target.onerror = null;
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">₱{parseFloat(item.price).toFixed(2)}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {editingItemId === item.id ? (
                                                        <div className="flex items-center">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={editingQuantity}
                                                                onChange={(e) => setEditingQuantity(e.target.value)}
                                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                            />
                                                            <button
                                                                onClick={() => handleUpdateQuantity(item.id)}
                                                                className="ml-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingItemId(null)}
                                                                className="ml-2 px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleEditClick(item.id, item.quantity)}
                                                                className="ml-3 text-sm text-blue-600 hover:text-blue-800"
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        ₱{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className={`text-sm ${getExpirationStyle(item.expiration_date)}`}>
                                                        {formatExpirationTime(item.expiration_date)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDeleteClick(item.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t border-gray-200">
                                        <tr>
                                            <td colSpan="4" className="px-4 py-4 text-right text-sm font-semibold text-gray-700">
                                                Selected Total ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}):
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-green-600">₱{calculateSelectedTotal()}</td>
                                            <td colSpan="2"></td>
                                        </tr>
                                        <tr className="bg-gray-100">
                                            <td colSpan="4" className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
                                                Cart Total ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''}):
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₱{calculateTotal()}</td>
                                            <td colSpan="2"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Mobile version */}
                            <div className="md:hidden">
                                {cartItems.map(item => (
                                    <div key={item.id} className={`border-b border-gray-200 p-4 ${selectedItems.includes(item.id) ? 'bg-green-50' : ''}`}>
                                        <div className="flex items-start mb-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleSelectItem(item.id)}
                                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer mt-1 mr-3"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={`${n}/api/components/${item.image_path}`}
                                                                alt={item.name}
                                                            />
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                    </div>
                                                    <button
                                                        className="text-red-600 hover:text-red-900"
                                                        onClick={() => handleDeleteClick(item.id)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
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
                                                                    onChange={(e) => setEditingQuantity(e.target.value)}
                                                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                                <button
                                                                    onClick={() => handleUpdateQuantity(item.id)}
                                                                    className="ml-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center">
                                                                <span>{item.quantity}</span>
                                                                <button
                                                                    onClick={() => handleEditClick(item.id, item.quantity)}
                                                                    className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="font-medium text-gray-700">Total:</div>
                                                    <div className="text-gray-700">₱{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</div>
                                                    <div className="font-medium text-gray-700">Expires:</div>
                                                    <div className={`text-sm ${getExpirationStyle(item.expiration_date)}`}>
                                                        {formatExpirationTime(item.expiration_date)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="bg-green-50 px-4 py-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold text-green-700">
                                            Selected ({selectedItems.length}):
                                        </span>
                                        <span className="font-bold text-green-700">₱{calculateSelectedTotal()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold text-gray-900">
                                            Total ({cartItems.length}):
                                        </span>
                                        <span className="font-bold text-gray-900">₱{calculateTotal()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                            <button
                                className={`font-bold py-2 px-6 rounded transition-colors ${selectedItems.length === 0
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                onClick={handleToggleCheckout}
                                disabled={selectedItems.length === 0}
                            >
                                {showCheckout ? 'Hide Checkout' : `Proceed to Checkout (${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''})`}
                            </button>
                        </div>

                        {showCheckout && itemsForCheckout.length > 0 && (
                            <div className="mt-6 border-t pt-6 max-w-4xl mx-auto">
                                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
                                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                                        <h2 className="text-xl sm:text-2xl font-bold">
                                            Payment for {itemsForCheckout.length} Item{itemsForCheckout.length > 1 ? 's' : ''} 💳
                                        </h2>
                                        <button
                                            onClick={handleToggleCheckout}
                                            className="text-gray-600 hover:text-gray-800 p-1"
                                            aria-label="Back to Cart"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* 👇 NEW ORDER DETAILS SECTION START 👇 */}
                                    <div className="pt-4 mb-6">
                                        <h3 className="text-lg font-semibold mb-3">Order Details</h3>

                                        {itemsForCheckout.map((item) => renderCheckoutItemCard(item))}

                                        {/* Grand Total */}
                                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xl font-bold text-green-800">Grand Total:</span>
                                                <span className="text-2xl sm:text-3xl font-bold text-green-600">
                                                    {formatCurrency(parseFloat(checkoutTotal))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 👆 NEW ORDER DETAILS SECTION END 👆 */}

                                    <div className="border-t pt-6">
                                        <h3 className="text-xl font-bold mb-4">Payment Information</h3>

                                        {loadingUserInfo ? (
                                            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 mb-4 rounded">
                                                <p className="text-sm">Loading your information...</p>
                                            </div>
                                        ) : addressMissing ? (
                                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-yellow-700 font-medium">
                                                            Address is required to proceed with checkout.
                                                        </p>
                                                        <p className="mt-2 text-sm text-yellow-700">
                                                            Please update your address in settings before completing your order.
                                                        </p>
                                                        <div className="mt-4">
                                                            <Link
                                                                to="/gomez/dashboard-client/settings"
                                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                                            >
                                                                Go to Settings
                                                                <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {userInfo && (
                                                    <div className="bg-green-50 border border-green-200 text-green-700 p-3 mb-4 rounded">
                                                        <div className="flex items-center">
                                                            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <p className="text-sm">✓ Your information has been loaded for {userInfo.name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <PaymentForm
                                                    totalAmount={parseFloat(checkoutTotal)}
                                                    cartItems={itemsForCheckout}
                                                    userId={userId}
                                                    onSuccess={handleCheckoutSuccess}
                                                    onError={handleCheckoutError}
                                                    orderId={null}
                                                    serviceId={null}
                                                    isFuneralPackage={false}
                                                    customerInfo={userInfo}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ClientCart;