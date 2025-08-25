import React, { useEffect, useState, useContext, useRef } from 'react';
import { EmailContext } from '../EmailContext';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const ClientMenu = () => {
    const [items, setItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [userId, setUserId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { email } = useContext(EmailContext);
    const [loading, setLoading] = useState(true);
    const itemsRef = useRef([]);

    useEffect(() => {
        if (email) {
            // Fetch user ID based on email
            fetch(`http://localhost/apii/components/getUserId.php?email=${encodeURIComponent(email)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.userId) {
                        setUserId(data.userId);
                        setIsLoggedIn(true);
                    }
                })
                .catch(error => console.error('Error fetching user ID:', error));
        }

        // Fetch menu items
        fetch('http://localhost/apii/components/fetchItems.php')
            .then(response => response.json())
            .then(data => {
                setItems(data);
                // Initialize quantities state with 1 for each item
                const initialQuantities = data.reduce((acc, item) => {
                    acc[item.id] = 1;
                    return acc;
                }, {});
                setQuantities(initialQuantities);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, [email]);

    useEffect(() => {
        // Properly set up refs when items change
        itemsRef.current = itemsRef.current.slice(0, items.length);
        
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-section');
                    entry.target.classList.remove('reverse-animate-section');
                } else {
                    entry.target.classList.remove('animate-section');
                    entry.target.classList.add('reverse-animate-section');
                }
            });
        }, options);

        // Only observe elements that exist
        itemsRef.current.forEach(ref => {
            if (ref) {
                observer.observe(ref);
            }
        });

        return () => {
            // Clean up by only unobserving elements that exist
            itemsRef.current.forEach(ref => {
                if (ref && observer) {
                    try {
                        observer.unobserve(ref);
                    } catch (error) {
                        console.log('Failed to unobserve element:', error);
                    }
                }
            });
        };
    }, [items]);

    const handleQuantityChange = (itemId, event) => {
        const newQuantities = { ...quantities, [itemId]: parseInt(event.target.value, 10) };
        setQuantities(newQuantities);
    };

    const handleBuy = (itemId) => {
        // Check if user is logged in
        if (!isLoggedIn) {
            alert('Please log in to make a purchase.');
            return;
        }

        const quantity = quantities[itemId];
        // Send a request to the backend to handle the purchase
        fetch('http://localhost/apii/components/buyItems.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemId,
                quantity,
                userId
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                toast.success('Item added to cart successfully', {
              duration: 2000,
              position: 'top-right',
            });
                // Update the item's stock in the state
                setItems(prevItems =>
                    prevItems.map(item =>
                        item.id === itemId ? { ...item, stock: item.stock - quantity } : item
                    )
                );
            } else {
                toast.error('Purchase failed: ' + data.error);
            }
        })
        .catch(error => console.error('Error buying item:', error));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-6 min-h-[70vh]">
                <div className="text-xl text-gray-600">Loading menu items...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <style dangerouslySetInnerHTML={{
                    __html: `
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }

                        @keyframes slideUp {
                            from { transform: translateY(30px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }

                        .animate-section {
                            animation: fadeIn 1.2s ease forwards, slideUp 1s ease 0.3s both;
                        }

                        .reverse-animate-section {
                            animation: fadeOut 0.8s ease forwards;
                        }
                        
                        .menu-card {
                            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                            background: linear-gradient(145deg, #ffffff, #f3f4f6);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                        }
                        
                        .menu-card:hover {
                            transform: translateY(-5px);
                            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                        }

                        .btn-primary {
                            transition: all 0.3s ease;
                            background: linear-gradient(145deg, #4b5563, #374151);
                            border: 1px solid rgba(0, 0, 0, 0.1);
                        }
                        
                        .btn-primary:hover:not(:disabled) {
                            background: linear-gradient(145deg, #374151, #1f2937);
                            transform: translateY(-2px);
                        }
                        
                        .btn-primary:active:not(:disabled) {
                            transform: translateY(1px);
                        }

                        .stock-badge {
                            backdrop-filter: blur(4px);
                            background: rgba(0, 0, 0, 0.6);
                        }
                    `
                }} />

                <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: '',
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            // Default options for specific types
            success: {
              duration: 4000,
              theme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
              style: {
                background: '#10b981',
                color: '#ffffff',
              },
            },
            error: {
              duration: 4000,
              theme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
              style: {
                background: '#ef4444',
                color: '#ffffff',
              },
            },
          }}
        />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Services</h1>
                        <p className="text-gray-600">Select from our range of dignified funeral services</p>
                    </div>
                    <Link 
                        to="/dashboard-client/cart" 
                        className="mt-4 sm:mt-0 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 w-full sm:w-auto text-center font-medium"
                    >
                        View Cart
                    </Link>
                </div>

                {!isLoggedIn && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-r-lg">
                        <p className="font-medium">Please log in to make purchases.</p>
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-xl shadow-inner border border-gray-200">
                        <p className="text-lg text-gray-600">No services available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                ref={el => itemsRef.current[index] = el}
                                className="menu-card rounded-xl overflow-hidden opacity-0"
                            >
                                <div className="relative">
                                    <img
                                        src={`http://localhost/apii/components/${item.image_path}`}
                                        alt={item.name}
                                        className="w-full h-56 sm:h-64 object-cover"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
                                        }}
                                    />
                                    {parseInt(item.stock) < 5 && parseInt(item.stock) > 0 && (
                                        <div className="stock-badge absolute top-3 right-3 text-white text-xs px-3 py-1.5 rounded-full">
                                            Low Stock
                                        </div>
                                    )}
                                    {parseInt(item.stock) <= 0 && (
                                        <div className="stock-badge absolute top-3 right-3 text-white text-xs px-3 py-1.5 rounded-full">
                                            Out of Stock
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold mb-3 text-gray-800">{item.name}</h2>
                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.details}</p>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-gray-900 font-bold text-xl">₱{parseFloat(item.price).toFixed(2)}</p>
                                        <p className={`text-sm ${parseInt(item.stock) < 5 ? 'text-red-600' : 'text-gray-500'}`}>
                                            Stock: {item.stock}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                            <label htmlFor={`quantity-${item.id}`} className="mr-2 text-gray-600 text-sm">Qty:</label>
                                            <input
                                                type="number"
                                                id={`quantity-${item.id}`}
                                                value={quantities[item.id]}
                                                onChange={(event) => handleQuantityChange(item.id, event)}
                                                min="1"
                                                max={item.stock}
                                                className="w-16 p-1 rounded bg-white text-gray-900 border border-gray-300 focus:border-gray-400 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleBuy(item.id)}
                                            disabled={!isLoggedIn || item.stock < 1}
                                            className={`btn-primary px-4 py-2 rounded-lg text-sm font-medium flex-grow ${
                                                !isLoggedIn || item.stock < 1
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'text-white'
                                            }`}
                                        >
                                            {item.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientMenu;