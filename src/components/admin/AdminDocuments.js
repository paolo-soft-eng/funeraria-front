import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
// Add print styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-content, .print-content * {
      visibility: visible;
    }
    .print-content {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
`;

// Helper to get the correct document URL
const getDocumentUrl = (doc) => `http://localhost/apii/components/documents.php?file=${encodeURIComponent(doc.document_path)}`;

const isEmbeddable = (type) => {
  if (!type) return false;
  const t = type.toLowerCase();
  return t === 'pdf' || t === 'jpg' || t === 'jpeg' || t === 'png';
};

const AdminDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);

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
        setIsDocumentViewerOpen(true);
    };

    const printDocument = (document) => {
        const embeddable = isEmbeddable(document.document_type);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${document.document_name}</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        .document-info { margin-bottom: 20px; }
                        .document-info p { margin: 5px 0; }
                        iframe { width: 100%; height: 80vh; border: none; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${document.document_name}</h1>
                    </div>
                    <div class="document-info">
                        <p><strong>Uploaded by:</strong> ${document.first_name} ${document.last_name}</p>
                        <p><strong>Email:</strong> ${document.email}</p>
                        <p><strong>Upload Date:</strong> ${formatDate(document.uploaded_at)}</p>
                        <p><strong>Document Type:</strong> ${document.document_type}</p>
                    </div>
                    ${embeddable
                        ? `<iframe src="${getDocumentUrl(document)}"></iframe>`
                        : `<div style="text-align:center;">
                                <p>Preview not available for this file type.</p>
                                <a href="${getDocumentUrl(document)}" download style="color: blue; text-decoration: underline;">
                                    Click here to download instead
                                </a>
                            </div>`
                    }
                    <div class="no-print" style="margin-top: 20px; text-align: center;">
                        <button onclick="window.print()">Print Document</button>
                        <button onclick="window.close()">Close</button>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Loading documents...</p>
                    </div>
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
        <AdminLayout currentPage="documents">
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <h1 className="text-3xl font-bold text-gray-900">Admin Documents Dashboard</h1>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
                    </div>

                    {/* Documents Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
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
                                                    <span className="text-2xl">{getDocumentTypeIcon(document.document_type)}</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">{document.document_name}</span>
                                                        <span className="text-xs text-gray-500 truncate max-w-xs">{document.document_path}</span>
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
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    {document.document_type?.toUpperCase() || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(document.uploaded_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => openDocumentViewer(document)}
                                                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                                        title="View Document"
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
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = getDocumentUrl(document);
                                                            link.download = document.document_name;
                                                            link.click();
                                                        }}
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

                    {/* Document Viewer Modal */}
                    {isDocumentViewerOpen && currentDocument && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-5/6 flex flex-col">
                                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{currentDocument.document_name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Uploaded by {currentDocument.first_name} {currentDocument.last_name} on {formatDate(currentDocument.uploaded_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => printDocument(currentDocument)}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            ⬇️ Download
                                        </button>
                                        <button
                                            onClick={() => setIsDocumentViewerOpen(false)}
                                            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                        >
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 overflow-hidden">
                                    {isEmbeddable(currentDocument.document_type) ? (
                                        <iframe
                                            src={getDocumentUrl(currentDocument)}
                                            className="w-full h-full border border-gray-200 rounded-lg"
                                            title={currentDocument.document_name}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <p className="mb-4">Preview not available for this file type.</p>
                                            <a
                                                href={getDocumentUrl(currentDocument)}
                                                download={currentDocument.document_name}
                                                className="text-blue-600 underline"
                                            >
                                                Download Document
                                            </a>
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