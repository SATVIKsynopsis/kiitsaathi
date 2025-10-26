import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PolicyAcceptance {
  privacy_policy_accepted: boolean;
  privacy_policy_version: string;
  terms_conditions_accepted: boolean;
  terms_conditions_version: string;
  last_updated: string;
}

const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

export function usePolicyManager() {
  const { user, accessToken } = useAuth();
  const [policyData, setPolicyData] = useState<PolicyAcceptance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(false);

  const CURRENT_PRIVACY_VERSION = "1.0";
  const CURRENT_TERMS_VERSION = "1.0";

  useEffect(() => {
    if (user && accessToken) {
      loadPolicyAcceptance();
    } else {
      setLoading(false);
    }
  }, [user, accessToken]);

  const loadPolicyAcceptance = async () => {
    if (!user || !accessToken) return;

    try {
      const response = await fetch(`${HOSTED_URL}/api/policy`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // ✅ Handle 401/403 errors gracefully
        if (response.status === 401 || response.status === 403) {
          console.error('Authentication failed - token may be invalid');
          // ✅ Optionally trigger logout here
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to load policy data`);
      }

      const result = await response.json();

      if (result.policyData) {
        setPolicyData(result.policyData);

        if (
          !result.policyData.privacy_policy_accepted ||
          result.policyData.privacy_policy_version !== CURRENT_PRIVACY_VERSION
        ) {
          setShowPrivacyPolicy(true);
        }
      } else {
        setShowPrivacyPolicy(true); // First-time user
      }
    } catch (error: any) {
      console.error('Error in loadPolicyAcceptance:', error);
      toast.error('Failed to load policy data');
    } finally {
      setLoading(false);
    }
  };

  const acceptPrivacyPolicy = async () => {
    if (!user || !accessToken) {
      toast.error('Please sign in to continue');
      return;
    }

    try {
      const response = await fetch(`${HOSTED_URL}/api/policy/privacy`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          privacy_policy_version: CURRENT_PRIVACY_VERSION,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // ✅ Better error handling
        if (response.status === 401 || response.status === 403) {
          toast.error('Session expired. Please sign in again.');
          return;
        }
        
        throw new Error(errorData.error || 'Policy update failed');
      }

      setPolicyData(prev => ({
        ...prev,
        privacy_policy_accepted: true,
        privacy_policy_version: CURRENT_PRIVACY_VERSION,
        last_updated: new Date().toISOString(),
      } as PolicyAcceptance));

      setShowPrivacyPolicy(false);
      toast.success('Privacy policy accepted successfully');
    } catch (error: any) {
      console.error('Error in acceptPrivacyPolicy:', error);
      toast.error(error.message || 'Failed to accept privacy policy');
    }
  };

  const acceptTermsAndConditions = async () => {
    if (!user || !accessToken) {
      toast.error('Please sign in to continue');
      return false;
    }

    try {
      const response = await fetch(`${HOSTED_URL}/api/policy/terms`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          terms_conditions_version: CURRENT_TERMS_VERSION,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // ✅ Better error handling
        if (response.status === 401 || response.status === 403) {
          toast.error('Session expired. Please sign in again.');
          return false;
        }
        
        throw new Error(errorData.error || 'Terms update failed');
      }

      setPolicyData(prev => ({
        ...prev,
        terms_conditions_accepted: true,
        terms_conditions_version: CURRENT_TERMS_VERSION,
        last_updated: new Date().toISOString(),
      } as PolicyAcceptance));

      setShowTermsAndConditions(false);
      toast.success('Terms and conditions accepted');
      return true;
    } catch (error: any) {
      console.error('Error in acceptTermsAndConditions:', error);
      toast.error(error.message || 'Failed to accept terms and conditions');
      return false;
    }
  };

  const requireTermsAcceptance = () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return false;
    }

    if (
      !policyData?.terms_conditions_accepted ||
      policyData.terms_conditions_version !== CURRENT_TERMS_VERSION
    ) {
      setShowTermsAndConditions(true);
      return false;
    }

    return true;
  };

  const isPrivacyPolicyAccepted = () =>
    policyData?.privacy_policy_accepted &&
    policyData.privacy_policy_version === CURRENT_PRIVACY_VERSION;

  const isTermsAccepted = () =>
    policyData?.terms_conditions_accepted &&
    policyData.terms_conditions_version === CURRENT_TERMS_VERSION;

  return {
    loading,
    policyData,
    showPrivacyPolicy,
    setShowPrivacyPolicy,
    showTermsAndConditions,
    setShowTermsAndConditions,
    acceptPrivacyPolicy,
    acceptTermsAndConditions,
    requireTermsAcceptance,
    isPrivacyPolicyAccepted,
    isTermsAccepted,
  };
}