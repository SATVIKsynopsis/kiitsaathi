import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const response = await fetch(`${HOSTED_URL}/api/auth/session`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.session && data.profile?.is_email_verified) {
          navigate('/');
        } else if (data.session) {
          setNotice('Please verify your email before accessing KIIT Saathi. Check your inbox for the verification link.');
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };
    checkUser();

    const reason = new URLSearchParams(window.location.search).get('reason');
    if (reason === 'confirm_failed') {
      setNotice('The confirmation link is invalid or expired. You can request a new email below.');
    } else if (reason === 'session_missing') {
      setNotice('Email confirmed, but we could not start your session. Please sign in or resend confirmation.');
    } else if (reason === 'email_not_verified') {
      setNotice('⚠️ Please verify your email before accessing services. Check your inbox for the verification link.');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          if (session.user?.email && !session.user.email.endsWith('@kiit.ac.in')) {
            await supabase.auth.signOut();
            setError('Only KIIT College Email IDs (@kiit.ac.in) are allowed to sign up or log in to KIIT Saathi.');
            toast.error('🚫 Only KIIT College Email IDs (@kiit.ac.in) are allowed to sign up or log in to KIIT Saathi.');
            return;
          }

          localStorage.setItem('access_token', session.access_token);

          const response = await fetch(`${HOSTED_URL}/api/auth/session`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });

          const data = await response.json();

          if (data.profile?.is_email_verified) {
            toast.success('Successfully signed in!');
            await fetch(`${HOSTED_URL}/api/auth/verify-email-callback`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });
            navigate('/');
          } else {
            setNotice('⚠️ Please verify your email before accessing services. Check your inbox for the verification link.');
            toast.warning('Please verify your email to access all features');
          }
        } else if (event === 'PASSWORD_RECOVERY') {
          toast.success('Check your email for password recovery instructions.');
        } else if (event === 'USER_UPDATED') {
          const token = localStorage.getItem('access_token');
          if (token) {
            await fetch(`${HOSTED_URL}/api/auth/verify-email-callback`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }
          toast.success('Email confirmed successfully!');
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setEmailError('');

    toast.info('Please sign in with your KIIT College email (@kiit.ac.in)', {
      duration: 4000,
    });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setLoading(false);
      const errorMsg = 'Google login failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Google login error:', error);
    }
  };

  const validateKiitEmail = (email: string, showFriendly: boolean = false) => {
    if (!email.trim()) return null;

    if (!email.endsWith('@kiit.ac.in')) {
      return showFriendly
        ? '🚫 Access Denied! Please use your official KIIT ID (example: 2000000@kiit.ac.in).'
        : 'Only KIIT College Email IDs (@kiit.ac.in) are allowed to sign up or log in to KIIT Saathi.';
    }
    return null;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError('');

    const emailValidationError = validateKiitEmail(value, true);
    setEmailError(emailValidationError || '');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailError('');

    const emailValidationError = validateKiitEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setError(emailValidationError);
      setLoading(false);
      toast.error(emailValidationError);
      return;
    }

    try {
      const response = await fetch(`${HOSTED_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign up failed');
      }

      if (data.session) {
        localStorage.setItem('access_token', data.session.access_token);
        toast.success('Account created successfully!');
        navigate('/');
      } else {
        toast.success('🎉 Almost there! Check your email for the confirmation link to activate your account.', {
          duration: 6000,
        });
      }

      setEmail('');
      setPassword('');
      setFullName('');
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message || 'An error occurred during sign up');
      toast.error(error.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailError('');

    const emailValidationError = validateKiitEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setError(emailValidationError);
      setLoading(false);
      toast.error(emailValidationError);
      return;
    }

    try {
      const response = await fetch(`${HOSTED_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sign in failed');
      }

      // ✅ Set the session in Supabase client (not just localStorage)
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });

      if (sessionError) {
        throw sessionError;
      }

      toast.success('Successfully signed in!');
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message || 'An error occurred during sign in');
      toast.error(error.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.info('Enter your email above first');
      return;
    }
    try {
      setLoading(true);

      const response = await fetch(`${HOSTED_URL}/api/auth/resend-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend confirmation');
      }

      toast.success('Confirmation email resent. Please check your inbox.');
    } catch (err: any) {
      console.error('Resend confirmation error:', err);
      toast.error(err.message || 'Failed to resend confirmation email');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.info('Please enter your email address first');
      return;
    }

    const emailValidationError = validateKiitEmail(email);
    if (emailValidationError) {
      toast.error(emailValidationError);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${HOSTED_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      toast.error(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft via-background to-campus-blue/20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-2 mt-4 flex items-center gap-2 text-kiit-green hover:text-kiit-green-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          {notice && (
            <Alert className="mb-4">
              <AlertDescription>
                {notice}{' '}
                <Button variant="link" onClick={handleResendConfirmation} disabled={!email || loading}>
                  Resend confirmation email
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Card className="glassmorphism border-white/20">
            <Tabs defaultValue="signin" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </CardHeader>

              {/* Sign In */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-4">
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                      Sign in to access your KIIT Saathi account
                    </CardDescription>
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your-email@kiit.ac.in"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        required
                        disabled={loading}
                        className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {emailError && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span>{emailError}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <Button
                          type="button"
                          variant="link"
                          className="px-0 text-xs text-kiit-green hover:text-kiit-green-dark"
                          onClick={handleForgotPassword}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-kiit-green hover:bg-kiit-green-dark"
                      disabled={loading || !!emailError}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* Sign Up */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4">
                    <CardTitle>Join KIIT Saathi</CardTitle>
                    <CardDescription>
                      Create your account to access all services
                    </CardDescription>
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your-email@kiit.ac.in"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        required
                        disabled={loading}
                        className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {emailError && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span>{emailError}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-campus-blue hover:bg-campus-blue/80"
                      disabled={loading || !!emailError}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </CardFooter>
                </form>
                <div className="px-6 pb-4 text-sm text-muted-foreground text-center">
                  Didn’t receive the email?
                  <Button variant="link" onClick={handleResendConfirmation} disabled={!email || loading}>
                    Resend confirmation email
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative my-6 mx-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <CardFooter>
              <Button 
                onClick={handleGoogleLogin} 
                variant="outline"
                className="w-full bg-card border-2 border-muted hover:bg-muted/50 text-foreground font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                disabled={loading}
              >
                {/* Google SVG Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" viewBox="0 0 48 48">
                  <g>
                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.91-6.91C36.44 2.34 30.65 0 24 0 14.64 0 6.27 5.48 1.98 13.44l8.51 6.62C12.81 13.13 17.96 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.09 24.55c0-1.64-.15-3.22-.43-4.76H24v9.03h12.41c-.54 2.91-2.18 5.38-4.65 7.04l7.19 5.59C43.73 37.97 46.09 31.81 46.09 24.55z"/>
                    <path fill="#FBBC05" d="M10.49 28.06c-.62-1.85-.98-3.81-.98-5.81s.36-3.96.98-5.81l-8.51-6.62C.36 13.96 0 18.86 0 24s.36 10.04 1.98 14.19l8.51-6.62z"/>
                    <path fill="#EA4335" d="M24 48c6.65 0 12.23-2.19 16.29-5.97l-7.19-5.59c-2.01 1.35-4.59 2.15-7.1 2.15-6.04 0-11.19-3.63-13.51-8.87l-8.51 6.62C6.27 42.52 14.64 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </g>
                </svg>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Sign in with Google'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
