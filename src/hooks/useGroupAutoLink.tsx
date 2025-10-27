import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to automatically link users to groups based on their roll number.
 * Now calls backend endpoint /api/groups/auto-link
 */
const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

export function useGroupAutoLink() {
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.email || !session?.access_token) return;

    const autoLinkGroups = async () => {
      try {
        const response = await fetch(`${HOSTED_URL}/api/groups/auto-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 🔒 Temporary: manually sending user info
            // Later: replace with token-only (Authorization)
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            user_id: user.id, // TEMPORARY: will be removed later
            email: user.email // TEMPORARY: will be removed later
          })
        });

        const result = await response.json();
        if (!response.ok || result.error) {
          console.error('Failed to auto-link groups:', result.error);
          return;
        }

        // Show notifications from backend response
        if (result.newGroups && result.newGroups.length > 0) {
          result.newGroups.forEach((group: any) => {
            toast({
              title: `🎉 You've been added to a group!`,
              description: `Group: "${group.name}" • Added by: ${group.creatorName}${
                group.creatorRollNumber ? ` (${group.creatorRollNumber})` : ''
              } • Your roll number: ${group.rollNumber}`,
              duration: 6000,
              className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none"
            });
          });
        }
      } catch (error) {
        console.error('Error during group auto-link:', error);
      }
    };

    const timeoutId = setTimeout(autoLinkGroups, 1000);
    return () => clearTimeout(timeoutId);
  }, [user, session, toast]);
}
