export async function recordPayment(paymentData) {
  const n = process.env.REACT_APP_API_URL;
  try {
    const { paymentIntentId, sourceId, checkoutSessionId } = paymentData;
    
    if (!paymentIntentId && !sourceId && !checkoutSessionId) {
      throw new Error('Either paymentIntentId, sourceId, or checkoutSessionId must be provided');
    }
    
    const response = await fetch(`${n}/api/components/record-payment.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        userId: paymentData.userId,
        paymentIntentId: paymentIntentId || null,
        sourceId: sourceId,
        checkoutSessionId: checkoutSessionId || null,
        amount: paymentData.amount,
        status:'paid',
        serviceId: paymentData.serviceId || null,
        address: paymentData.address,
        orderId: paymentData.orderId,
        deliveryDate: paymentData.deliveryDate,
        items: paymentData.items || []
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || `HTTP ${response.status}: ${errorText}`;
      } catch (parseError) {
        errorMessage = `HTTP ${response.status}: ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Payment recording failed');
    }

    return result;

  } catch (error) {
    console.error('❌ Error recording payment:', error);
    throw error;
  }
}