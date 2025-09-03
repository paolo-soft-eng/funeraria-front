import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
const AdminDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost/apii/components/adminDocuments.php', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.status === 'success') {
                setDocuments(result.data);
            } else {
                setError(result.message || 'Failed to fetch documents');
            }
        } catch (err) {
            setError('Error fetching documents: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDownloadWithErrorHandling = (doc) => {
        try {
            const link = document.createElement('a');
            link.href = getDocumentUrl(doc);
            link.download = doc.document_name || 'download';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(getDocumentUrl(doc), '_blank');
        }
    };

    const getDocumentTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'jpg':
            case 'jpeg':
            case 'png':
                return '🖼️';
            default:
                return '📎';
        }
    };

    const getDocumentUrl = (doc, action = 'file') => {
        return `http://localhost/apii/components/documents.php?${action}=${encodeURIComponent(doc.document_path)}`;
    };

    const getPreviewUrl = (doc) => {
        return `http://localhost/apii/components/adminDocuments.php?preview=${encodeURIComponent(doc.document_path)}`;
    };

    const isPreviewable = (type) => {
        if (!type) return false;
        const t = type.toLowerCase();
        return ['pdf', 'jpg', 'jpeg', 'png'].includes(t);
    };

    const handleDocumentSelect = (documentId) => {
        setSelectedDocuments(prev =>
            prev.includes(documentId)
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };

    const handleBulkPrint = () => {
        if (selectedDocuments.length === 0) {
            alert('Please select documents to print');
            return;
        }

        selectedDocuments.forEach(docId => {
            const doc = documents.find(d => d.id === docId);
            if (doc) {
                printDocument(doc);
            }
        });
    };

    const openDocumentViewer = (document) => {
        setCurrentDocument(document);
        if (isPreviewable(document.file_extension)) {
            setPreviewUrl(getPreviewUrl(document));
        }
        setIsDocumentViewerOpen(true);
    };

    const printDocument = (document) => {
        const printWindow = window.open('', '_blank');
        const isPreviewableDoc = isPreviewable(document.file_extension);
        const documentUrl = isPreviewableDoc ? getPreviewUrl(document) : getDocumentUrl(document);
        const isImageFile = ['jpg', 'jpeg', 'png'].includes(document.file_extension?.toLowerCase());

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Print: ${document.document_name}</title>
                <style>
                    body { 
                        margin: 0; 
                        padding: 0; 
                        font-family: Arial, sans-serif; 
                        background: white;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                    }
                    
                    /* For PDF files */
                    iframe { 
                        width: 100%; 
                        height: 100vh; 
                        border: none; 
                    }
                    
                    /* For image files */
                    .image-container {
                        width: 100%;
                        height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    
                    .image-container img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        border: none;
                    }
                    
                    .no-preview {
                        text-align: center;
                        padding: 40px;
                        background: #f8f9fa;
                        border-radius: 5px;
                        border: 1px solid #ddd;
                        margin: 20px;
                    }
                    
                    .download-link {
                        color: #007bff;
                        text-decoration: none;
                        font-weight: bold;
                    }
                    
                    .download-link:hover {
                        text-decoration: underline;
                    }
                    
                    .control-buttons {
                        position: fixed; 
                        bottom: 20px; 
                        right: 20px; 
                        z-index: 1000;
                        display: flex;
                        gap: 10px;
                    }
                    
                    .control-buttons button {
                        background: #007bff; 
                        color: white; 
                        border: none; 
                        padding: 10px 15px; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        font-size: 14px;
                    }
                    
                    .control-buttons button:hover {
                        opacity: 0.9;
                    }
                    
                    .control-buttons .close-btn {
                        background: #6c757d;
                    }
                    
                    @media print {
                        .no-print { display: none !important; }
                        body { 
                            padding: 0; 
                            margin: 0; 
                            background: white;
                        }
                        iframe { height: 100vh; }
                        .image-container { 
                            padding: 0;
                            height: 100vh;
                        }
                        .image-container img {
                            max-width: 100%;
                            max-height: 100%;
                            width: auto;
                            height: auto;
                        }
                    }
                </style>
            </head>
            <body>
                ${isImageFile ?
                `<div class="image-container">
                        <img src="${documentUrl}" alt="${document.document_name}" onload="console.log('Image loaded')" onerror="console.error('Image failed to load')" />
                    </div>` :
                (isPreviewableDoc ?
                    `<iframe src="${documentUrl}" title="${document.document_name}" onload="console.log('PDF loaded')"></iframe>` :
                    `<div class="no-preview">
                            <h3>Preview not available for this file type</h3>
                            <p>This document cannot be previewed in the browser.</p>
                            <p>File type: ${document.file_extension?.toUpperCase() || 'Unknown'}</p>
                            <a href="${documentUrl}" download="${document.document_name}" class="download-link">
                                📥 Download ${document.document_name}
                            </a>
                        </div>`
                )
            }
                
                <div class="control-buttons no-print">
                    <button onclick="window.print()">
                        🖨️ Print
                    </button>
                    <button onclick="window.close()" class="close-btn">
                        ✕ Close
                    </button>
                </div>
                
                <script>
                    // Auto-print functionality with delay to ensure content loads
                    window.onload = function() {
                        ${isImageFile ? `
                            // For images, wait a bit longer to ensure they're fully loaded
                            setTimeout(() => {
                                const img = document.querySelector('img');
                                if (img && img.complete) {
                                    // Uncomment the next line if you want auto-print
                                    // window.print();
                                }
                            }, 1000);
                        ` : `
                            // For PDFs and other content
                            setTimeout(() => {
                                // Uncomment the next line if you want auto-print
                                // window.print();
                            }, 500);
                        `}
                    };
                    
                    // Handle image load errors
                    ${isImageFile ? `
                        document.querySelector('img').onerror = function() {
                            console.error('Failed to load image');
                            document.body.innerHTML = '<div class="no-preview"><h3>Failed to load image</h3><p>The image could not be displayed.</p></div>';
                        };
                    ` : ''}
                </script>
            </body>
        </html>
    `);
        printWindow.document.close();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading documents...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div className="text-red-600 text-lg mb-4">Error: {error}</div>
                        <button
                            onClick={fetchDocuments}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AdminLayout currentPage='documents'>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Documents Dashboard</h1>
                                <p className="text-gray-600">Preview, print, and manage client documents</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={fetchDocuments}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium"
                                >
                                    🔄 Refresh
                                </button>
                                {selectedDocuments.length > 0 && (
                                    <button
                                        onClick={handleBulkPrint}
                                        className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium"
                                    >
                                        🖨️ Print Selected ({selectedDocuments.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Total Documents</h3>
                            <span className="text-3xl font-bold text-blue-600">{documents.length}</span>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Unique Users</h3>
                            <span className="text-3xl font-bold text-green-600">
                                {new Set(documents.map(doc => doc.user_id)).size}
                            </span>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Previewable</h3>
                            <span className="text-3xl font-bold text-purple-600">
                                {documents.filter(doc => isPreviewable(doc.file_extension)).length}
                            </span>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">This Month</h3>
                            <span className="text-3xl font-bold text-orange-600">
                                {documents.filter(doc => {
                                    const docDate = new Date(doc.uploaded_at);
                                    const now = new Date();
                                    return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
                                }).length}
                            </span>
                        </div>
                    </div>

                    {/* Documents Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Document Library</h2>
                                <div className="text-sm text-gray-500">
                                    {documents.length} document{documents.length !== 1 ? 's' : ''} total
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedDocuments(documents.map(doc => doc.id));
                                                    } else {
                                                        setSelectedDocuments([]);
                                                    }
                                                }}
                                                checked={selectedDocuments.length === documents.length && documents.length > 0}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Size</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {documents.map((document) => (
                                        <tr key={document.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDocuments.includes(document.id)}
                                                    onChange={() => handleDocumentSelect(document.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <span className="text-2xl">{getDocumentTypeIcon(document.file_extension)}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                            {document.document_name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {document.file_extension?.toUpperCase() || 'Unknown'}
                                                            {isPreviewable(document.file_extension) && (
                                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    Previewable
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {document.first_name} {document.last_name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{document.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 mb-1">
                                                        {document.document_type || document.file_extension?.toUpperCase() || 'Unknown'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {document.file_size_formatted || 'Unknown size'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-col">
                                                    <span>{formatDate(document.uploaded_at).split(',')[0]}</span>
                                                    <span className="text-xs">{formatDate(document.uploaded_at).split(',')[1]}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => openDocumentViewer(document)}
                                                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                                        title="Preview Document"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={() => printDocument(document)}
                                                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                                                        title="Print Document"
                                                    >
                                                        🖨️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadWithErrorHandling(document)}
                                                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                                        title="Download Document"
                                                    >
                                                        ⬇️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* No Documents Message */}
                    {documents.length === 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <div className="text-gray-400 text-6xl mb-4">📁</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                            <p className="text-gray-500">There are no documents uploaded yet.</p>
                        </div>
                    )}

                    {/* Enhanced Document Viewer Modal */}
                    {isDocumentViewerOpen && currentDocument && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl h-[80vh] flex flex-col">

                                {/* Header */}
                                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-3xl">{getDocumentTypeIcon(currentDocument.file_extension)}</span>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{currentDocument.document_name}</h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                <span>📤 {currentDocument.first_name} {currentDocument.last_name}</span>
                                                <span>📅 {formatDate(currentDocument.uploaded_at)}</span>
                                                <span>📊 {currentDocument.file_size_formatted || 'Unknown size'}</span>
                                                {isPreviewable(currentDocument.file_extension) && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        ✅ Previewable
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                                        <button
                                            onClick={() => printDocument(currentDocument)}
                                            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                                        >
                                            🖨️ Print
                                        </button>
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = getDocumentUrl(currentDocument);
                                                link.download = currentDocument.document_name;
                                                link.click();
                                            }}
                                            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                        >
                                            ⬇️ Download
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsDocumentViewerOpen(false);
                                                setCurrentDocument(null);
                                                setPreviewUrl('');
                                            }}
                                            className="w-full sm:w-auto inline-flex items-center justify-center p-2 border border-transparent rounded-full shadow-sm text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                        >
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                </div>

                                {/* Content Area with Fixed Image Display */}
                                <div className="flex-1 p-6 overflow-hidden bg-gray-100">
                                    {isPreviewable(currentDocument.file_extension) ? (
                                        <div className="h-full p-3 bg-white rounded-lg border border-gray-300 overflow-hidden flex items-center justify-center">
                                            {/* For Images */}
                                            {['jpg', 'jpeg', 'png'].includes(currentDocument.file_extension?.toLowerCase()) ? (
                                                <img
                                                    src={previewUrl}
                                                    alt={currentDocument.document_name}
                                                    className="max-w-full max-h-full object-contain"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                        width: 'auto',
                                                        height: 'auto'
                                                    }}
                                                    onLoad={() => console.log('Image loaded successfully')}
                                                    onError={() => console.error('Failed to load image preview')}
                                                />
                                            ) : (
                                                /* For PDFs and other previewable documents */
                                                <iframe
                                                    src={previewUrl}
                                                    className="w-full h-full"
                                                    title={currentDocument.document_name}
                                                    onLoad={() => console.log('Document loaded successfully')}
                                                    onError={() => console.error('Failed to load document preview')}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-gray-300">
                                            <div className="text-center p-8">
                                                <span className="text-6xl mb-4 block">{getDocumentTypeIcon(currentDocument.file_extension)}</span>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Preview Not Available</h3>
                                                <p className="text-gray-600 mb-4">
                                                    This file type ({currentDocument.file_extension?.toUpperCase() || 'Unknown'}) cannot be previewed in the browser.
                                                </p>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-gray-500">
                                                        <strong>File:</strong> {currentDocument.document_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        <strong>Type:</strong> {currentDocument.document_type || currentDocument.file_extension?.toUpperCase()}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        <strong>Size:</strong> {currentDocument.file_size_formatted || 'Unknown'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = getDocumentUrl(currentDocument);
                                                        link.download = currentDocument.document_name;
                                                        link.click();
                                                    }}
                                                    className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                >
                                                    📥 Download Document
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDocuments;