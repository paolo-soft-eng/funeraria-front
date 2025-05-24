import React, { useEffect, useState, useContext, useRef } from 'react';
import { EmailContext } from '../EmailContext';
import { Link } from 'react-router-dom';

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
                alert('Item added to your cart successfully!');
                // Update the item's stock in the state
                setItems(prevItems =>
                    prevItems.map(item =>
                        item.id === itemId ? { ...item, stock: item.stock - quantity } : item
                    )
                );
            } else {
                alert('Purchase failed: ' + data.error);
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Define styles without using style jsx */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }

                    @keyframes slideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }

                    @keyframes slideDown {
                        from { transform: translateY(0); opacity: 1; }
                        to { transform: translateY(20px); opacity: 0; }
                    }

                    .animate-section {
                        animation: fadeIn 1s ease forwards, slideUp 0.8s ease 0.2s both;
                    }

                    .reverse-animate-section {
                        animation: fadeOut 1s ease forwards, slideDown 0.8s ease 0.2s both;
                    }
                    
                    .btn-primary {
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .btn-primary:after {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 0;
                        height: 0;
                        background: rgba(255,255,255,0.2);
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                        transition: width 0.3s, height 0.3s;
                    }
                    
                    .btn-primary:hover:after {
                        width: 200%;
                        height: 200%;
                    }
                    
                    .btn-primary:active {
                        transform: translateY(2px);
                    }
                `
            }} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-2xl font-bold mb-3 sm:mb-0">Menu Items</h1>
                <Link to="/dashboard-client/cart" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded shadow-md transition-all duration-300 w-full sm:w-auto text-center">
                    View Cart
                </Link>
            </div>

            {!isLoggedIn && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                    <p className="font-medium">Please log in to make purchases.</p>
                </div>
            )}

            {items.length === 0 ? (
                <div className="text-center p-6 bg-gray-100 rounded-lg shadow-inner">
                    <p className="text-lg text-gray-600">No items available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            ref={el => itemsRef.current[index] = el}
                            className="border rounded-lg shadow-md overflow-hidden opacity-0 transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="relative">
                                <img
                                    src={`http://localhost/apii/components/${item.image_path}`}
                                    alt={item.name}
                                    className="w-full h-48 sm:h-56 object-cover"
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
                                    }}
                                />
                                {parseInt(item.stock) < 5 && parseInt(item.stock) > 0 && (
                                    <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                                        Low Stock
                                    </div>
                                )}
                                {parseInt(item.stock) <= 0 && (
                                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                        Out of Stock
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-gray-700">
                                <h2 className="text-xl font-semibold mb-2 text-white">{item.name}</h2>
                                <p className="text-gray-200 mb-2 text-sm sm:text-base">{item.details}</p>
                                <p className="text-gray-100 font-bold mb-2 text-lg">₱{parseFloat(item.price).toFixed(2)}</p>
                                <p className={`mb-3 ${parseInt(item.stock) < 5 ? 'text-red-400' : 'text-gray-300'} text-sm`}>
                                    Stock: {item.stock}
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center">
                                        <label htmlFor={`quantity-${item.id}`} className="mr-2 text-gray-200 whitespace-nowrap">Quantity:</label>
                                        <input
                                            type="number"
                                            id={`quantity-${item.id}`}
                                            value={quantities[item.id]}
                                            onChange={(event) => handleQuantityChange(item.id, event)}
                                            min="1"
                                            max={item.stock}
                                            className="p-1 rounded w-14 text-center text-black bg-slate-200 border border-gray-400"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleBuy(item.id)}
                                        disabled={!isLoggedIn || item.stock < 1}
                                        className={`btn-primary px-3 py-2 rounded text-sm sm:text-base ${
                                            !isLoggedIn || item.stock < 1
                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-800 hover:bg-gray-900 text-white shadow-md'
                                        } flex-grow`}
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
    );
};

export default ClientMenu;