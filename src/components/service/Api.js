export const API_BASE_URL = 'http://192.168.100.99:8000';

// Fetch all available funeral services
export const fetchServices = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/components/services.php`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            // First try to get error message from response JSON if possible
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            } catch (jsonError) {
                // If response isn't JSON, use status text
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        
        // Ensure the response is an array
        if (!Array.isArray(data)) {
            console.warn('Expected array but received:', data);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Failed to fetch services:', error);
        // Return empty array but also log the error for debugging
        return [];
    }
};

// Fetch a specific service by ID
export const fetchServiceById = async (serviceId) => {
    try {
        // Fixed URL path
        const response = await fetch(`${API_BASE_URL}/components/services.php?id=${serviceId}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch service ${serviceId}:`, error);
        throw error;
    }
};

// Place a new order
export const placeOrder = async (orderData) => {
    try {
        // Fixed URL path
        const response = await fetch(`${API_BASE_URL}/components/orders.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        // Handle non-JSON responses
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Server returned non-JSON response:", text);
            throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error: ${response.status} ${response.statusText}. ${errorData.message || ''}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to place order:', error);
        throw error;
    }
};
export const fetchCaskets = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/components/caskets.php`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error(`Error: ${response.status} ${response.statusText}. Response: ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Server returned non-JSON response:", text);
            throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
        }

        let data;
        try {
            data = await response.json();

            if (!Array.isArray(data)) {
                console.warn('API did not return an array for caskets:', data);
                if (data && Array.isArray(data.data)) {
                    return data.data;
                }
                return [];
            }

            return data;
        } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
        }
    } catch (error) {
        console.error('Failed to fetch caskets:', error);
        return [];
    }
};

// Fetch all chapels
export const fetchChapels = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/components/chapel.php`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error(`Error: ${response.status} ${response.statusText}. Response: ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Server returned non-JSON response:", text);
            throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
        }

        let data;
        try {
            data = await response.json();

            if (!Array.isArray(data)) {
                console.warn('API did not return an array for chapels:', data);
                if (data && Array.isArray(data.data)) {
                    return data.data;
                }
                return [];
            }

            return data;
        } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
        }
    } catch (error) {
        console.error('Failed to fetch chapels:', error);
        return [];
    }
};

// Fetch caskets by service ID
export const fetchCasketsByServiceId = async (serviceId) => {
    try {
        const allCaskets = await fetchCaskets();
        return allCaskets.filter(casket => casket.service_id == serviceId);
    } catch (error) {
        console.error(`Failed to fetch caskets for service ${serviceId}:`, error);
        return [];
    }
};

// Fetch chapels by service ID
export const fetchChapelsByServiceId = async (serviceId) => {
    try {
        const allChapels = await fetchChapels();
        return allChapels.filter(chapel => chapel.service_id == serviceId);
    } catch (error) {
        console.error(`Failed to fetch chapels for service ${serviceId}:`, error);
        return [];
    }
};