import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Loader2, CheckCircle2, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    document.title = 'Email Confirmation | KIIT Saathi';

    const handleAuthCallback = async () => {
      try {
        // Check for error parameters first
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error_description') || params.get('error');

        if (error) {
          toast.error(error);
          navigate('/auth?reason=confirm_failed');
          return;
        }

        // Handle the auth callback - this processes any tokens in the URL
        const { data, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('Auth callback error:', authError);
          toast.error('Email confirmation failed. Please try again.');
          navigate('/auth?reason=confirm_failed');
          return;
        }

        // If we have a valid session, the user is confirmed and logged in
        if (data?.session?.user) {
          // Verify the user is confirmed
          if (data.session.user.email_confirmed_at) {
            toast.success('Email confirmed! You are now signed in.');
            navigate('/');
          } else {
            toast.error('Email confirmation is still pending. Please check your email.');
            navigate('/auth?reason=confirm_failed');
          }
        } else {
          // No session found, might need to wait for auth state change
          toast.error('We could not start your session. Please sign in or resend the email.');
          navigate('/auth?reason=session_missing');
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        toast.error('Something went wrong. Please try signing in again.');
        navigate('/auth?reason=confirm_failed');
      } finally {
        setIsProcessing(false);
      }
    };

    // Set up auth state listener to catch session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        toast.success('Email confirmed! You are now signed in.');
        navigate('/');
      } else if (event === 'TOKEN_REFRESHED' && session?.user?.email_confirmed_at) {
        toast.success('Email confirmed! You are now signed in.');
        navigate('/');
      }
    });

    // Start the callback handling
    handleAuthCallback();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft via-background to-campus-blue/20">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <section className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-4">Confirming your email…</h1>
          <p className="text-muted-foreground mb-8">Please wait while we finalize your account.</p>
          <div className="flex items-center justify-center gap-3 text-kiit-green">
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
            <span>{isProcessing ? 'Setting up your session' : 'Processing complete'}</span>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-kiit-green" />
              <span>Link opened</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              {isProcessing ? (
                <CircleAlert className="w-4 h-4 text-campus-blue" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-kiit-green" />
              )}
              <span>{isProcessing ? 'Verifying session' : 'Session verified'}</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
