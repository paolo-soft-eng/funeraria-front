const n = process.env.REACT_APP_API_URL;
export const API_BASE_URL = `${n}/api`;

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
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            } catch (jsonError) {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
            console.warn('Expected array but received:', data);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Failed to fetch services:', error);
        return [];
    }
};

// Fetch a specific service by ID
export const fetchServiceById = async (serviceId) => {
    try {
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
        const response = await fetch(`${API_BASE_URL}/components/orders.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

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

// Fetch all chapels - FIXED to use service_id parameter and bypass cache
export const fetchChapels = async (serviceId = null, timestamp = null) => {
    try {
        // Build URL with service_id if provided and cache-busting timestamp
        let url = `${API_BASE_URL}/components/chapel.php`;
        const params = new URLSearchParams();
        
        if (serviceId) {
            params.append('service_id', serviceId);
        }
        
        // Add timestamp to prevent caching
        if (timestamp) {
            params.append('_t', timestamp);
        }
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        console.log('Fetching chapels from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Disable caching
            cache: 'no-store'
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
            console.log('Received chapel data:', data);

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
// Fetch all items with stock information
export const fetchItems = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/components/items.php`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            } catch (jsonError) {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        console.log("STock: "+data);
        
        
        if (!Array.isArray(data)) {
            console.warn('Expected array but received:', data);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Failed to fetch items:', error);
        return [];
    }
};

// Fetch caskets by service ID
export const fetchCasketsByServiceId = async (serviceId, timestamp = null) => {
    try {
        const allCaskets = await fetchCaskets();
        return allCaskets.filter(casket => casket.service_id == serviceId);
    } catch (error) {
        console.error(`Failed to fetch caskets for service ${serviceId}:`, error);
        return [];
    }
};

// Fetch chapels by service ID - FIXED to use server-side filtering
export const fetchChapelsByServiceId = async (serviceId, timestamp = null) => {
    try {
        // Use the updated fetchChapels function with service_id parameter
        return await fetchChapels(serviceId, timestamp || Date.now());
    } catch (error) {
        console.error(`Failed to fetch chapels for service ${serviceId}:`, error);
        return [];
    }
};