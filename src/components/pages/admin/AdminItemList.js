import React from "react";
import AdminLayout from "./AdminLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import custom hooks
import { useAuth } from "../../hooks/admin/useAuth";
import { useItems } from "../../hooks/admin/useItems";
import { useItemForm } from "../../hooks/admin/useItemForm";
import { usePagination } from "../../hooks/admin/usePagination";

const AdminItemList = () => {
  const n = process.env.REACT_APP_API_URL;
  // Authentication
  const { isLoggedIn, userId, userName } = useAuth();

  // Pagination - initialize first
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  // Items management - depends on pagination
  const { items, setItems, totalItems, isLoading, fetchItems } = useItems(
    currentPage,
    itemsPerPage
  );

  // Pagination handlers - use totalItems from useItems
  const {
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    getVisiblePageNumbers,
  } = usePagination(totalItems, itemsPerPage, currentPage, setCurrentPage, setItemsPerPage);

  // Form management
  const {
    formData,
    imagePreview,
    setImagePreview,
    isLoading: formLoading,
    confirmationModal,
    handleChange,
    handleImageChange,
    handleSubmit,
    resetForm,
    editItem,
    deleteItem,
    closeConfirmation,
    handleConfirm,
  } = useItemForm(userId, userName, fetchItems);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Login Required Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Login Required
            </h2>
            <p className="mt-2 text-gray-600">
              Please log in to access the admin dashboard.
            </p>
            <div className="mt-6">
              <a
                href="/gomez/auth"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout currentPage="itemlists">
      <div className="container mx-auto px-4 py-6">
        {/* Add/Update Form */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Manage Items
          </h1>
          <p className="text-gray-600 text-sm mb-7">manage and track menu items</p>

          <h2 className="text-xl font-semibold mb-4">
            {formData.id ? "Update Item" : "Add New Item"}
          </h2>

          <form
            onSubmit={(e) => handleSubmit(e, setItems)}
            encType="multipart/form-data"
          >
            <input type="hidden" name="id" value={formData.id} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name:
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details:
                </label>
                <input
                  type="text"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price:
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock:
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image:
              </label>
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.id && !formData.image && imagePreview
                      ? "Leave empty to keep current image"
                      : "Upload a services image"}
                  </p>
                </div>
                {imagePreview && (
                  <div className="w-24 h-24 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {formLoading
                  ? "Processing..."
                  : formData.id
                    ? "Update Item"
                    : "Add Item"}
              </button>
              {formData.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-xl font-semibold">Current Items</h2>

              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                  Items per page:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Items count display */}
            <div className="mb-4 text-sm text-gray-600">
              Showing{" "}
              {items.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}{" "}
              to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)}{" "}
              of {totalItems} items
            </div>

            {isLoading && <p className="text-gray-500">Loading items...</p>}
            {!isLoading && items.length === 0 && (
              <p className="text-gray-500">No items found</p>
            )}
          </div>

          {items.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Details
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {item.image_path ? (
                            <img
                              src={`${n}/api/components/${item.image_path}`}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md">
                              <span className="text-gray-400 text-xs">
                                No image
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.details}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          ₱{formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {item.stock}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <button
                            onClick={() => editItem(item)}
                            className="mr-2 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Previous button */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Previous
                      </button>
                    </div>

                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {getVisiblePageNumbers().map((pageNum, idx) => (
                        <React.Fragment key={idx}>
                          {pageNum === "..." ? (
                            <span className="px-3 py-2 text-sm text-gray-500">
                              ...
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${currentPage === pageNum
                                  ? "bg-gray-600 text-white"
                                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                              {pageNum}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Next button */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {/* Page info */}
                  <div className="mt-2 text-center text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Custom Confirmation Modal */}
        {confirmationModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mr-3 text-red-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {confirmationModal.title}
                  </h3>
                  <p className="text-gray-600">
                    {confirmationModal.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeConfirmation}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </AdminLayout>
  );
};

export default AdminItemList;