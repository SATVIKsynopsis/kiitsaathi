import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function EmailVerificationBanner() {
  const { user, session } = useAuth();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_email_verified')
        .eq('id', user.id)
        .single();

      setIsVerified(profile?.is_email_verified ?? false);
      setLoading(false);
    };

    checkVerificationStatus();
  }, [user]);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      // Log email sent
      await supabase.from('email_logs').insert({
        user_id: user.id,
        email: user.email,
        email_type: 'verification',
        status: 'sent',
      });

      toast.success('✅ Verification email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error('Failed to resend email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  // Don't show banner if loading, no user, or already verified
  if (loading || !user || isVerified) {
    return null;
  }

  return (
    <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-4">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-amber-600" />
          <span className="text-amber-900 dark:text-amber-200">
            <strong>Email Verification Required:</strong> Please verify your email to access all features. Check your inbox for the verification link.
          </span>
        </div>
        <Button
          onClick={handleResendVerification}
          disabled={isResending}
          size="sm"
          variant="outline"
          className="border-amber-600 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/20"
        >
          {isResending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Resend Email
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
