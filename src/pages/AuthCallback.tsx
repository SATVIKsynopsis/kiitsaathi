import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Loader2, CheckCircle2, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Email Confirmation | KIIT Saathi';

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error_description') || params.get('error');

    if (error) {
      toast.error(error);
      navigate('/auth');
      return;
    }

    // Give Supabase a brief moment to persist the session
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        toast.success('Email confirmed! You are now signed in.');
        navigate('/');
      } else {
        toast.message('Email confirmed. Please sign in.');
        navigate('/auth');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft via-background to-campus-blue/20">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <section className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-4">Confirming your email…</h1>
          <p className="text-muted-foreground mb-8">Please wait while we finalize your account.</p>
          <div className="flex items-center justify-center gap-3 text-kiit-green">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Setting up your session</span>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-kiit-green" />
              <span>Link opened</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CircleAlert className="w-4 h-4 text-campus-blue" />
              <span>Verifying session</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
