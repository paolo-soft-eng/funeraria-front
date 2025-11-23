import React, { useState, useEffect } from 'react';
import useCart from '../../hooks/useCart';
import ClientCartItem from './ClientCartItem';
import PaymentForm from './ClientPaymentForm';

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
        fetchCartItems,
        handleEditClick,
        handleUpdateQuantity,
        handleDeleteClick,
        calculateTotal,
        clearMessages: clearCartMessages
    } = useCart();

    const [showCheckout, setShowCheckout] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [loadingUserInfo, setLoadingUserInfo] = useState(false);

    const error = cartError;
    const successMessage = cartSuccessMessage;
    const setError = setCartError;
    const setSuccessMessage = setCartSuccessMessage;

    useEffect(() => {
        if (userId) {
            fetchCartItems(userId);
        }
    }, [userId]);

    const fetchUserInfo = async () => {
        setLoadingUserInfo(true);
        try {
            // Get email from session storage or local storage
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
                `http://localhost/funeraria/api/components/getUserInfo.php?email=${encodeURIComponent(userEmail)}`,
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
                setUserInfo(userInfoData);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
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
    };

    const handleCheckoutError = (errorMessage) => {
        setError('Payment error: ' + errorMessage);
    };

    const handleToggleCheckout = async () => {
        if (!showCheckout) {
            // Fetch user info when opening checkout
            await fetchUserInfo();
        }
        setShowCheckout(!showCheckout);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6 min-h-[70vh]">
                <div className="text-xl text-gray-600">Loading your cart...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto p-4 flex-grow">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight lg:text-5xl text-center mb-6">
                    Shopping Cart
                </h1>

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

                <h2 className="text-2xl font-bold mb-4">Menu Orders</h2>
                
                {cartItems?.length === 0 ? (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                        <p>Your cart is empty. Go to the menu to add items to your cart!</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                            {/* Desktop version */}
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
                                            <ClientCartItem
                                                key={item.id}
                                                item={item}
                                                editingItemId={editingItemId}
                                                editingQuantity={editingQuantity}
                                                setEditingQuantity={setEditingQuantity}
                                                onEditClick={handleEditClick}
                                                onUpdateQuantity={handleUpdateQuantity}
                                                onDeleteClick={handleDeleteClick}
                                                isOrderCart={isOrderCart}
                                                isProcessingFuneralPayment={false}
                                            />
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-50">
                                            <td colSpan="3" className="px-6 py-4 text-right font-semibold">Total:</td>
                                            <td className="px-6 py-4 font-bold">₱{calculateTotal()}</td>
                                            <td colSpan="2"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Mobile version */}
                            <div className="md:hidden">
                                {cartItems.map(item => (
                                    <div key={item.id} className="border-b border-gray-200 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={`http://localhost/funeraria/api/components/${item.image_path}`}
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
                                            <div className="text-gray-700">{item.quantity}</div>
                                            <div className="font-medium text-gray-700">Total:</div>
                                            <div className="text-gray-700">₱{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</div>
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
                                onClick={handleToggleCheckout}
                            >
                                {showCheckout ? 'Hide Checkout' : 'Proceed to Checkout'}
                            </button>
                        </div>

                        {showCheckout && cartItems.length > 0 && (
                            <div className="mt-6 border-t pt-6">
                                <h2 className="text-xl font-bold mb-4">Payment Information</h2>

                                {loadingUserInfo ? (
                                    <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 mb-4 rounded">
                                        <p className="text-sm">Loading your information...</p>
                                    </div>
                                ) : (
                                    <>
                                        {userInfo && (
                                            <div className="bg-green-50 border border-green-200 text-green-700 p-3 mb-4 rounded">
                                                <p className="text-sm">✓ Your information has been loaded</p>
                                            </div>
                                        )}
                                        <PaymentForm
                                            totalAmount={parseFloat(calculateTotal())}
                                            cartItems={cartItems}
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
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ClientCart;