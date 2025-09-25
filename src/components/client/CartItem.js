import React from 'react';
const CartItem = ({
    item,
    editingItemId,
    editingQuantity,
    setEditingQuantity,
    onEditClick,
    onUpdateQuantity,
    onDeleteClick,
    isOrderCart = false,
    isProcessingFuneralPayment = false
}) => {
    const formatExpirationTime = (expirationDate) => {
        const now = new Date();
        const expiration = new Date(expirationDate);
        const diffInMinutes = Math.floor((expiration - now) / (1000 * 60));

        if (diffInMinutes <= 0) {
            return 'Expired';
        }

        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
        }

        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;

        if (minutes === 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        }

        return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };

    const getExpirationStyle = (expirationDate) => {
        const now = new Date();
        const expiration = new Date(expirationDate);
        const diffInMinutes = Math.floor((expiration - now) / (1000 * 60));

        if (diffInMinutes <= 0) {
            return 'text-red-600 font-semibold';
        }

        if (diffInMinutes < 5) {
            return 'text-red-500';
        }

        if (diffInMinutes < 15) {
            return 'text-orange-500';
        }

        return 'text-gray-600';
    };

    const isEditing = editingItemId === item.id;
    const canEdit = !isOrderCart && !isProcessingFuneralPayment;
    const canDelete = !isProcessingFuneralPayment;

    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={`http://localhost/apii/components/${item.image_path}`}
                            alt={item.name}
                        />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">₱{parseFloat(item.price).toFixed(2)}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <input
                        type="number"
                        min="1"
                        value={editingQuantity}
                        onChange={(e) => {
                            if (canEdit) {
                                const value = parseInt(e.target.value);
                                setEditingQuantity(isNaN(value) ? 1 : value);
                            }
                        }}
                        className={`w-16 px-2 py-1 border rounded text-sm ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        disabled={!canEdit}
                        readOnly={!canEdit}
                    />
                ) : (
                    <div className="text-sm text-gray-900">{item.quantity}</div>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">₱{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {!isOrderCart && item.expiration_date && (
                    <div className={`text-sm ${getExpirationStyle(item.expiration_date)}`}>
                        {formatExpirationTime(item.expiration_date)}
                    </div>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {isEditing ? (
                    <>
                        <button
                            className="text-green-600 hover:text-green-900 mr-2"
                            onClick={() => onUpdateQuantity(item.id)}
                        >
                            Save
                        </button>
                        <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => setEditingQuantity(null)}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className={`text-indigo-600 hover:text-indigo-900 mr-2 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => canEdit && onEditClick(item.id, item.quantity)}
                            disabled={!canEdit}
                        >
                            Edit
                        </button>
                        <button
                            className={`text-red-600 hover:text-red-900 ${!canDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => canDelete && onDeleteClick(item.id)}
                            disabled={!canDelete}
                        >
                            Delete
                        </button>
                    </>
                )}
            </td>
        </tr>
    );
};

export default CartItem;