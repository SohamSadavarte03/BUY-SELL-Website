import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authcontext';

const CASCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCASCallback = async () => {
      const ticket = new URLSearchParams(location.search).get('ticket');
      
      if (ticket) {
        try {
          const response = await axios.post('http://localhost:5000/api/users/cas-verify', {
            ticket,
            service: 'http://localhost:5173/cas-callback',
            renew: true  
          });
          console.log('CAS verification response:', response.data);
          if (response.data.error) {
            console.error('CAS verification failed:', response.data.error);
            navigate('/');
            return;
          }

          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('userData', JSON.stringify({ data: user }));
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(user);
          
          navigate('/profile');
          window.location.reload();
        } catch (error) {
          console.error('CAS verification failed:', error);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };

    handleCASCallback();
  }, [location, navigate, setUser]);

  return <div>Verifying your login...</div>;
};

export default CASCallback;