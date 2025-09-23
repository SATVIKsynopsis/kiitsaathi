import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TermsAndConditions } from '@/components/TermsAndConditions';
import { useNavigate } from 'react-router-dom';

const TermsAndConditionsPage = () => {
  const navigate = useNavigate();

  const handleAccept = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <TermsAndConditions 
          open={true} 
          onOpenChange={() => navigate('/')}
          onAccept={handleAccept}
        />
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditionsPage;