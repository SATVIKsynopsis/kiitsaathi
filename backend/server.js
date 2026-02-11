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

// ===== NEW IMPORTS FOR TIMETABLE FEATURE (DO NOT REMOVE) =====
import xlsx from 'xlsx';
import mammoth from 'mammoth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import dayjs from 'dayjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ===== END NEW IMPORTS =====


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
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Verify Supabase Admin API access
console.log('🔍 Supabase Admin API Check:');
console.log('- Admin listUsers method:', typeof supabase.auth.admin.listUsers);
console.log('- Admin createUser method:', typeof supabase.auth.admin.createUser);
console.log('- Admin getUserByEmail method:', typeof supabase.auth.admin.getUserByEmail);

// Test admin permissions on startup
(async () => {
  try {
    console.log('🧪 Testing admin permissions...');
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      console.error('❌ Admin permissions test failed:', error.message);
    } else {
      console.log('✅ Admin permissions working - can list users');
    }
  } catch (e) {
    console.error('❌ Admin API test error:', e.message);
  }
})();

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

// Check if the authenticated user has an admin role (email from access token)
app.get('/api/admin/check', authenticateToken, async (req, res) => {
  try {
    const normalizedEmail = req.user?.email?.toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, error: 'Email missing in token' });
    }

    const { data, error } = await supabase
      .from('admin_roles')
      .select('email')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('Admin check error:', error.message);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }

    if (!data) {
      return res.status(403).json({ success: false, error: 'User is not an admin' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Admin check exception:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

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

    // Get total users count from profiles table
    const { count: totalUsers, error: usersError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    
    if (usersError) {
      console.error("Error fetching users count:", usersError);
    }
    
    console.log("Total users count from profiles:", totalUsers);

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
      .select('is_email_verified, is_admin')
      .eq('id', user.id)
      .single();

    console.log('🔍 Session check for user:', user.id, 'Profile:', profile);

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

    if (
  !email.endsWith('@kiit.ac.in') &&
  !email.endsWith('@ksom.ac.in') &&
  !email.endsWith('@kiitbiotech.ac.in') &&
  !email.endsWith('@kls.ac.in') &&
  !email.endsWith('@shop.com')
) {
  return res.status(400).json({ 
    error: 'Only KIIT College Email IDs (@kiit.ac.in, @ksom.ac.in, @kiitbiotech.ac.in, @kls.ac.in) and shopkeeper accounts (@shop.com) are allowed to sign up or log in to KIIT Saathi.' 
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

    if (
  !email.endsWith('@kiit.ac.in') &&
  !email.endsWith('@ksom.ac.in') &&
  !email.endsWith('@kiitbiotech.ac.in') &&
  !email.endsWith('@kls.ac.in') &&
  !email.endsWith('@shop.com')
) {
  return res.status(400).json({ 
    error: 'Only KIIT College Email IDs (@kiit.ac.in, @ksom.ac.in, @kiitbiotech.ac.in, @kls.ac.in) and shopkeeper accounts (@shop.com) are allowed to sign up or log in to KIIT Saathi.' 
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

   if (
  !email.endsWith('@kiit.ac.in') &&
  !email.endsWith('@ksom.ac.in') &&
  !email.endsWith('@kiitbiotech.ac.in') &&
  !email.endsWith('@kls.ac.in') &&
  !email.endsWith('@shop.com')
) {
  return res.status(400).json({
    error: 'Password reset is only allowed for KIIT and shopkeeper email accounts.' 
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

app.get('/api/food/shops', async (req, res) => {
  console.log('🍽️ Food shops route hit!');
  try {
    const { data: shops, error } = await supabase
      .from('shops')
      .select('*')
      .eq('is_active', true)
      .order('featured', { ascending: false })
      .order('name');

    if (error) {
      console.error('Error fetching shops:', error);
      return res.status(500).json({ error: 'Failed to fetch shops' });
    }

    console.log(`✅ Found ${shops?.length || 0} shops`);
    return res.json({ shops: shops || [] });

  } catch (error) {
    console.error('Error fetching shops:', error);
    return res.status(500).json({ error: 'Failed to fetch shops' });
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
// FOOD STALL COUPON ROUTES


// ============================================

app.post('/api/food/generate-coupon', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { shopId, couponData } = req.body;

    if (!shopId || !couponData) {
      return res.status(400).json({ error: 'Missing shopId or couponData' });
    }

    // Note: We don't need amount from couponData anymore since we get it from the batch

    // Verify shop exists
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id, name')
      .eq('id', shopId)
      .single();

    if (shopError || !shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Generate unique coupon code
    const couponCode = `KIIT${Date.now()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Get the coupon batch to determine discount value
    const { data: batch, error: batchError } = await supabase
      .from('coupon_batches')
      .select('*')
      .eq('shop_id', shopId)
      .eq('is_active', true)
      .single();

    if (batchError || !batch) {
      return res.status(404).json({ error: 'No active coupon batch found for this shop' });
    }

    // Insert coupon into database
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        shop_id: shopId,
        batch_id: batch.id,
        generated_by_user_id: userId,
        discount_value: batch.amount_per_coupon,
        qr_payload: couponCode, // Use coupon code as QR payload
        status: 'generated',
        expires_at: new Date(Date.now() + (batch.expires_in_days || 7) * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (couponError) {
      console.error('Error creating coupon:', couponError);
      return res.status(500).json({ error: 'Failed to generate coupon' });
    }

    // Return the complete coupon with shop info
    return res.json({
      success: true,
      coupon: {
        ...coupon,
        shop_name: shop.name,
        amount: coupon.discount_value // Map discount_value to amount for frontend compatibility
      }
    });

  } catch (error) {
    console.error('Error generating coupon:', error);
    return res.status(500).json({ error: 'Failed to generate coupon' });
  }
});

// ============================================
// FOOD SHOP MANAGEMENT ROUTES
// ============================================

// Test route for food API
app.get('/api/food/test', (req, res) => {
  console.log('🧪 Food API test route hit!');
  res.json({ message: 'Food API is working!', timestamp: new Date().toISOString() });
});

// Get all active shops (PUBLIC)


// Get shop by ID (PUBLIC)
app.get('/api/food/shop/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: shop, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching shop:', error);
      return res.status(404).json({ error: 'Shop not found' });
    }

    return res.json({ shop });

  } catch (error) {
    console.error('Error fetching shop:', error);
    return res.status(500).json({ error: 'Failed to fetch shop' });
  }
});

// Track shop view (PUBLIC - can be called without auth)
app.post('/api/food/shop/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const { viewType, userId } = req.body;

    if (!viewType || !['card_click', 'page_view'].includes(viewType)) {
      return res.status(400).json({ error: 'Invalid view type' });
    }

    const { error } = await supabase
      .from('shop_views')
      .insert({
        shop_id: id,
        user_id: userId || null,
        view_type: viewType,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error tracking shop view:', error);
      // Don't fail the request if view tracking fails
    }

    return res.json({ success: true });

  } catch (error) {
    console.error('Error tracking shop view:', error);
    return res.json({ success: true }); // Don't fail the request
  }
});

// Get shop analytics (SECURED - for shopkeepers)
app.get('/api/food/shop/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user_id;

    // Verify user is shopkeeper for this shop
    const { data: shopStaff, error: staffError } = await supabase
      .from('shop_staff')
      .select('*')
      .eq('user_id', userId)
      .eq('shop_id', id)
      .single();

    if (staffError || !shopStaff) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get analytics
    const { count: cardClicks } = await supabase
      .from('shop_views')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', id)
      .eq('view_type', 'card_click');

    const { count: pageViews } = await supabase
      .from('shop_views')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', id)
      .eq('view_type', 'page_view');

    return res.json({
      cardClicks: cardClicks || 0,
      pageViews: pageViews || 0
    });

  } catch (error) {
    console.error('Error fetching shop analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Update shop contact number (SECURED - for shopkeepers)
app.patch('/api/food/shop/:id/contact', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { contactNumber } = req.body;
    const userId = req.user_id;

    if (!contactNumber) {
      return res.status(400).json({ error: 'Contact number is required' });
    }

    // Verify user is shopkeeper for this shop
    const { data: shopStaff, error: staffError } = await supabase
      .from('shop_staff')
      .select('*')
      .eq('user_id', userId)
      .eq('shop_id', id)
      .single();

    if (staffError || !shopStaff) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update contact number
    const { error: updateError } = await supabase
      .from('shops')
      .update({ contact_number: contactNumber })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating contact:', updateError);
      return res.status(500).json({ error: 'Failed to update contact number' });
    }

    return res.json({ success: true });

  } catch (error) {
    console.error('Error updating shop contact:', error);
    return res.status(500).json({ error: 'Failed to update contact number' });
  }
});

// Get shop rating and review count (PUBLIC)
app.get('/api/food/shop/:id/rating', async (req, res) => {
  try {
    const { id } = req.params;

    // These would be RPC functions in Supabase - for now return mock data
    const avgRating = 0; // await supabase.rpc('get_shop_avg_rating', { shop_uuid: id });
    const reviewCount = 0; // await supabase.rpc('get_shop_review_count', { shop_uuid: id });

    return res.json({
      avgRating,
      reviewCount
    });

  } catch (error) {
    console.error('Error fetching shop rating:', error);
    return res.status(500).json({ error: 'Failed to fetch rating' });
  }
});

// ============================================
// SHOPKEEPER MANAGEMENT ROUTES
// ============================================

// Get shopkeeper's assigned shop (SECURED)
app.get('/api/food/shopkeeper/shop', authenticateToken, async (req, res) => {
  console.log('🛒 Shopkeeper shop route hit!');
  try {
    const userId = req.user_id;

    const { data: shopStaff, error: staffError } = await supabase
      .from('shop_staff')
      .select('shop_id')
      .eq('user_id', userId)
      .single();

    if (staffError) {
      if (staffError.code === 'PGRST116') {
        return res.json({ shopStaff: null });
      }
      throw staffError;
    }

    if (!shopStaff) {
      return res.json({ shopStaff: null });
    }

    // Get shop details
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopStaff.shop_id)
      .single();

    if (shopError) {
      console.error('Error fetching shop:', shopError);
      return res.status(500).json({ error: 'Failed to fetch shop details' });
    }

    return res.json({
      shopStaff,
      shop
    });

  } catch (error) {
    console.error('Error fetching shopkeeper shop:', error);
    return res.status(500).json({ error: 'Failed to fetch assigned shop' });
  }
});

// Get active coupon batch for shop (SECURED - for shopkeepers)
app.get('/api/food/shopkeeper/batch', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;

    // First get shopkeeper's shop
    const { data: shopStaff, error: staffError } = await supabase
      .from('shop_staff')
      .select('shop_id')
      .eq('user_id', userId)
      .single();

    if (staffError || !shopStaff) {
      return res.status(403).json({ error: 'Shopkeeper access required' });
    }

    // Get active batch for this shop
    const { data: batch, error: batchError } = await supabase
      .from('coupon_batches')
      .select('*')
      .eq('shop_id', shopStaff.shop_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (batchError && batchError.code !== 'PGRST116') {
      console.error('Error fetching batch:', batchError);
      return res.status(500).json({ error: 'Failed to fetch batch' });
    }

    return res.json({ batch: batch || null });

  } catch (error) {
    console.error('Error fetching shopkeeper batch:', error);
    return res.status(500).json({ error: 'Failed to fetch batch' });
  }
});

// Update discount amount for active batch (SECURED - for shopkeepers)
app.patch('/api/food/shopkeeper/batch/discount', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { discountAmount } = req.body;

    if (!discountAmount || discountAmount <= 0) {
      return res.status(400).json({ error: 'Valid discount amount is required' });
    }

    // Get shopkeeper's shop
    const { data: shopStaff, error: staffError } = await supabase
      .from('shop_staff')
      .select('shop_id')
      .eq('user_id', userId)
      .single();

    if (staffError || !shopStaff) {
      return res.status(403).json({ error: 'Shopkeeper access required' });
    }

    // Get active batch
    const { data: batch, error: batchError } = await supabase
      .from('coupon_batches')
      .select('id')
      .eq('shop_id', shopStaff.shop_id)
      .eq('is_active', true)
      .single();

    if (batchError || !batch) {
      return res.status(404).json({ error: 'No active batch found' });
    }

    // Update discount amount
    const { error: updateError } = await supabase
      .from('coupon_batches')
      .update({ amount_per_coupon: discountAmount })
      .eq('id', batch.id);

    if (updateError) {
      console.error('Error updating discount:', updateError);
      return res.status(500).json({ error: 'Failed to update discount amount' });
    }

    return res.json({ success: true });

  } catch (error) {
    console.error('Error updating discount amount:', error);
    return res.status(500).json({ error: 'Failed to update discount amount' });
  }
});

// ============================================
// ADMIN SHOPKEEPER EMAIL ROUTES
// ============================================

// Get all shops for admin (SECURED - admin only)
app.get('/api/food/admin/shops', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: shops, error } = await supabase
      .from('shops')
      .select(`
        *,
        menu_items:shop_menu_items(*)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching shops:', error);
      return res.status(500).json({ error: 'Failed to fetch shops' });
    }

    return res.json({ shops: shops || [] });

  } catch (error) {
    console.error('Error fetching admin shops:', error);
    return res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// Get shop details for editing (SECURED - admin only)
app.get('/api/food/admin/shops/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { id } = req.params;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: shop, error } = await supabase
      .from('shops')
      .select(`
        *,
        menu_items:shop_menu_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching shop for edit:', error);
      return res.status(500).json({ error: 'Failed to fetch shop' });
    }

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    return res.json({ shop });

  } catch (error) {
    console.error('Error fetching shop for edit:', error);
    return res.status(500).json({ error: 'Failed to fetch shop' });
  }
});

// Update shop details (SECURED - admin only)
app.put('/api/food/admin/shops/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { id } = req.params;
    const { 
      name, 
      description, 
      location, 
      contact_number, 
      opening_hours, 
      closing_hours,
      is_active,
      featured,
      category,
      photos,
      menu_items 
    } = req.body;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('🏪 Admin updating shop:', id);
    console.log('🍽️ Menu items received:', menu_items ? menu_items.length : 'none', menu_items);

    // Update shop basic details
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .update({
        name,
        description,
        location,
        contact_number,
        opening_hours,
        closing_hours,
        is_active,
        featured,
        category,
        photos,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (shopError) {
      console.error('Error updating shop:', shopError);
      return res.status(500).json({ error: 'Failed to update shop' });
    }

    // Update menu items if provided
    if (menu_items && Array.isArray(menu_items)) {
      console.log('Processing menu items:', menu_items);
      console.log('Menu items with photos debug:', menu_items.map(item => ({
        name: item.name,
        photos: item.photos,
        photosLength: item.photos?.length || 0
      })));
      
      // Delete existing menu items
      await supabase
        .from('shop_menu_items')
        .delete()
        .eq('shop_id', id);

      // Insert new menu items
      if (menu_items.length > 0) {
        // Filter out temp IDs and clean the data
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        const menuItemsWithShopId = menu_items.map(item => {
          const cleanItem = {
            name: item.name,
            description: item.description || '',
            price: parseFloat(item.price) || 0,
            category: item.category || 'Main Course',
            is_available: item.is_available !== false,
            shop_id: id,
            created_at: new Date().toISOString()
          };
          
          // Handle photos - save both photos array and image_url for backward compatibility
          if (item.photos && Array.isArray(item.photos)) {
            cleanItem.photos = item.photos;
            // Set first photo as image_url for backward compatibility
            if (item.photos.length > 0) {
              cleanItem.image_url = item.photos[0];
            }
          } else {
            cleanItem.photos = [];
          }
          
          // Only include ID if it's a valid UUID
          if (item.id && uuidRegex.test(item.id)) {
            cleanItem.id = item.id;
          }
          
          return cleanItem;
        });

        console.log('Clean menu items to insert:', menuItemsWithShopId);

        const { error: menuError } = await supabase
          .from('shop_menu_items')
          .insert(menuItemsWithShopId);

        if (menuError) {
          console.error('Error updating menu items:', menuError);
          // Don't fail the request, just log the error
        } else {
          console.log('✅ Menu items inserted successfully');
        }
      }
    }

    console.log('✅ Shop updated successfully');
    return res.json({ 
      success: true, 
      shop,
      message: 'Shop updated successfully' 
    });

  } catch (error) {
    console.error('Error updating shop:', error);
    return res.status(500).json({ error: 'Failed to update shop' });
  }
});

// API to get all 4th sem teacher names from mapping (for frontend dropdown)
app.get('/api/teachers/4thsem', (req, res) => {
  try {
    const mapping = parse4thSemMapping();
    // Get all unique teacher names from the mapping values
    const teacherSet = new Set(Object.values(mapping));

    // Additionally, extract all unique teacher names from the ED/IOC/OB column in the mapping file
    const mappingPath = path.join(__dirname, '..', 'src', 'data', 'KIIT Saathi Section Swapping 4th Sem (1).xlsx');
    if (fs.existsSync(mappingPath)) {
      const workbook = xlsx.readFile(mappingPath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      // Row 2 is headers, find the ED/IOC/OB column index
      if (data.length >= 3) {
        const headers = data[2];
        const electiveColIndex = headers.findIndex(h => h && h.toString().toUpperCase().includes('ED'));
        if (electiveColIndex !== -1) {
          for (let i = 3; i < data.length; i++) {
            const row = data[i];
            const teacher = row[electiveColIndex]?.toString().trim();
            if (teacher && teacher.length > 0 && teacher !== '-') {
              teacherSet.add(teacher);
            }
          }
        }
      }
    }
    // Remove empty/invalid names
    const teachers = Array.from(teacherSet).filter(t => t && t.length > 0).sort();
    res.json({ teachers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load 4th sem teachers' });
  }
});

// Get shopkeeper emails (SECURED - admin only)
app.get('/api/food/admin/shopkeeper-emails', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: emails, error } = await supabase
      .from('shopkeeper_emails')
      .select('*, shops(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shopkeeper emails:', error);
      return res.status(500).json({ error: 'Failed to fetch emails' });
    }

    return res.json({ emails: emails || [] });

  } catch (error) {
    console.error('Error fetching shopkeeper emails:', error);
    return res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Enhanced debugging endpoint for user creation issues
app.post('/api/food/admin/debug-user-creation', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required for testing' });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const debugInfo = {
      email: email.toLowerCase().trim(),
      emailValidation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      supabaseConfig: {
        url: !!process.env.SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    };

    // Step 1: Check if email exists in auth.users using listUsers
    try {
      const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });
      
      if (listError) {
        debugInfo.existingAuthUser = {
          exists: false,
          error: listError.message,
          note: 'Could not list users to check for duplicates'
        };
      } else {
        const existingUser = authUsers?.users?.find(user => 
          user.email?.toLowerCase() === email.toLowerCase().trim()
        );
        
        debugInfo.existingAuthUser = {
          exists: !!existingUser,
          userId: existingUser?.id || null,
          error: null
        };
      }
    } catch (e) {
      debugInfo.existingAuthUser = { 
        exists: false, 
        error: e.message,
        note: 'This is expected if user does not exist'
      };
    }

    // Step 2: Check database tables
    try {
      const { data: shopkeeperEmail, error: shopkeeperError } = await supabase
        .from('shopkeeper_emails')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();
      
      debugInfo.shopkeeperEmailExists = {
        exists: !!shopkeeperEmail,
        error: shopkeeperError?.message || null
      };
    } catch (e) {
      debugInfo.shopkeeperEmailExists = { exists: false, error: e.message };
    }

    // Step 3: Try creating user with different approaches
    const testResults = [];

    // Test 1: Minimal user creation
    try {
      const { data: authData1, error: authError1 } = await supabase.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: password,
        email_confirm: true
      });

      if (authData1?.user?.id) {
        await supabase.auth.admin.deleteUser(authData1.user.id);
        testResults.push({ test: 'minimal_creation', success: true, userId: authData1.user.id });
      } else {
        testResults.push({ 
          test: 'minimal_creation', 
          success: false, 
          error: authError1?.message,
          code: authError1?.code,
          details: authError1
        });
      }
    } catch (e) {
      testResults.push({ 
        test: 'minimal_creation', 
        success: false, 
        error: e.message,
        stack: e.stack
      });
    }

    // Test 2: User creation without auto-confirm
    try {
      const { data: authData2, error: authError2 } = await supabase.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: password
      });

      if (authData2?.user?.id) {
        await supabase.auth.admin.deleteUser(authData2.user.id);
        testResults.push({ test: 'no_auto_confirm', success: true, userId: authData2.user.id });
      } else {
        testResults.push({ 
          test: 'no_auto_confirm', 
          success: false, 
          error: authError2?.message,
          code: authError2?.code
        });
      }
    } catch (e) {
      testResults.push({ test: 'no_auto_confirm', success: false, error: e.message });
    }

    return res.json({ 
      success: true,
      message: 'Debug information collected',
      debugInfo,
      testResults
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return res.status(500).json({ 
      error: 'Debug failed',
      details: error.message,
      stack: error.stack
    });
  }
});

// Test endpoint for user creation debugging
app.post('/api/food/admin/test-user-creation', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required for testing' });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Try to create a minimal user account for testing
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      email_confirm: true
    });

    if (authError) {
      return res.json({ 
        success: false,
        error: authError.message,
        code: authError.code,
        status: authError.status,
        details: authError
      });
    }

    // Clean up the test user immediately
    if (authData?.user?.id) {
      await supabase.auth.admin.deleteUser(authData.user.id);
    }

    return res.json({ 
      success: true,
      message: 'User creation test successful (user was deleted)',
      userId: authData?.user?.id
    });

  } catch (error) {
    console.error('Test user creation error:', error);
    return res.status(500).json({ 
      error: 'Test failed',
      details: error.message,
      stack: error.stack
    });
  }
});

// Alternative shopkeeper creation with step-by-step approach
app.post('/api/food/admin/create-shopkeeper-alt', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { email, password, shopId } = req.body;

    console.log('🔍 Starting alternative shopkeeper creation:', {
      email: email?.toLowerCase().trim(),
      hasPassword: !!password,
      shopId,
      adminUserId: userId
    });

    if (!email || !password || !shopId) {
      return res.status(400).json({ error: 'Email, password, and shop ID are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Step 1: Check all possible conflicts first
    console.log('Step 1: Checking for existing accounts...');
    
    // Check shopkeeper_emails
    const { data: existingShopkeeperEmail } = await supabase
      .from('shopkeeper_emails')
      .select('id, email, shops(name)')
      .eq('email', normalizedEmail)
      .single();

    if (existingShopkeeperEmail) {
      return res.status(400).json({ 
        error: `Email already assigned to shop: ${existingShopkeeperEmail.shops?.name || 'Unknown shop'}` 
      });
    }

    // Check auth.users using list approach (more reliable)
    console.log('Step 2: Checking auth.users...');
    try {
      const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // Adjust if you have more users
      });

      const existingAuthUser = authUsers?.users?.find(user => 
        user.email?.toLowerCase() === normalizedEmail
      );

      if (existingAuthUser) {
        return res.status(400).json({ 
          error: 'An account with this email already exists in the authentication system' 
        });
      }
    } catch (listError) {
      console.log('Could not list users, trying direct approach:', listError.message);
    }

    // Step 3: Create user without any metadata first
    console.log('Step 3: Creating minimal auth user...');
    
    // Use original @shop.com email since it's now allowed
    const shopkeeperEmail = normalizedEmail;
    
    console.log('✅ Using original shopkeeper email:', {
      email: shopkeeperEmail
    });
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: shopkeeperEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'shopkeeper',
        original_email: normalizedEmail
      }
    });

    if (authError) {
      console.error('❌ Auth user creation failed (ALT METHOD):', {
        message: authError.message,
        code: authError.code,
        status: authError.status,
        details: authError.details,
        hint: authError.hint,
        fullError: authError
      });
      return res.status(400).json({ 
        error: `Failed to create user account: ${authError.message}`,
        code: authError.code,
        supabaseError: {
          status: authError.status,
          hint: authError.hint,
          details: authError.details
        },
        details: process.env.NODE_ENV === 'development' ? authError : undefined
      });
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 4: Add to shopkeeper_emails table (bypass RLS with service role)
    console.log('Step 4: Adding to shopkeeper_emails...');
    
    // Try with explicit RLS bypass
    const insertData = {
      email: normalizedEmail,
      shop_id: shopId,
      added_by: userId,
      assigned: true
    };
    
    console.log('Insert data:', insertData);
    
    const { data: insertResult, error: emailError } = await supabase
      .from('shopkeeper_emails')
      .insert(insertData)
      .select();

    if (emailError) {
      console.error('❌ Shopkeeper email insertion failed:', {
        code: emailError.code,
        message: emailError.message,
        details: emailError.details,
        hint: emailError.hint,
        insertData
      });
      // Cleanup auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ 
        error: 'Error adding shopkeeper email', 
        details: {
          code: emailError.code,
          message: emailError.message,
          hint: emailError.hint
        }
      });
    }

    console.log('✅ Shopkeeper email added');

    // Step 5: Create shop_staff entry
    console.log('Step 5: Creating shop_staff entry...');
    const { error: staffError } = await supabase
      .from('shop_staff')
      .insert({
        user_id: authData.user.id,
        shop_id: shopId,
        role: 'manager'
      });

    if (staffError) {
      console.error('❌ Shop staff creation failed:', staffError);
      // Cleanup
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from('shopkeeper_emails').delete().eq('email', normalizedEmail);
      return res.status(500).json({ error: 'Failed to assign shopkeeper to shop' });
    }

    console.log('✅ Shop staff created');

    // Step 6: Update user metadata (non-critical)
    console.log('Step 6: Updating user metadata...');
    try {
      await supabase.auth.admin.updateUserById(authData.user.id, {
        user_metadata: {
          role: 'shopkeeper',
          full_name: `Shopkeeper - ${normalizedEmail.split('@')[0]}`
        }
      });
      console.log('✅ User metadata updated');
    } catch (metadataError) {
      console.log('⚠️ Metadata update failed (non-critical):', metadataError.message);
    }

    console.log('🎉 Shopkeeper creation completed successfully');

    return res.json({ 
      success: true, 
      message: 'Shopkeeper account created successfully',
      shopkeeper: {
        email: normalizedEmail,
        userId: authData.user.id,
        loginCredentials: {
          email: shopkeeperEmail,
          note: "Use this email format to login"
        }
      }
    });

  } catch (error) {
    console.error('💥 Alternative shopkeeper creation failed:', error);
    return res.status(500).json({ 
      error: 'Failed to create shopkeeper account',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create complete shopkeeper account (SECURED - admin only)
app.post('/api/food/admin/create-shopkeeper', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { email, password, shopId } = req.body;

    if (!email || !password || !shopId) {
      return res.status(400).json({ error: 'Email, password, and shop ID are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Check if email already exists in shopkeeper_emails
    const { data: existingEmail, error: checkError } = await supabase
      .from('shopkeeper_emails')
      .select('id, email, shops(name)')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing email:', checkError);
      return res.status(500).json({ error: 'Failed to check existing email' });
    }

    if (existingEmail) {
      return res.status(400).json({ 
        error: `Email already assigned to shop: ${existingEmail.shops?.name || 'Unknown shop'}` 
      });
    }

    // Check if email already exists in auth.users using listUsers (more reliable)
    try {
      const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // Adjust based on your user count
      });
      
      if (!listError && authUsers?.users) {
        const existingAuthUser = authUsers.users.find(user => 
          user.email?.toLowerCase() === email.toLowerCase().trim()
        );
        
        if (existingAuthUser) {
          return res.status(400).json({ 
            error: 'An account with this email already exists in the system' 
          });
        }
      }
      
      if (listError) {
        console.log('Could not check existing users, proceeding with creation:', listError.message);
      }
    } catch (emailCheckError) {
      console.log('Email check failed, proceeding with creation:', emailCheckError.message);
    }

    // Validate email format more strictly
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toLowerCase().trim())) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create the user account in Supabase Auth with minimal metadata first
    // Use original @shop.com email since it's now allowed
    const shopkeeperEmail = email.toLowerCase().trim();
    
    console.log('✅ Using original shopkeeper email:', {
      email: shopkeeperEmail
    });
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: shopkeeperEmail,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'shopkeeper',
        original_email: email.toLowerCase().trim()
      }
    });

    if (authError) {
      console.error('🚨 DETAILED AUTH ERROR:', {
        message: authError.message,
        code: authError.code,
        status: authError.status,
        details: authError.details,
        hint: authError.hint,
        fullError: authError
      });
      
      // Provide more specific error messages
      if (authError.message?.includes('duplicate') || authError.message?.includes('already')) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }
      
      return res.status(400).json({ 
        error: authError.message || 'Failed to create user account',
        details: authError.code || 'unknown_error',
        supabaseError: {
          code: authError.code,
          status: authError.status,
          hint: authError.hint
        }
      });
    }

    // Add email to shopkeeper_emails table (bypass RLS with service role)
    const insertData = {
      email: email.toLowerCase().trim(),
      shop_id: shopId,
      added_by: userId,
      assigned: true // Mark as assigned since account is created
    };
    
    console.log('Inserting shopkeeper email data:', insertData);
    
    const { data: insertResult, error: emailError } = await supabase
      .from('shopkeeper_emails')
      .insert(insertData)
      .select();

    if (emailError) {
      console.error('❌ Shopkeeper email insertion failed:', {
        code: emailError.code,
        message: emailError.message,
        details: emailError.details,
        hint: emailError.hint,
        insertData
      });
      // Try to clean up the auth user if email insertion fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ 
        error: 'Error adding shopkeeper email', 
        details: {
          code: emailError.code,
          message: emailError.message,
          hint: emailError.hint
        }
      });
    }

    // Update the profile with shopkeeper details
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: email.toLowerCase().trim(), // Keep original email in profile
          auth_email: shopkeeperEmail, // Store converted email for reference
          full_name: `Shopkeeper - ${email.split('@')[0]}`,
          role: 'shopkeeper',
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.log('Profile update warning (non-critical):', profileError);
      }
    } catch (profileUpdateError) {
      console.log('Profile update failed (non-critical):', profileUpdateError);
    }

    // Create shop_staff entry
    const { error: staffError } = await supabase
      .from('shop_staff')
      .insert({
        user_id: authData.user.id,
        shop_id: shopId,
        role: 'manager'
      });

    if (staffError) {
      console.error('Error creating shop staff:', staffError);
      // Clean up on error
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
        await supabase.from('shopkeeper_emails').delete().eq('email', email.toLowerCase().trim());
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      return res.status(500).json({ error: 'Failed to assign shopkeeper to shop' });
    }

    return res.json({ 
      success: true, 
      message: 'Shopkeeper account created successfully',
      shopkeeper: {
        email: email.toLowerCase().trim(),
        userId: authData.user.id,
        loginCredentials: {
          email: shopkeeperEmail,
          password: "As set by admin",
          note: "Shopkeeper must use the email above to login"
        }
      }
    });

  } catch (error) {
    console.error('Error creating shopkeeper:', error);
    return res.status(500).json({ error: 'Failed to create shopkeeper account' });
  }
});

// Add shopkeeper email (SECURED - admin only) [DEPRECATED - use create-shopkeeper instead]
app.post('/api/food/admin/shopkeeper-emails', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { email, shopId } = req.body;

    if (!email || !shopId) {
      return res.status(400).json({ error: 'Email and shop ID are required' });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Check if email already exists
    const { data: existingEmail, error: checkError } = await supabase
      .from('shopkeeper_emails')
      .select('id, email, shops(name)')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing email:', checkError);
      return res.status(500).json({ error: 'Failed to check existing email' });
    }

    if (existingEmail) {
      return res.status(400).json({ 
        error: `Email already assigned to shop: ${existingEmail.shops?.name || 'Unknown shop'}` 
      });
    }

    // Add email
    const { error } = await supabase
      .from('shopkeeper_emails')
      .insert({
        email: email.toLowerCase().trim(),
        shop_id: shopId,
        added_by: userId,
      });

    if (error) {
      console.error('Error adding shopkeeper email:', error);
      return res.status(500).json({ error: 'Failed to add email' });
    }

    return res.json({ success: true });

  } catch (error) {
    console.error('Error adding shopkeeper email:', error);
    return res.status(500).json({ error: 'Failed to add email' });
  }
});

// Delete shopkeeper email (SECURED - admin only)
app.delete('/api/food/admin/shopkeeper-emails/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { id } = req.params;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { error } = await supabase
      .from('shopkeeper_emails')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting shopkeeper email:', error);
      return res.status(500).json({ error: 'Failed to delete email' });
    }

    return res.json({ success: true });

  } catch (error) {
    console.error('Error deleting shopkeeper email:', error);
    return res.status(500).json({ error: 'Failed to delete email' });
  }
});

// ============================================
// MENU MANAGEMENT ROUTES FOR SHOPKEEPERS
// ============================================

// Get menu items for a shop (PUBLIC)
app.get('/api/food/shop/:shopId/menu', async (req, res) => {
  try {
    const { shopId } = req.params;
    console.log(`[MENU DEBUG] Fetching menu items for shop_id: ${shopId}`);

    const { data: menuItems, error } = await supabase
      .from('shop_menu_items')
      .select('*')
      .eq('shop_id', shopId)
      // Temporarily show all items for debugging
      // .eq('is_available', true)
      .order('category')
      .order('name');

    console.log(`[MENU DEBUG] Query result:`, { 
      shopId, 
      menuItemsCount: menuItems?.length || 0, 
      menuItems: menuItems?.slice(0, 3), // Log first 3 items
      error 
    });

    if (error) {
      console.error('Error fetching menu items:', error);
      return res.status(500).json({ error: 'Failed to fetch menu items' });
    }

    console.log(`[MENU DEBUG] Returning ${menuItems?.length || 0} menu items`);
    return res.json({ menuItems: menuItems || [] });

  } catch (error) {
    console.error('Error fetching menu items:', error);
    return res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get menu items for shopkeeper's shop (SECURED - shopkeeper only)
app.get('/api/food/shopkeeper/menu', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;

    // Get shopkeeper's assigned shop
    const { data: shopStaff, error: staffError } = await supabase
      .from('shop_staff')
      .select('shop_id, shops(*)')
      .eq('user_id', userId)
      .single();

    if (staffError || !shopStaff) {
      return res.status(403).json({ error: 'Shopkeeper access required' });
    }

    const { data: menuItems, error } = await supabase
      .from('shop_menu_items')
      .select('*')
      .eq('shop_id', shopStaff.shop_id)
      .order('category')
      .order('name');

    if (error) {
      console.error('Error fetching shopkeeper menu items:', error);
      return res.status(500).json({ error: 'Failed to fetch menu items' });
    }

    return res.json({ menuItems: menuItems || [] });

  } catch (error) {
    console.error('Error fetching shopkeeper menu items:', error);
    return res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Add menu item (SECURED - shopkeeper only)
app.post('/api/food/shopkeeper/menu', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { name, description, price, category, isVeg } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    // Get shopkeeper's assigned shop
    const { data: shopStaff, error: staffError } = await supabase
      .from('shop_staff')
      .select('shop_id')
      .eq('user_id', userId)
      .single();

    if (staffError || !shopStaff) {
      return res.status(403).json({ error: 'Shopkeeper access required' });
    }

    const { data: menuItem, error } = await supabase
      .from('shop_menu_items')
      .insert({
        shop_id: shopStaff.shop_id,
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        category: category.trim(),
        is_veg: isVeg || false,
        is_available: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding menu item:', error);
      return res.status(500).json({ error: 'Failed to add menu item' });
    }

    return res.json({ menuItem });

  } catch (error) {
    console.error('Error adding menu item:', error);
    return res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// Update menu item (SECURED - shopkeeper only)
app.patch('/api/food/shopkeeper/menu/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { id } = req.params;
    const { name, description, price, category, isVeg, isActive } = req.body;

    // Get shopkeeper's assigned shop
    const { data: shopStaff, error: staffError } = await supabase
      .from('shop_staff')
      .select('shop_id')
      .eq('user_id', userId)
      .single();

    if (staffError || !shopStaff) {
      return res.status(403).json({ error: 'Shopkeeper access required' });
    }

    // Verify menu item belongs to shopkeeper's shop
    const { data: existingItem, error: itemError } = await supabase
      .from('shop_menu_items')
      .select('shop_id')
      .eq('id', id)
      .single();

    if (itemError || !existingItem || existingItem.shop_id !== shopStaff.shop_id) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category.trim();
    if (isVeg !== undefined) updateData.is_veg = isVeg;
    if (isActive !== undefined) updateData.is_available = isActive;

    const { data: menuItem, error } = await supabase
      .from('shop_menu_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating menu item:', error);
      return res.status(500).json({ error: 'Failed to update menu item' });
    }

    return res.json({ menuItem });

  } catch (error) {
    console.error('Error updating menu item:', error);
    return res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item (SECURED - shopkeeper only)
app.delete('/api/food/shopkeeper/menu/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { id } = req.params;

    // Get shopkeeper's assigned shop
    const { data: shopStaff, error: staffError } = await supabase
      .from('shop_staff')
      .select('shop_id')
      .eq('user_id', userId)
      .single();

    if (staffError || !shopStaff) {
      return res.status(403).json({ error: 'Shopkeeper access required' });
    }

    // Verify menu item belongs to shopkeeper's shop
    const { data: existingItem, error: itemError } = await supabase
      .from('shop_menu_items')
      .select('shop_id')
      .eq('id', id)
      .single();

    if (itemError || !existingItem || existingItem.shop_id !== shopStaff.shop_id) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Soft delete by setting is_available to false
    const { error } = await supabase
      .from('shop_menu_items')
      .update({ is_available: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting menu item:', error);
      return res.status(500).json({ error: 'Failed to delete menu item' });
    }

    return res.json({ success: true });

  } catch (error) {
    console.error('Error deleting menu item:', error);
    return res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// ============================================
// FOOD COUPON BATCH MANAGEMENT ROUTES
// ============================================

// Get shop with coupon batches for coupon generation (PUBLIC)
app.get('/api/food/shop/:id/batches', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select(`
        *,
        coupon_batches!inner(*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .eq('coupon_batches.is_active', true)
      .single();

    if (shopError) {
      console.error('Error fetching shop with batches:', shopError);
      return res.status(404).json({ error: 'Shop or active batch not found' });
    }

    return res.json({ shop });

  } catch (error) {
    console.error('Error fetching shop with batches:', error);
    return res.status(500).json({ error: 'Failed to fetch shop batches' });
  }
});

// ============================================
// ADMIN DASHBOARD ROUTES FOR FOOD
// ============================================

// Get admin dashboard stats (SECURED - admin only)
app.get('/api/food/admin/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get total shops count
    const { count: totalShops } = await supabase
      .from('shops')
      .select('*', { count: 'exact', head: true });

    // Get active batches count
    const { count: activeBatches } = await supabase
      .from('coupon_batches')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get redemptions count
    const { count: redemptions } = await supabase
      .from('redemptions')
      .select('*', { count: 'exact', head: true });

    // Get flagged attempts count
    const { count: flaggedAttempts } = await supabase
      .from('flagged_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return res.json({
      totalShops: totalShops || 0,
      activeBatches: activeBatches || 0,
      redemptions: redemptions || 0,
      flaggedAttempts: flaggedAttempts || 0
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all coupon batches for admin (SECURED - admin only)
app.get('/api/food/admin/batches', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: batches, error } = await supabase
      .from('coupon_batches')
      .select('*, shops(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching batches:', error);
      return res.status(500).json({ error: 'Failed to fetch batches' });
    }

    return res.json({ batches: batches || [] });

  } catch (error) {
    console.error('Error fetching admin batches:', error);
    return res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

// Get redemption history for admin (SECURED - admin only)
app.get('/api/food/admin/redemptions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: redemptions, error } = await supabase
      .from('redemptions')
      .select('*, coupons(code, discount_value), shops(name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching redemptions:', error);
      return res.status(500).json({ error: 'Failed to fetch redemptions' });
    }

    return res.json({ redemptions: redemptions || [] });

  } catch (error) {
    console.error('Error fetching admin redemptions:', error);
    return res.status(500).json({ error: 'Failed to fetch redemptions' });
  }
});

// Get flagged attempts for admin (SECURED - admin only)
app.get('/api/food/admin/flagged', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: flaggedAttempts, error } = await supabase
      .from('flagged_attempts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flagged attempts:', error);
      return res.status(500).json({ error: 'Failed to fetch flagged attempts' });
    }

    return res.json({ flaggedAttempts: flaggedAttempts || [] });

  } catch (error) {
    console.error('Error fetching admin flagged attempts:', error);
    return res.status(500).json({ error: 'Failed to fetch flagged attempts' });
  }
});

// Create shop (SECURED - admin only)
app.post('/api/food/admin/shops', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const shopData = req.body;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Filter allowed shop fields (exclude non-existent columns)
    const allowedFields = {
      name: shopData.name,
      short_desc: shopData.short_desc,
      address: shopData.address,
      contact_number: shopData.contact_number,
      tags: shopData.tags,
      photos: shopData.photos,
      featured: shopData.featured || false,
      is_active: shopData.is_active !== undefined ? shopData.is_active : true
    };

    // Remove undefined fields
    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] === undefined) {
        delete allowedFields[key];
      }
    });

    const { data: shop, error } = await supabase
      .from('shops')
      .insert(allowedFields)
      .select()
      .single();

    if (error) {
      console.error('Error creating shop:', error);
      return res.status(500).json({ error: 'Failed to create shop' });
    }

    return res.json({ shop });

  } catch (error) {
    console.error('Error creating shop:', error);
    return res.status(500).json({ error: 'Failed to create shop' });
  }
});



// Delete shop (SECURED - admin only)
app.delete('/api/food/admin/shops/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { id } = req.params;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting shop:', error);
      return res.status(500).json({ error: 'Failed to delete shop' });
    }

    return res.json({ success: true });

  } catch (error) {
    console.error('Error deleting shop:', error);
    return res.status(500).json({ error: 'Failed to delete shop' });
  }
});

// Create coupon batch (SECURED - admin only)
app.post('/api/food/admin/batches', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const batchData = req.body;

    // Check if user is admin by email
    const adminEmails = ['adityash8997@gmail.com', '24155598@kiit.ac.in'];
    if (!req.user?.email || !adminEmails.includes(req.user.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Filter allowed coupon batch fields (use correct database schema)
    const allowedFields = {
      shop_id: batchData.shop_id,
      batch_name: batchData.batch_name,
      amount_per_coupon: batchData.amount_per_coupon,
      expires_in_days: batchData.expires_in_days,
      daily_limit: batchData.daily_limit || batchData.total_coupons, // Support both field names
      per_user_limit: batchData.per_user_limit,
      start_time: batchData.start_time,
      end_time: batchData.end_time,
      is_active: batchData.is_active !== undefined ? batchData.is_active : true
    };

    // Remove undefined fields
    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] === undefined) {
        delete allowedFields[key];
      }
    });

    const { data: batch, error } = await supabase
      .from('coupon_batches')
      .insert(allowedFields)
      .select()
      .single();

    if (error) {
      console.error('Error creating batch:', error);
      return res.status(500).json({ error: 'Failed to create batch' });
    }

    return res.json({ batch });

  } catch (error) {
    console.error('Error creating batch:', error);
    return res.status(500).json({ error: 'Failed to create batch' });
  }
});

