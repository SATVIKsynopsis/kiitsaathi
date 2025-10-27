import dotenv from 'dotenv';
dotenv.config(); // ✅ Load environment variables FIRST

import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import fileUpload from 'express-fileupload';

import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

const allowedOrigins = [  
  "http://localhost:8080",
  "http://10.5.83.177:8080",
  "http://localhost:5173",
  "https://kiitsaathi.vercel.app",
  "https://kiitsaathi-git-satvik-aditya-sharmas-projects-3c0e452b.vercel.app",
  "https://ksaathi.vercel.app",
  "https://kiitsaathi.in",
  "https://www.kiitsaathi.in",
  "https://kiitsaathi-hosted.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001"
];

// ✅ MIDDLEWARE MUST COME FIRST (before any routes)






// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, be more permissive with CORS
    if (process.env.NODE_ENV === 'development' || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // In production, strictly check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// ✅ Add request logger


async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  console.log('🔐 Auth attempt:', { 
    hasAuthHeader: !!authHeader, 
    tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
    path: req.path 
  });

  if (!token) {
    console.error('❌ No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // ✅ Verify token using Supabase Auth system
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('❌ Token verification failed:', error?.message || 'No user found');
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    console.log('✅ Token verified for user:', user.email);
    
    // ✅ Attach user data to request
    req.user = user;
    req.user_id = user.id;
    
    next();
  } catch (err) {
    console.error('❌ Token verification exception:', err);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}


// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  next(err);
});

console.log('🔧 Environment Debug Info:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '❌ Missing');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing');

// ✅ Initialize Supabase AFTER environment variables are loaded
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



// Razorpay instance
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Razorpay:', error.message);
  }
} else {
  console.warn('⚠️  Razorpay not initialized - missing environment variables');
}

// ✅ SIMPLE TEST ROUTES FIRST (for debugging)
app.get('/test', (req, res) => {
  console.log('✅ Test endpoint hit!');
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

app.get('/health', async (req, res) => {
  console.log('✅ Health check endpoint hit!');
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('lost_and_found_items')
      .select('id')
      .limit(1);
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      supabase: error ? 'Error' : 'Connected',
      razorpay: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Missing'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// ✅ NOW register route files (AFTER middleware and supabase initialization)



// ============================================
// ADMIN ROUTES
// ============================================

// Admin Dashboard Data
app.get("/api/admin/dashboard-data", async (req, res) => {
  try {
    const { data: lfRequests } = await supabase
      .from("lost_found_requests")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: eventReqs } = await supabase
      .from("interview_event_requests")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: resaleReqs } = await supabase
      .from("resale_listings")
      .select(`
        *,
        seller:profiles!seller_id(full_name, email),
        images:resale_listing_images(storage_path)
      `)
      .order("created_at", { ascending: false });

    const { data: contacts } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: feedbackData } = await supabase
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: actions } = await supabase
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: studyMaterialRequests } = await supabase
      .from("study_material_requests")
      .select("*")
      .order("created_at", { ascending: false });

    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const today = new Date().toISOString().split("T")[0];
    const actionsToday =
      actions?.filter((a) => a.created_at.startsWith(today)).length || 0;

    const stats = {
      totalPendingLostFound:
        lfRequests?.filter((r) => r.status === "pending").length || 0,
      totalPendingEvents:
        eventReqs?.filter((r) => r.status === "pending").length || 0,
      totalPendingResale:
        resaleReqs?.filter((r) => r.status === "pending").length || 0,
      totalPendingContacts:
        contacts?.filter((c) => c.status === "new").length || 0,
      totalActionsToday: actionsToday,
      totalUsers: totalUsers || 0,
      totalFeedbacks: feedbackData?.length || 0,
      totalUnresolvedFeedbacks:
        feedbackData?.filter((f) => !f.resolved).length || 0,
    };

    res.json({
      lostFoundRequests: lfRequests || [],
      eventRequests: eventReqs || [],
      resaleListings: resaleReqs || [],
      contactSubmissions: contacts || [],
      feedbacks: feedbackData || [],
      adminActions: actions || [],
      study_material_requests: studyMaterialRequests || [],
      stats,
    });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({
      error: "Failed to fetch admin data",
      message: error.message,
    });
  }
});

// Approve Item
app.post('/api/admin/approve-item', async (req, res) => {
  try {
    const { itemId, type, adminUserId } = req.body;
    
    const functionName = type === 'lost-found' ? 'admin-approve-lost-item' : 'admin-approve-event';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { 
        requestId: itemId, 
        adminUserId 
      }
    });

    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ 
      error: 'Failed to approve item',
      message: error.message 
    });
  }
});

// Approve Resale
app.post('/api/admin/approve-resale', async (req, res) => {
  try {
    const { listingId, adminUserId } = req.body;
    
    const { data, error } = await supabase.functions.invoke('moderate-resale-listing', {
      body: { 
        listingId,
        action: 'approve',
        adminUserId
      }
    });

    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Resale approval error:', error);
    res.status(500).json({ 
      error: 'Failed to approve listing',
      message: error.message 
    });
  }
});

// Reject Item
app.post('/api/admin/reject-item', async (req, res) => {
  try {
    const { itemId, type, reason, adminUserId } = req.body;
    
    if (!reason?.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const functionName = type === 'lost-found' ? 'admin-reject-lost-item' : 'admin-reject-event';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { 
        requestId: itemId, 
        reason,
        adminUserId 
      }
    });

    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ 
      error: 'Failed to reject item',
      message: error.message 
    });
  }
});

// Reject Resale
app.post('/api/admin/reject-resale', async (req, res) => {
  try {
    const { listingId, reason, adminUserId } = req.body;
    
    if (!reason?.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const { data, error } = await supabase.functions.invoke('moderate-resale-listing', {
      body: { 
        listingId,
        action: 'reject',
        adminUserId,
        reason
      }
    });

    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Resale rejection error:', error);
    res.status(500).json({ 
      error: 'Failed to reject listing',
      message: error.message 
    });
  }
});

// Update Contact Status
app.patch('/api/admin/update-contact-status', async (req, res) => {
  try {
    const { contactId, status } = req.body;
    
    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', contactId);

    if (error) throw error;
    
    res.json({ success: true, message: `Contact marked as ${status}` });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ 
      error: 'Failed to update contact status',
      message: error.message 
    });
  }
});

// Resolve Feedback
app.patch('/api/admin/resolve-feedback', async (req, res) => {
  try {
    const { feedbackId, resolved } = req.body;
    
    const { error } = await supabase
      .from('feedbacks')
      .update({ 
        resolved,
        resolved_at: resolved ? new Date().toISOString() : null
      })
      .eq('id', feedbackId);

    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: resolved ? 'Feedback marked as resolved' : 'Feedback marked as unresolved' 
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ 
      error: 'Failed to update feedback',
      message: error.message 
    });
  }
});

