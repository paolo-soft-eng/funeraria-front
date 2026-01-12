import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailContext } from '../../utils/EmailContext';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const { email } = useContext(EmailContext);
  const navigate = useNavigate();
  const n = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (email) {
      fetch(
        `${n}/api/components/getUserId.php?email=${encodeURIComponent(email)}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.userId) {
            setUserId(data.userId);
            setUserName(data.userName || 'Admin');
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            navigate('/gomez/auth');
          }
        })
        .catch((err) => {
          console.error('Error fetching user ID:', err);
          setIsLoggedIn(false);
          navigate('/gomez/auth');
        });
    } else {
      setIsLoggedIn(false);
      navigate('/gomez/auth');
    }
  }, [email, navigate]);

  return { isLoggedIn, userId, userName, email };
};
