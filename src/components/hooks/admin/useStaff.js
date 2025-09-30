import { useState, useEffect } from 'react';

export const useStaff = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    position: 'Support Staff',
    email: ''
  });
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('http://localhost/apii/components/staff.php');
      const data = await res.json();
      if (data.success) {
        setStaffMembers(data.data);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const addStaff = async () => {
    const res = await fetch('http://localhost/apii/components/staff.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStaff)
    });
    const data = await res.json();
    if (data.success) {
      setNewStaff({
        fullName: '',
        position: 'Support Staff',
        email: ''
      });
      await fetchStaff();
    }
    return data;
  };

  const updateStaff = async () => {
    const res = await fetch('http://localhost/apii/components/staff.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingStaff)
    });
    const data = await res.json();
    if (data.success) {
      setShowEditModal(false);
      setEditingStaff(null);
      await fetchStaff();
    }
    return data;
  };

  const deleteStaff = async (staffId) => {
    const res = await fetch('http://localhost/apii/components/staff.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId })
    });
    const data = await res.json();
    if (data.success) {
      setStaffToDelete(null);
      await fetchStaff();
    }
    return data;
  };

  const openEditModal = (staff) => {
    setEditingStaff({
      staffId: staff.id,
      fullName: staff.full_name,
      position: staff.position,
      email: staff.email
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingStaff(null);
  };

  const confirmDelete = (staff) => {
    setStaffToDelete(staff);
  };

  const cancelDelete = () => {
    setStaffToDelete(null);
  };

  return {
    staffMembers,
    newStaff,
    setNewStaff,
    editingStaff,
    setEditingStaff,
    staffToDelete,
    showEditModal,
    addStaff,
    updateStaff,
    deleteStaff,
    openEditModal,
    closeEditModal,
    confirmDelete,
    cancelDelete
  };
};