export const API_BASE_URL = 'http://localhost';

// Fetch all available funeral services
export const fetchServices = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/apii/components/services.php`, {
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
            console.log('Fetched data:', data); // Debugging statement

            if (!Array.isArray(data)) {
                console.warn('API did not return an array for services:', data);
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
        console.error('Failed to fetch services:', error);
        return [];
    }
};


// Fetch a specific service by ID
export const fetchServiceById = async (serviceId) => {
    try {
        // Fixed URL path
        const response = await fetch(`${API_BASE_URL}/apii/components/services.php?id=${serviceId}`);
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
        const response = await fetch(`${API_BASE_URL}/apii/components/orders.php`, {
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
        const response = await fetch(`${API_BASE_URL}/apii/components/caskets.php`, {
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
            console.log('Fetched caskets data:', data);

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

// Fetch all flowers
export const fetchFlowers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/apii/components/flowers.php`, {
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
            console.log('Fetched flowers data:', data);

            if (!Array.isArray(data)) {
                console.warn('API did not return an array for flowers:', data);
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
        console.error('Failed to fetch flowers:', error);
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

// Fetch flowers by service ID
export const fetchFlowersByServiceId = async (serviceId) => {
    try {
        const allFlowers = await fetchFlowers();
        return allFlowers.filter(flower => flower.service_id == serviceId);
    } catch (error) {
        console.error(`Failed to fetch flowers for service ${serviceId}:`, error);
        return [];
    }
};

// Initialize the database with sample data
export const initializeDatabase = async () => {
    try {
        // Fixed URL path
        const response = await fetch(`${API_BASE_URL}/apii/components/initialize.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }        
        return await response.json();
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};