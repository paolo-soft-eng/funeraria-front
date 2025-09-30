import { useState } from 'react';

export const useReportModal = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const openModal = (report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedReport(null);
  };

  return {
    selectedReport,
    isViewModalOpen,
    openModal,
    closeModal,
    setSelectedReport
  };
};