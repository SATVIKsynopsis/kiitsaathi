import React from 'react';
import { useNavigate } from 'react-router-dom';
import Campus25MultiFloor from '@/components/services/campus-map/Campus25MultiFloor';

const Campus25: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Campus25MultiFloor onBack={() => navigate('/campus-map')} />
  );
};

export default Campus25;
