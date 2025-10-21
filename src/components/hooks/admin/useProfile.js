import { useState, useEffect } from 'react';

export const useProfile = (email) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    role: 'admin',
    profileImage: null
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (email) {
      fetchProfileData();
    }
  }, [email]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost/funeraria/api/components/fetchAdminProfile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          firstName: data.data.firstName || '',
          lastName: data.data.lastName || '',
          email: data.data.email || email,
          phone: data.data.phone || '',
          address: data.data.address || '',
          emergencyContact: data.data.emergencyContact || '',
          role: data.data.role || 'admin'
        }));

        if (data.data.profileImage) {
          setProfilePreview(data.data.profileImage);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Only JPG, PNG & GIF files are allowed.');
      }
      if (file.size > 5000000) {
        throw new Error('File is too large. Maximum size is 5MB.');
      }

      setFormData({ ...formData, profileImage: file });
      const previewUrl = URL.createObjectURL(file);
      if (profilePreview && profilePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePreview);
      }
      setProfilePreview(previewUrl);
    }
  };

  const updateProfile = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('email', formData.email);
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('emergencyContact', formData.emergencyContact);
    formDataToSend.append('role', formData.role);
    formDataToSend.append('adminCancel','adminCancel' )

    if (formData.profileImage instanceof File) {
      formDataToSend.append('profileImage', formData.profileImage);
    }

    const res = await fetch('http://localhost/funeraria/api/components/updateAdminProfile.php', {
      method: 'POST',
      body: formDataToSend
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error('Expected JSON response but got: ' + text.substring(0, 100));
    }

    return await res.json();
  };

  
  const removeProfileImage = async () => {
  const res = await fetch('http://localhost/funeraria/api/components/removeProfileImage.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: formData.email })
  });

  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

  const data = await res.json();
  
  if (data.success) {
    // Clear the profile image state
    if (profilePreview && profilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profilePreview);
    }
    setFormData(prev => ({ ...prev, profileImage: null }));
    setProfilePreview(null);
  }
  return data;
};

  return {
    formData,
    profilePreview,
    isLoading,
    handleInputChange,
    handleProfileImageChange,
    updateProfile,
    removeProfileImage
  };
};