// Delete Feedback
app.delete('/api/admin/delete-feedback/:feedbackId', async (req, res) => {
  try {
    const { feedbackId } = req.params;
    
    const { error } = await supabase
      .from('feedbacks')
      .delete()
      .eq('id', feedbackId);

    if (error) throw error;
    
    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to delete feedback',
      message: error.message 
    });
  }
});

// ============================================
// FEEDBACK ROUTES
// ============================================

// Submit Feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const { category, feedback_text, rating } = req.body;

    if (!category || !feedback_text) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const { error } = await supabase
      .from("feedbacks")
      .insert([{ category, feedback_text, rating: rating || null }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ success: false, message: "Database insert failed" });
    }

    return res.status(200).json({ success: true, message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Feedback submission failed:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ============================================
// LOST & FOUND IMAGE UPLOAD ROUTE
// ============================================

// Upload lost & found application image
app.post("/api/upload-lost-found-image", async (req, res) => {
  try {
    // Use express-fileupload or multer for file parsing if not already set up
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    const { lostItemId } = req.body;
    const file = req.files.image;
    if (!lostItemId || !file) {
      return res.status(400).json({ error: "Missing lostItemId or file" });
    }
    // Validate file type and size
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
      return res.status(400).json({ error: "Only JPG and PNG files are allowed" });
    }
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "File size must be less than 5MB" });
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `application_${lostItemId}_${Date.now()}.${fileExt}`;
    // Upload new image
    const { error: uploadError } = await supabase.storage
      .from("lost-and-found-images")
      .upload(fileName, file.data, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.mimetype,
      });
    if (uploadError) throw uploadError;
    // Get public URL
    const { data } = supabase.storage.from("lost-and-found-images").getPublicUrl(fileName);
    res.json({ publicUrl: data.publicUrl });
  } catch (error) {
    console.error("Lost & Found image upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// ============================================
// ASSIGNMENT ROUTES
// ============================================

/**
 * ✅ GET /api/assignments (SECURED)
 * Fetch assignments for the logged-in user.
 */
app.get('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id; // ✅ Secure user ID from token

    const { data, error } = await supabase
      .from('assignment_requests')
      .select(`*, assignment_files(*)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ assignments: data || [] });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

/**
 * ✅ POST /api/assignments (SECURED)
 * Body: formData (no user_id required anymore — we use token)
 */
app.post('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id; // ✅ Secure user ID from token
    const { name, whatsapp, year, branch, pages, deadline, hostel, room,
      notes, urgent, matchHandwriting, deliveryMethod } = req.body;

    // ✅ Server-side pricing logic here
    const basePrice = pages * (urgent ? 15 : 10);
    const matchingFee = matchHandwriting ? 20 : 0;
    const deliveryFee = deliveryMethod === 'hostel_delivery' ? 10 : 0;
    const totalPrice = basePrice + matchingFee + deliveryFee;

    const { data, error } = await supabase
      .from('assignment_requests')
      .insert({
        user_id: userId,
        student_name: name,
        whatsapp_number: whatsapp,
        year,
        branch,
        pages,
        deadline,
        hostel_name: hostel,
        room_number: room,
        special_instructions: notes,
        is_urgent: urgent,
        match_handwriting: matchHandwriting,
        delivery_method: deliveryMethod || 'hostel_delivery',
        total_price: totalPrice,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, assignment: data });
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

/**
 * ✅ GET /api/files/signed-url (SECURED)
 */
app.get('/api/files/signed-url', authenticateToken, async (req, res) => {
  try {
    const { path } = req.query;
    if (!path) return res.status(400).json({ error: 'File path required' });

    const { data, error } = await supabase.storage
      .from('assignment-files')
      .createSignedUrl(path, 3600); // 1 hour

    if (error) throw error;

    res.json({ url: data.signedUrl });
  } catch (err) {
    console.error('Error creating signed URL:', err);
    res.status(500).json({ error: 'Failed to generate URL' });
  }
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

app.get("/api/auth/callback", async (req, res) => {
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

app.get('/api/auth/session', async (req, res) => {
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

app.post('/api/auth/signup', async (req, res) => {
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
        emailRedirectTo: "https://ksaathi.vercel.app/auth/callback",
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

app.post('/api/auth/signin', async (req, res) => {
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

app.post('/api/auth/signout', async (req, res) => {
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

app.post('/api/auth/resend-confirmation', async (req, res) => {
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

app.post('/api/auth/forgot-password', async (req, res) => {
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
      redirectTo: `${process.env.FRONTEND_URL || 'https://ksaathi.vercel.app'}/reset-password`,
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

app.post('/api/auth/verify-email-callback', async (req, res) => {
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

// ============================================
// ADMIN REAL-TIME NOTIFICATIONS (SSE)
// ============================================

// Store active SSE connections
const sseClients = new Set();

// SSE endpoint for real-time admin notifications
app.get('/api/admin/realtime-notifications', (req, res) => {
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



// ============================================
// FACULTY ROUTES
// ============================================

// Get faculty photo URL
app.get('/api/faculty/photo-url', async (req, res) => {
  try {
    const { facultyId } = req.query;
    if (!facultyId) {
      return res.status(400).json({ error: 'Missing facultyId parameter' });
    }
    const fileName = `${facultyId}.jpg`;
    const { data } = supabase.storage.from('faculty-photos').getPublicUrl(fileName);
    res.json({ photoUrl: data.publicUrl });
  } catch (error) {
    console.error('Error fetching faculty photo URL:', error);
    res.status(500).json({ error: 'Failed to fetch photo URL' });
  }
});

// Upload faculty photo
app.post("/api/faculty/upload-photo", async (req, res) => {
  try {
    if (!req.files || !req.files.photo) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { facultyId } = req.body;
    const file = req.files.photo;
    if (!facultyId || !file) {
      return res.status(400).json({ error: "Missing facultyId or file" });
    }
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
      return res.status(400).json({ error: "Only JPG and PNG files are allowed" });
    }
    if (file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ error: "File size must be less than 2MB" });
    }
    const fileName = `${facultyId}.jpg`;
    await supabase.storage.from("faculty-photos").remove([fileName]);
    const { error: uploadError } = await supabase.storage
      .from("faculty-photos")
      .upload(fileName, file.data, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.mimetype,
      });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("faculty-photos").getPublicUrl(fileName);
    res.json({ photoUrl: data.publicUrl });
  } catch (error) {
    console.error("Faculty photo upload error:", error);
    res.status(500).json({ error: "Failed to upload photo" });
  }
});


// ============================================
// LOST & FOUND ROUTES
// ============================================

// ✅ Create order for Lost & Found contact unlock (amount expected in **paise**)
app.post('/api/lostfound/create-lost-found-order', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // payer
    const { amount, itemId, itemTitle, itemPosterEmail, receipt } = req.body;

    if (!razorpay) {
      return res.status(500).json({ error: 'Payment service not available' });
    }
    if (!amount || !itemId || !itemTitle) {
      return res.status(400).json({ error: 'Missing amount, itemId, or itemTitle' });
    }

    // Validate item and prevent paying for own item
    const { data: itemData, error: itemError } = await supabase
      .from('lost_and_found_items')
      .select('contact_email')
      .eq('id', itemId)
      .single();

    if (itemError || !itemData) {
      return res.status(404).json({ error: 'Lost item not found' });
    }
    if (itemData.contact_email && itemPosterEmail && itemData.contact_email === itemPosterEmail) {
      return res.status(400).json({ error: 'You cannot unlock your own item' });
    }

    // Check existing completed payment for the same user & item
    const { data: existingPayment, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user_id)
      .eq('service_name', 'LostAndFoundContact')
      .eq('payment_status', 'completed')
      .contains('booking_details', { item_id: itemId })
      .limit(1);

    if (checkError) {
      console.error('Check existing payment error:', checkError);
      return res.status(500).json({ error: 'Failed to validate payment status' });
    }
    if (existingPayment && existingPayment.length > 0) {
      return res.status(400).json({ error: 'Payment already completed for this item' });
    }

    const order = await razorpay.orders.create({
      amount, // already in paise
      currency: 'INR',
      receipt: receipt || `lost_found_${itemId}_${Date.now()}`,
      notes: {
        item_id: itemId,
        item_title: itemTitle,
        payer_user_id: user_id,
        poster_email: itemPosterEmail || '',
      },
    });

    return res.json(order);
  } catch (error) {
    console.error('Error creating Lost & Found order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// ✅ Verify Lost & Found payment (paise) and store
app.post('/api/lostfound/verify-lost-found-payment', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // payer
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      itemId,
      itemTitle,
      itemPosterEmail,
      splitDetails,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !itemId || !itemTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Optional: verify captured
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment.status !== 'captured') {
        return res.status(400).json({ error: 'Payment not captured' });
      }
    } catch (e) {
      console.warn('Razorpay fetch warning:', e?.message);
    }

    const { error: orderError } = await supabase.from('orders').insert({
      user_id,
      service_name: 'LostAndFoundContact',
      subservice_name: itemTitle,
      amount: splitDetails?.totalAmount || null,
      payment_method: 'razorpay',
      payment_status: 'completed',
      transaction_id: razorpay_payment_id,
      booking_details: {
        item_id: itemId,
        item_title: itemTitle,
        poster_email: itemPosterEmail || '',
        razorpay_order_id,
        split_details: splitDetails || null,
      },
    });
    if (orderError) {
      console.error('Error storing order:', orderError);
    }

    return res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error('Error verifying Lost & Found payment:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

// ✅ Check if the authenticated user already paid for Lost & Found contact
app.get('/api/lostfound/has-paid-lost-found-contact', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { item_id } = req.query;

    if (!item_id) {
      return res.status(400).json({ error: 'Missing item_id' });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user_id)
      .eq('service_name', 'LostAndFoundContact')
      .eq('payment_status', 'completed')
      .contains('booking_details', { item_id })
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.json({ paid: !!(data && data.length) });
  } catch (error) {
    console.error('Error checking Lost & Found payment status:', error);
    return res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// ✅ Submit application for a lost item
app.post('/api/lostfound/submit-lost-item-application', authenticateToken, async (req, res) => {
  try {
    const applicantUserId = req.user_id;
    const {
      lostItemId,
      lostItemTitle,
      lostItemOwnerEmail,
      applicantName,
      applicantEmail,
      applicantPhone,
      foundPhotoUrl,
      foundDescription,
      foundLocation,
      foundDate,
    } = req.body;

    console.log('Application submission data:', {
      applicantUserId,
      lostItemId,
      applicantName,
      applicantEmail,
      applicantPhone,
      foundPhotoUrl: foundPhotoUrl ? 'provided' : 'missing',
      foundDescription: foundDescription ? 'provided' : 'missing',
      foundLocation,
      foundDate
    });

    if (!lostItemId || !lostItemOwnerEmail || !applicantName || !applicantEmail || !applicantPhone || !foundPhotoUrl || !foundDescription || !foundLocation || !foundDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: applicationData, error: insertError } = await supabase
      .from('lost_found_applications')
      .insert({
        lost_item_id: lostItemId,
        applicant_user_id: applicantUserId || null,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone,
        found_photo_url: foundPhotoUrl,
        found_description: foundDescription,
        found_location: foundLocation,
        found_date: foundDate,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      
      if (insertError.code === '23505' || `${insertError.message}`.includes('unique_application_per_user_per_item')) {
        return res.status(409).json({
          error: 'You have already applied for this lost item.',
          type: 'duplicate',
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to save application',
        details: insertError.message 
      });
    }

    console.log('Application submitted successfully:', applicationData.id);

    return res.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: applicationData.id,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({ 
      error: 'Failed to submit application',
      details: error.message 
    });
  }
});

// ✅ Create order for unlocking application contact details
app.post('/api/lostfound/create-application-unlock-order', authenticateToken, async (req, res) => {
  try {
    const ownerUserId = req.user_id;
    const { amount, applicationId, lostItemTitle, receipt } = req.body;

    if (!razorpay) {
      return res.status(500).json({ error: 'Payment service not available' });
    }
    if (!amount || !applicationId) {
      return res.status(400).json({ error: 'Missing amount or applicationId' });
    }

    const { data: existingApplication, error: checkError } = await supabase
      .from('lost_found_applications')
      .select('status')
      .eq('id', applicationId)
      .single();

    if (checkError) {
      console.error('Check application error:', checkError);
      return res.status(500).json({ error: 'Failed to validate application' });
    }
    if (existingApplication?.status === 'paid') {
      return res.status(400).json({ error: 'Already unlocked' });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: receipt || `app_unlock_${applicationId}_${Date.now()}`,
      notes: {
        application_id: applicationId,
        service: 'application_contact_unlock',
        owner_user_id: ownerUserId,
        lost_item_title: lostItemTitle || '',
      },
    });

    return res.json(order);
  } catch (error) {
    console.error('Error creating application unlock order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// ✅ Verify payment for application unlock
app.post('/api/lostfound/verify-application-unlock-payment', authenticateToken, async (req, res) => {
  try {
    const ownerUserId = req.user_id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      applicationId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !applicationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment.status !== 'captured') {
        return res.status(400).json({ error: 'Payment not captured' });
      }
    } catch (e) {
      console.warn('Razorpay fetch warning:', e?.message);
    }

    const { error: updateError } = await supabase
      .from('lost_found_applications')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_id: razorpay_payment_id,
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return res.status(500).json({ error: 'Failed to unlock application' });
    }

    const { error: orderError } = await supabase.from('orders').insert({
      user_id: ownerUserId,
      service_name: 'ApplicationContactUnlock',
      subservice_name: `Application ${applicationId}`,
      amount: null,
      payment_method: 'razorpay',
      payment_status: 'completed',
      transaction_id: razorpay_payment_id,
      booking_details: {
        application_id: applicationId,
        razorpay_order_id,
      },
    });
    if (orderError) {
      console.error('Error storing order:', orderError);
    }

    return res.json({
      success: true,
      message: 'Contact details unlocked successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Error verifying application unlock payment:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

// ✅ GET Lost & Found items (active only) - SECURED
// ✅ GET - Fetch all Lost/Found items (PUBLIC - no auth required for browsing)
app.get('/api/lostfound/items', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lost_and_found_items')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // ✅ Ensure image URLs are properly formatted as public URLs
    const itemsWithImages = (data || []).map(item => {
      if (item.image_url && !item.image_url.startsWith('http')) {
        // If image_url is just a filename, generate the full public URL
        const { data: urlData } = supabase.storage
          .from('lost-and-found-images')
          .getPublicUrl(item.image_url);
        console.log(`🖼️ Generated public URL for ${item.image_url}: ${urlData.publicUrl}`);
        return { ...item, image_url: urlData.publicUrl };
      }
      return item;
    });

    console.log(`📦 Returning ${itemsWithImages.length} Lost & Found items`);
    return res.json({ items: itemsWithImages });
  } catch (err) {
    console.error('Error fetching lost & found items:', err);
    return res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// ✅ POST - Add a new Lost/Found item (SECURED)
app.post('/api/lostfound/items', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { ...itemData } = req.body;

    console.log('📝 Adding new Lost & Found item:', {
      title: itemData.title,
      item_type: itemData.item_type,
      has_image: !!itemData.image_url,
      user_id
    });

    const newItem = {
      ...itemData,
      user_id,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('lost_and_found_items')
      .insert(newItem)
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting item:', error);
      throw error;
    }

    console.log('✅ Item added successfully:', data.id);
    return res.json({ item: data });
  } catch (err) {
    console.error('Error adding lost & found item:', err);
    return res.status(500).json({ error: 'Failed to add item', details: err.message });
  }
});

// ✅ PATCH - Update an existing Lost/Found item (SECURED)
app.patch('/api/lostfound/items/:id', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { id } = req.params;
    const { ...updates } = req.body;

    const { data, error } = await supabase
      .from('lost_and_found_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(403).json({ error: 'Unauthorized to update this item' });
    }

    return res.json({ item: data });
  } catch (err) {
    console.error('Error updating lost & found item:', err);
    return res.status(500).json({ error: 'Failed to update item' });
  }
});



app.post('/api/payments/create-lost-found-order', async (req, res) => {
  try {
    const { amount, itemId, itemTitle, itemPosterEmail, payerUserId, receipt } = req.body;

    // Validate required fields 
    if (!amount || !itemId || !itemTitle || !payerUserId) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['amount', 'itemId', 'itemTitle', 'payerUserId'] 
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount, // amount in paise (15 rupees = 1500 paise)
      currency: 'INR',
      receipt: receipt,
      notes: {
        item_id: itemId,
        item_title: itemTitle,
        service: 'lost_found_contact',
        payer_user_id: payerUserId,
        poster_email: itemPosterEmail
      }
    };

    const order = await razorpay.orders.create(options);
    
    // Store order details in database
    const { error: dbError } = await supabase
      .from('payment_orders')
      .insert({
        order_id: order.id,
        amount: amount / 100, // Convert back to rupees for storage
        currency: 'INR',
        status: 'created',
        service_type: 'lost_found_contact',
        user_id: payerUserId,
        metadata: {
          item_id: itemId,
          item_title: itemTitle,
          poster_email: itemPosterEmail
        }
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Database error while storing order' });
    }

    console.log('Lost & Found order created:', order);
    res.json(order);

  } catch (error) {
    console.error('Error creating Lost & Found order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Verify payment and process split for Lost & Found
app.post('/api/payments/verify-lost-found-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      itemId,
      itemTitle,
      itemPosterEmail,
      payerUserId,
      splitDetails
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({ success: false, message: 'Payment not captured' });
    }

    // Update order status in database
    const { error: updateError } = await supabase
      .from('payment_orders')
      .update({ 
        status: 'completed',
        payment_id: razorpay_payment_id,
        completed_at: new Date().toISOString()
      })
      .eq('order_id', razorpay_order_id);

    if (updateError) {
      console.error('Error updating order:', updateError);
    }

    // Record the contact unlock transaction
    const { error: unlockError } = await supabase
      .from('lost_found_contact_unlocks')
      .insert({
        item_id: itemId,
        payer_user_id: payerUserId,
        amount_paid: splitDetails.totalAmount,
        platform_fee: splitDetails.platformFee,
        poster_reward: splitDetails.posterAmount,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      });

    if (unlockError) {
      console.error('Error recording unlock:', unlockError);
      // Don't fail the request if this fails, as payment is already successful
    }

    // TODO: Implement Razorpay PayoutX for automatic splitting
    // For now, we'll handle the split manually through transfers
    
    try {
      // Create payout to item poster (10 rupees)
      // Note: This requires PayoutX or Route feature to be enabled
      const payout = await razorpay.payouts.create({
        account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // Your account number
        fund_account_id: 'fa_poster_account_id', // This needs to be created for each poster
        amount: splitDetails.posterAmount * 100, // 10 rupees in paise
        currency: 'INR',
        mode: 'IMPS',
        purpose: 'refund', // or 'payout'
        queue_if_low_balance: true,
        reference_id: `lf_reward_${itemId}_${Date.now()}`,
        narration: `Reward for helping find: ${itemTitle}`
      });
      
      console.log('Payout created for poster:', payout);
    } catch (payoutError) {
      console.error('Payout creation failed (non-critical):', payoutError);
      // This is non-critical for the contact unlock functionality
    }

    // Send contact details email
    try {
      // This would typically call your email service
      await fetch(`/api/payments/send-contact-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemTitle,
          payerUserId,
          posterContactDetails: {
            email: itemPosterEmail
          }
        })
      });
    } catch (emailError) {
      console.error('Email sending failed (non-critical):', emailError);
    }

    res.json({
      success: true,
      message: 'Payment verified and contact details unlocked',
      paymentId: razorpay_payment_id,
      splitProcessed: true
    });

  } catch (error) {
    console.error('Error verifying Lost & Found payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed', 
      details: error.message 
    });
  }
});

