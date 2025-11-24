import React, { useContext, useRef, useEffect } from 'react';
import { EmailContext } from '../../utils/EmailContext';
import toast, { Toaster } from 'react-hot-toast';
import { useMenuItems } from '../../hooks/client/useMenuItems';
import { useUser } from '../../hooks/client/useUser';
import { useQuantities } from '../../hooks/client/useQuantities';
import { usePurchase } from '../../hooks/client/usePurchase';

const ClientCustomized = () => {
  const { email } = useContext(EmailContext);
  const customizationItemsRef = useRef([]);
  const otherProductsRef = useRef([]);
  
  // Custom hooks
  const { items, loading, error, updateItemStock } = useMenuItems();
  const { userId, isLoggedIn } = useUser(email);
  const { quantities, handleQuantityChange } = useQuantities(items);
  const { handleBuy, purchasing } = usePurchase(isLoggedIn, userId, updateItemStock);

  // Filter items based on whether details contains "item"
  const customizationItems = items.filter(item => 
    !item.details?.toLowerCase().includes('item')
  );
  
  const otherProducts = items.filter(item => 
    item.details?.toLowerCase().includes('item')
  );

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    [...customizationItemsRef.current, ...otherProductsRef.current].forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      [...customizationItemsRef.current, ...otherProductsRef.current].forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [customizationItems, otherProducts]);

  const onBuyClick = (itemId) => {
    const quantity = quantities[itemId];
    handleBuy(itemId, quantity);
  };

  // Render menu item card
  const renderMenuItemCard = (item, index, refArray) => (
    <div
      key={item.id}
      ref={el => refArray.current[index] = el}
      className="menu-card rounded-xl overflow-hidden"
    >
      <div className="relative">
        <img
          src={`http://localhost/funeraria/api/components/${item.image_path}`}
          alt={item.name}
          className="w-full h-56 sm:h-64 object-cover"
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
          <p className="text-gray-900 font-bold text-xl">₱{parseFloat(item.price)}</p>
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
              value={quantities[item.id] || 1}
              onChange={(event) => handleQuantityChange(item.id, event)}
              min="1"
              max={item.stock}
              className="w-16 p-1 rounded bg-white text-gray-900 border border-gray-300 focus:border-gray-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => onBuyClick(item.id)}
            disabled={!isLoggedIn || item.stock < 1 || purchasing}
            className={`btn-primary px-4 py-2 rounded-lg text-sm font-medium flex-grow ${
              !isLoggedIn || item.stock < 1 || purchasing
                ? 'opacity-50 cursor-not-allowed'
                : 'text-white'
            }`}
          >
            {purchasing ? 'Adding...' : item.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6 min-h-[70vh]">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-6 min-h-[70vh]">
        <div className="text-xl text-red-600">Error: {error}</div>
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
            
            .menu-card {
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              background: linear-gradient(145deg, #ffffff, #f3f4f6);
              border: 1px solid rgba(0, 0, 0, 0.1);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              opacity: 0;
              transform: translateY(30px);
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
          toastOptions={{
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
            success: {
              duration: 4000,
              style: {
                background: '#10b981',
                color: '#ffffff',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#ffffff',
              },
            },
          }}
        />

        {/* Login Warning */}
        {!isLoggedIn && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded-r-lg">
            <p className="font-medium">Please log in to make purchases.</p>
          </div>
        )}

        {/* Package Customization Section */}
        <div className="mb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gomez Package Customization</h1>
            <p className="text-gray-600">Customize your service package with our additional options</p>
          </div>

          {customizationItems.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-inner border border-gray-200">
              <p className="text-lg text-gray-600">No customization options available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {customizationItems.map((item, index) => renderMenuItemCard(item, index, customizationItemsRef))}
            </div>
          )}
        </div>

        {/* Other Products Section */}
        <div className="mb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gomez Other Products</h1>
            <p className="text-gray-600">Select from our range of dignified menu items</p>
          </div>

          {otherProducts.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-inner border border-gray-200">
              <p className="text-lg text-gray-600">No other products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherProducts.map((item, index) => renderMenuItemCard(item, index, otherProductsRef))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientCustomized;