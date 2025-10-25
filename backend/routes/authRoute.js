import express from "express";

// ✅ Export a function that accepts supabase instance
const createAuthRoutes = (supabase) => {
  const router = express.Router();

  // Store active SSE connections
  const sseClients = new Set();

  // ============================================
  // AUTHENTICATION ENDPOINTS
  // ============================================

  router.get("/api/auth/callback", async (req, res) => {
    try {
      const { access_token } = req.query;

      if (!access_token) {
        return res.status(400).json({ error: "Missing access token" });
      }

      const { data: user, error } = await supabase.auth.getUser(access_token);
      if (error || !user) {
        console.error(error);
        return res.status(401).json({ error: "Invalid token" });
      }

      if (user.user?.email_confirmed_at) {
        return res.json({ success: true, message: "Email confirmed" });
      } else {
        return res.status(403).json({ success: false, message: "Email not confirmed yet" });
      }
    } catch (err) {
      console.error("Auth callback failed:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get('/api/auth/session', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.json({ session: null, profile: null });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.json({ session: null, profile: null });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_email_verified')
        .eq('id', user.id)
        .single();

      res.json({ 
        session: { user }, 
        profile 
      });
    } catch (error) {
      console.error('Session check error:', error);
      res.status(500).json({ error: 'Failed to check session' });
    }
  });

  router.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, fullName } = req.body;

      if (!email.endsWith('@kiit.ac.in')) {
        return res.status(400).json({ 
          error: 'Only KIIT College Email IDs (@kiit.ac.in) are allowed to sign up or log in to KIIT Saathi.' 
        });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "https://ksaathi.vercel.app/auth/callback", // ✅ Fixed typo (was .router)
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      res.json({ 
        success: true, 
        user: data.user, 
        session: data.session,
        message: data?.user && !data.session 
          ? 'Check your email for the confirmation link' 
          : 'Account created successfully'
      });
    } catch (error) {
      console.error('Sign up error:', error);
      res.status(400).json({ 
        error: error.message || 'An error occurred during sign up' 
      });
    }
  });

  router.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email.endsWith('@kiit.ac.in')) {
        return res.status(400).json({ 
          error: 'Only KIIT College Email IDs (@kiit.ac.in) are allowed to sign up or log in to KIIT Saathi.' 
        });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      res.json({ 
        success: true, 
        session: data.session,
        user: data.user
      });
    } catch (error) {
      console.error('Sign in error:', error);
      res.status(400).json({ 
        error: error.message || 'An error occurred during sign in' 
      });
    }
  });

  router.post('/api/auth/signout', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        await supabase.auth.admin.signOut(token);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Sign out error:', error);
      res.status(500).json({ error: 'Failed to sign out' });
    }
  });

  router.post('/api/auth/resend-confirmation', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const { error } = await supabase.auth.resend({ 
        type: 'signup', 
        email 
      });

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Confirmation email resent' 
      });
    } catch (error) {
      console.error('Resend confirmation error:', error);
      res.status(400).json({ 
        error: error.message || 'Failed to resend confirmation email' 
      });
    }
  });

  router.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      if (!email.endsWith('@kiit.ac.in')) {
        return res.status(400).json({ 
          error: 'Only KIIT College Email IDs (@kiit.ac.in) are allowed' 
        });
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'https://ksaathi.vercel.app'}/reset-password`, // ✅ Fixed typo
      });

      if (error) throw error;

      res.json({ 
        success: true, 
        message: 'Password reset email sent' 
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({ 
        error: error.message || 'Failed to send password reset email' 
      });
    }
  });

  router.post('/api/auth/verify-email-callback', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.replace('Bearer ', '');
      
      const { error } = await supabase.functions.invoke('verify-email-callback', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      console.error('Verify email callback error:', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  });

  // SSE endpoint for real-time admin notifications
  router.get('/api/admin/realtime-notifications', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    sseClients.add(res);
    console.log(`Admin client connected. Total clients: ${sseClients.size}`);

    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Real-time connected' })}\n\n`);

    req.on('close', () => {
      sseClients.delete(res);
      console.log(`Admin client disconnected. Total clients: ${sseClients.size}`);
    });
  });

  // Broadcast function
  const broadcastToAdmins = (notification) => {
    const message = `data: ${JSON.stringify(notification)}\n\n`;
    sseClients.forEach(client => {
      try {
        client.write(message);
      } catch (error) {
        console.error('Error sending SSE:', error);
        sseClients.delete(client);
      }
    });
  };

  // Set up Supabase real-time subscriptions
  const setupAdminRealtimeSubscriptions = () => {
    const lostFoundChannel = supabase
      .channel('admin_lost_found_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lost_found_requests'
      }, (payload) => {
        console.log('🔔 Lost & Found real-time event:', payload);
        broadcastToAdmins({
          type: 'lost_found',
          eventType: payload.eventType,
          data: payload.new,
          timestamp: new Date().toISOString()
        });
      })
      .subscribe();

    const eventRequestsChannel = supabase
      .channel('admin_event_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interview_event_requests'
      }, (payload) => {
        console.log('🔔 Event Request real-time event:', payload);
        broadcastToAdmins({
          type: 'event',
          eventType: payload.eventType,
          data: payload.new,
          timestamp: new Date().toISOString()
        });
      })
      .subscribe();

    const resaleListingsChannel = supabase
      .channel('admin_resale_listings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'resale_listings'
      }, (payload) => {
        console.log('🔔 Resale Listing real-time event:', payload);
        broadcastToAdmins({
          type: 'resale',
          eventType: payload.eventType,
          data: payload.new,
          timestamp: new Date().toISOString()
        });
      })
      .subscribe();

    const contactsChannel = supabase
      .channel('admin_contacts_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contacts'
      }, (payload) => {
        console.log('🔔 Contact Submission real-time event:', payload);
        broadcastToAdmins({
          type: 'contact',
          eventType: payload.eventType,
          data: payload.new,
          timestamp: new Date().toISOString()
        });
      })
      .subscribe();

    return { lostFoundChannel, eventRequestsChannel, resaleListingsChannel, contactsChannel };
  };

  // Initialize real-time subscriptions
  setupAdminRealtimeSubscriptions();

  return router; // ✅ Return the router
};

export default createAuthRoutes;