// Send contact details via email
app.post('/api/payments/send-contact-details', async (req, res) => {
  try {
    const { itemId, itemTitle, payerUserId, posterContactDetails } = req.body;

    // Get payer's email from user profile
    const { data: payerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', payerUserId)
      .single();

    if (profileError || !payerProfile) {
      console.error('Could not fetch payer profile:', profileError);
      return res.status(400).json({ error: 'Could not find payer profile' });
    }

    // TODO: Integrate with your email service (SendGrid, etc.)
    // For now, we'll just log the details
    console.log('Contact details to send:', {
      to: payerProfile.email,
      itemTitle,
      posterContactDetails
    });

    // Email would contain:
    // - Item details
    // - Poster's contact information
    // - Thank you message
    // - Platform info

    res.json({ success: true, message: 'Contact details sent via email' });

  } catch (error) {
    console.error('Error sending contact details:', error);
    res.status(500).json({ error: 'Failed to send contact details' });
  }
});

// Check if user has already paid for contact details
app.get('/api/payments/has-paid-contact', async (req, res) => {
  try {
    const { user_id, item_id } = req.query;

    if (!user_id || !item_id) {
      return res.status(400).json({ error: 'Missing user_id or item_id' });
    }

    const { data, error } = await supabase
      .from('lost_found_contact_unlocks')
      .select('id')
      .eq('item_id', item_id)
      .eq('payer_user_id', user_id)
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ paid: data && data.length > 0 });

  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// ============================================
// POLICY ROUTES
// ============================================

// ✅ Get user policy acceptance (SECURED)
app.get('/api/policy', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ From JWT

    const { data, error } = await supabase
      .from('policy_acceptances')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return res.json({ policyData: data || null });
  } catch (err) {
    console.error('Error fetching policy acceptance:', err);
    return res.status(500).json({ error: 'Failed to fetch policy data' });
  }
});