// Update coupon batch (SECURED - admin only)
app.put('/api/food/admin/batches/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { id } = req.params;
    const batchData = req.body;

    // Check if user is admin by email
    const adminEmails = ['adityash8997@gmail.com', '24155598@kiit.ac.in'];
    if (!req.user?.email || !adminEmails.includes(req.user.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Filter allowed coupon batch fields (use correct database schema)
    const allowedFields = {
      shop_id: batchData.shop_id,
      batch_name: batchData.batch_name,
      amount_per_coupon: batchData.amount_per_coupon,
      expires_in_days: batchData.expires_in_days,
      daily_limit: batchData.daily_limit || batchData.total_coupons, // Support both field names
      per_user_limit: batchData.per_user_limit,
      start_time: batchData.start_time,
      end_time: batchData.end_time,
      is_active: batchData.is_active
    };

    // Remove undefined fields
    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] === undefined) {
        delete allowedFields[key];
      }
    });

    // First check if batch exists
    const { data: existingBatch, error: checkError } = await supabase
      .from('coupon_batches')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingBatch) {
      console.error('Batch not found:', checkError);
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Update the batch
    const { data: batch, error } = await supabase
      .from('coupon_batches')
      .update(allowedFields)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating batch:', error);
      return res.status(500).json({ error: 'Failed to update batch' });
    }

    if (!batch || batch.length === 0) {
      console.error('Update returned no rows for batch:', id);
      return res.status(404).json({ error: 'Batch not found or could not be updated' });
    }

    return res.json({ batch: batch[0] });

  } catch (error) {
    console.error('Error updating batch:', error);
    return res.status(500).json({ error: 'Failed to update batch' });
  }
});

