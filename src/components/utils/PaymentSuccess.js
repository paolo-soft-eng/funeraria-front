import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { recordPayment } from "./recordPayment";

const PaymentSuccess = () => {
  const [state, setState] = useState({
    paymentDetails: null,
    loading: true,
    error: null,
    recordingResult: null,
    retryCount: 0,
    paymentIncomplete: false
  });

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // SINGLE SOURCE OF TRUTH for identifiers - extract once and store in state
  const [identifiers, setIdentifiers] = useState(null);

  // Extract identifiers ONCE when component mounts
  useEffect(() => {
    const extractedIdentifiers = extractPaymentIdentifiers(searchParams, location.state);
    setIdentifiers(extractedIdentifiers);
  }, [searchParams, location.state]); // Only depend on these

  // Enhanced identifier extraction - make it a pure function
  function extractPaymentIdentifiers(searchParams, locationState) {
    const identifiers = {
      paymentIntentId: null,
      sourceId: null,
      sessionId: null,
      userId: null
    };

    // Extract from URL parameters
    identifiers.paymentIntentId =
      searchParams.get('payment_intent') ||
      searchParams.get('payment_intent_id') ||
      searchParams.get('pi_id');

    identifiers.sourceId =
      searchParams.get('source_id') ||
      searchParams.get('sourceId') ||
      searchParams.get('src_id');

    identifiers.sessionId =
      searchParams.get('session_id') ||
      searchParams.get('sessionId') ||
      searchParams.get('checkout_session_id') ||
      searchParams.get('cs_id');

    identifiers.userId = searchParams.get('userId') || searchParams.get('user_id');

    // Extract from location state
    if (locationState) {
      identifiers.userId = identifiers.userId || locationState.userId;
    }

    // Extract from stored payment data as fallback
    const storedData = getStoredPaymentData();

    if (!identifiers.paymentIntentId && storedData.paymentIntentId) {
      identifiers.paymentIntentId = storedData.paymentIntentId;
    }
    if (!identifiers.sourceId && storedData.sourceId) {
      identifiers.sourceId = storedData.sourceId;
    }
    if (!identifiers.sessionId && storedData.sessionId) {
      identifiers.sessionId = storedData.sessionId;
    }
    if (!identifiers.userId && (storedData.userId || storedData.user_id)) {
      identifiers.userId = storedData.userId || storedData.user_id;
    }

    return identifiers;
  }

  function getStoredPaymentData() {
    try {
      // Get identifiers from storage
      const sourceId = sessionStorage.getItem('paymentSourceId')
        || localStorage.getItem('lastPaymentSourceId');

      const paymentIntentId = sessionStorage.getItem('paymentIntentId')
        || localStorage.getItem('lastPaymentIntentId');

      const sessionId = sessionStorage.getItem('checkoutSessionId')
        || localStorage.getItem('lastCheckoutSessionId');

      const userId = sessionStorage.getItem('userId')
        || localStorage.getItem('lastUserId');

      // Get the main payment data
      const pendingPayment = sessionStorage.getItem('pendingPayment')
        || localStorage.getItem('lastPaymentAttempt');

      let parsedData = {};

      if (pendingPayment) {
        try {
          parsedData = JSON.parse(pendingPayment);
        } catch (e) {
          console.warn('Failed to parse pending payment data:', e);
        }
      }

      // Merge identifiers + extras into parsed data
      return {
        ...parsedData,
        sourceId: parsedData.sourceId || sourceId || null,
        paymentIntentId: parsedData.paymentIntentId || paymentIntentId || null,
        sessionId: parsedData.sessionId || sessionId || null,
        userId: parsedData.userId || parsedData.user_id || userId || null,
        address: parsedData.address || localStorage.getItem('lastBillingAddress') || null,
        orderId: parsedData.orderId || parsedData.order_id || localStorage.getItem('lastOrderId') || null,
        deliveryDate: parsedData.deliveryDate || parsedData.delivery_date || localStorage.getItem('lastDeliveryDate') || null,
        items: parsedData.items || JSON.parse(localStorage.getItem('lastCartItems') || '[]'),
        billingInfo: parsedData.billingInfo || JSON.parse(localStorage.getItem('lastBillingInfo') || '{}'),
        paymentMethod: parsedData.paymentMethod || localStorage.getItem('lastPaymentMethod') || null,
        amount: parsedData.amount || localStorage.getItem('lastPaymentAmount') || null
      };
    } catch (e) {
      console.warn('Failed to get stored payment data:', e);
      return {};
    }
  }

  function cleanupStoredData() {
    try {
      ['pendingPayment', 'paymentIntentId', 'paymentSourceId', 'checkoutSessionId', 'selectedPaymentMethod'].forEach(key => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      });
      localStorage.removeItem('lastPaymentAttempt');
      localStorage.removeItem('lastCheckoutSessionId');
    } catch (e) {
      console.warn('Failed to clean up stored data:', e);
    }
  }

  function updateState(updates) {
    setState(prev => ({ ...prev, ...updates }));
  }

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Enhanced payment status check with better error handling
  async function checkPaymentStatus(identifier, type = 'intent') {
    let endpoint;

    switch (type) {
      case 'session':
        endpoint = `http://localhost/funeraria/api/components/check-checkout-session.php?sessionId=${identifier}`;
        break;
      case 'source':
        endpoint = `http://localhost/funeraria/api/components/check-ewallet-payment.php?sourceId=${identifier}${identifiers.userId ? `&userId=${identifiers.userId}` : ''}`;
        break;
      case 'intent':
      default:
        endpoint = `http://localhost/funeraria/api/components/check-payment-status.php?paymentIntentId=${identifier}`;
        break;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {

      const response = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Status check failed: HTTP ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Payment verification failed");
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  }

  async function verifyPaymentWithRetry(identifier, type = 'intent', maxRetries = 4) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {

        const result = await checkPaymentStatus(identifier, type);

        return result;

      } catch (err) {

        if (attempt === maxRetries) {
          throw new Error(`Payment verification failed after ${maxRetries} attempts: ${err.message}`);
        }

        // Progressive delay: 2s, 4s, 6s, 8s
        await delay(2000 * attempt);
        updateState({ retryCount: attempt });
      }
    }
  }

  // Fixed recordPaymentInDatabase function - around line 245
  async function recordPaymentInDatabase(paymentData, verificationType = 'session') {
    try {

      const { paymentIntentId, sourceId, sessionId, userId: extractedUserId } = identifiers;

      let identifier = null;
      let actualVerificationType = 'intent';
      let statusResult = null;

      // Use the extracted userId
      const actualUserId = extractedUserId || (location.state ? location.state.userId : null);

      // Get stored data to access serviceId and other details
      const storedData = getStoredPaymentData();

      // PRIORITY 1: Use checkout session ID if available (most reliable)
      if (sessionId && (sessionId.startsWith('cs_') || sessionId.startsWith('sess_'))) {
        identifier = sessionId;
        actualVerificationType = 'session';
      }
      // PRIORITY 2: Use source ID for e-wallet payments
      else if (sourceId && sourceId.startsWith('src_')) {
        identifier = sourceId;
        actualVerificationType = 'source';
      }
      // PRIORITY 3: Use payment intent for card payments
      else if (paymentIntentId && paymentIntentId.startsWith('pi_')) {
        identifier = paymentIntentId;
        actualVerificationType = 'intent';
      }
      else {

        if (storedData.sessionId) {
          identifier = storedData.sessionId;
          actualVerificationType = 'session';
        } else if (storedData.sourceId || storedData.source_id) {
          identifier = storedData.sourceId || storedData.source_id;
          actualVerificationType = 'source';
        } else if (storedData.paymentIntentId || storedData.payment_intent_id) {
          identifier = storedData.paymentIntentId || storedData.payment_intent_id;
          actualVerificationType = 'intent';
        } else {
          updateState({
            error: "Payment verification failed: No payment identifier found. Please check your order history or contact support.",
            loading: false
          });
          return;
        }
      }

      // Extract serviceId from multiple possible sources
      let serviceId = null;

      // Priority 1: From passed paymentData
      if (paymentData.serviceId) {
        serviceId = paymentData.serviceId;
      }
      // Priority 2: From location.state (when coming from funeral order payment)
      else if (location.state?.serviceId) {
        serviceId = location.state.serviceId;
      }
      // Priority 3: From stored data
      else if (storedData.serviceId) {
        serviceId = storedData.serviceId;
      }
      // Priority 4: Extract from cart items if they contain service info
      else if (storedData.items && storedData.items.length > 0) {
        const firstItem = storedData.items[0];
        if (firstItem.service_id || firstItem.serviceId) {
          serviceId = firstItem.service_id || firstItem.serviceId;
        }
      }

      const recordData = {
        userId: actualUserId || paymentData.userId || paymentData.user_id,
        amount: paymentData.amount,
        address: paymentData.address,
        orderId: paymentData.orderId,
        serviceId: serviceId, // Now properly extracted
        deliveryDate: paymentData.deliveryDate,
        items: paymentData.items || []
      };

      // FIX: Set payment identifiers based on verification type, not arbitrarily
      if (actualVerificationType === 'session') {
        recordData.checkoutSessionId = sessionId;
        recordData.paymentIntentId = null; // Will be populated by backend
        recordData.sourceId = null;

      } else if (actualVerificationType === 'source') {
        // For e-wallet sources
        recordData.sourceId = sourceId;
        recordData.paymentIntentId = null;
        recordData.checkoutSessionId = null;

      } else {
        // For payment intents
        recordData.paymentIntentId = paymentIntentId;
        recordData.sourceId = null;
        recordData.checkoutSessionId = null;
      }

      if (!recordData.paymentIntentId && !recordData.sourceId && !recordData.checkoutSessionId) {
        throw new Error("No valid payment identifier available for recording");
      }


      // Use the external recordPayment function
      const result = await recordPayment(recordData);

      if (!result.success) {
        throw new Error(result.error || "Failed to record payment in database");
      }

      return result;

    } catch (err) {
      console.error("Database recording error:", err);
      throw new Error(`Database recording failed: ${err.message}`);
    }
  }

  const verifyAndRecord = useCallback(async () => {
    // Don't proceed until identifiers are loaded
    if (!identifiers) {
      return;
    }

    try {

      const { paymentIntentId, sourceId, sessionId, userId: extractedUserId } = identifiers;

      let identifier = null;
      let verificationType = 'intent';
      let statusResult = null;

      // Use the extracted userId
      const actualUserId = extractedUserId || (location.state ? location.state.userId : null);

      // PRIORITY 1: Use checkout session ID if available (most reliable)
      if (sessionId && (sessionId.startsWith('cs_') || sessionId.startsWith('sess_'))) {
        identifier = sessionId;
        verificationType = 'session';
      }
      // PRIORITY 2: Use source ID for e-wallet payments
      else if (sourceId && sourceId.startsWith('src_')) {
        identifier = sourceId;
        verificationType = 'source';
      }
      // PRIORITY 3: Use payment intent for card payments
      else if (paymentIntentId && paymentIntentId.startsWith('pi_')) {
        identifier = paymentIntentId;
        verificationType = 'intent';
      }
      else {
        // Last resort: check stored data
        const storedData = getStoredPaymentData();

        if (storedData.sessionId) {
          identifier = storedData.sessionId;
          verificationType = 'session';
        } else if (storedData.sourceId || storedData.source_id) {
          identifier = storedData.sourceId || storedData.source_id;
          verificationType = 'source';
        } else if (storedData.paymentIntentId || storedData.payment_intent_id) {
          identifier = storedData.paymentIntentId || storedData.payment_intent_id;
          verificationType = 'intent';
        } else {
          updateState({
            error: "Payment verification failed: No payment identifier found. Please check your order history or contact support.",
            loading: false
          });
          return;
        }
      }

      // Wait for webhook processing for e-wallet payments
      if (verificationType === 'source') {
        await delay(3000);
      }

      // Verify payment status with the actual identifier
      try {
        statusResult = await verifyPaymentWithRetry(identifier, verificationType);
      } catch (error) {
        console.error("Payment verification failed:", error);

        // For e-wallet payments, show processing state if verification fails
        if (verificationType === 'source' && identifier) {
          updateState({
            paymentDetails: {
              status: 'processing',
              sourceId: identifier,
              message: 'Your e-wallet payment is being processed. Please refresh this page in a few moments to check the status.',
              paymentIntent: {
                attributes: { amount: 0 },
                id: identifier
              }
            },
            loading: false
          });
          return;
        }

        updateState({
          error: `Payment verification failed: ${error.message}. Please try refreshing the page.`,
          loading: false
        });
        return;
      }

      // Handle different verification result types
      if (verificationType === 'session') {
        // Checkout session verification
        if (statusResult.success) {
          const sessionStatus = statusResult.status;

          // Checkout session verification
          if (statusResult.success) {
            const sessionStatus = statusResult.status;

            if (sessionStatus === 'paid') {
              const storedData = getStoredPaymentData();
              const actualPaymentIntentId = statusResult.session?.payment_intent_id || null;

              let serviceId = null;
              if (storedData.serviceId) {
                serviceId = storedData.serviceId;
              } else if (storedData.items && storedData.items.length > 0) {
                const firstItem = storedData.items[0];
                serviceId = firstItem.service_id || firstItem.serviceId || null;
              }
              const recordData = {
                userId: actualUserId || storedData.userId || storedData.user_id,
                paymentIntentId: actualPaymentIntentId,
                sourceId: sourceId,
                serviceId: serviceId,
                amount: statusResult.amount,
                address: storedData.address || "Address not provided",
                orderId: storedData.orderId || storedData.order_id,
                deliveryDate: storedData.deliveryDate || storedData.delivery_date,
                items: storedData.items || []
              };

              // In the checkout session verification section (around line 416)
              try {
                const recordResult = await recordPaymentInDatabase(recordData, 'session');
                updateState({ recordingResult: recordResult });
              } catch (err) {
                console.error("Failed to record checkout session payment:", err);
              }

              updateState({
                paymentDetails: {
                  status: 'succeeded',
                  sessionId: identifier,
                  paymentIntent: {
                    attributes: { amount: (statusResult.amount || 0) * 100 },
                    id: identifier
                  }
                },
                loading: false
              });
              cleanupStoredData();
              return;
            }
          }
          else if (['pending', 'processing'].includes(sessionStatus)) {
            updateState({
              paymentDetails: {
                status: 'processing',
                sessionId: identifier,
                message: 'Your payment is being processed. Please wait...',
                paymentIntent: {
                  attributes: { amount: (statusResult.amount || 0) * 100 },
                  id: identifier
                }
              },
              loading: false
            });
            return;
          }
          else {
            updateState({
              error: `Checkout session status: ${sessionStatus}. Please contact support.`,
              loading: false
            });
            return;
          }
        }
      }
      else if (verificationType === 'source') {
        // E-wallet source verification
        if (statusResult.success && statusResult.status === 'paid') {
          const storedData = getStoredPaymentData();
          let serviceId = null;
          if (storedData.serviceId) {
            serviceId = storedData.serviceId;
          } else if (storedData.items && storedData.items.length > 0) {
            const firstItem = storedData.items[0];
            serviceId = firstItem.service_id || firstItem.serviceId || null;
          }
          const recordData = {
            userId: actualUserId || storedData.userId || storedData.user_id,
            serviceId: serviceId,
            amount: statusResult.amount,
            address: storedData.address || "Address not provided",
            orderId: storedData.orderId || storedData.order_id,
            deliveryDate: storedData.deliveryDate || storedData.delivery_date,
            items: storedData.items || []
          };

          // In the e-wallet source verification section
          try {
            const recordResult = await recordPaymentInDatabase(recordData, 'source'); // Pass verificationType
            updateState({ recordingResult: recordResult });
          } catch (err) {
            console.error("Failed to record e-wallet payment:", err);
          }

          updateState({
            paymentDetails: {
              status: 'succeeded',
              sourceId: identifier,
              paymentIntent: {
                attributes: { amount: (statusResult.amount || 0) * 100 },
                id: identifier
              }
            },
            loading: false
          });
          cleanupStoredData();
          return;
        }
        else if (statusResult.success && ['processing', 'pending'].includes(statusResult.status)) {
          updateState({
            paymentDetails: {
              status: 'processing',
              sourceId: identifier,
              message: 'Your e-wallet payment is being processed. This may take a few moments.',
              paymentIntent: {
                attributes: { amount: (statusResult.amount || 0) * 100 },
                id: identifier
              }
            },
            loading: false
          });
          return;
        }
      }
      else {
        // Payment intent verification (card payments)
        const paymentStatus = statusResult?.paymentDetails?.status;

        if (!paymentStatus) {
          updateState({
            error: "Invalid payment status response. Please refresh the page.",
            loading: false
          });
          return;
        }

        updateState({ paymentDetails: statusResult.paymentDetails });

        // Handle different payment statuses
        const incompleteStatuses = ['awaiting_payment_method', 'requires_payment_method', 'requires_confirmation', 'requires_action'];

        if (incompleteStatuses.includes(paymentStatus)) {
          updateState({ paymentIncomplete: true, loading: false });
          return;
        }

        if (['pending', 'processing'].includes(paymentStatus)) {
          updateState({ loading: false });
          return;
        }

        if (['failed', 'cancelled'].includes(paymentStatus)) {
          updateState({
            error: `Payment ${paymentStatus}. Please try again or use a different payment method.`,
            loading: false
          });
          return;
        }

        if (paymentStatus !== 'succeeded') {
          updateState({
            error: `Unexpected payment status: ${paymentStatus}. Please contact support.`,
            loading: false
          });
          return;
        }

        // Payment succeeded - record in database (only for non-webhook processed payments)
        const storedData = getStoredPaymentData();
        let serviceId = null;
        if (location.state?.serviceId) {
          serviceId = location.state.serviceId;
        } else if (storedData.serviceId) {
          serviceId = storedData.serviceId;
        } else if (storedData.items && storedData.items.length > 0) {
          const firstItem = storedData.items[0];
          serviceId = firstItem.service_id || firstItem.serviceId || null;
        }
        const recordData = {
          userId: actualUserId || storedData.userId || storedData.user_id,
          paymentIntentId: identifier,
          serviceId: serviceId,
          amount: location.state?.totalAmount || storedData.amount,
          address: location.state?.billingAddress || storedData.address || "Address not provided",
          orderId: location.state?.funeralOrderId || storedData.orderId || storedData.order_id || null,
          deliveryDate: location.state?.selectedDate || storedData.deliveryDate || storedData.delivery_date || null,
          items: location.state?.cartItems || storedData.items || []
        };

        const validationErrors = [];
        if (!recordData.userId) validationErrors.push("User ID is missing");
        if (!recordData.amount || recordData.amount <= 0) validationErrors.push("Invalid payment amount");
        if (!recordData.paymentIntentId && !recordData.sourceId) validationErrors.push("Missing payment identifier");

        if (validationErrors.length > 0) {
          console.warn(`Payment recording validation failed: ${validationErrors.join(', ')}`);
          updateState({
            error: `Payment successful but missing required data: ${validationErrors.join(', ')}. Please contact support.`,
            paymentDetails: statusResult.paymentDetails,
            loading: false
          });
          return;
        }

        // In the payment intent verification section (card payments)
        try {
          const recordResult = await recordPaymentInDatabase(recordData, 'intent'); // Pass verificationType
          updateState({ recordingResult: recordResult });

          if (recordResult.success) {
            cleanupStoredData();
          } else {
            throw new Error(recordResult.error || "Database recording failed");
          }
        } catch (err) {
          console.error("Failed to record payment in database:", err);
          updateState({
            error: "Payment successful but failed to record in database. Please contact support with your payment details.",
            paymentDetails: statusResult.paymentDetails,
            loading: false
          });
          return;
        }
      }

      // Clean up for successful payments
      cleanupStoredData();

    } catch (err) {
      console.error("Error in payment verification and recording:", err);
      updateState({
        error: `Payment processing failed: ${err.message}. Please try refreshing the page.`,
        loading: false
      });
    } finally {
      updateState(prev => ({ ...prev, loading: false, retryCount: 0 }));
    }
  }, [identifiers, location.state]); // Only depend on identifiers and location.state

  // Run verification when identifiers are ready
  useEffect(() => {
    if (identifiers) {
      verifyAndRecord();
    }
  }, [identifiers, verifyAndRecord]);

  // Resume payment for incomplete transactions
  const resumePayment = async () => {
    try {
      // Use the identifiers from state instead of extracting again
      if (!identifiers) {
        updateState({ error: "Cannot resume: payment identifiers not loaded." });
        return;
      }

      const stored = getStoredPaymentData();

      // Use identifiers from state instead of the old variables
      const intentId = identifiers.paymentIntentId;

      if (!intentId) {
        updateState({ error: "Cannot resume: missing payment intent." });
        return;
      }

      const amountCentavos = Math.round(parseFloat(stored.amount || (location.state?.totalAmount || 0)) * 100);
      if (!amountCentavos || amountCentavos < 2000) {
        updateState({ error: "Cannot resume: invalid amount." });
        return;
      }

      const billingEmail = stored?.billingInfo?.email || "";
      if (!billingEmail) {
        updateState({ error: "Cannot resume: billing email is missing." });
        return;
      }

      const storedMethod = sessionStorage.getItem('selectedPaymentMethod')
        || localStorage.getItem('selectedPaymentMethod')
        || stored.paymentMethod;

      const isEwallet = ['gcash', 'grab_pay', 'paymaya'].includes(storedMethod);

      const endpoint = isEwallet
        ? "http://localhost/funeraria/api/components/create-payment-source.php"
        : "http://localhost/funeraria/api/components/create-checkout-session.php";

      // Use userId from identifiers or location.state
      const userId = identifiers.userId || (location.state ? location.state.userId : null);

      // Use orderId from location.state or stored data
      const orderId = location.state?.funeralOrderId || stored.orderId || stored.order_id || null;

      // Use items from location.state or stored data
      const items = location.state?.cartItems || stored.items || [];

      const payload = {
        amount: amountCentavos,
        currency: "PHP",
        billing: {
          name: stored?.billingInfo?.name || "",
          email: billingEmail,
          phone: stored?.billingInfo?.phone || ""
        },
        metadata: {
          user_id: (userId || "").toString(),
          order_id: (orderId || "").toString(),
          items_count: (items.length || 0).toString()
        }
      };

      if (isEwallet) {
        payload.type = storedMethod || 'gcash';
        payload.redirect = {
          success: `${window.location.origin}/gomez/payment-success`,
          failed: `${window.location.origin}/gomez/payment-failed`
        };
      } else {
        payload.payment_method = "card";
        payload.successUrl = `${window.location.origin}/gomez/payment-success?payment_intent=${encodeURIComponent(intentId)}&userId=${encodeURIComponent(userId || '')}`;
        payload.cancelUrl = `${window.location.origin}/gomez/payment-failed`;
        payload.paymentIntentId = intentId;
      }


      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create payment session");
      }

      if (!data.checkout_url) {
        throw new Error("No checkout URL received from server");
      }

      // Store the new session ID if provided
      if (data.session_id) {
        sessionStorage.setItem('checkoutSessionId', data.session_id);
      }
      if (data.source_id) {
        sessionStorage.setItem('paymentSourceId', data.source_id);
      }

      // Redirect to payment page
      window.location.href = data.checkout_url;

    } catch (e) {
      console.error("Resume payment error:", e);
      updateState({
        error: e.message || "Failed to resume payment. Please try again."
      });
    }
  };
  const LoadingView = () => {
    // Safely extract from identifiers
    const paymentIntentId = identifiers?.paymentIntentId;
    const sourceId = identifiers?.sourceId;
    const sessionId = identifiers?.sessionId;
    const userId = identifiers?.userId;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying your payment...
          </h2>
          <p className="text-gray-600 mb-4">
            Please wait while we confirm your payment details.
          </p>
          {state.retryCount > 0 && (
            <p className="text-sm text-blue-600">
              Retry attempt {state.retryCount}/4...
            </p>
          )}

          {/* Enhanced debug info */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
            <p><strong>Debug Info:</strong></p>
            <p>Payment Intent: {paymentIntentId || 'None'}</p>
            <p>Source ID: {sourceId || 'None'}</p>
            <p>Session ID: {sessionId || 'None'}</p>
            <p>User ID: {userId || 'None'}</p>
            <p>URL Params: {window.location.search}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
            <p className="text-sm text-yellow-800">
              Do not close this window or navigate away.
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={() => verifyAndRecord()}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Check Payment Status Now
            </button>
          </div>
        </div>
      </div>
    );
  };


  const PaymentDetailsCard = ({ paymentDetails }) => (
    <div className="mt-6 p-4 bg-gray-50 rounded-md text-left">
      <h3 className="text-sm font-medium text-gray-900">Payment Details</h3>
      <dl className="mt-2 space-y-2">
        <div className="flex justify-between">
          <dt className="text-sm text-gray-600">Status:</dt>
          <dd className="text-sm text-gray-900 capitalize">{paymentDetails.status.replace(/_/g, ' ')}</dd>
        </div>
        {paymentDetails.paymentIntent && (
          <>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Amount:</dt>
              <dd className="text-sm text-gray-900">
                ₱{(paymentDetails.paymentIntent.attributes.amount / 100).toFixed(2)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Payment ID:</dt>
              <dd className="text-sm text-gray-900 truncate ml-2">
                {paymentDetails.paymentIntent.id}
              </dd>
            </div>
          </>
        )}
      </dl>
    </div>
  );

  const ActionButtons = ({ onRefresh, onResume, backToCartLink, showResume = false }) => (
    <div className="mt-6 space-y-3">
      <button
        onClick={onRefresh}
        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        {showResume ? "Check Payment Status" : "Refresh Status"}
      </button>
      {showResume && (
        <button
          onClick={onResume}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
        >
          Continue Payment
        </button>
      )}
      <Link
        to={backToCartLink}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
      >
        {showResume ? "Try Different Payment Method" : "Back to Cart"}
      </Link>
    </div>
  );

  if (state.loading) {
    return <LoadingView />;
  }

  if (state.paymentDetails && ['processing', 'pending'].includes(state.paymentDetails.status)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Processing</h2>
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                {state.paymentDetails?.message || "Your payment is being processed. This may take a few moments. You can safely close this tab; we will update your order once confirmed."}
              </p>
            </div>

            {state.paymentDetails?.paymentIntent && (
              <PaymentDetailsCard paymentDetails={state.paymentDetails} />
            )}

            <ActionButtons
              onRefresh={() => window.location.reload()}
              backToCartLink="/gomez/dashboard-client/cart"
            />
          </div>
        </div>
      </div>
    );
  }

  if (state.paymentIncomplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Incomplete</h2>
            <div className="mt-4 p-4 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                Your payment hasn't been completed yet. You need to finish the payment process.
              </p>
            </div>

            {state.paymentDetails && (
              <PaymentDetailsCard paymentDetails={state.paymentDetails} />
            )}

            <ActionButtons
              onRefresh={verifyAndRecord}
              onResume={resumePayment}
              backToCartLink="/gomez/dashboard-client/cart"
              showResume={true}
            />

            <div className="mt-4 text-xs text-gray-500">
              If you've already completed the payment on another tab or window, click "Check Payment Status" above.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Issue</h2>
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <p className="text-sm text-red-800">{state.error}</p>
            </div>

            <ActionButtons
              onRefresh={() => window.location.reload()}
              backToCartLink="/gomez/dashboard-client/cart"
            />

            <div className="mt-4 text-xs text-gray-500">
              If the problem persists, please contact customer support with your payment details.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  const isSucceeded = state.paymentDetails?.status === 'succeeded';

  if (!isSucceeded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Awaiting payment update...</h2>
          <button
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Successful!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>

          {state.paymentDetails && (
            <PaymentDetailsCard paymentDetails={state.paymentDetails} />
          )}

          {state.recordingResult && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md text-left">
              <h3 className="text-sm font-medium text-blue-900">Order Details</h3>
              <dl className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-blue-600">Order ID:</dt>
                  <dd className="text-sm text-blue-900">#{state.recordingResult.orderId}</dd>
                </div>
                {state.recordingResult.serviceId && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-blue-600">Service ID:</dt>
                    <dd className="text-sm text-blue-900">#{state.recordingResult.serviceId}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="mt-6">
            <Link
              to="/gomez/dashboard-client/menu"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
            >
              Continue Shopping
            </Link>
          </div>

          <div className="mt-4">
            <button
              onClick={() => navigate("/gomez/dashboard-client/cart")}
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              View your orders
            </button>
          </div>
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Payment verification complete</h2>
          <p>Status: {state.paymentDetails?.status || 'Unknown'}</p>
          {state.error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">
              {state.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;