// ✅ Accept Privacy Policy (SECURED)
app.post('/api/policy/privacy', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ From token
    const { privacy_policy_version } = req.body;

    if (!privacy_policy_version) {
      return res.status(400).json({ error: 'Missing privacy_policy_version' });
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('policy_acceptances')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const updateData = {
      user_id,
      privacy_policy_accepted: true,
      privacy_policy_version,
      terms_conditions_accepted: existing?.terms_conditions_accepted || false,
      terms_conditions_version: existing?.terms_conditions_version || '',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('policy_acceptances')
      .upsert(updateData, { onConflict: 'user_id' });

    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Error accepting privacy policy:', err);
    return res.status(500).json({ 
      error: 'Failed to accept privacy policy',
      details: err.message 
    });
  }
});

app.post('/delete-all-resume-data', async (req, res) => {
  try {
    const { target_user_id } = req.body;

    if (!target_user_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing target_user_id',
      });
    }

    console.log('🗑️ Initiating Delete All Data Request...');
    console.log('👤 Target User ID:', target_user_id);

    // Call Supabase RPC function
    const { data, error } = await supabase.rpc('delete_all_resume_data', {
      target_user_id,
    });

    if (error) {
      console.error('❌ Supabase RPC Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete user data',
      });
    }

    if (!data) {
      console.error('⚠️ RPC returned no data');
      return res.status(500).json({
        success: false,
        error: 'Delete operation returned null or undefined',
      });
    }

    console.log('✅ Data deleted successfully for user:', target_user_id);

    return res.status(200).json({
      success: true,
      message: 'All personal data permanently deleted from our servers',
    });

  } catch (err) {
    console.error('💥 Unexpected API Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Unexpected server error occurred',
    });
  }
});