// Delete coupon batch (SECURED - admin only)
app.delete('/api/food/admin/batches/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { id } = req.params;

    // Check if user is admin by email
    const adminEmails = ['adityash8997@gmail.com', '24155598@kiit.ac.in'];
    if (!req.user?.email || !adminEmails.includes(req.user.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { error } = await supabase
      .from('coupon_batches')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting batch:', error);
      return res.status(500).json({ error: 'Failed to delete batch' });
    }

    return res.json({ success: true });

  } catch (error) {
    console.error('Error deleting batch:', error);
    return res.status(500).json({ error: 'Failed to delete batch' });
  }
});

// Get user's coupons (SECURED)
app.get('/api/food/my-coupons', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;

    const { data: coupons, error } = await supabase
      .from('coupons')
      .select(`
        *,
        shops!inner(
          id,
          name,
          address,
          tags
        )
      `)
      .eq('generated_by_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
      return res.status(500).json({ error: 'Failed to fetch coupons' });
    }

    return res.json({ coupons: coupons || [] });

  } catch (error) {
    console.error('Error fetching user coupons:', error);
    return res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Get coupon by ID (SECURED)
app.get('/api/food/coupon/:couponId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { couponId } = req.params;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select(`
        *,
        shops!inner(
          id,
          name,
          address,
          contact_number
        )
      `)
      .eq('id', couponId)
      .eq('generated_by_user_id', userId)
      .single();

    if (error || !coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    return res.json({ coupon });

  } catch (error) {
    console.error('Error fetching coupon:', error);
    return res.status(500).json({ error: 'Failed to fetch coupon' });
  }
});

// Redeem coupon (SHOPKEEPER ACCESS)
app.post('/api/food/redeem-coupon', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({ error: 'Missing couponCode' });
    }

    // Check if user is a shopkeeper
    const { data: shopStaff, error: roleError } = await supabase
      .from('shop_staff')
      .select('shop_id, role')
      .eq('user_id', userId)
      .single();

    if (roleError || !shopStaff) {
      return res.status(403).json({ error: 'Unauthorized. Only shopkeepers can redeem coupons.' });
    }

    // Find and validate coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select(`
        *,
        shops!inner(
          id,
          name
        )
      `)
      .eq('code', couponCode)
      .eq('status', 'generated')
      .eq('shop_id', shopStaff.shop_id)
      .single();

    if (couponError || !coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon' });
    }

    // Check if coupon is expired
    if (new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    // Update coupon status to redeemed
    const { error: updateError } = await supabase
      .from('coupons')
      .update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString(),
        redeemed_by_staff_id: userId
      })
      .eq('code', couponCode);

    if (updateError) {
      console.error('Error redeeming coupon:', updateError);
      return res.status(500).json({ error: 'Failed to redeem coupon' });
    }

    // Record redemption
    const { error: redemptionError } = await supabase
      .from('redemptions')
      .insert({
        coupon_id: coupon.id,
        shop_id: coupon.shop_id,
        staff_id: userId,
        customer_id: coupon.generated_by_user_id
      });

    if (redemptionError) {
      console.error('Error recording redemption:', redemptionError);
    }

    return res.json({
      success: true,
      message: 'Coupon redeemed successfully',
      coupon: {
        ...coupon,
        status: 'redeemed',
        redeemed_at: new Date().toISOString(),
        amount: coupon.discount_value // Map discount_value to amount for frontend compatibility
      }
    });

  } catch (error) {
    console.error('Error redeeming coupon:', error);
    return res.status(500).json({ error: 'Failed to redeem coupon' });
  }
});

// Get shop coupons for shopkeeper dashboard (SECURED)
app.get('/api/food/shop-coupons', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;

    // Check if user is a shopkeeper and get their shop
    const { data: shopStaff, error: roleError } = await supabase
      .from('shop_staff')
      .select('shop_id, role')
      .eq('user_id', userId)
      .single();

    if (roleError || !shopStaff) {
      return res.status(403).json({ error: 'Unauthorized. Only shopkeepers can access this endpoint.' });
    }

    const { data: coupons, error } = await supabase
      .from('coupons')
      .select(`
        *,
        profiles!generated_by_user_id(
          full_name,
          email
        )
      `)
      .eq('shop_id', shopStaff.shop_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shop coupons:', error);
      return res.status(500).json({ error: 'Failed to fetch shop coupons' });
    }

    return res.json({ coupons: coupons || [] });

  } catch (error) {
    console.error('Error fetching shop coupons:', error);
    return res.status(500).json({ error: 'Failed to fetch shop coupons' });
  }
});

// Get coupon batches for admin (ADMIN ONLY)
app.get('/api/food/admin/coupon-batches', authenticateToken, async (req, res) => {
  try {
    const userId = req.user_id;

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: batches, error } = await supabase
      .from('coupon_batches')
      .select(`
        *,
        shops!inner(
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupon batches:', error);
      return res.status(500).json({ error: 'Failed to fetch coupon batches' });
    }

    return res.json({ batches: batches || [] });

  } catch (error) {
    console.error('Error fetching coupon batches:', error);
    return res.status(500).json({ error: 'Failed to fetch coupon batches' });
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

    // Check if record exists (use maybeSingle to avoid error on empty result)
    const { data: existing } = await supabase
      .from('policy_acceptances')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

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

    // Check if record exists (use maybeSingle to avoid error on empty result)
    const { data: existing } = await supabase
      .from('policy_acceptances')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

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
    if (subject) {
      console.log('🔎 Filtering by subject:', subject);
      query = query.eq('subject', subject);
    }
    if (semester) {
      console.log('🔎 Filtering by semester:', semester);
      query = query.eq('semester', semester);
    }
    if (year) {
      // Convert year to integer for proper comparison since it's stored as integer in DB
      const yearInt = parseInt(year, 10);
      console.log('🔎 Filtering by year:', year, '-> converted to:', yearInt, 'Type:', typeof yearInt);
      query = query.eq('year', yearInt);
    }
    if (search) {
      console.log('🔎 Filtering by search:', search);
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`❌ Supabase query error:`, error);
      throw error;
    }

    console.log(`📊 Found ${data?.length || 0} materials in ${tableName} table`);
    if (year) {
      console.log(`🎯 Year filter results: requested year=${year}, found ${data?.length || 0} items`);
    }
    if (data && data.length > 0) {
      console.log('📝 Sample of returned data:', {
        id: data[0].id,
        title: data[0].title,
        year: data[0].year,
        yearType: typeof data[0].year
      });
    }

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
// Backend corrected version
app.post('/api/study-materials/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded', success: false });
    }
    const file = req.files.file;
    const { title, subject, semester, branch, year, folder_type, uploader_name } = req.body;

    // Validate required fields
    const validTypes = ['pyqs', 'notes', 'ebooks', 'ppts'];
    if (!title || !subject || !semester || !folder_type || !uploader_name || !validTypes.includes(folder_type)) {
      return res.status(400).json({ error: 'Missing or invalid required fields', success: false });
    }

    // Validate year for pyqs/ebooks
    if ((folder_type === 'pyqs' || folder_type === 'ebooks') && !year) {
      return res.status(400).json({ error: 'Year is required for PYQs/Ebooks', success: false });
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
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeTitle}_${timestamp}.${ext}`;
    const storagePath = `${folder_type}/${filename}`; // Match frontend path

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

    // Get public URL (match frontend)
    const { data: publicData } = supabase.storage
      .from('study-materials')
      .getPublicUrl(storagePath);
    
    const publicUrl = publicData?.publicUrl ?? null;
    const filesizeMB = `${(file.size / 1024 / 1024).toFixed(2)} MB`;

    // Base data for all tables
    const baseData = {
      title,
      subject,
      semester,
      branch: branch || 'CSE',
      uploaded_by: uploader_name,
      user_id: userId,
      filesize: filesizeMB,
      mime_type: file.mimetype,
      status: 'active', // or 'pending' based on your workflow
      pdf_url: publicUrl,
      upload_date: new Date().toISOString().split('T')[0], // Date only (YYYY-MM-DD)
      created_at: new Date().toISOString().split('T')[0] // Date only
    };

    // Insert based on folder type
    let insertError = null;

    if (folder_type === 'notes') {
      const { error } = await supabase.from('notes').insert(baseData);
      insertError = error;
    } else if (folder_type === 'pyqs') {
      const { error } = await supabase.from('pyqs').insert({ 
        ...baseData, 
        year: parseInt(year, 10) // Convert to integer
      });
      insertError = error;
    } else if (folder_type === 'ppts') {
      const { error } = await supabase.from('ppts').insert({ 
        ...baseData, 
        ppt_url: publicUrl 
      });
      insertError = error;
    } else if (folder_type === 'ebooks') {
      const { error } = await supabase.from('ebooks').insert({ 
        ...baseData, 
        year: parseInt(year, 10) // Convert to integer
      });
      insertError = error;
    }

    if (insertError) {
      // Rollback: remove file from storage
      try {
        await supabase.storage.from('study-materials').remove([storagePath]);
      } catch (rErr) {
        console.warn('Rollback remove failed:', rErr);
      }
      throw insertError;
    }

    res.json({ success: true, message: 'Study material uploaded successfully' });
  } catch (error) {
    console.error('Study material upload error:', error);
    res.status(500).json({ 
      error: error?.message || 'Failed to upload material', 
      success: false 
    });
  }
});

// Fetch study material requests (Admin)
app.post('/api/admin/study-material-approve', async (req, res) => {
  try {
    const { request_id, folder_type, adminUserId } = req.body;

    // Validate folder_type
    const validTypes = ['pyqs', 'notes', 'ebooks', 'ppts'];
    if (!request_id || !folder_type || !validTypes.includes(folder_type)) {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    // Fetch the request from the appropriate table
    const tableName = folder_type;
    const { data: request, error: fetchError } = await supabase
      .from(tableName)
      .select('pdf_url')
      .eq('id', request_id)
      .single();

    if (fetchError || !request) throw new Error('Request not found');

    // Move file to approved folder
    const currentPath = `${folder_type}/pending/${request.pdf_url}`;
    const newPath = `${folder_type}/${request.pdf_url}`;
    const { error: moveError } = await supabase.storage
      .from('study-materials')
      .move(currentPath, newPath);

    if (moveError) throw moveError;

    // Update the request status
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', request_id);

    if (updateError) throw updateError;

    res.json({ success: true });
  } catch (error) {
    console.error('Error approving material:', error);
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
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Error ensuring profile:', err);
    return res.status(500).json({ success: false, message: "Server error" });
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
          paid_by_member:group_members!expenses_paid_by_member_id_fkey(*)
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
      .select(`
  *,
  expenses:expenses(amount)
