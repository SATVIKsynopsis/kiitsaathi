import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PolicyAcceptance {
  privacy_policy_accepted: boolean;
  privacy_policy_version: string;
  terms_conditions_accepted: boolean;
  terms_conditions_version: string;
  last_updated: string;
}

export function usePolicyManager() {
  const { user } = useAuth();
  const [policyData, setPolicyData] = useState<PolicyAcceptance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(false);

  const CURRENT_PRIVACY_VERSION = "1.0";
  const CURRENT_TERMS_VERSION = "1.0";

  useEffect(() => {
    if (user) {
      loadPolicyAcceptance();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadPolicyAcceptance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('policy_acceptances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading policy acceptance:', error);
        return;
      }

      if (data) {
        setPolicyData(data);
        
        // Check if privacy policy needs to be shown (first time or version update)
        if (!data.privacy_policy_accepted || data.privacy_policy_version !== CURRENT_PRIVACY_VERSION) {
          setShowPrivacyPolicy(true);
        }
      } else {
        // First time user - show privacy policy
        setShowPrivacyPolicy(true);
      }
    } catch (error) {
      console.error('Error in loadPolicyAcceptance:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptPrivacyPolicy = async () => {
    if (!user) return;

    try {
      const updateData = {
        user_id: user.id,
        privacy_policy_accepted: true,
        privacy_policy_version: CURRENT_PRIVACY_VERSION,
        last_updated: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('policy_acceptances')
        .upsert(updateData, { onConflict: 'user_id' });

      if (error) {
        console.error('Error accepting privacy policy:', error);
        toast.error('Failed to save privacy policy acceptance');
        return;
      }

      setPolicyData(prev => ({
        ...prev,
        privacy_policy_accepted: true,
        privacy_policy_version: CURRENT_PRIVACY_VERSION,
        last_updated: new Date().toISOString(),
      } as PolicyAcceptance));

      setShowPrivacyPolicy(false);
      toast.success('Privacy policy accepted successfully');
    } catch (error) {
      console.error('Error in acceptPrivacyPolicy:', error);
      toast.error('Failed to accept privacy policy');
    }
  };

  const acceptTermsAndConditions = async () => {
    if (!user) return;

    try {
      const updateData = {
        user_id: user.id,
        terms_conditions_accepted: true,
        terms_conditions_version: CURRENT_TERMS_VERSION,
        last_updated: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('policy_acceptances')
        .upsert(updateData, { onConflict: 'user_id' });

      if (error) {
        console.error('Error accepting terms and conditions:', error);
        toast.error('Failed to save terms acceptance');
        return false;
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
    } catch (error) {
      console.error('Error in acceptTermsAndConditions:', error);
      toast.error('Failed to accept terms and conditions');
      return false;
    }
  };

  const requireTermsAcceptance = (serviceName?: string) => {
    if (!user) {
      toast.error('Please sign in to continue');
      return false;
    }

    if (!policyData?.terms_conditions_accepted || 
        policyData.terms_conditions_version !== CURRENT_TERMS_VERSION) {
      setShowTermsAndConditions(true);
      return false;
    }

    return true;
  };

  const isPrivacyPolicyAccepted = () => {
    return policyData?.privacy_policy_accepted && 
           policyData.privacy_policy_version === CURRENT_PRIVACY_VERSION;
  };

  const isTermsAccepted = () => {
    return policyData?.terms_conditions_accepted && 
           policyData.terms_conditions_version === CURRENT_TERMS_VERSION;
  };

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