// ✅ Accept Terms & Conditions (SECURED)
app.post('/api/policy/terms', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ From token
    const { terms_conditions_version } = req.body;

    if (!terms_conditions_version) {
      return res.status(400).json({ error: 'Missing terms_conditions_version' });
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('policy_acceptances')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const updateData = {
      user_id,
      privacy_policy_accepted: existing?.privacy_policy_accepted || false,
      privacy_policy_version: existing?.privacy_policy_version || '',
      terms_conditions_accepted: true,
      terms_conditions_version,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('policy_acceptances')
      .upsert(updateData, { onConflict: 'user_id' });

    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Error accepting terms:', err);
    return res.status(500).json({ 
      error: 'Failed to accept terms',
      details: err.message 
    });
  }
});

// ============================================
// SEMESTER BOOKS ROUTES
// ============================================

// Get semester books
app.get('/api/semester-books', async (req, res) => {
  const { semester } = req.query;
  if (!semester || isNaN(Number(semester))) {
    return res.status(400).json({ error: 'Invalid or missing semester parameter' });
  }

  try {
    const { data, error } = await supabase
      .from('semester_books')
      .select('*')
      .eq('semester', Number(semester))
      .order('subject_category', { ascending: true });

    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching semester books:', error);
    res.status(500).json({ error: 'Failed to fetch semester books' });
  }
});

// Get semester combos
app.get('/api/semester-combos', async (req, res) => {
  const { semester } = req.query;
  if (!semester || isNaN(Number(semester))) {
    return res.status(400).json({ error: 'Invalid or missing semester parameter' });
  }

  try {
    const { data, error } = await supabase
      .from('semester_combos')
      .select('*')
      .eq('semester_number', Number(semester));

    if (error) throw error;
    res.json({ data: data || [] });
  } catch (error) {
    console.error('Error fetching semester combos:', error);
    res.status(500).json({ error: 'Failed to fetch semester combos' });
  }
});


// ============================================
// STUDY MATERIAL ROUTES
// ============================================

