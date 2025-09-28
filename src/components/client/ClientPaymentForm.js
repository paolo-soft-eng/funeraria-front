// Unified PaymentForm.js - All methods use payment intents
import React, { useState, useEffect, useCallback } from 'react';
import BillingForm from './ClientBillingForm';

const PAYMENT_METHODS = {
  CARD: 'card',
  GCASH: 'gcash',
  GRAB_PAY: 'grab_pay',
  PAYMAYA: 'paymaya',
  COD: 'cod'
};


const PaymentForm = ({ 
    totalAmount, 
    cartItems, 
    userId, 
    onSuccess, 
    onError, 
    orderId 
}) => {
    const [state, setState] = useState({
        processing: false,
        errorMessage: null,
        paymentMethod: PAYMENT_METHODS.CARD,
        billingData: null,
        billingValid: false,
        isRetrying: false
    });

    const updateState = useCallback((updates) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const storePaymentData = (formData) => {
        const paymentData = {
            userId: userId,
            amount: totalAmount,
            address: formData.address,
            orderId: orderId,
            deliveryDate: formData.deliveryDate,
            timestamp: Date.now(),
            paymentMethod: state.paymentMethod,
            billingInfo: {
                name: formData.name || '',
                email: formData.email || '',
                phone: formData.phone || ''
            },
            items: cartItems.map(item => ({
                id: parseInt(item.product_id || item.item_id || item.id),
                serviceId: item[0]?.service_id || cartItems[0]?.serviceId,
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price)
            }))
        };

        try {
            sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
            sessionStorage.setItem('selectedPaymentMethod', state.paymentMethod);
            localStorage.setItem('lastPaymentAttempt', JSON.stringify(paymentData));
        } catch (error) {
            console.warn('Failed to store payment data:', error);
        }
    };

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        
        if (!state.billingValid || !state.billingData) {
            updateState({ errorMessage: 'Please fill in all required billing information correctly' });
            return;
        }

        updateState({ processing: true, errorMessage: null });

        try {
            storePaymentData(state.billingData);

            if (state.paymentMethod === 'cod') {
                await handleCashOnDelivery();
                return;
            }

            const amountInCentavos = Math.round(parseFloat(totalAmount) * 100);
            
            if (amountInCentavos < 2000) {
                throw new Error('Amount too low. Minimum payment is ₱20.00');
            }

            // UNIFIED APPROACH: Always create payment intent first
            await handleUnifiedPayment(amountInCentavos);

        } catch (error) {
            updateState({ errorMessage: error.message || 'Payment processing failed' });
            onError && onError("Network connection error. Please check your internet connection");
        } finally {
            updateState({ processing: false });
        }
    };

    const handleUnifiedPayment = async (amountInCentavos) => {
        try {
            // Step 1: Always create payment intent first (for all payment methods)
            const intentResponse = await fetchWithRetry(
                'http://localhost/apii/components/create-payment-intent.php',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: amountInCentavos,
                        currency: 'PHP',
                        // Include the specific payment method
                        payment_method_allowed: [state.paymentMethod],
                        metadata: {
                            user_id: userId.toString(),
                            order_id: orderId ? orderId.toString() : '',
                            items_count: cartItems.length.toString(),
                            billing_name: state.billingData.name || '',
                            billing_email: state.billingData.email || '',
                            billing_phone: state.billingData.phone || '',
                            payment_method: state.paymentMethod
                        }
                    })
                }
            );

            const intentData = await intentResponse.json();
            
            if (!intentResponse.ok || !intentData.success || !intentData.intent_id) {
                throw new Error(intentData.error || 'Failed to create payment intent');
            }

            // Store intent ID for all payment methods
            try {
                sessionStorage.setItem('paymentIntentId', intentData.intent_id);
                localStorage.setItem('lastPaymentIntentId', intentData.intent_id);
            } catch (e) {
                console.warn('Failed to store payment intent ID:', e);
            }

            // Step 2: Create checkout session with the payment intent
            await createUnifiedCheckoutSession(amountInCentavos, intentData.intent_id);

        } catch (error) {
            throw new Error(`Payment failed: Internet connection error`);
        }
    };

    const createUnifiedCheckoutSession = async (amountInCentavos, intentId) => {
        const sessionResponse = await fetchWithRetry(
            'http://localhost/apii/components/create-checkout-session.php',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountInCentavos,
                    currency: 'PHP',
                    payment_method: state.paymentMethod, // Specify the exact method
                    successUrl: `${window.location.origin}/payment-success?payment_intent=${encodeURIComponent(intentId)}`,
                    cancelUrl: `${window.location.origin}/payment-failed`,
                    billing: {
                        name: state.billingData.name || '',
                        email: state.billingData.email || '',
                        phone: state.billingData.phone || ''
                    },
                    metadata: {
                        user_id: userId.toString(),
                        order_id: orderId ? orderId.toString() : '',
                        items_count: cartItems.length.toString(),
                        payment_method: state.paymentMethod
                    },
                    paymentIntentId: intentId
                })
            }
        );

        const sessionData = await sessionResponse.json();
        
        if (!sessionResponse.ok || !sessionData.success || !sessionData.checkout_url) {
            throw new Error(sessionData.error || 'Failed to create checkout session');
        }

        // IMPORTANT: Store the checkout session ID for later verification
        try {
            sessionStorage.setItem('checkoutSessionId', sessionData.checkout_session_id);
            localStorage.setItem('lastCheckoutSessionId', sessionData.checkout_session_id);
            console.log('Stored checkout session ID:', sessionData.checkout_session_id);
        } catch (e) {
            console.warn('Failed to store checkout session ID:', e);
        }

        // Store source ID if this is an e-wallet payment
        if (['gcash', 'grab_pay', 'paymaya'].includes(state.paymentMethod)) {
            try {
                // For e-wallet payments, we might get a source ID in the response
                if (sessionData.source_id) {
                    sessionStorage.setItem('paymentSourceId', sessionData.source_id);
                    localStorage.setItem('lastPaymentSourceId', sessionData.source_id);
                }
            } catch (e) {
                console.warn('Failed to store source ID:', e);
            }
        }

        window.location.href = sessionData.checkout_url;
    };

    const handleCashOnDelivery = async () => {
        try {
            const payload = {
                userId: parseInt(userId),
                amount: parseFloat(totalAmount),
                items: cartItems.map(item => ({
                    id: parseInt(item.product_id || item.item_id || item.id),
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                })),
                deliveryDate: state.billingData.deliveryDate || null,
                address: state.billingData.address.trim(),
                billingInfo: {
                    name: state.billingData.name || '',
                    email: state.billingData.email || '',
                    phone: state.billingData.phone || ''
                },
                ...(orderId && { orderId: parseInt(orderId) })
            };

            const recordResponse = await fetchWithRetry(
                'http://localhost/apii/components/cod-order.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload),
                }
            );

            const recordData = await recordResponse.json();

            if (!recordResponse.ok || !recordData.success) {
                throw new Error(recordData.error || 'Order processing failed');
            }

            try {
                sessionStorage.removeItem('pendingPayment');
                localStorage.removeItem('lastPaymentAttempt');
            } catch (e) {
                console.warn('Failed to clear stored data:', e);
            }

            onSuccess({
                message: recordData.message || 'Your cash on delivery order has been placed successfully!',
                orderId: recordData.orderId,
                isFuneralService: recordData.isFuneralService,
                deletedFuneralOrder: recordData.deletedFuneralOrder
            });

        } catch (error) {
            throw new Error(error.message || 'Failed to place cash on delivery order');
        }
    };

    const fetchWithRetry = async (url, options, maxRetries = 2) => {
        for (let i = 0; i <= maxRetries; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                if(!response.ok){
                    console.error('Internet connection error!');
                }

                clearTimeout(timeoutId);
                return response;

            } catch (error) {
                if (i === maxRetries) {
                    throw error;
                }
                
                if (error.name === 'AbortError') {
                    throw new Error('Request timed out. Please check your connection and try again.');
                }
                
                updateState({ isRetrying: true });
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    };

    const handleBillingSubmit = (formData, isValid) => {
        updateState({ 
            billingData: formData, 
            billingValid: isValid,
            errorMessage: isValid ? null : state.errorMessage 
        });
    };

    const getPaymentButtonText = () => {
        if (state.processing) {
            if (state.isRetrying) return 'Retrying...';
            return state.paymentMethod === 'cod' ? 'Processing Order...' : 'Processing Payment...';
        }
        
        const amountText = `₱${parseFloat(totalAmount).toFixed(2)}`;
        return state.paymentMethod === 'cod' ? `Confirm Service - ${amountText}` : `Pay ${amountText}`;
    };

    return (
        <div className="w-full max-w-lg mx-auto mt-6 bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
                <div className="space-y-2">
                    {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                        <label key={value} className="flex items-center">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={value}
                                checked={state.paymentMethod === value}
                                onChange={(e) => updateState({ paymentMethod: e.target.value })}
                                disabled={state.processing}
                                className="mr-2"
                            />
                            <span>
                                {value === 'card' && 'Credit/Debit Card'}
                                {value === 'gcash' && 'GCash'}
                                {value === 'grab_pay' && 'GrabPay'}
                                {value === 'paymaya' && 'PayMaya'}
                                {value === 'cod' && 'Cash on Delivery'}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <BillingForm
                onSubmit={handleBillingSubmit}
                disabled={state.processing}
                userId={userId}
                cartItems={cartItems}
                orderId={orderId}
            />

            {state.errorMessage && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {state.errorMessage}
                    </div>
                </div>
            )}

            <button
                onClick={handleSubmit}
                className={`w-full font-bold py-3 px-4 rounded mt-4 transition-all duration-200 ${
                    state.processing || !state.billingValid
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white hover:shadow-lg'
                }`}
                disabled={state.processing || !state.billingValid}
            >
                {getPaymentButtonText()}
            </button>

            {state.processing && (
                <div className="mt-2 text-center">
                    <div className="inline-flex items-center text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        {state.isRetrying ? 'Retrying connection...' : 'Processing...'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentForm;