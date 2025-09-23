import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Settings, Mail, MessageCircle } from 'lucide-react';

interface HelperPreferences {
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  shopkeeper_email?: string;
  shopkeeper_whatsapp?: string;
}

export function HelperPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<HelperPreferences>({
    email_notifications: true,
    whatsapp_notifications: true,
    shopkeeper_email: '',
    shopkeeper_whatsapp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('helper_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is ok
        throw error;
      }

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          whatsapp_notifications: data.whatsapp_notifications,
          shopkeeper_email: data.shopkeeper_email || '',
          shopkeeper_whatsapp: data.shopkeeper_whatsapp || ''
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('helper_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        });

      if (error) throw error;

      toast.success('Preferences saved successfully! 🎉');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <Card className="glassmorphism">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to manage helper preferences.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glassmorphism">
      <CardHeader>
        <CardTitle className="text-campus-blue flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Helper Preferences
        </CardTitle>
        <CardDescription>
          Configure your notification settings and shopkeeper integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Notifications</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive job updates via email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, email_notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="whatsapp-notifications">WhatsApp Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive job updates via WhatsApp
                </p>
              </div>
            </div>
            <Switch
              id="whatsapp-notifications"
              checked={preferences.whatsapp_notifications}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, whatsapp_notifications: checked })
              }
            />
          </div>
        </div>

        {/* Shopkeeper Integration */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Shopkeeper Integration</h4>
          <p className="text-sm text-muted-foreground">
            Configure your preferred shopkeeper's contact details for sending print jobs directly
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shopkeeper-email">Shopkeeper Email</Label>
              <Input
                id="shopkeeper-email"
                type="email"
                value={preferences.shopkeeper_email}
                onChange={(e) => 
                  setPreferences({ ...preferences, shopkeeper_email: e.target.value })
                }
                placeholder="shopkeeper@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="shopkeeper-whatsapp">Shopkeeper WhatsApp</Label>
              <Input
                id="shopkeeper-whatsapp"
                type="tel"
                value={preferences.shopkeeper_whatsapp}
                onChange={(e) => 
                  setPreferences({ ...preferences, shopkeeper_whatsapp: e.target.value })
                }
                placeholder="+91 9876543210"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={savePreferences}
          disabled={isSaving || isLoading}
          className="w-full"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}