// Get study materials
app.get("/api/study-materials", async (req, res) => {
  const { type, subject, semester, year, search } = req.query;
  
  try {
    console.log('📚 Study materials request received:', {
      type,
      subject,
      semester,
      year,
      search,
      fullQuery: req.query
    });

    // Validate type parameter
    const validTypes = ['pyqs', 'notes', 'ebooks', 'ppts'];
    if (!type || !validTypes.includes(type)) {
      console.error('❌ Invalid type parameter:', type);
      return res.status(400).json({ error: "Invalid or missing type parameter" });
    }

    // Select table based on type
    const tableName = type; // Maps directly to table names: pyqs, notes, ebooks, ppts
    console.log(`✅ Fetching materials from table: ${tableName}`);

    let query = supabase
      .from(tableName)
      .select('*') // Select all columns to avoid missing column errors
      .order('created_at', { ascending: false });

    // Apply filters only if the columns exist
    if (subject) query = query.eq('subject', subject);
    if (semester) query = query.eq('semester', semester);
    if (year) query = query.eq('year', year);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query;
    if (error) {
      console.error(`❌ Supabase query error:`, error);
      throw error;
    }

    console.log(`📊 Found ${data?.length || 0} materials in ${tableName} table`);

    // If no data, return empty array
    if (!data || data.length === 0) {
      console.log(`📭 No materials found, returning empty array`);
      return res.json({ data: [] });
    }

    // Generate PUBLIC URLs for pdf_url (stored as storage_path in the bucket)
    const materialsWithPublicUrls = data.map((material) => {
      // Find the file path from any possible column
      const filePath = material.storage_path || material.pdf_url || material.downloadUrl || material.url || null;
      
      if (!filePath) {
        console.error(`❌ No file path found for material ID ${material.id}:`, {
          id: material.id,
          title: material.title,
          storage_path: material.storage_path,
          pdf_url: material.pdf_url
        });
        return { ...material, pdf_url: null };
      }

      try {
        // Check if it's already a full URL
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
          console.log(`✅ Material ${material.id} already has a full URL:`, filePath);
          return { ...material, pdf_url: filePath };
        }

        // Remove leading slashes if any for storage path
        const storagePath = filePath.replace(/^\/+/, '');
        
        console.log(`🔗 Generating PUBLIC URL for material ${material.id}:`, {
          title: material.title,
          originalPath: filePath,
          finalStoragePath: storagePath,
          materialType: type
        });

        // Generate PUBLIC URL from storage path
        const { data: publicUrlData } = supabase.storage
          .from('study-materials')
          .getPublicUrl(storagePath);

        if (!publicUrlData?.publicUrl) {
          console.error(`❌ Error creating public URL for ${storagePath}`);
          return { ...material, pdf_url: null };
        }

        console.log(`✅ Successfully generated public URL for material ${material.id}:`, publicUrlData.publicUrl);
        return { ...material, pdf_url: publicUrlData.publicUrl };
      } catch (error) {
        console.error(`❌ Error processing material ${material.id}:`, error);
        return { ...material, pdf_url: null };
      }
    });

    const materialsWithValidUrls = materialsWithPublicUrls.filter(m => m.pdf_url !== null);
    console.log(`📤 Returning ${materialsWithValidUrls.length}/${materialsWithPublicUrls.length} materials with valid URLs`);

    res.json({ data: materialsWithPublicUrls });
  } catch (error) {
    console.error(`❌ Error fetching study materials (type: ${type}):`, error);
    res.status(500).json({ error: `Failed to fetch study materials`, details: error.message });
  }
});

// Debug endpoint to test table access
app.get("/api/study-materials/debug/:type", async (req, res) => {
  try {
    const { type } = req.params;
    console.log(`🔍 Debug: Testing access to ${type} table`);
    
    const { data, error, count } = await supabase
      .from(type)
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error(`❌ Debug error:`, error);
      return res.json({ 
        success: false, 
        table: type,
        error: error.message,
        details: error 
      });
    }
    
    console.log(`✅ Debug: Found ${count} total rows, returning first 5`);
    res.json({ 
      success: true, 
      table: type,
      totalCount: count,
      sampleData: data,
      columns: data.length > 0 ? Object.keys(data[0]) : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload study material and submit request
app.post('/api/study-materials/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded', success: false });
    }a
    const file = req.files.file;
    const { title, subject, semester, branch, year, folder_type, uploader_name } = req.body;

    // Validate required fields and folder_type
    const validTypes = ['pyqs', 'notes', 'ebooks', 'ppts'];
    if (!title || !subject || !semester || !folder_type || !uploader_name || !validTypes.includes(folder_type)) {
      return res.status(400).json({ error: 'Missing or invalid required fields', success: false });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type', success: false });
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 50MB limit', success: false });
    }

  const userId = req.user?.id || null;
  const timestamp = Date.now();
  const filename = `${userId ? userId : 'guest'}_${timestamp}_${file.name}`;
  const storagePath = `${folder_type}/pending/${filename}`; // Store in pending subfolder

    // Upload to study-materials bucket
    const { error: uploadError } = await supabase.storage
      .from('study-materials')
      .upload(storagePath, file.data, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file', success: false });
    }

    // Insert into study_material_requests table only (match DB schema)
    const { error: insertError } = await supabase
      .from('study_material_requests')
      .insert({
        title,
        subject,
        semester,
        branch,
        year,
        folder_type,
        uploader_name: uploader_name || (req.user?.email ?? 'Unknown'),
        uploader_id: userId || null,
        filename: filename,
        storage_path: storagePath,
        filesize: file.size,
        mime_type: file.mimetype,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      await supabase.storage.from('study-materials').remove([storagePath]);
      throw insertError;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Study material upload error:', error);
    res.status(500).json({ error: 'Failed to upload material', success: false });
  }
});

// Fetch study material requests (Admin)
app.post('/api/admin/study-material-approve', async (req, res) => {
  try {
    const { request_id } = req.body;

    if (!request_id) return res.status(400).json({ error: 'request_id is required' });

    // Forward the approval to the Supabase Edge Function which contains the hardened logic
    const authHeader = req.headers.authorization || '';

    const { data, error } = await supabase.functions.invoke('admin-approve-study-material', {
      body: { request_id },
      headers: { Authorization: authHeader }
    });

    if (error) {
      console.error('Edge function error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Approval function failed' });
    }

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error invoking approval function:', error);
    res.status(500).json({ success: false, error: 'Failed to approve material' });
  }
});
// Get signed preview URL (Admin)
app.get('/api/admin/study-material-preview-url', async (req, res) => {
  try {
    const { path } = req.query;
    if (!path) return res.status(400).json({ error: 'Missing path' });
    const { data, error } = await supabase.storage
      .from('study-material-pending')
      .createSignedUrl(path, 300);
    if (error) throw error;
    res.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error('Error creating signed URL:', error);
    res.status(500).json({ error: 'Failed to create signed URL' });
  }
});

// Approve study material (Admin)
app.post('/api/admin/study-material-approve', async (req, res) => {
  try {
    const { request_id, adminUserId } = req.body;
    const { error } = await supabase
      .from('study_material_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', request_id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error approving material:', error);
    res.status(500).json({ success: false, error: 'Failed to approve material' });
  }
});

// Reject study material (Admin)
app.post('/api/admin/study-material-reject', async (req, res) => {
  try {
    const { request_id, folder_type, admin_comment } = req.body;

    // Validate folder_type
    const validTypes = ['pyqs', 'notes', 'ebooks', 'ppts'];
    if (!request_id || !folder_type || !validTypes.includes(folder_type)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // Fetch the request
    const tableName = folder_type;
    const { data: request, error: fetchError } = await supabase
      .from(tableName)
      .select('pdf_url')
      .eq('id', request_id)
      .single();

    if (fetchError || !request) throw new Error('Request not found');

    // Remove file from storage
    const storagePath = `${folder_type}/pending/${request.pdf_url}`;
    const { error: removeError } = await supabase.storage
      .from('study-materials')
      .remove([storagePath]);

    if (removeError) throw removeError;

    // Update request status
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        status: 'rejected',
        admin_comment,
        updated_at: new Date().toISOString()
      })
      .eq('id', request_id);

    if (updateError) throw updateError;

    res.json({ success: true });
  } catch (error) {
    console.error('Error rejecting material:', error);
    res.status(500).json({ success: false, error: 'Failed to reject material' });
  }
});








