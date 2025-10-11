
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

const Index = () => {
  const navigate = useNavigate();
  
  // Ensure proper routing
  useEffect(() => {
    // Redirect to the home page component directly
    navigate('/', { replace: true });
  }, [navigate]);

  return <Home />;
};

export default Index;