`)
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
    const userId = req.user_id;
    const { groupForm } = req.body;

    if (!groupForm?.name?.trim()) {
      return res.status(400).json({ error: "Missing group name" });
    }

    const validMembers = (groupForm.members || []).filter(
      (m) => m.name && m.name.trim() !== ""
    );

    if (validMembers.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one member with a name is required" });
    }

    /* 1️⃣ Create group */
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({
        name: groupForm.name.trim(),
        description: groupForm.description || "",
        currency: groupForm.currency || "₹",
        created_by: userId,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    /* 2️⃣ Insert members */
    const membersToInsert = validMembers.map((member) => ({
      group_id: group.id,
      name: member.name.trim(),
      email_phone: "",
      roll_number: member.rollNumber?.trim() || null,
    }));

    const { data: insertedMembers, error: membersError } = await supabase
      .from("group_members")
      .insert(membersToInsert)
      .select();

    if (membersError) throw membersError;

   const initialAmount = Number(groupForm.initialAmount);


if (Number.isFinite(initialAmount) && initialAmount > 0) {
  const paidByMember = insertedMembers[0];

  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      group_id: group.id,
      title: "Initial Group Expense",
      amount: initialAmount,
      paid_by_member_id: paidByMember.id,
      date: new Date().toISOString().split("T")[0],
      notes: "Initial amount added during group creation",
    })
    .select()
    .single();

  if (expenseError) throw expenseError;

  const splitAmount = initialAmount / insertedMembers.length;

  const splits = insertedMembers.map((member) => ({
    expense_id: expense.id,
    member_id: member.id,
    amount: splitAmount,
  }));

  const { error: splitsError } = await supabase
    .from("expense_splits")
    .insert(splits);

  if (splitsError) throw splitsError;
}


    /* ✅ DONE */
    return res.status(200).json({
      message: "Group created successfully",
      group,
      memberCount: insertedMembers.length,
    });
  } catch (error) {
    console.error("❌ Error creating group:", error);
    return res.status(500).json({ error: "Failed to create group" });
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

//campus map buildings

app.get('/api/campus-buildings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('campus_maps')
      .select('building, location')
      .eq('is_visible', true);
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch campus buildings' });
    }
    
    // Get unique buildings with their locations
    const uniqueBuildings = data.reduce((acc, curr) => {
      if (!acc.find(b => b.building === curr.building)) {
        acc.push({
          building: curr.building,
          location: curr.location || 'KIIT Campus',
        });
      }
      return acc;
    }, []);
    
    res.json(uniqueBuildings);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
  
  

// Check if user is a shopkeeper
app.post('/api/check-shopkeeper-status', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if email exists in shopkeeper_emails table
    const { data, error } = await supabase
      .from('shopkeeper_emails')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking shopkeeper status:', error);
      return res.status(500).json({ error: 'Failed to check shopkeeper status' });
    }
    
    const isShopkeeper = !!data;
    
    return res.json({ isShopkeeper });
    
    
  } catch (error) {
    console.error('Error in shopkeeper status check:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================================================
// ===== TEACHER TIMETABLE API - NEW FEATURE (DO NOT MODIFY ABOVE) =====
// =====================================================================

// In-memory storage for timetable data
let timetableData = [];

// Define timeslots
const TIME_SLOTS = ["8-9", "9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4", "4-5"];

// Helper function to normalize teacher names
function normalizeTeacherName(name) {
  if (!name || typeof name !== 'string') return '';
  // Remove titles and normalize
  return name.trim()
    .toLowerCase()
    .replace(/^(mr\.|dr\.|prof\.|ms\.|mrs\.)\s*/i, '')
    .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical content like "(On leave)"
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to find matching cabin with fuzzy matching
function findCabinForTeacher(teacherName, cabinMap) {
  if (!teacherName) return null;
  
  const normalized = normalizeTeacherName(teacherName);
  
  // Try exact match first
  if (cabinMap[normalized]) {
    return cabinMap[normalized];
  }
  
  // Try fuzzy match - check if any cabin key contains or is contained in the teacher name
  for (const [cabinTeacher, cabin] of Object.entries(cabinMap)) {
    const cabinNormalized = normalizeTeacherName(cabinTeacher);
    
    // Check if last names match (assuming last word is last name)
    const teacherLastName = normalized.split(' ').pop();
    const cabinLastName = cabinNormalized.split(' ').pop();
    
    if (teacherLastName && cabinLastName && 
        teacherLastName === cabinLastName && 
        teacherLastName.length > 3) {
      return cabin;
    }
  }
  
  return null;
}

// Parse cabin allocation from DOCX
async function parseCabinAllocation() {
  const cabinMap = {};
  const cabinPath = path.join(__dirname, '..', 'src', 'data', 'Annexure I  Faculty Chamber allocation.docx');
  
  if (!fs.existsSync(cabinPath)) {
    console.log('⚠️ Cabin allocation file not found, skipping...');
    return cabinMap;
  }
  
  try {
    const buffer = fs.readFileSync(cabinPath);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    console.log('📄 Parsing cabin allocation file...');
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    // Pattern: Serial Number, Name, Email, Room Number (repeating)
    // Skip header lines and process in groups of 4
    let i = 0;
    
    // Skip to the first serial number after headers
    while (i < lines.length && !lines[i].match(/^\d+$/)) {
      i++;
    }
    
    // Now process in groups of 4: serial, name, email, room
    while (i < lines.length - 3) {
      const serial = lines[i];
      const name = lines[i + 1];
      const email = lines[i + 2];
      const room = lines[i + 3];
      
      // Validate this is a valid entry
      if (serial.match(/^\d+$/) && 
          (name.includes('Mr.') || name.includes('Dr.') || name.includes('Prof.') || name.includes('Ms.') || name.includes('Mrs.')) &&
          email.includes('@') &&
          room.match(/^[A-Z]\d{3}[A-Z]$/)) {
        
        const normalizedName = normalizeTeacherName(name);
        cabinMap[normalizedName] = room;
        console.log(`  ✓ ${name} → ${room}`);
        
        i += 4; // Move to next entry
      } else {
        i++; // Skip invalid entry
      }
    }
    
    console.log(`✅ Loaded ${Object.keys(cabinMap).length} cabin allocations`);
  } catch (error) {
    console.error('❌ Error parsing cabin allocation:', error.message);
    console.error(error);
  }
  
  return cabinMap;
}

// Parse 4th semester mapping sheet (horizontal layout)
function parse4thSemMapping() {
  const mappingPath = path.join(__dirname, '..', 'src', 'data', 'KIIT Saathi Section Swapping 4th Sem (1).xlsx');
  const mapping = {};
  
  console.log('📍 Looking for 4th sem mapping at:', mappingPath);
  console.log('📍 File exists:', fs.existsSync(mappingPath));
  
  if (!fs.existsSync(mappingPath)) {
    console.log('⚠️ 4th sem mapping file not found, skipping...');
    return mapping;
  }
  
  try {
    const workbook = xlsx.readFile(mappingPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    console.log(`\n📊 4th Sem Mapping - Parsing ${data.length} rows`);
    
    // Based on analysis: Row 0 is title, Row 1 is empty, Row 2 is headers, Row 3+ is data
    if (data.length < 4) {
      console.log('⚠️ Not enough rows in 4th sem mapping file');
      return mapping;
    }
    
    const headers = data[2]; // Row 2 has subject codes
    const validHeaders = headers.filter(h => h && h.toString().trim().length > 0);
    console.log(`Found ${validHeaders.length} subject columns: ${validHeaders.slice(0, 5).join(', ')}...`);
    
    // Process data rows starting from row 3
    let processedSections = 0;
    for (let i = 3; i < data.length; i++) {
      const row = data[i];
      const section = row[0]?.toString().trim();
      
      if (!section || section.length === 0) continue;
      
      let rowMappings = 0;
      for (let j = 1; j < headers.length && j < row.length; j++) {
        const subjectRaw = headers[j]?.toString().trim();
        const teacher = row[j]?.toString().trim();
      
        if (!subjectRaw || !teacher || teacher === '-' || teacher.length === 0) continue;
      
        // Subject might be compound like "ED/IOC/OB" or "ED|IOC|OB", split and create mapping for each
        const subjects = subjectRaw.split(/[\/|]/).map(s => s.trim()).filter(s => s.length > 0);
      
        for (const subject of subjects) {
          const key = `4_${section}_${subject.toUpperCase()}`;
          mapping[key] = normalizeTeacherName(teacher);
          rowMappings++;
        
          if (Object.keys(mapping).length <= 10) {
            console.log(`  ✓ [${section}] ${subject} → ${teacher}`);
          }
        }
      }
      
      if (rowMappings > 0) {
        processedSections++;
        if (processedSections === 1) {
          console.log(`First section (${section}): ${rowMappings} mappings created`);
        }
      }
    }
    
    console.log(`✅ Loaded ${Object.keys(mapping).length} 4th sem mappings from ${processedSections} sections`);
  } catch (error) {
    console.error('❌ Error parsing 4th sem mapping:', error.message);
    console.error(error.stack);
  }
  
  return mapping;
}

// Parse 6th semester mapping sheet (horizontal layout)
function parse6thSemMapping() {
  const mappingPath = path.join(__dirname, '..', 'src', 'data', 'updated_sheet_with_colors(1).xlsx');
  const mapping = {};
  const electiveChoices = {}; // Track which elective each section chose
  
  if (!fs.existsSync(mappingPath)) {
    console.log('⚠️ 6th sem mapping file not found, skipping...');
    return { mapping, electiveChoices };
  }
  
  try {
    const workbook = xlsx.readFile(mappingPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    if (data.length < 2) return { mapping, electiveChoices };
    
    const headers = data[0]; // Subject names
    
    // Find the PE-III Subject column index
    const electiveColumnIndex = headers.findIndex(h => 
      h?.toString().trim().toLowerCase().includes('pe-iii subject') ||
      h?.toString().trim().toLowerCase().includes('pe-3 subject')
    );
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const section = row[0]?.toString().trim();
      
      if (!section) continue;
      
      // Store the chosen elective subject for this section
      if (electiveColumnIndex !== -1 && row[electiveColumnIndex]) {
        const chosenElective = row[electiveColumnIndex].toString().trim().toUpperCase();
        electiveChoices[section] = chosenElective;
      }
      
      for (let j = 1; j < headers.length && j < row.length; j++) {
        const subject = headers[j]?.toString().trim();
        const teacher = row[j]?.toString().trim();
        
        if (subject && teacher) {
          // First, create mapping with original subject (might be compound like CC/SPM/NLP/CV)
          const key = `6_${section}_${subject}`;
          mapping[key] = normalizeTeacherName(teacher);
          
          // ONLY split compound subjects that are electives (PE-III column indicates compound electives)
          // Check if this subject looks like an elective: CC/SPM/NLP/CV or similar patterns
          const isElectiveCompound = (subject.includes('/') || subject.includes('|')) && 
                                     (subject.includes('CC') || subject.includes('SPM') || 
                                      subject.includes('NLP') || subject.includes('CV') ||
                                      subject.includes('IOT') || subject.includes('BDA'));
          
          if (isElectiveCompound) {
            const individualSubjects = subject.split(/[\/\|]/).map(s => s.trim()).filter(s => s.length > 0);
            for (const indivSubject of individualSubjects) {
              const indivKey = `6_${section}_${indivSubject}`;
              mapping[indivKey] = normalizeTeacherName(teacher);
            }
          }
          
          // Debug: Show CSE29 mappings and Nayan Kumar mappings
          if (section === 'CSE29' || teacher.toLowerCase().includes('nayan')) {
            console.log(`  [6th Sem] ${section} - ${subject} → ${teacher}`);
          }
        }
      }
    }
    console.log(`✅ Loaded ${Object.keys(mapping).length} 6th sem mappings`);
    console.log(`✅ Loaded ${Object.keys(electiveChoices).length} elective choices`);
  } catch (error) {
    console.error('❌ Error parsing 6th sem mapping:', error.message);
  }
  
  return { mapping, electiveChoices };
}

// Parse 4th semester timetable
function parse4thSemTimetable() {
  const ttPath = path.join(__dirname, '..', 'src', 'data', 'combined_timetable_2nd_yr (1).xls');
  const schedules = [];
  
  if (!fs.existsSync(ttPath)) {
    console.log('⚠️ 4th sem timetable file not found, skipping...');
    return schedules;
  }
  
  try {
    const workbook = xlsx.readFile(ttPath);
    const sheetName = workbook.SheetNames[0];
    console.log(`\n📊 4th Sem - Available sheets: ${workbook.SheetNames.join(', ')}`);
    console.log(`   Using sheet: "${sheetName}"`);
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    if (data.length < 2) return schedules;
    
    const headers = data[0];
    const dayIndex = headers.findIndex(h => h?.toString().toLowerCase().includes('day'));
    const sectionIndex = headers.findIndex(h => h?.toString().toLowerCase().includes('section'));
    
    console.log(`   Headers (first 12): ${headers.slice(0, 12).map(h => h || 'empty').join(' | ')}`);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const day = row[dayIndex]?.toString().trim();
      const section = row[sectionIndex]?.toString().trim();
      
      if (!day || !section) continue;
      
      for (let j = 0; j < headers.length; j++) {
        if (j === dayIndex || j === sectionIndex) continue;
        
        const header = headers[j]?.toString().trim();
        const cellValue = row[j]?.toString().trim();
        
        // Check if this is a time slot column (not a ROOM column)
        if (header && cellValue && cellValue !== '-' && cellValue.length > 0 && !header.toLowerCase().includes('room')) {
          const timeSlot = header.replace(/\s+/g, '');
          
          // Look for corresponding ROOM column before this time slot
          let classroom = '';
          for (let k = j - 1; k >= 0; k--) {
            const prevHeader = headers[k]?.toString().trim();
            if (prevHeader && prevHeader.toLowerCase().includes('room')) {
              const roomValue = row[k]?.toString().trim();
              // Only set classroom if it's not empty, dash, or "---"
              if (roomValue && roomValue !== '-' && roomValue !== '--' && roomValue !== '---' && roomValue.length > 0) {
                classroom = roomValue;
              }
              break;
            }
            // Stop if we hit section/day column
            if (k === dayIndex || k === sectionIndex) {
              break;
            }
          }
          
          // Cell contains SUBJECT CODE only (not teacher name)
          // Teacher will be filled from mapping: semester_section_subject
          // Check if cell contains classroom info (format could be "SUBJECT-ROOM" or "SUBJECT ROOM")
          let subjectCode = cellValue;
          
          // Try to extract classroom if format is like "ML-CR12" or "AI CR12"
          const roomMatch = cellValue.match(/^(.+?)[\s\-](CR\d+|[A-Z]\d+|Room\s*\d+)/i);
          if (roomMatch) {
            subjectCode = roomMatch[1].trim();
            if (!classroom) classroom = roomMatch[2].trim();
          }
          
          schedules.push({
            semester: 4,
            section,
            day,
            timeSlot,
            subject: subjectCode,
            classroom,
            teacher: '', // Will be filled from mapping
            cabin: ''
          });
        }
      }
    }
    console.log(`✅ Loaded ${schedules.length} 4th sem timetable entries`);
    const withClassrooms = schedules.filter(e => e.classroom && e.classroom !== '-' && e.classroom !== '---');
    console.log(`   Entries with classrooms: ${withClassrooms.length}`);
  } catch (error) {
    console.error('❌ Error parsing 4th sem timetable:', error.message);
  }
  
  return schedules;
}

// Parse 6th semester timetable
function parse6thSemTimetable() {
  const ttPath = path.join(__dirname, '..', 'src', 'data', '6th sem Time-Table and Section Detail.xls');
  const schedules = [];
  
  if (!fs.existsSync(ttPath)) {
    console.log('⚠️ 6th sem timetable file not found, skipping...');
    return schedules;
  }
  
  try {
    const workbook = xlsx.readFile(ttPath);
    console.log(`\n📊 6th Sem Timetable - Available sheets: ${workbook.SheetNames.join(', ')}`);
    const sheetName = workbook.SheetNames[0];
    console.log(`   Using sheet: "${sheetName}"`);
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    

    
    if (data.length < 2) return schedules;
    
    const headers = data[0];
    const dayIndex = headers.findIndex(h => h?.toString().toLowerCase().includes('day'));
    const sectionIndex = headers.findIndex(h => h?.toString().toLowerCase().includes('section'));
    
    console.log(`   Headers (first 12): ${headers.slice(0, 12).map(h => h || 'empty').join(' | ')}`);
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const day = row[dayIndex]?.toString().trim();
      const section = row[sectionIndex]?.toString().trim();
      
      if (!day || !section) continue;
      
      for (let j = 0; j < headers.length; j++) {
        if (j === dayIndex || j === sectionIndex) continue;
        
        const header = headers[j]?.toString().trim();
        const cellValue = row[j]?.toString().trim();
        
        // Check if this is a time slot column (not a ROOM column)
        if (header && cellValue && cellValue !== '-' && cellValue.length > 0 && !header.toLowerCase().includes('room')) {
          const timeSlot = header.replace(/\s+/g, '');
          
          // Look for corresponding ROOM column before this time slot
          let classroom = '';
          for (let k = j - 1; k >= 0; k--) {
            const prevHeader = headers[k]?.toString().trim();
            if (prevHeader && prevHeader.toLowerCase().includes('room')) {
              const roomValue = row[k]?.toString().trim();
              if (roomValue && roomValue !== '-' && roomValue !== '--' && roomValue !== '---' && roomValue.length > 0) {
                classroom = roomValue;
              }
              break;
            }
            // Stop if we hit section/day column
            if (k === dayIndex || k === sectionIndex) {
              break;
            }
          }
          
          // Cell contains SUBJECT CODE only (not teacher name)
          // Teacher will be filled from mapping: semester_section_subject
          // Check if cell contains classroom info (format could be "SUBJECT-ROOM" or "SUBJECT ROOM")
          let subjectCode = cellValue;
          
          // Try to extract classroom if format is like "ML-CR12" or "AI CR12"
          const roomMatch = cellValue.match(/^(.+?)[\s\-](CR\d+|[A-Z]\d+|Room\s*\d+)/i);
          if (roomMatch) {
            subjectCode = roomMatch[1].trim();
            if (!classroom) classroom = roomMatch[2].trim();
          }
          
          schedules.push({
            semester: 6,
            section,
            day,
            timeSlot,
            subject: subjectCode,
            classroom,
            teacher: '', // Will be filled from mapping
            cabin: ''
          });
        }
      }
    }
    console.log(`✅ Loaded ${schedules.length} 6th sem timetable entries`);
    
    // Debug: Check if classrooms are being loaded
    const withClassrooms = schedules.filter(e => e.classroom && e.classroom !== '-');
    console.log(`   Entries with classrooms: ${withClassrooms.length}`);
  } catch (error) {
    console.error('❌ Error parsing 6th sem timetable:', error.message);
  }
  
  return schedules;
}

// Main function to load all timetable data
async function loadTimetableData() {
  console.log('\n🔄 Loading timetable data...');
  console.log('📁 Current directory:', __dirname);
  
  try {
    // Load all data
    console.log('📖 Step 1: Loading cabin allocation...');
    const cabinMap = await parseCabinAllocation();
    console.log(`✓ Loaded ${Object.keys(cabinMap).length} cabin assignments`);
    
    console.log('📖 Step 2: Loading 4th semester mapping...');
    const mapping4th = parse4thSemMapping();
    console.log(`✓ Loaded ${Object.keys(mapping4th).length} 4th sem mappings`);
    
    console.log('📖 Step 3: Loading 6th semester mapping...');
    const { mapping: mapping6th, electiveChoices } = parse6thSemMapping();
    console.log(`✓ Loaded ${Object.keys(mapping6th).length} 6th sem mappings`);
    
    console.log('📖 Step 4: Loading 4th semester timetable...');
    const schedule4th = parse4thSemTimetable();
    console.log(`✓ Loaded ${schedule4th.length} 4th sem entries`);
    
    console.log('📖 Step 5: Loading 6th semester timetable...');
    const schedule6th = parse6thSemTimetable();
    console.log(`✓ Loaded ${schedule6th.length} 6th sem entries`);
    
    // Merge schedules
    const allSchedules = [...schedule4th, ...schedule6th];
    
    let cabinMatchCount = 0;
    let teacherMatchCount = 0;
    
    // Attach teachers and cabins
    for (const entry of allSchedules) {
      const mapping = entry.semester === 4 ? mapping4th : mapping6th;
      const normalizedSection = entry.section.replace(/-/g, '');
      let subjectNormalized = entry.subject.toUpperCase();
      let subjectForMatching = subjectNormalized;

      // For 6th semester: If this is a compound subject (CC|SPM|NLP|CV), use actual chosen elective for matching
      if (entry.semester === 6 && subjectNormalized.includes('|')) {
        const chosenElective = electiveChoices[normalizedSection];
        if (chosenElective) {
          subjectForMatching = chosenElective;
          entry.displaySubject = chosenElective;
        }
      }

      // For 4th semester: If this is a compound elective (ED/IOC/OB or ED|IOC|OB), try to match each elective in mapping
      if (entry.semester === 4 && (/ED[\/|]IOC[\/|]OB/.test(subjectNormalized) || /ED[\/|]OB[\/|]IOC/.test(subjectNormalized))) {
        // Try to find a teacher for each elective for this section
        const electives = ['ED', 'IOC', 'OB'];
        for (const elective of electives) {
          let key = `4_${normalizedSection}_${elective}`;
          let teacherName = mapping[key];
          if (teacherName) {
            entry.teacher = teacherName;
            entry.displaySubject = elective;
            teacherMatchCount++;
            // Find cabin
            const cabin = findCabinForTeacher(teacherName, cabinMap);
            if (cabin) {
              entry.cabin = cabin;
              cabinMatchCount++;
            }
            break; // Only assign the first found elective/teacher
          }
        }
        continue; // Skip the rest of the loop for this entry
      }

      const subjectWithSlash = subjectForMatching.replace(/\|/g, '/');
      let key = `${entry.semester}_${normalizedSection}_${subjectForMatching}`;
      let teacherName = mapping[key];

      if (!teacherName && subjectWithSlash !== subjectForMatching) {
        key = `${entry.semester}_${normalizedSection}_${subjectWithSlash}`;
        teacherName = mapping[key];
      }

      if (teacherName) {
        entry.teacher = teacherName;
        teacherMatchCount++;
        const cabin = findCabinForTeacher(teacherName, cabinMap);
        if (cabin) {
          entry.cabin = cabin;
          cabinMatchCount++;
        }
      }
    }
    
    timetableData = allSchedules;
    console.log(`✅ Total timetable entries loaded: ${timetableData.length}`);
    console.log(`✅ Entries with teachers: ${timetableData.filter(e => e.teacher).length}`);
    console.log(`✅ Entries with cabins: ${timetableData.filter(e => e.cabin).length}`);
    console.log();
  } catch (error) {
    console.error('❌ Error loading timetable data:', error);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Current directory:', __dirname);
    // Initialize empty data to prevent crashes
    timetableData = [];
  }
}


// Helper function to get current time slot
function getCurrentTimeSlot() {
  const now = dayjs();
  const hour = now.hour();
  
  if (hour >= 8 && hour < 9) return "8-9";
  if (hour >= 9 && hour < 10) return "9-10";
  if (hour >= 10 && hour < 11) return "10-11";
  if (hour >= 11 && hour < 12) return "11-12";
  if (hour >= 12 && hour < 13) return "12-1";
  if (hour >= 13 && hour < 14) return "1-2";
  if (hour >= 14 && hour < 15) return "2-3";
  if (hour >= 15 && hour < 16) return "3-4";
  if (hour >= 16 && hour < 17) return "4-5";
  
  return null;
}

// Helper function to get day name
function getCurrentDay() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayjs().day()];
}

// ===== HEALTH CHECK ENDPOINT =====
app.get('/api/teacher/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Teacher Timetable API is running',
    dataLoaded: timetableData.length > 0,
    totalEntries: timetableData.length,
    timestamp: new Date().toISOString()
  });
});

// ===== NEW API 1: GET /api/teacher =====
app.get('/api/teacher', (req, res) => {
  try {
    const { name, day } = req.query;
    
    if (!name) {
      return res.status(400).json({ error: 'Teacher name is required' });
    }
    
    const searchTerm = normalizeTeacherName(name);
    
    // Filter by teacher name (partial match - supports first name, last name, or full name)
    let results = timetableData.filter(entry => 
      entry.teacher && normalizeTeacherName(entry.teacher).includes(searchTerm)
    );
    
    // Filter by day if provided
    if (day) {
      results = results.filter(entry => 
        entry.day.toLowerCase() === day.toLowerCase()
      );
    }
    
    // Map results to use displaySubject if available
    const formattedResults = results.map(entry => ({
      ...entry,
      subject: entry.displaySubject || entry.subject
    }));
    
    return res.json({
      teacher: name,
      count: formattedResults.length,
      schedule: formattedResults
    });
  } catch (error) {
    console.error('Error in /api/teacher:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== NEW API 2: GET /api/teacher/status =====
app.get('/api/teacher/status', (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ error: 'Teacher name is required' });
    }
    
    const searchTerm = normalizeTeacherName(name);
    const currentDay = getCurrentDay();
    const currentSlot = getCurrentTimeSlot();
    
    // Get all classes for this teacher today (partial match - supports first name, last name, or full name)
    const todayClasses = timetableData
      .filter(entry => 
        entry.teacher && 
        normalizeTeacherName(entry.teacher).includes(searchTerm) &&
        entry.day.toLowerCase() === currentDay.toLowerCase()
      )
      .sort((a, b) => {
        const aIndex = TIME_SLOTS.indexOf(a.timeSlot);
        const bIndex = TIME_SLOTS.indexOf(b.timeSlot);
        return aIndex - bIndex;
      });
    
    // Find current class
    const currentClass = currentSlot ? todayClasses.find(entry => 
      entry.timeSlot === currentSlot
    ) : null;
    
    // Find next class
    let nextClass = null;
    if (currentSlot) {
      const currentIndex = TIME_SLOTS.indexOf(currentSlot);
      for (let i = currentIndex + 1; i < TIME_SLOTS.length; i++) {
        nextClass = todayClasses.find(entry => entry.timeSlot === TIME_SLOTS[i]);
        if (nextClass) break;
      }
    } else if (todayClasses.length > 0) {
      nextClass = todayClasses[0];
    }
    
    const cabin = todayClasses.length > 0 ? todayClasses[0].cabin : '';
    
    // Format classes to use displaySubject if available
    const formatClass = (cls) => cls ? { ...cls, subject: cls.displaySubject || cls.subject } : null;
    const formattedToday = todayClasses.map(formatClass);
    
    return res.json({
      teacher: name,
      cabin: cabin || 'Not assigned',
      currentTime: dayjs().format('HH:mm'),
      currentDay,
      currentSlot,
      current: formatClass(currentClass),
      next: formatClass(nextClass),
      today: formattedToday
    });
  } catch (error) {
    console.error('Error in /api/teacher/status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Load timetable data on server startup
loadTimetableData();

// ===== END OF TIMETABLE FEATURE =====
// =====================================================================

// ===== ANALYTICS FEATURE =====
// =====================================================================

// Track visitor
app.post('/api/analytics/track-visitor', async (req, res) => {
  try {
    const { sessionId, userId, pageUrl, referrer } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Insert visitor session
    const { error: sessionError } = await supabase
      .from('visitor_sessions')
      .insert({
        session_id: sessionId,
        user_id: userId || null,
        ip_address: ip,
        user_agent: userAgent,
        page_url: pageUrl,
        referrer: referrer
      });

    if (sessionError) throw sessionError;

    // Update daily visitor count
    const today = new Date().toISOString().split('T')[0];
    const { data: existingVisitor, error: fetchError } = await supabase
      .from('website_visitors')
      .select('*')
      .eq('visit_date', today)
      .single();

    if (existingVisitor) {
      const { error: updateError } = await supabase
        .from('website_visitors')
        .update({ 
          page_views: existingVisitor.page_views + 1,
          updated_at: new Date().toISOString()
        })
        .eq('visit_date', today);
      
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('website_visitors')
        .insert({
          visit_date: today,
          visitor_count: 1,
          unique_visitors: 1,
          page_views: 1
        });
      
      if (insertError) throw insertError;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    res.status(500).json({ error: 'Failed to track visitor' });
  }
});

// Track service usage
app.post('/api/analytics/track-service', async (req, res) => {
  try {
    const { serviceName } = req.body;

    if (!serviceName) {
      return res.status(400).json({ error: 'Service name is required' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Update cumulative service_usage table
    const { data: existingService, error: fetchError } = await supabase
      .from('service_usage')
      .select('*')
      .eq('service_name', serviceName)
      .single();

    if (existingService) {
      const { error: updateError } = await supabase
        .from('service_usage')
        .update({ 
          usage_count: existingService.usage_count + 1,
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('service_name', serviceName);
      
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('service_usage')
        .insert({
          service_name: serviceName,
          usage_count: 1,
          last_used: new Date().toISOString()
        });
      
      if (insertError) throw insertError;
    }

    // Update daily_service_usage table for daily/monthly tracking
    const { data: existingDaily, error: dailyFetchError } = await supabase
      .from('daily_service_usage')
      .select('*')
      .eq('service_name', serviceName)
      .eq('usage_date', today)
      .single();

    if (existingDaily) {
      const { error: dailyUpdateError } = await supabase
        .from('daily_service_usage')
        .update({ 
          usage_count: existingDaily.usage_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('service_name', serviceName)
        .eq('usage_date', today);
      
      if (dailyUpdateError) throw dailyUpdateError;
    } else {
      const { error: dailyInsertError } = await supabase
        .from('daily_service_usage')
        .insert({
          service_name: serviceName,
          usage_date: today,
          usage_count: 1
        });
      
      if (dailyInsertError) throw dailyInsertError;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking service:', error);
    res.status(500).json({ error: 'Failed to track service' });
  }
});

// Get analytics data for admin dashboard
app.get('/api/admin/analytics', async (req, res) => {
  try {
    // Get visitor data for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: visitorData, error: visitorError } = await supabase
      .from('website_visitors')
      .select('*')
      .gte('visit_date', sixMonthsAgo.toISOString().split('T')[0])
      .order('visit_date', { ascending: true });

    if (visitorError) throw visitorError;

    // Get service usage data
    const { data: serviceData, error: serviceError } = await supabase
      .from('service_usage')
      .select('*')
      .order('usage_count', { ascending: false });

    if (serviceError) throw serviceError;

    // Get daily service usage data for last 6 months
    const { data: dailyServiceData, error: dailyServiceError } = await supabase
      .from('daily_service_usage')
      .select('*')
      .gte('usage_date', sixMonthsAgo.toISOString().split('T')[0])
      .order('usage_date', { ascending: true });

    if (dailyServiceError) throw dailyServiceError;

    // Calculate monthly service usage statistics
    const monthlyServiceStats = {};
    
    (dailyServiceData || []).forEach(day => {
      const date = new Date(day.usage_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyServiceStats[monthKey]) {
        monthlyServiceStats[monthKey] = {};
      }
      
      if (!monthlyServiceStats[monthKey][day.service_name]) {
        monthlyServiceStats[monthKey][day.service_name] = 0;
      }
      
      monthlyServiceStats[monthKey][day.service_name] += day.usage_count;
    });

    // Calculate monthly statistics
    const monthlyStats = {};
    const dailyStats = {};
    
    visitorData.forEach(day => {
      const date = new Date(day.visit_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const dayKey = day.visit_date;
      
      // Monthly aggregation
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          totalVisitors: 0,
          totalPageViews: 0,
          days: 0
        };
      }
      monthlyStats[monthKey].totalVisitors += day.visitor_count;
      monthlyStats[monthKey].totalPageViews += day.page_views;
      monthlyStats[monthKey].days += 1;

      // Daily stats
      dailyStats[dayKey] = {
        date: dayKey,
        visitors: day.visitor_count,
        pageViews: day.page_views,
        uniqueVisitors: day.unique_visitors
      };
    });

    // Convert to arrays and sort
    const monthlyArray = Object.values(monthlyStats).sort((a, b) => 
      a.month.localeCompare(b.month)
    );

    const dailyArray = Object.values(dailyStats).sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    // Calculate growth rates
    const latestMonth = monthlyArray[monthlyArray.length - 1];
    const previousMonth = monthlyArray[monthlyArray.length - 2];
    const monthlyGrowth = previousMonth 
      ? ((latestMonth.totalVisitors - previousMonth.totalVisitors) / previousMonth.totalVisitors * 100).toFixed(2)
      : 0;

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayStats = dailyStats[today] || { visitors: 0, pageViews: 0, uniqueVisitors: 0 };

    // Get yesterday's stats for daily comparison
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    const yesterdayStats = dailyStats[yesterdayKey] || { visitors: 0, pageViews: 0, uniqueVisitors: 0 };
    const dailyGrowth = yesterdayStats.visitors 
      ? ((todayStats.visitors - yesterdayStats.visitors) / yesterdayStats.visitors * 100).toFixed(2)
      : 0;

    res.json({
      visitors: {
        today: todayStats,
        yesterday: yesterdayStats,
        daily: dailyArray,
        monthly: monthlyArray,
        dailyGrowth: parseFloat(dailyGrowth),
        monthlyGrowth: parseFloat(monthlyGrowth)
      },
      services: serviceData.map(service => ({
        name: service.service_name,
        count: service.usage_count,
        lastUsed: service.last_used
      })),
      servicesByMonth: monthlyServiceStats,
      dailyServiceUsage: dailyServiceData || [],
      totalStats: {
        totalVisitors: visitorData.reduce((sum, day) => sum + day.visitor_count, 0),
        totalPageViews: visitorData.reduce((sum, day) => sum + day.page_views, 0),
        avgDailyVisitors: visitorData.length > 0 
          ? (visitorData.reduce((sum, day) => sum + day.visitor_count, 0) / visitorData.length).toFixed(0)
          : '0',
        totalServices: serviceData.length,
        totalServiceUsage: serviceData.reduce((sum, service) => sum + service.usage_count, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// ===== END OF ANALYTICS FEATURE =====
// =====================================================================

/* ---------------------- SERVER ---------------------- */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