// ✅ Check if the authenticated user has paid to view a Lost & Found contact
app.get('/has-paid-contact', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id;
    const { item_id, item_title } = req.query;

    if (!item_id || !item_title) {
      return res.status(400).json({ error: 'Missing item_id or item_title' });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user_id)
      .eq('service_name', 'LostAndFound')
      .eq('subservice_name', item_title)
      .eq('payment_status', 'completed')
      .limit(1);

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.json({ paid: !!(data && data.length) });
  } catch (err) {
    console.error('Unexpected error in /has-paid-contact:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

// ✅ Check if user has paid for contact unlock for a specific item

// ✅ Create a generic Razorpay order (amount in rupees -> converted to paise)
app.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!razorpay) {
      return res.status(500).json({
        error: 'Payment service not available - Razorpay not configured',
      });
    }

    if (!amount || !receipt) {
      return res.status(400).json({ error: 'Missing amount or receipt' });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // rupees -> paise
      currency,
      receipt,
    });

    console.log('✅ Razorpay order created:', order.id);
    return res.json(order);
  } catch (err) {
    console.error('❌ Error creating Razorpay order:', err);
    return res.status(500).json({ 
      error: 'Failed to create order',
      details: err.message 
    });
  }
});

//Group Dashboard SplitSaathi
app.post("/api/profile/ensure", async (req, res) => {
  const { user_id, email, full_name } = req.body;

  if (!user_id || !email) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Check if profile exists
    const { data: existing, error: selectError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user_id)
      .maybeSingle();

    if (selectError) throw selectError;

    // If not, create one
    if (!existing) {
      const { error: insertError } = await supabase.from("profiles").insert([
        { id: user_id, email, full_name: full_name || email },
      ]);
      if (insertError) throw insertError;
    if (!razorpay) {
      return res.status(500).json({
        error: 'Payment service not available - Razorpay not configured',
      });
    }
    if (!amount || !receipt) {
      return res.status(400).json({ error: 'Missing amount or receipt' });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // rupees -> paise
      currency,
      receipt,
    });
  }
    return res.json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// ✅ Verify a generic payment and record it to orders
app.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      service_name,
      subservice_name,
      amount,
      payment_method = 'razorpay',
      currency = 'INR',
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !service_name || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Signature verify
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Optional: fetch payment to double-check status
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      if (payment.status !== 'captured') {
        return res.status(400).json({ error: 'Payment not captured' });
      }
    } catch (e) {
      console.warn('Razorpay fetch warning:', e?.message);
    }

    const { error } = await supabase.from('orders').insert({
      user_id,
      service_name,
      subservice_name: subservice_name || null,
      amount,
      payment_status: 'completed',
      transaction_id: razorpay_payment_id,
      payment_method,
      booking_details: { currency, razorpay_order_id },
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to save order' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Error ensuring profile:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});




app.get("/api/group/:groupId", authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const user_id = req.user_id; // ✅ From authenticated token

  try {
    // Fetch group details
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();
    if (groupError) throw groupError;

    // Fetch members
    const { data: members, error: membersError } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId);
    if (membersError) throw membersError;

    // Fetch expenses
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select(`
        *,
        paid_by_member:group_members(*)
      `)
      .eq("group_id", groupId)
      .order("date", { ascending: false });
    if (expensesError) throw expensesError;

    return res.json({ group, members, expenses });
  } catch (err) {
    console.error("Error fetching group data:", err);
    return res.status(500).json({ error: "Failed to fetch group data" });
  }
});



{/* ---------------------- events hook ENDPOINTS  ---------------------- */}

/**
 * GET /api/events
 * Returns validated and chronological events
 */
app.get('/api/events',  async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('validation', true)
      .order('event_date', { ascending: true });

    if (error) throw error;

    res.json({ events: data || [] });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events/add', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Missing authorization header' });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user)
      return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { formData } = req.body;
    if (!formData?.event_name || !formData?.event_date)
      return res.status(400).json({ success: false, message: 'Event name and date are required' });

    // ✅ Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, email')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const reqs = formData.requirements || [];

    if (profile?.is_admin) {
      // Admin → directly publish to calendar
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([
          {
            ...formData,
            requirements: reqs,
            validation: true,
          },
        ])
        .select();

      if (error) throw error;

      return res.json({
        success: true,
        message: 'Event published successfully!',
        data,
      });
    } else {
      // Regular user → create request
      const { error } = await supabase
        .from('interview_event_requests')
        .insert({
          ...formData,
          requirements: reqs,
          requester_email: user.email,
          user_id: user.id,
          status: 'pending',
        });

      if (error) throw error;

      return res.json({
        success: true,
        message:
          "Event submitted for review! You'll be notified once it's approved.",
      });
    }
  } catch (error) {
    console.error('Event add error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/interviews/add", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const { formData } = req.body;
    if (!formData?.interview_name || !formData?.interview_date) {
      return res.status(400).json({ success: false, message: "Interview name and date are required" });
    }

    const reqs = formData.requirements
      ? formData.requirements.split(",").map(r => r.trim()).filter(Boolean)
      : [];

    // Get user profile to check admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .single();

    if (profile?.is_admin) {
      const { data, error } = await supabase
        .from("interview_events")
        .insert([{ ...formData, requirements: reqs, validation: true }])
        .select();

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.json({ success: true, message: "Interview added successfully", data });
    } else {
      const { error } = await supabase
        .from("interview_events")
        .insert({
          ...formData,
          requirements: reqs,
          
          
        });

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.json({
        success: true,
        message: "Interview submitted for review! You'll be notified once it's approved",
      });
    }
  }  catch (err) {
    console.error("Interview submit error:", err);
    res.status(500).json({ success: false, message: "Failed to submit interview" });
  }
});






{/* ---------------------- group auto link ENDPOINTS  ---------------------- */}

