import React, { useState, useEffect } from 'react';

const BillingForm = ({
    onSubmit,
    disabled,
    userId,
    cartItems,
    orderId,
    isFuneralPackage = false,
    customerInfo = null,
    serviceDate = null
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        deliveryDate: new Date().toISOString().slice(0, 16)
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [formValid, setFormValid] = useState(false);

    // Initialize form with customer info and serviceDate
    useEffect(() => {
        if (customerInfo) {
            const newFormData = {
                name: customerInfo.name || '',
                email: customerInfo.email || '',
                phone: customerInfo.phone || '',
                address: isFuneralPackage ? 'Chapel' : (customerInfo.address || ''),
                // Use serviceDate for funeral packages, otherwise use default
                deliveryDate: isFuneralPackage && serviceDate 
                    ? serviceDate 
                    : new Date().toISOString().slice(0, 16)
            };
            setFormData(newFormData);
        } else if (isFuneralPackage && serviceDate) {
            // If no customer info but we have serviceDate, still use it
            setFormData(prev => ({
                ...prev,
                deliveryDate: serviceDate
            }));
        }
    }, [customerInfo, isFuneralPackage, serviceDate]);

    // Check form validity whenever formData or errors change
    useEffect(() => {
        const isValid = Object.keys(formData).every(field => {
            if (field === 'deliveryDate') {
                // For funeral packages, deliveryDate is pre-filled with serviceDate
                if (isFuneralPackage) {
                    return formData[field] && formData[field].trim() !== '';
                }
                // For regular orders, validate it's in the future
                const selectedDate = new Date(formData[field]);
                const now = new Date();
                return formData[field] && selectedDate > now;
            }
            return formData[field] && formData[field].trim() !== '' && !errors[field];
        });
        setFormValid(isValid);
    }, [formData, errors, isFuneralPackage]);

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Name is required';
                if (value.trim().length < 2) return 'Name must be at least 2 characters';
                return '';
            case 'email':
                if (!value.trim()) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Please enter a valid email address';
                return '';
            case 'phone':
                if (!value.trim()) return 'Phone number is required';
                const phoneRegex = /^9\d{9}$/;
                if (!phoneRegex.test(value)) return 'Phone number must start with 9 and be 10 digits long';
                return '';
            case 'address':
                if (!value.trim()) return 'Address is required';
                if (value.trim().length < 5) return 'Please enter a complete address';
                return '';
            case 'deliveryDate':
                if (!value) return isFuneralPackage ? 'Service date is required' : 'Delivery date is required';

                const selected = new Date(value);
                const today = new Date();

                // Normalize both dates to compare
                selected.setSeconds(0, 0);
                today.setSeconds(0, 0);

                // For funeral packages, the date is pre-set and should not be in the past
                if (isFuneralPackage) {
                    if (selected < today) return 'Service date cannot be in the past';
                    return '';
                }

                // For regular orders, must be in the future
                if (selected < today) return 'Delivery date cannot be in the past';
                return '';

            default:
                return '';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);
        setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveMessage('');

        if (validateForm()) {
            try {
                // Simulate API call to save billing info
                await new Promise(resolve => setTimeout(resolve, 500));

                // Call the parent onSubmit with form data and validity
                onSubmit && onSubmit(formData, true);
                setSaveMessage('Billing information saved successfully!');
            } catch (error) {
                setSaveMessage('Error saving billing information');
            }
        } else {
            setSaveMessage('Please fix the errors above');
            onSubmit && onSubmit(formData, false);
        }

        setSaving(false);
    };

    const getFieldClassName = (fieldName) => {
        const baseClass = "w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";
        if (errors[fieldName] && touched[fieldName]) {
            return `${baseClass} border-red-500 focus:border-red-500`;
        }
        return `${baseClass} border-gray-300 focus:border-blue-500`;
    };

    return (
        <div onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Full Name *
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('name')}
                    placeholder="Enter your full name"
                    disabled={disabled}
                />
                {errors.name && touched.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email Address *
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('email')}
                    placeholder="Enter your email address"
                    disabled={disabled}
                />
                {errors.email && touched.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Phone Number *
                </label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('phone')}
                    placeholder="e.g., 9123456789"
                    disabled={disabled}
                />
                {errors.phone && touched.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    {isFuneralPackage ? 'Service Location *' : 'Delivery Address *'}
                </label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('address')}
                    placeholder={isFuneralPackage ? 'Service location' : 'Enter your complete delivery address'}
                    rows={3}
                    disabled={isFuneralPackage}
                />
                {errors.address && touched.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    {isFuneralPackage ? 'Service Date & Time *' : 'Delivery Date & Time *'}
                </label>
                <input
                    type="datetime-local"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName('deliveryDate')}
                    min={new Date().toISOString().slice(0, 16)}
                />
                {isFuneralPackage && (
                    <p className="text-green-600 text-xs mt-1">
                        ✓ Service date has been set for this funeral package
                    </p>
                )}
                {errors.deliveryDate && touched.deliveryDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.deliveryDate}</p>
                )}
            </div>

            {saveMessage && (
                <div className={`p-3 rounded text-sm mb-4 ${saveMessage.includes('successfully')
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                    {saveMessage}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={disabled || saving}
                className={`w-full py-2 px-4 rounded text-white text-sm font-semibold transition-colors ${disabled || saving
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {saving ? 'Saving...' : 'Save Billing Info'}
            </button>
        </div>
    );
};

export default BillingForm;