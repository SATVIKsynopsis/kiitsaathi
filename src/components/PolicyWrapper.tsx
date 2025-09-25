import React from 'react';
import { TermsAndConditions } from '@/components/TermsAndConditions';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import { usePolicyManager } from '@/hooks/usePolicyManager';

interface PolicyWrapperProps {
  children: React.ReactNode;
}

export function PolicyWrapper({ children }: PolicyWrapperProps) {
  const {
    showPrivacyPolicy,
    setShowPrivacyPolicy,
    showTermsAndConditions,
    setShowTermsAndConditions,
    acceptPrivacyPolicy,
    acceptTermsAndConditions,
  } = usePolicyManager();

  return (
    <>
      {children}
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicy
        open={showPrivacyPolicy}
        onOpenChange={setShowPrivacyPolicy}
        onAccept={acceptPrivacyPolicy}
        isFirstTime={true}
      />

      {/* Terms and Conditions Modal */}
      <TermsAndConditions
        open={showTermsAndConditions}
        onOpenChange={setShowTermsAndConditions}
        onAccept={acceptTermsAndConditions}
      />
    </>
  );
}