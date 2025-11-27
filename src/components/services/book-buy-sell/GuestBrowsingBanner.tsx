import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface GuestBrowsingBannerProps {
  message?: string;
  action?: string;
  className?: string;
}

export function GuestBrowsingBanner({ 
  message = "You can explore and fill out forms without signing in",
  action = "sign in to complete your booking",
  className 
}: GuestBrowsingBannerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) return null;

  return (
    <Alert className={`border-blue-200 bg-blue-50 text-blue-800 ${className}`}>
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {message}. You'll need to {action}.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/auth')}
          className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </AlertDescription>
    </Alert>
  );
}