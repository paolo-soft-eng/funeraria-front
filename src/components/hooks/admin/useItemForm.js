import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const useItemForm = (userId, userName, fetchItems) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    details: '',
    price: '',
    stock: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      details: '',
      price: '',
      stock: '',
      image: null,
    });
    setImagePreview(null);
  };

  const addItem = async () => {
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('details', formData.details);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('user_id', userId);
      formDataToSend.append('user_name', userName);

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await axios.post(
        'http://localhost/funeraria/api/components/itemlist.php',
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      fetchItems();
      resetForm();
      toast.success('Item added successfully ✅');
    } catch (err) {
      toast.error('Error adding item ❌');
      console.error('Error adding item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (setItems) => {
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('id', formData.id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('details', formData.details);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('user_id', userId);
      formDataToSend.append('user_name', userName);

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const res = await axios({
        method: 'POST',
        url: 'http://localhost/funeraria/api/components/itemlist.php?_method=PUT',
        data: formDataToSend,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.message === 'No changes made') {
        toast.info('No changes made ⚠️');
      } else {
        toast.success('Item updated successfully ✅');
        setItems((prev) =>
          prev.map((item) =>
            item.id === res.data.item.id ? res.data.item : item
          )
        );
        resetForm();
      }
    } catch (err) {
      toast.info('No changes made ⚠️');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setIsLoading(true);
        await axios.delete(
          `http://localhost/funeraria/api/components/itemlist.php?id=${id}&user_id=${userId}&user_name=${encodeURIComponent(userName)}`
        );
        fetchItems();
        toast.success('Item deleted successfully 🗑️');
      } catch (err) {
        toast.error('Error deleting item ❌');
        console.error('Error deleting item:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const editItem = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      details: item.details,
      price: item.price,
      stock: item.stock,
      image: null,
    });

    if (item.image_path) {
      setImagePreview(`http://localhost/funeraria/api/components/${item.image_path}`);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e, setItems) => {
    e.preventDefault();
    if (formData.id) {
      updateItem(setItems);
    } else {
      addItem();
    }
  };

  return {
    formData,
    setFormData,
    imagePreview,
    setImagePreview,
    isLoading,
    handleChange,
    handleImageChange,
    handleSubmit,
    resetForm,
    editItem,
    deleteItem,
  };
};