// ✅ FINAL FIXED BACKEND ENDPOINT (no foreign key joins required)
// POST /api/groups/auto-link
// ✅ SECURED version of POST /api/groups/auto-link
// ✅ SECURED version of POST /api/groups/auto-link
app.post('/api/groups/auto-link', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ From token

    // ✅ Fetch user email from Supabase Auth system
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !userData?.user?.email) {
      return res.status(400).json({ error: 'Could not fetch user email' });
    }
    const email = userData.user.email;

    // ✅ Extract roll number from email
    const rollMatch = email.match(/^(\d+)@/);
    if (!rollMatch) {
      return res.json({ newGroups: [] });
    }
    const rollNumber = rollMatch[1];

    // ✅  Fetch matching groups based on roll_number in group_members
    const { data: matchingMembers, error: membersError } = await supabase
      .from('group_members')
      .select(`
        id,
        roll_number,
        group_id,
        groups!inner(
          id,
          name,
          created_by
        )
      `)
      .eq('roll_number', rollNumber);

    if (membersError) throw membersError;
    if (!matchingMembers || matchingMembers.length === 0) {
      return res.json({ newGroups: [] });
    }

    const newGroups = [];

    // ✅ Loop through matched groups
    for (const member of matchingMembers) {
      const group = member.groups;
      if (!group) continue;

      // ✅ Skip if user created this group
      if (group.created_by === user_id) continue;

      // ✅ Check if notification exists
      const { data: existingNotification } = await supabase
        .from('group_notifications')
        .select('id')
        .eq('user_id', user_id)
        .eq('group_id', group.id)
        .single();

      if (existingNotification) continue;

      // ✅ Insert notification
      await supabase
        .from('group_notifications')
        .insert({ user_id, group_id: group.id });

      // ✅ Fetch group creator info
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', group.created_by)
        .single();

      const creatorName = creatorProfile?.full_name || 'Unknown';
      const creatorEmail = creatorProfile?.email || '';
      const creatorRollNumber = creatorEmail.match(/^(\d+)@/)?.[1] || '';

      newGroups.push({
        name: group.name,
        creatorName,
        creatorRollNumber,
        rollNumber
      });
    }

    return res.json({ newGroups });
  } catch (err) {
    console.error('Error auto-linking groups:', err);
    return res.status(500).json({ error: 'Failed to auto-link groups' });
  }
});



{/* ---------------------- use order history hook ENDPOINTS  ---------------------- */}

// 1️⃣ GET /api/orders - Fetch user's orders
// ✅ GET /api/orders - Fetch user's orders (SECURED)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ Secure user from token

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ orders: data || [] });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});


// ✅ POST /api/orders - Create new order (SECURED)
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ Secure user from token
    const { service_name, subservice_name, amount, payment_status, transaction_id, payment_method, booking_details } = req.body;

    if (!service_name || !amount || !payment_status) {
      return res.status(400).json({ error: 'Missing required fields: service_name, amount, or payment_status' });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id,
        service_name,
        subservice_name: subservice_name || null,
        amount,
        payment_status,
        transaction_id: transaction_id || null,
        payment_method: payment_method || null,
        booking_details: booking_details || null
      })
      .select()
      .single();

    if (error) throw error;

    return res.json({ order: data });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});


// ✅ PATCH /api/orders/:id/status - Update order payment status (SECURED)
app.patch('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ Secure user from token
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Missing status field' });
    }

    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status })
      .eq('id', id)
      .eq('user_id', user_id); // ✅ Prevent updating others' orders

    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});


//Society Events
app.get("/api/society-events", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .gte("event_date", today)
      .order("event_date", { ascending: true });

    if (error) throw error;

    // Group by society name (case-insensitive)
    const eventsBySociety = {};
    data?.forEach((event) => {
      const normalizedName = event.society_name.toLowerCase().trim();
      if (!eventsBySociety[normalizedName]) {
        eventsBySociety[normalizedName] = [];
      }
      eventsBySociety[normalizedName].push(event);
    });

    res.status(200).json(eventsBySociety);
  } catch (err) {
    console.error("Error fetching events:", err.message);
    res.status(500).json({ error: "Failed to load events" });
  }
});


//SplitSaathi - ✅ SECURED
app.post("/api/user-groups", authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id; // ✅ From token
    const email = req.user.email; // ✅ From token
    
    if (!userId || !email) {
      return res.status(400).json({ error: "Missing user information" });
    }

    // Extract roll number from email (e.g., "2105555@kiit.ac.in")
    const rollNumberMatch = email.match(/^(\d+)@/);
    const rollNumber = rollNumberMatch?.[1];

    // Load groups created by user
    const { data: createdGroups, error: createdError } = await supabase
      .from("groups")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (createdError) throw createdError;

    let linkedGroups = [];

    // If roll number found, load groups they're a member of
    if (rollNumber) {
      const { data: memberRecords, error: memberError } = await supabase
        .from("group_members")
        .select("group_id, groups!inner(*)")
        .eq("roll_number", rollNumber);

      if (memberError) throw memberError;

      linkedGroups = memberRecords
        .map((record) => record.groups)
        .filter((group) => group.created_by !== userId); // Avoid duplicates
    }

    // Merge & deduplicate
    const allGroups = [...(createdGroups || []), ...linkedGroups];
    const uniqueGroups = Array.from(
      new Map(allGroups.map((g) => [g.id, g])).values()
    );

    res.status(200).json(uniqueGroups);
  } catch (error) {
    console.error("Error loading user groups:", error.message);
    res.status(500).json({ error: "Failed to load user groups" });
  }
});
app.post("/api/create-group", authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id; // ✅ From token
    const { groupForm } = req.body;

    if (!groupForm?.name?.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate members
    const validMembers = (groupForm.members || []).filter(
      (m) => m.name && m.name.trim() !== ""
    );

    if (validMembers.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one member with a name is required" });
    }

    // 1️⃣ Create the group
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: groupForm.name,
        description: groupForm.description,
        currency: groupForm.currency || "₹",
        created_by: userId,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // 2️⃣ Insert members
    const { error: membersError } = await supabase
      .from("group_members")
      .insert(
        validMembers.map((member) => ({
          group_id: group.id,
          name: member.name.trim(),
          email_phone: "",
          roll_number: member.rollNumber?.trim() || null,
        }))
      );

    if (membersError) throw membersError;

    // Return the created group
    res.status(200).json({
      message: "Group created successfully",
      group,
      memberCount: validMembers.length,
    });
  } catch (error) {
    console.error("❌ Error creating group:", error.message);
    res.status(500).json({ error: "Failed to create group" });
  }
});



{/* ---------------------- use service visibility hook ENDPOINTS ---------------------- */}


// ✅ GET service visibility data
app.get('/api/service-visibility', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_visibility')
      .select('*');

    if (error) throw error;

    return res.json({ services: data || [] });
  } catch (err) {
    console.error('Error fetching service visibility:', err);
    return res.status(500).json({ error: 'Failed to fetch service visibility' });
  }
});


  
  

/* ---------------------- SERVER ---------------------- */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
