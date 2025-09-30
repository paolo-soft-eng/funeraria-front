import { useState } from 'react';

export const useFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleSearch = () => {
    setSearchTerm(searchInput.trim());
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchInput('');
    setStatusFilter('');
  };

  return {
    searchTerm,
    searchInput,
    statusFilter,
    setSearchInput,
    handleSearch,
    handleSearchKeyPress,
    handleStatusFilter,
    clearFilters
  };
};