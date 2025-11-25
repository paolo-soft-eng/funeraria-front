import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteModal = ({ open, onConfirm, onCancel, user }) => {
  if (!open) return null;

  const getInitials = (name) => name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in p-6">

        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-100 rounded-full mb-4">
          <AlertTriangle className="text-rose-600" size={32} />
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center">Delete Administrator</h2>

        <p className="text-gray-600 text-center mt-2 mb-4">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">{user?.username}</span>?  
          This action cannot be undone.
        </p>

        {user && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold">
                {getInitials(user.username)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
