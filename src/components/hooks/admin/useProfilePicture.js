import { useState } from 'react';
import { FaUser } from 'react-icons/fa';

export const useProfilePicture = () => {
  const [imgErrors, setImgErrors] = useState({});

  const ProfilePicture = ({ client, size = 'small' }) => {
    const sizeClasses = {
      small: 'w-8 h-8',
      medium: 'w-12 h-12',
      large: 'w-16 h-16'
    };

    const handleImageError = (clientId) => {
      setImgErrors(prev => ({ ...prev, [clientId]: true }));
    };

    if (imgErrors[client.id] || !client.profile_picture) {
      return (
        <div className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center`}>
          <FaUser className="text-gray-500 text-xs" />
        </div>
      );
    }

    return (
      <img
        src={client.profile_picture}
        alt={`${client.username}'s profile`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        onError={() => handleImageError(client.id)}
      />
    );
  };

  return {
    ProfilePicture
  };
};