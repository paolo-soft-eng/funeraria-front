import { useState } from 'react';

export const useBugReport = (email) => {
  const [bugDescription, setBugDescription] = useState('');
  const [isBugSubmitting, setIsBugSubmitting] = useState(false);
  const [bugReportStatus, setBugReportStatus] = useState(null);

  const submitBugReport = async () => {
    setIsBugSubmitting(true);
    setBugReportStatus(null);

    try {
      const res = await fetch('http://localhost/apii/components/adminBug.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          description: bugDescription
        })
      });
      const data = await res.json();

      if (data.status === 'success') {
        setBugReportStatus({ type: 'success', message: data.message });
        setBugDescription('');
      } else {
        setBugReportStatus({ type: 'error', message: data.message });
      }
      return data;
    } catch (err) {
      const errorMsg = 'Failed to submit bug report. Please try again.';
      setBugReportStatus({ type: 'error', message: errorMsg });
      throw new Error(errorMsg);
    } finally {
      setIsBugSubmitting(false);
    }
  };

  return {
    bugDescription,
    setBugDescription,
    isBugSubmitting,
    bugReportStatus,
    submitBugReport
  };
};
