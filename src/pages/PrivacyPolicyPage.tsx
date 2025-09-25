import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  const handleAccept = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <PrivacyPolicy 
          open={true} 
          onOpenChange={() => navigate('/')}
          onAccept={handleAccept}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;