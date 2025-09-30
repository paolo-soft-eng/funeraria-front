export const usePagination = (totalItems, itemsPerPage, currentPage, setCurrentPage, setItemsPerPage) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Handle edge case where there are no pages
    if (totalPages === 0) {
      return [];
    }

    // Handle single page
    if (totalPages === 1) {
      return [1];
    }

    // Build the range of pages around current page
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Always show first page
    rangeWithDots.push(1);

    // Add ellipsis after first page if needed
    if (currentPage - delta > 2) {
      rangeWithDots.push('...');
    }

    // Add the range of pages
    rangeWithDots.push(...range);

    // Add ellipsis before last page if needed
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...');
    }

    // Always show last page (if it's not already included)
    if (totalPages > 1 && !rangeWithDots.includes(totalPages)) {
      rangeWithDots.push(totalPages);
    }

    // Remove duplicates while maintaining order
    return rangeWithDots.filter((value, index, self) => 
      self.indexOf(value) === index
    );
  };

  return {
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    getVisiblePageNumbers,
  };
};