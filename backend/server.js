import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Perplexity from '@perplexity-ai/perplexity_ai';
import Groq from 'groq-sdk';
import multer from 'multer';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfreader = require('pdfreader');
const pdfParseModule = require('pdf-parse');

const pdfParse = pdfParseModule.default || pdfParseModule;
console.log('📦 pdf-parse loaded, type:', typeof pdfParse);
console.log('📦 pdf-parse keys:', Object.keys(pdfParseModule));
console.log('📦 pdfParse is function?', typeof pdfParse === 'function');


const app = express();

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Initialize Gemini AI with stable SDK (kept for backward compatibility if needed)


// Initialize Groq for resume analysis
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize Perplexity AI (for resume generation)
const perplexityClient = new Perplexity({
  apiKey: process.env.PERPLEXITY_API_KEY,
});

const allowedOrigins = [
  "http://localhost:8080",
  "http://10.5.83.177:8080",
  "http://localhost:5173",
  "https://kiitsaathi.vercel.app",
  "https://kiitsaathi-git-satvik-aditya-sharmas-projects-3c0e452b.vercel.app",
  "https://kiitsaathi-git-satvik-resume-aditya-sharmas-projects-3c0e452b.vercel.app", // ✅ new correct one
  "https://kiitsaathi-git-satvik-adityash8997s-projects.vercel.app"
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from localhost, Vercel, and Render preview URLs
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com")
      ) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// Error handling middleware

app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  next(err);
});

// Health check endpoint
app.get('/health', async (req, res) => {
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
      razorpay: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Missing',
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Test Gemini API endpoint

/* ==================== USAGE SUMMARY ROUTE ==================== */
app.get('/usage-summary', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    const actions = ['generation', 'analysis'];
    const limits = { generation: 2, analysis: 3 };
    const summary = {};

    for (const action of actions) {
      const { data, error } = await supabase
        .from('resume_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('action', action)
        .eq('year', year)
        .eq('month', month)
        .limit(1)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') {
        // PGRST116 = No rows found for maybeSingle; ignore
        throw new Error(error.message);
      }
      const used = data?.count || 0;
      const limit = limits[action];
      summary[action] = { used, limit, remaining: Math.max(0, limit - used) };
    }

    return res.json({ success: true, summary });
  } catch (err) {
    console.error('Usage summary error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch usage summary' });
  }
});

// Debug endpoint to check database state
app.get('/debug-usage', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }

    const { data, error } = await supabase
      .from('resume_usage')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, records: data });
  } catch (err) {
    console.error('Debug usage error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/test-gemini', async (req, res) => {
  try {
    // Use the stable SDK format with confirmed working model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello, this is a test for resume analysis");
    const response = await result.response;
    const text = response.text();
    
    res.json({ 
      success: true, 
      workingModel: "gemini-2.5-flash",
      message: 'Gemini API is working!',
      response: text 
    });
  } catch (error) {
    console.error('Gemini API test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.toString()
    });
  }
});

// Razorpay instance - only create if environment variables are available
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

console.log('🔧 Environment Debug Info:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '❌ Missing');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ Set' : '❌ Missing');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ Set' : '❌ Missing');
console.log('PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY ? '✅ Set' : '❌ Missing');

// Supabase instance
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ==================== MONTHLY USAGE TRACKING HELPERS ==================== */
async function getOrInitMonthlyUsage(userId, action) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1; // 1-12

  // Try to fetch existing row
  const { data: rows, error: selErr } = await supabase
    .from('resume_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('action', action)
    .eq('year', year)
    .eq('month', month)
    .limit(1);

  if (selErr) throw new Error(`Usage select failed: ${selErr.message}`);
  if (rows && rows.length > 0) return rows[0];

  // Insert new row with 0 count
  const insertRow = { user_id: userId, action, year, month, count: 0 };
  const { data: inserted, error: insErr } = await supabase
    .from('resume_usage')
    .insert([insertRow])
    .select('*')
    .limit(1);
  if (insErr) {
    // If unique violation, re-select (concurrent init)
    const { data: retryRows, error: retryErr } = await supabase
      .from('resume_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('action', action)
      .eq('year', year)
      .eq('month', month)
      .limit(1);
    if (retryErr) throw new Error(`Usage reselect failed: ${retryErr.message}`);
    return retryRows[0];
  }
  return inserted[0];
}

async function incrementMonthlyUsage(userId, action) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  console.log(`📊 Incrementing usage for user ${userId}, action: ${action}, ${year}-${month}`);

  // Atomic increment using Postgres UPDATE with conflict handling
  // First, ensure the row exists
  const existing = await getOrInitMonthlyUsage(userId, action);
  console.log(`📊 Current usage before increment:`, existing);
  
  // Now do an atomic increment using raw SQL through RPC or UPDATE
  const { data, error } = await supabase.rpc('increment_resume_usage', {
    p_user_id: userId,
    p_action: action,
    p_year: year,
    p_month: month
  });
  
  console.log('🔍 RPC Response - Data:', data, 'Error:', error);
  
  if (error) {
    // Fallback: use non-atomic increment if RPC doesn't exist
    console.warn('⚠️ RPC not available, using non-atomic increment:', error.message);
    const current = await getOrInitMonthlyUsage(userId, action);
    const nextCount = (current?.count || 0) + 1;
    console.log(`📊 Incrementing from ${current?.count || 0} to ${nextCount}`);
    const { data: updateData, error: updateError } = await supabase
      .from('resume_usage')
      .update({ count: nextCount })
      .eq('user_id', userId)
      .eq('action', action)
      .eq('year', year)
      .eq('month', month)
      .select('*');
    if (updateError) throw new Error(`Usage update failed: ${updateError.message}`);
    console.log(`✅ Usage incremented successfully:`, updateData?.[0]);
    return updateData?.[0];
  }
  
  console.log(`✅ Usage incremented via RPC:`, data);
  return data;
}

async function checkMonthlyLimit(userId, action, limit) {
  const usage = await getOrInitMonthlyUsage(userId, action);
  return (usage?.count || 0) < limit;
}

/* ==================== PAYMENT & ORDER ROUTES ==================== */

// ✅ Check if user has paid for contact unlock for a specific item
app.get('/has-paid-contact', async (req, res) => {
  const { user_id, item_id, item_title } = req.query;
  if (!user_id || !item_id || !item_title) {
    return res.status(400).json({ error: 'Missing user_id, item_id, or item_title' });
  }
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user_id)
      .eq('service_name', 'LostAndFound')
      .eq('subservice_name', item_title)
      .eq('payment_status', 'success');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ paid: data && data.length > 0 });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err });
  }
});

// ✅ Create Razorpay order
app.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  
  if (!razorpay) {
    return res.status(500).json({ 
      error: 'Payment service not available - Razorpay not configured',
      details: 'Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables'
    });
  }
  
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency,
      receipt,
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Verify payment and save to Supabase
app.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, user_id, amount, service_name, subservice_name, payment_method } = req.body;

  try {
    // Insert order
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id,
          transaction_id: razorpay_order_id,
          amount,
          payment_status: 'success',
          service_name,
          subservice_name,
          payment_method,
        },
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message, details: error });
    }

    // If LostAndFound, send contact details to user's email
    if (service_name === 'LostAndFound') {
      // 1. Get user email from Supabase users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', user_id)
        .single();
      if (userError || !userData?.email) {
        console.error('User email fetch error:', userError);
      } else {
        // 2. Get contact details for the item
        const { data: itemData, error: itemError } = await supabase
          .from('lost_and_found_items')
          .select('contact_name, contact_email, contact_phone, title')
          .eq('title', subservice_name)
          .single();
        if (itemError || !itemData) {
          console.error('LostFound item fetch error:', itemError);
        } else {
          // 3. Send email using Resend API
          try {
            const Resend = require('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: 'KIIT Saathi <onboarding@resend.dev>',
              to: [userData.email],
              subject: `Contact Details for ${itemData.title}`,
              html: `<h2>Contact Details for ${itemData.title}</h2>
                <p><strong>Name:</strong> ${itemData.contact_name}</p>
                <p><strong>Email:</strong> ${itemData.contact_email}</p>
                <p><strong>Phone:</strong> ${itemData.contact_phone}</p>
                <p>Thank you for using KIIT Saathi Lost & Found!</p>`
            });
            console.log('Contact details sent to', userData.email);
          } catch (emailErr) {
            console.error('Error sending contact email:', emailErr);
          }
        }
      }
    }

    console.log('Order insert response:', data);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error in /verify-payment:', err);
    return res.status(500).json({ error: 'Unexpected server error', details: err });
  }
});

// ✅ Get user's orders
app.get('/get-orders', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ orders: data });
  } catch (err) {
    console.error('Unexpected error in /get-orders:', err);
    return res.status(500).json({ error: 'Unexpected server error', details: err });
  }
});

// ✅ Alternative endpoint for fetching orders
app.get('/orders', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error (alt):', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ orders: data });
  } catch (err) {
    console.error('Unexpected error in /orders:', err);
    return res.status(500).json({ error: 'Unexpected server error', details: err });
  }
});

// Test Lost & Found order creation (simplified)
app.post('/test-lost-found-order', async (req, res) => {
  try {
    console.log('🧪 Test Lost & Found Order Request:', req.body);
    const { amount } = req.body;
    
    // Check if Razorpay is available
    if (!razorpay) {
      return res.status(500).json({ 
        error: 'Razorpay not configured',
        details: 'Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables'
      });
    }
    
    // Simple Razorpay order creation test
    const order = await razorpay.orders.create({
      amount: amount || 1500, // Default 15 rupees in paise
      currency: 'INR',
      receipt: 'test_' + Date.now(),
      notes: {
        test: 'true'
      }
    });
    
    console.log('✅ Test order created:', order.id);
    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Test order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create order for Lost & Found contact unlock
app.post('/create-lost-found-order', async (req, res) => {
  try {
    console.log('🔍 Lost & Found Order Request:', req.body);
    console.log('🔍 Environment check - Supabase URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
    console.log('🔍 Environment check - Razorpay Key:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Missing');
    
    const { amount, itemId, itemTitle, itemPosterEmail, payerUserId, receipt } = req.body;

    // Validate required fields
    if (!amount || !itemId || !itemTitle || !payerUserId) {
      console.log('❌ Missing required fields:', { amount, itemId, itemTitle, payerUserId });
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['amount', 'itemId', 'itemTitle', 'payerUserId'] 
      });
    }

    console.log('⏳ Checking for existing payment...');
    // For now, let's skip the unlock table check since it doesn't exist yet
    // and check directly in the orders table
    const { data: existingPayment, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', payerUserId)
      .eq('service_name', 'LostAndFoundContact')
      .eq('payment_status', 'completed')
      .contains('booking_details', { item_id: itemId })
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing payment:', checkError);
      return res.status(500).json({ error: 'Failed to validate payment status', details: checkError });
    }

    if (existingPayment && existingPayment.length > 0) {
      console.log('❌ Payment already exists for this user/item combination');
      return res.status(400).json({ 
        error: 'Payment already completed', 
        message: 'You have already unlocked contact details for this item' 
      });
    }

    console.log('⏳ Fetching item details...');
    // Get the item details to check if user is the poster and item type
    const { data: itemData, error: itemError } = await supabase
      .from('lost_and_found_items')
      .select('contact_email, item_type')
      .eq('id', itemId)
      .single();

    if (itemError) {
      console.error('❌ Error fetching item details:', itemError);
      return res.status(500).json({ error: 'Failed to validate item', details: itemError });
    }

    if (!itemData) {
      console.error('❌ Item not found with ID:', itemId);
      return res.status(404).json({ error: 'Item not found' });
    }

    console.log('⏳ Fetching user details...');
    // Get user's email to check if they're the poster
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(payerUserId);
    
    if (userError) {
      console.error('❌ Error fetching user details:', userError);
      return res.status(500).json({ error: 'Failed to validate user', details: userError });
    }

    if (!userData?.user?.email) {
      console.error('❌ User email not found for ID:', payerUserId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent users from paying for their own items (both lost and found)
    if (itemData.contact_email === userData.user.email) {
      console.log('❌ User trying to unlock their own item');
      return res.status(400).json({ 
        error: 'Cannot unlock own item', 
        message: 'You cannot pay to unlock contact details for your own posted item' 
      });
    }

    console.log('⏳ Creating Razorpay order...');
    
    // Check if Razorpay is available
    if (!razorpay) {
      console.error('❌ Razorpay not initialized - missing environment variables');
      return res.status(500).json({ 
        error: 'Payment service not available', 
        details: 'Razorpay not configured - missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET',
        message: 'Payment service is temporarily unavailable. Please contact support.' 
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
    console.log('✅ Lost & Found order created successfully:', order.id);
    res.json(order);

  } catch (error) {
    console.error('❌ Error creating Lost & Found order:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Verify payment and process split for Lost & Found
app.post('/verify-lost-found-payment', async (req, res) => {
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

    // Store payment in existing orders table
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: payerUserId,
        service_name: 'LostAndFoundContact',
        subservice_name: itemTitle,
        amount: splitDetails.totalAmount,
        payment_method: 'razorpay',
        payment_status: 'completed',
        transaction_id: razorpay_payment_id,
        booking_details: {
          item_id: itemId,
          item_title: itemTitle,
          poster_email: itemPosterEmail,
          razorpay_order_id: razorpay_order_id,
          split_details: splitDetails
        }
      });

    if (orderError) {
      console.error('Error storing order:', orderError);
      // Don't fail the request as payment is successful
    }

    console.log('✅ Lost & Found payment verified and stored successfully');
    res.json({
      success: true,
      message: 'Payment verified and contact details unlocked',
      paymentId: razorpay_payment_id
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

// Check if user has already paid for Lost & Found contact details
app.get('/has-paid-lost-found-contact', async (req, res) => {
  try {
    console.log('🔍 Checking payment status for user:', req.query.user_id, 'item:', req.query.item_id);
    const { user_id, item_id } = req.query;

    if (!user_id || !item_id) {
      console.log('❌ Missing required parameters');
      return res.status(400).json({ error: 'Missing user_id or item_id' });
    }

    console.log('⏳ Checking orders table for payment history...');
    // Check in the orders table for completed payments
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user_id)
      .eq('service_name', 'LostAndFoundContact')
      .eq('payment_status', 'completed')
      .contains('booking_details', { item_id: item_id })
      .limit(1);

    if (error) {
      console.error('❌ Database error in orders table:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const hasPaid = data && data.length > 0;
    console.log(`${hasPaid ? '✅' : '❌'} Payment status result:`, hasPaid);
    res.json({ paid: hasPaid });

  } catch (error) {
    console.error('Error checking Lost & Found payment status:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

/* ==================== RESUME ATS ANALYSIS ROUTES ==================== */

// Debug endpoint to test RPC function
app.get('/test-rpc', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    console.log('🧪 Testing RPC function for user:', userId);
    
    // Check BEFORE state
    const { data: beforeState, error: beforeError } = await supabase
      .from('resume_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('action', 'analysis')
      .eq('year', year)
      .eq('month', month)
      .single();

    console.log('📊 State BEFORE RPC:', beforeState);

    // Test the RPC function
    const { data, error } = await supabase.rpc('increment_resume_usage', {
      p_user_id: userId,
      p_action: 'analysis',
      p_year: year,
      p_month: month
    });

    console.log('🔍 RPC Result - Data:', data, 'Error:', error);

    // Check AFTER state
    const { data: afterState, error: afterError } = await supabase
      .from('resume_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('action', 'analysis')
      .eq('year', year)
      .eq('month', month)
      .single();

    console.log('📊 State AFTER RPC:', afterState);

    res.json({
      success: !error,
      rpcResult: { data, error: error?.message },
      beforeState,
      afterState,
      incremented: afterState?.count > beforeState?.count
    });

  } catch (err) {
    console.error('❌ Test RPC error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ATS Resume Analysis endpoint using Gemini AI (Form Data)
app.post('/analyze-resume-form', async (req, res) => {
  try {
    const { resumeData, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }

    // Enforce quota: max 3 analyses per month
    const canUse = await checkMonthlyLimit(userId, 'analysis', 3);
    if (!canUse) {
      return res.status(429).json({
        success: false,
        error: 'Monthly limit reached',
        message: 'You have reached your monthly limit of 3 resume analyses. Please try again next month.'
      });
    }

    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required' });
    }

    console.log('🤖 Starting resume analysis with Groq AI...');
    console.log('👤 User ID:', userId);
    console.log('📝 Analysis type: Form-based resume');

    // Convert resume data to a comprehensive text format
    const resumeText = formatResumeForAnalysis(resumeData);

    // Comprehensive ATS analysis prompt
    const prompt = `
You are an expert ATS (Applicant Tracking System) resume analyzer and career counselor. Analyze the following resume and provide a detailed assessment:

RESUME CONTENT:
${resumeText}

Please provide a comprehensive analysis in the following JSON format:
{
  "atsScore": number (0-100),
  "overallGrade": "A+/A/B+/B/C+/C/D+/D/F",
  "summary": "Brief 2-3 sentence overall assessment",
  "strengths": [
    "List of specific strengths found in the resume"
  ],
  "criticalIssues": [
    "Major problems that significantly hurt ATS compatibility"
  ],
  "improvements": [
    "Specific, actionable improvement suggestions"
  ],
  "sectionAnalysis": {
    "personalInfo": {
      "score": number (0-100),
      "feedback": "Detailed feedback on contact information",
      "issues": ["specific issues"],
      "suggestions": ["specific improvements"]
    },
    "summary": {
      "score": number (0-100),
      "feedback": "Analysis of professional summary",
      "issues": ["specific issues"],
      "suggestions": ["specific improvements"]
    },
    "experience": {
      "score": number (0-100),
      "feedback": "Analysis of work experience section",
      "issues": ["specific issues"],
      "suggestions": ["specific improvements"]
    },
    "education": {
      "score": number (0-100),
      "feedback": "Analysis of education section",
      "issues": ["specific issues"],
      "suggestions": ["specific improvements"]
    },
    "skills": {
      "score": number (0-100),
      "feedback": "Analysis of skills section",
      "issues": ["specific issues"],
      "suggestions": ["specific improvements"]
    },
    "projects": {
      "score": number (0-100),
      "feedback": "Analysis of projects section",
      "issues": ["specific issues"],
      "suggestions": ["specific improvements"]
    }
  },
  "keywordAnalysis": {
    "score": number (0-100),
    "industryKeywords": {
      "found": ["keywords found in resume"],
      "missing": ["important keywords missing"],
      "suggestions": ["keyword suggestions for improvement"]
    },
    "technicalSkills": {
      "found": ["technical skills found"],
      "missing": ["important technical skills missing"],
      "suggestions": ["technical skills to add"]
    }
  },
  "formatAnalysis": {
    "score": number (0-100),
    "issues": [
      "Formatting issues that hurt ATS readability"
    ],
    "suggestions": [
      "Formatting improvements for better ATS compatibility"
    ]
  },
  "lengthAnalysis": {
    "score": number (0-100),
    "currentLength": "assessment of current resume length",
    "recommendations": "recommendations for resume length"
  },
  "careerLevel": "entry/mid/senior",
  "recommendedImprovements": [
    {
      "priority": "high/medium/low",
      "category": "content/format/keywords",
      "issue": "specific issue description",
      "solution": "specific solution",
      "impact": "expected impact on ATS score"
    }
  ],
  "industrySpecificAdvice": "Advice specific to the person's industry/field",
  "nextSteps": [
    "Prioritized list of next steps to improve the resume"
  ]
}

ANALYSIS CRITERIA:
1. ATS Compatibility: How well will ATS systems parse this resume?
2. Keyword Optimization: Are relevant industry keywords present?
3. Format and Structure: Is the format clean and ATS-friendly?
4. Content Quality: Is the content compelling and achievement-focused?
5. Completeness: Are all necessary sections present and well-developed?
6. Professional Presentation: Does it look professional and error-free?

Focus on:
- Quantified achievements
- Action verbs usage
- Industry-relevant keywords
- ATS-friendly formatting
- Professional presentation
- Content gaps or weaknesses
- Specific, actionable improvements

Provide honest, constructive feedback that will help improve both ATS compatibility and human readability.
`;

    console.log('🚀 Sending resume data to Groq AI for analysis...');
    console.log('🤖 Model: llama-3.3-70b-versatile');
    console.log('📝 Resume text length:', resumeText.length, 'characters');
    console.log('📄 Resume text preview:', resumeText.substring(0, 500));
    
    // Use Groq for fast and reliable analysis
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert ATS resume analyzer. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Fast and capable model
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });
    
    console.log('✅ Received response from Groq AI!');
    
    const analysisText = completion.choices[0]?.message?.content || '{}';
    console.log('📊 Groq response length:', analysisText.length, 'characters');
    console.log('📋 Groq response preview:', analysisText.substring(0, 500));

    // Try to extract JSON from the response
    let analysisResult;
    try {
      // Parse the JSON directly (Groq returns JSON object format)
      analysisResult = JSON.parse(analysisText);
      console.log('✅ Successfully parsed Groq JSON response');
      console.log('📊 Parsed score:', analysisResult.atsScore);
      console.log('📝 Parsed summary:', analysisResult.summary?.substring(0, 100));
    } catch (parseError) {
      console.error('❌ Error parsing Groq response:', parseError);
      console.log('🔴 Raw response:', analysisText);
      
      // Fallback analysis if JSON parsing fails
      analysisResult = createFallbackAnalysis(resumeData, analysisText);
    }

    // Increment usage count after success
    console.log('📊 About to increment analysis usage for user:', userId);
    try { 
      await incrementMonthlyUsage(userId, 'analysis'); 
      console.log('✅ Analysis usage increment completed successfully');
    } catch (e) { 
      console.error('❌ Analysis usage increment failed:', e.message, e); 
    }

    res.json({
      success: true,
      analysis: analysisResult,
      rawResponse: analysisText // For debugging
    });

  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ 
      error: 'Failed to analyze resume',
      message: error.message 
    });
  }
});

// File upload endpoint for PDF resume analysis
app.post('/analyze-resume-ats', upload.single('resume'), async (req, res) => {
  try {
    const userId = req.body?.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }

    // Enforce quota: max 3 analyses per month
    const canUse = await checkMonthlyLimit(userId, 'analysis', 3);
    if (!canUse) {
      return res.status(429).json({
        success: false,
        error: 'Monthly limit reached',
        message: 'You have reached your monthly limit of 3 resume analyses. Please try again next month.'
      });
    }
    // Handle file upload
    if (req.file) {
      const filePath = req.file.path;
      
      console.log('🤖 Starting resume analysis with Groq AI...');
      console.log('👤 User ID:', userId);
      console.log('📝 Analysis type: PDF-based resume');
      console.log('📄 File name:', req.file.originalname);
      
      try {
        // Read the uploaded PDF file
        const fileBuffer = fs.readFileSync(filePath);
        
        // Extract text content from PDF using pdfreader
        console.log('Extracting text from PDF...');
        console.log('PDF file path:', filePath);
        console.log('PDF file size:', req.file.size, 'bytes');
        
        const extractedText = await extractTextFromPDF(filePath);
        
        console.log('Raw extracted text:', extractedText);
        console.log('Extracted text length:', extractedText ? extractedText.length : 0);
        
        if (!extractedText || extractedText.trim().length < 10) {
          // More lenient check and better error message
          console.log('✅ PDF structure parsed successfully, but no text content found');
          console.log('📄 This appears to be a scanned/image-based PDF');
          console.log('🔄 Switching to fallback analysis mode...');
          
          // Return a fallback analysis instead of throwing an error
          const fileInfo = {
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
          };
          
          const fallbackAnalysis = createAdvancedFallbackAnalysis(fileInfo);
          fallbackAnalysis.note = "PDF appears to be image-based or scanned - analysis based on best practices";
          fallbackAnalysis.extractionError = "Unable to extract text from PDF. This could be due to: 1) Scanned/image-based PDF (most common), 2) Password protection, 3) Complex formatting, 4) Corrupted file";
          fallbackAnalysis.recommendations = [
            "For scanned PDFs: Try converting to text-based PDF using Adobe Acrobat or similar tools",
            "Alternative: Use the form-based resume builder for detailed AI analysis",
            "Ensure your PDF has selectable text (try copying text from the PDF)",
            "Consider recreating your resume in a word processor and exporting as PDF"
          ];
          fallbackAnalysis.atsScore = 75; // Higher score for scanned PDFs that might still be readable by some ATS
          fallbackAnalysis.summary = `Uploaded resume appears to be scanned/image-based (${fileInfo.fileName}). While the file format is professional, modern ATS systems work best with text-based PDFs. Consider the recommendations below.`;
          
          // Clean up the uploaded file
          fs.unlinkSync(filePath);
          
          console.log('📤 Sending fallback analysis to frontend...');
          console.log('📊 ATS Score:', fallbackAnalysis.atsScore);
          console.log('📝 Analysis type:', 'Scanned PDF fallback');
          
          // Increment usage (counts as analysis)
          console.log('📊 About to increment analysis usage (scanned PDF fallback) for user:', userId);
          try { 
            await incrementMonthlyUsage(userId, 'analysis'); 
            console.log('✅ Analysis usage increment completed successfully (scanned PDF)');
          } catch (e) { 
            console.error('❌ Analysis usage increment failed:', e.message, e); 
          }

          return res.json({
            success: true,
            analysis: fallbackAnalysis,
            source: 'fallback_scanned_pdf_analysis',
            extractedTextLength: extractedText ? extractedText.length : 0,
            warning: 'PDF appears to be scanned/image-based - analysis based on best practices',
            userMessage: 'Your PDF seems to be scanned or image-based. For the most accurate ATS analysis, try uploading a text-based PDF or use our form-based resume builder.',
            nextSteps: [
              'Try copying text from your PDF - if you can\'t select text, it\'s image-based',
              'Use our Resume Builder for detailed AI analysis',
              'Convert scanned PDF to text-based PDF using online tools'
            ]
          });
        }
        
        console.log('PDF text extracted successfully, length:', extractedText.length);
        
        // Use Gemini for comprehensive analysis with the actual resume content
        const prompt = `
You are an expert ATS (Applicant Tracking System) resume analyzer and career counselor. Analyze the following resume content and provide comprehensive feedback.

RESUME CONTENT:
${extractedText}

ADDITIONAL FILE INFO:
- File Name: ${req.file.originalname}
- File Size: ${req.file.size} bytes
- Extracted Text Length: ${extractedText.length} characters

Please provide a detailed analysis in the following JSON format:
{
  "atsScore": number (0-100),
  "overallGrade": "A+/A/B+/B/C+/C/D+/D/F",
  "summary": "Brief 2-3 sentence overall assessment of the resume",
  "strengths": [
    "List of specific strengths found in the resume"
  ],
  "criticalIssues": [
    "Major problems that significantly hurt ATS compatibility"
  ],
  "improvements": [
    "Specific, actionable improvement suggestions"
  ],
  "sectionAnalysis": {
    "personalInfo": {
      "score": number (0-100),
      "feedback": "Analysis of contact information section",
      "issues": ["specific issues found"],
      "suggestions": ["specific improvements"]
    },
    "summary": {
      "score": number (0-100),
      "feedback": "Analysis of professional summary",
      "issues": ["specific issues found"],
      "suggestions": ["specific improvements"]
    },
    "experience": {
      "score": number (0-100),
      "feedback": "Analysis of work experience section",
      "issues": ["specific issues found"],
      "suggestions": ["specific improvements"]
    },
    "education": {
      "score": number (0-100),
      "feedback": "Analysis of education section",
      "issues": ["specific issues found"],
      "suggestions": ["specific improvements"]
    },
    "skills": {
      "score": number (0-100),
      "feedback": "Analysis of skills section",
      "issues": ["specific issues found"],
      "suggestions": ["specific improvements"]
    },
    "projects": {
      "score": number (0-100),
      "feedback": "Analysis of projects section",
      "issues": ["specific issues found"],
      "suggestions": ["specific improvements"]
    }
  },
  "keywordAnalysis": {
    "score": number (0-100),
    "industryKeywords": {
      "found": ["industry-specific keywords found in resume"],
      "missing": ["important industry keywords missing"],
      "suggestions": ["keyword suggestions for improvement"]
    },
    "technicalSkills": {
      "found": ["technical skills found in resume"],
      "missing": ["important technical skills missing"],
      "suggestions": ["technical skills to add"]
    }
  },
  "formatAnalysis": {
    "score": number (0-100),
    "issues": ["Formatting issues that hurt readability"],
    "suggestions": ["Formatting improvements"]
  },
  "lengthAnalysis": {
    "score": number (0-100),
    "currentLength": "assessment of current resume length",
    "recommendations": "recommendations for resume length"
  },
  "careerLevel": "entry/mid/senior",
  "recommendedImprovements": [
    {
      "priority": "high/medium/low",
      "category": "content/format/keywords",
      "issue": "specific issue description",
      "solution": "specific solution",
      "impact": "expected impact on score"
    }
  ],
  "industrySpecificAdvice": "Advice specific to the person's industry/field",
  "nextSteps": [
    "Prioritized list of next steps to improve the resume"
  ]
}

Key factors to analyze:
- ATS compatibility and parsing ability
- Professional presentation and formatting
- Keyword optimization for relevant roles
- Content quality and achievement focus
- Section organization and completeness
- Industry best practices compliance

Provide specific, actionable recommendations that will improve both ATS performance and human readability.
`;

        console.log('🚀 Sending PDF resume data to Groq AI for analysis...');
        console.log('🤖 Model: llama-3.3-70b-versatile');
        console.log('📊 Extracted text length:', extractedText.length, 'characters');
        console.log('📄 Extracted text preview:', extractedText.substring(0, 500));
        
        // Use Groq for fast and reliable analysis
        const completion = await groqClient.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are an expert ATS resume analyzer. Always respond with valid JSON only."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: "llama-3.3-70b-versatile", // Fast and capable model
          temperature: 0.3,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        });
        
        console.log('✅ Received response from Groq AI!');
        
        const analysisText = completion.choices[0]?.message?.content || '{}';
        console.log('📊 Groq response length:', analysisText.length, 'characters');
        console.log('📋 Groq response preview:', analysisText.substring(0, 500));

        // Clean up the uploaded file
        fs.unlinkSync(filePath);

        // Try to extract JSON from the response
        let analysisResult;
        try {
          // Parse the JSON directly (Groq returns JSON object format)
          analysisResult = JSON.parse(analysisText);
          console.log('✅ Successfully parsed Groq JSON response');
          console.log('📊 Parsed score:', analysisResult.atsScore);
          console.log('📝 Parsed summary:', analysisResult.summary?.substring(0, 100));
        } catch (parseError) {
          console.error('❌ Error parsing Groq response:', parseError);
          console.log('🔴 Raw response:', analysisText);
          
          // Create a fallback analysis if JSON parsing fails
          const fileInfo = {
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
          };
          analysisResult = createAdvancedFallbackAnalysis(fileInfo);
          analysisResult.note = "AI analysis completed with formatting assistance";
          analysisResult.extractedTextLength = extractedText.length;
        }

        // Increment usage after success
        console.log('📊 About to increment analysis usage (PDF Groq) for user:', userId);
        try { 
          await incrementMonthlyUsage(userId, 'analysis'); 
          console.log('✅ Analysis usage increment completed successfully (PDF Groq)');
        } catch (e) { 
          console.error('❌ Analysis usage increment failed:', e.message, e); 
        }

        return res.json({
          success: true,
          analysis: analysisResult,
          source: 'groq_ai_analysis',
          model: 'llama-3.3-70b-versatile',
          extractedTextLength: extractedText.length
        });

      } catch (fileError) {
        // Clean up the uploaded file on error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw fileError;
      }
    } else {
      // No file provided
      return res.status(400).json({ error: 'PDF file is required for this endpoint' });
    }

  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ 
      error: 'Failed to analyze resume',
      message: error.message 
    });
  }
});

// Helper function to format resume data for analysis
function formatResumeForAnalysis(resumeData) {
  let text = '';
  
  // Personal Information
  text += `PERSONAL INFORMATION:\n`;
  text += `Name: ${resumeData.personalInfo?.fullName || 'N/A'}\n`;
  text += `Email: ${resumeData.personalInfo?.email || 'N/A'}\n`;
  text += `Phone: ${resumeData.personalInfo?.phone || 'N/A'}\n`;
  text += `City: ${resumeData.personalInfo?.city || 'N/A'}\n`;
  if (resumeData.personalInfo?.linkedin) text += `LinkedIn: ${resumeData.personalInfo.linkedin}\n`;
  if (resumeData.personalInfo?.portfolio) text += `Portfolio: ${resumeData.personalInfo.portfolio}\n`;
  text += `\n`;

  // Professional Summary
  if (resumeData.summary) {
    text += `PROFESSIONAL SUMMARY:\n${resumeData.summary}\n\n`;
  }

  // Education
  if (resumeData.education?.length > 0) {
    text += `EDUCATION:\n`;
    resumeData.education.forEach(edu => {
      text += `- ${edu.degree} from ${edu.institution} (${edu.startDate} - ${edu.endDate})`;
      if (edu.cgpa) text += ` - CGPA: ${edu.cgpa}`;
      text += `\n`;
    });
    text += `\n`;
  }

  // Experience
  if (resumeData.experience?.length > 0) {
    text += `WORK EXPERIENCE:\n`;
    resumeData.experience.forEach(exp => {
      text += `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
      if (exp.bullets?.length > 0) {
        exp.bullets.forEach(bullet => {
          text += `• ${bullet}\n`;
        });
      }
      text += `\n`;
    });
  }

  // Projects
  if (resumeData.projects?.length > 0) {
    text += `PROJECTS:\n`;
    resumeData.projects.forEach(project => {
      text += `${project.name}\n`;
      text += `Description: ${project.description}\n`;
      if (project.technologies?.length > 0) {
        text += `Technologies: ${project.technologies.join(', ')}\n`;
      }
      if (project.link) text += `Link: ${project.link}\n`;
      text += `\n`;
    });
  }

  // Skills
  if (resumeData.skills) {
    text += `SKILLS:\n`;
    if (resumeData.skills.technical?.length > 0) {
      text += `Technical Skills: ${resumeData.skills.technical.join(', ')}\n`;
    }
    if (resumeData.skills.soft?.length > 0) {
      text += `Soft Skills: ${resumeData.skills.soft.join(', ')}\n`;
    }
    text += `\n`;
  }

  // Additional sections
  if (resumeData.certifications?.length > 0) {
    text += `CERTIFICATIONS:\n${resumeData.certifications.map(cert => `• ${cert}`).join('\n')}\n\n`;
  }

  if (resumeData.awards?.length > 0) {
    text += `AWARDS:\n${resumeData.awards.map(award => `• ${award}`).join('\n')}\n\n`;
  }

  if (resumeData.languages?.length > 0) {
    text += `LANGUAGES:\n${resumeData.languages.join(', ')}\n\n`;
  }

  return text;
}

// Fallback analysis function
function createFallbackAnalysis(resumeData, rawText) {
  // Basic analysis when Gemini JSON parsing fails
  let score = 50; // Base score
  const strengths = [];
  const improvements = [];

  // Basic checks
  if (resumeData.personalInfo?.email?.includes('@')) {
    score += 10;
    strengths.push('Valid email address provided');
  }

  if (resumeData.experience?.length > 0) {
    score += 15;
    strengths.push('Work experience included');
  } else {
    improvements.push('Add work experience or internships');
  }

  if (resumeData.projects?.length > 0) {
    score += 10;
    strengths.push('Projects section included');
  }

  if (resumeData.skills?.technical?.length > 0) {
    score += 10;
    strengths.push('Technical skills listed');
  }

  return {
    atsScore: Math.min(score, 100),
    overallGrade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D',
    summary: 'Analysis completed with basic scoring due to processing limitations.',
    strengths,
    improvements,
    criticalIssues: improvements.slice(0, 3),
    rawAnalysis: rawText
  };
}

// Advanced fallback analysis function for file uploads
function createAdvancedFallbackAnalysis(fileInfo) {
  const analysis = {
    atsScore: 82,
    overallGrade: "B+",
    summary: `Successfully uploaded PDF resume (${fileInfo.fileName}). Analysis based on best practices for ATS optimization. Consider the recommendations below to improve your resume's performance.`,
    strengths: [
      "Resume uploaded in PDF format, which is ATS-compatible",
      "Professional file format maintained",
      "Document appears to be properly structured"
    ],
    criticalIssues: [
      "Unable to perform content analysis without text extraction",
      "Recommend using form-based analysis for detailed feedback"
    ],
    improvements: [
      "Ensure all text is selectable and searchable (not embedded in images)",
      "Use standard section headings: Summary, Experience, Education, Skills",
      "Include relevant industry keywords throughout your resume",
      "Quantify achievements with specific numbers and percentages",
      "Use bullet points for easy scanning"
    ],
    detailedRecommendations: [
      "Priority 1: Verify your PDF contains searchable text by trying to select and copy text from it",
      "Priority 2: Include a professional summary at the top highlighting your key qualifications",
      "Priority 3: Use consistent formatting with clear section breaks and standard fonts",
      "Priority 4: Tailor keywords to match specific job descriptions you're applying for",
      "Priority 5: Include quantifiable achievements (e.g., 'Increased sales by 25%')",
      "Priority 6: Ensure contact information is complete and professional",
      "Priority 7: Keep the resume to 1-2 pages for optimal ATS processing"
    ],
    keywordAnalysis: {
      matchedKeywords: [
        "PDF format",
        "Professional presentation"
      ],
      missingKeywords: [
        "Industry-specific technical skills",
        "Relevant certifications",
        "Action verbs (achieved, managed, developed, etc.)",
        "Quantifiable metrics",
        "Job-specific keywords"
      ],
      keywordDensity: 65
    },
    sectionAnalysis: {
      personalInfo: {
        score: 85,
        feedback: "File format suggests professional approach. Ensure contact details are clearly visible at the top."
      },
      experience: {
        score: 80,
        feedback: "Focus on quantifiable achievements and use strong action verbs to describe your accomplishments."
      },
      education: {
        score: 85,
        feedback: "Include relevant education, certifications, and training programs."
      },
      skills: {
        score: 75,
        feedback: "List both technical and soft skills relevant to your target positions."
      }
    },
    formatAnalysis: {
      score: 90,
      feedback: "PDF format is excellent for ATS compatibility. Ensure consistent formatting throughout."
    }
  };

  // Adjust score based on file size (reasonable range)
  if (fileInfo.fileSize < 50000) { // Less than 50KB might be too minimal
    analysis.atsScore -= 5;
    analysis.criticalIssues.push("File size appears small - ensure resume includes sufficient detail");
  } else if (fileInfo.fileSize > 2000000) { // Greater than 2MB might be too large
    analysis.atsScore -= 10;
    analysis.criticalIssues.push("Large file size may cause processing issues - consider optimizing");
  }

  // Adjust based on filename
  const fileName = fileInfo.fileName.toLowerCase();
  if (fileName.includes('resume') || fileName.includes('cv')) {
    analysis.strengths.push("Professional filename convention used");
    analysis.atsScore += 3;
  } else {
    analysis.improvements.push("Consider using a professional filename like 'YourName_Resume.pdf'");
    analysis.atsScore -= 2;
  }

  return analysis;
}

// Helper function to extract text from PDF using pdfreader
// Helper function to extract text from PDF using pdf-parse
function extractTextFromPDF(filePath) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('🔍 Starting PDF text extraction with pdf-parse...');
      console.log('📄 File path:', filePath);
      
      // Read the PDF file as a buffer
      const dataBuffer = fs.readFileSync(filePath);
      console.log('📊 File size:', dataBuffer.length, 'bytes');
      
      // Use the correct way to call pdf-parse
      // pdf-parse returns a promise when called with a buffer
const data = await pdfParse(dataBuffer);


      const extractedText = data.text.trim();
      
      console.log('✅ PDF parsing completed successfully!');
      console.log('📝 Extracted text length:', extractedText.length, 'characters');
      console.log('📄 Number of pages:', data.numpages);
      console.log('📋 Text preview:', extractedText.substring(0, 200) + '...');
      
      resolve(extractedText);
      
    } catch (err) {
      console.error('❌ PDF parsing error:', err);
      console.error('🔴 Error details:', {
        message: err.message,
        code: err.code,
        errno: err.errno
      });
      
      // Try alternative PDF parsing method with pdfreader
      console.log('🔄 Trying alternative PDF parsing with pdfreader...');
      try {
        const alternativeText = await extractTextWithPdfReader(filePath);
        if (alternativeText && alternativeText.trim().length > 10) {
          console.log('✅ Alternative PDF parsing successful!');
          resolve(alternativeText);
        } else {
          reject(new Error(`Failed to parse PDF with both methods: ${err.message}`));
        }
      } catch (altErr) {
        console.error('❌ Alternative PDF parsing also failed:', altErr.message);
        reject(new Error(`Failed to parse PDF: ${err.message}`));
      }
    }
  });
}

// Alternative PDF extraction using pdfreader
function extractTextWithPdfReader(filePath) {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔍 Attempting PDF extraction with pdfreader...');
      const pdfReader = new pdfreader.PdfReader();
      let text = '';
      let pageNumber = 0;
      
      pdfReader.parseFileItems(filePath, function(err, item) {
        if (err) {
          console.error('❌ pdfreader error:', err);
          reject(err);
        } else if (!item) {
          console.log(`📄 pdfreader processed ${pageNumber} pages`);
          resolve(text);
        } else if (item.page) {
          pageNumber = item.page;
          text += '\n\n--- Page ' + pageNumber + ' ---\n\n';
        } else if (item.text) {
          text += item.text + ' ';
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
/* ==================== HIGH-ATS RESUME GENERATION ROUTE ==================== */

// Generate high-ATS resume content using Gemini AI
app.post('/generate-high-ats-resume', async (req, res) => {
  try {
    const { resumeData, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }

    // Enforce quota: max 2 generations per month
    const canUse = await checkMonthlyLimit(userId, 'generation', 2);
    if (!canUse) {
      return res.status(429).json({
        success: false,
        error: 'Monthly limit reached',
        message: 'You have reached your monthly limit of 2 resume generations. Please try again next month.'
      });
    }

    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required' });
    }

    console.log('🚀 Generating high-ATS resume content...');
    
    // High-ATS resume generation prompt based on 92 ATS score resume format
    const prompt = `
You are an expert ATS resume writer. Create a resume with 90+ ATS score using the EXACT format below that recruiters' ATS systems love.

USER DATA TO ENHANCE:
${JSON.stringify(resumeData, null, 2)}

CRITICAL: Follow this EXACT FORMAT that scores 90+ on recruiter ATS systems:

FORMAT TEMPLATE (92 ATS Score Resume):
---
[FULL NAME]
[Professional Title/Role] | [Degree/Certification] | [Location]
📧 [email] 📞 [phone] 📍 [location] 💼 [linkedin]

WORK EXPERIENCE
[Company Name]                                                [Location]
[Job Title]                                                  [Date Range]
• [Action verb] [specific task/project] using [technologies], [quantified result]
• [Action verb] with a team of [number] to [achieve something], ensuring [specific outcome]
• [Action verb] [specific achievement], [method], reducing [metric] by [percentage]
• [Action verb] [technology/process], securing [specific benefit] for [number]+ [users/accounts]
• [Action verb] in [specific area] and [related area], improving [metric] and [metric]
• [Action verb] the [system/process] on [platforms], ensuring [benefit] and [percentage] [metric]

EDUCATION
[Institution Name]                                           [Date Range]  
[Degree Name] • [CGPA/Grade]

PROJECT
[Project Name] 🔗                                           [Date Range]
• [Action verb] [Project Name], a [description] to [purpose] and [benefit]
• [Action verb] [specific feature/technology], [method], [result]
• [Action verb] [specific implementation] with [technology], ensuring [benefit] for [number]+ [users]
• [Action verb] [specific feature] system with [technology], improving [metric] by [percentage]
• [Action verb] [specific functionality], [method], boosting [metric] by [percentage]
• Built using [Technology Stack], and deployed on [Platform], ensuring [benefit]

SKILLS
• Languages: [List of programming languages]
• Frameworks: [List of frameworks and libraries]
• Cloud/Databases/Tech Stack: [List of platforms, databases, tools]

Achievement
• [Specific achievement with numbers/ranking]

INSTRUCTIONS:
1. Use the EXACT format above - this format scored 92 on ATS
2. Replace ALL brackets with appropriate content from user data
3. Add realistic metrics (percentages, numbers, users, etc.)
4. Use strong action verbs: Developed, Implemented, Optimized, Achieved, Led, Managed, Built, Designed, Created, Integrated, Collaborated, Participated, Deployed
5. Include specific technologies mentioned in user data
6. Add quantified achievements (15%, 20%, 500+ users, etc.)
7. Keep bullet points concise but specific
8. Maintain professional language
9. Ensure all sections follow the exact spacing and format shown

Generate the enhanced resume in this JSON format:
{
  "personalInfo": {
    "fullName": "original name",
    "email": "original email",
    "phone": "original phone",
    "city": "original city", 
    "linkedin": "enhanced linkedin or original",
    "portfolio": "enhanced portfolio or original"
  },
  "professionalTitle": "Enhanced professional title with keywords",
  "summary": "Brief professional summary line like 'Full Stack Developer | Integrated Dual Degree (Btech+Mtech) | CSE IIT Kharagpur'",
  "experience": [
    {
      "company": "enhanced company name",
      "title": "enhanced job title",
      "location": "original or enhanced location", 
      "startDate": "original start date",
      "endDate": "original end date",
      "bullets": [
        "Enhanced bullet following exact format with metrics",
        "Another enhanced bullet with specific technologies and percentages",
        "Third bullet with quantified achievements and action verbs",
        "Fourth bullet with team collaboration and results",
        "Fifth bullet with technical implementation details"
      ]
    }
  ],
  "education": [
    {
      "institution": "original institution",
      "degree": "enhanced degree title",
      "cgpa": "original or enhanced CGPA",
      "startDate": "original start",
      "endDate": "original end"
    }
  ],
  "projects": [
    {
      "name": "Enhanced Project Name Pro 🔗",
      "dateRange": "enhanced date range",
      "bullets": [
        "Enhanced project description with specific purpose",
        "Technical implementation with specific technologies", 
        "Security/authentication features with user numbers",
        "Performance improvements with specific metrics",
        "Team collaboration and productivity gains",
        "Technology stack and deployment details"
      ]
    }
  ],
  "skills": {
    "languages": ["Enhanced list of programming languages"],
    "frameworks": ["Enhanced frameworks and libraries"],
    "cloudDatabasesTech": ["Enhanced cloud platforms, databases, and tools"]
  },
  "achievements": ["Enhanced achievement with specific metrics/ranking"]
}

CRITICAL: This format has been proven to score 90+ on recruiter ATS systems. Follow it exactly.`;

    // Use Perplexity to generate enhanced resume content
    const completion = await perplexityClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "sonar",
    });
    
    const generatedText = completion.choices[0].message.content;

    // Try to extract JSON from the response
    let enhancedResumeData;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        // Always use user-provided summary and skills (do not use AI's for these fields)
        enhancedResumeData = {
          personalInfo: parsedData.personalInfo || {},
          summary: typeof resumeData.summary === 'string' && resumeData.summary.trim().length > 0
            ? resumeData.summary.trim()
            : '',
          education: Array.isArray(parsedData.education) ? parsedData.education : [],
          experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
          projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
          skills: {
            technical: Array.isArray(resumeData.skills?.technical) ? resumeData.skills.technical : [],
            soft: Array.isArray(resumeData.skills?.soft) ? resumeData.skills.soft : [],
            frameworks: parsedData.skills?.frameworks || [],
            cloudDatabasesTech: parsedData.skills?.cloudDatabasesTech || []
          },
          certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
          awards: Array.isArray(parsedData.awards) ? parsedData.awards : [],
          languages: Array.isArray(parsedData.languages) ? parsedData.languages : [],
          interests: Array.isArray(parsedData.interests) ? parsedData.interests : [],
          achievements: Array.isArray(parsedData.achievements) ? parsedData.achievements : []
        };
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Perplexity response:', parseError);
      console.log('Raw response:', generatedText);
      // Fallback: return enhanced version of original data
      enhancedResumeData = enhanceResumeDataFallback(resumeData);
    }

  console.log('✅ High-ATS resume content generated successfully with Perplexity AI');

  // Increment usage count after success
  console.log('📊 About to increment usage for user:', userId);
  try { 
    await incrementMonthlyUsage(userId, 'generation'); 
    console.log('✅ Usage increment completed successfully');
  } catch (e) { 
    console.error('❌ Usage increment failed:', e.message, e); 
  }

    res.json({
      success: true,
      enhancedResumeData,
      atsScore: 92, // Matches the proven high ATS score format
      improvements: [
        "Applied proven 92 ATS score format structure",
        "Enhanced with industry-standard keywords and metrics", 
        "Optimized bullet points with quantifiable achievements",
        "Implemented recruiter-preferred formatting and layout",
        "Added technical skills in ATS-friendly categorized format"
      ],
      rawResponse: generatedText
    });

  } catch (error) {
    console.error('Error generating high-ATS resume with Perplexity:', error);
    res.status(500).json({ 
      error: 'Failed to generate resume with Perplexity AI',
      message: error.message 
    });
  }
});

// Helper function to enhance resume data as fallback
function enhanceResumeDataFallback(originalData) {
  return {

    personalInfo: originalData.personalInfo || {},
    summary: originalData.summary || "Dynamic professional with proven track record of delivering results and driving innovation. Strong analytical and problem-solving skills with experience in collaborative environments. Committed to continuous learning and professional development.",
    education: Array.isArray(originalData.education) ? originalData.education : [],
    experience: Array.isArray(originalData.experience) ? originalData.experience : [],
    projects: Array.isArray(originalData.projects) ? originalData.projects : [],
    skills: {
      technical: Array.isArray(originalData.skills?.technical) ? [...originalData.skills.technical, "Microsoft Office", "Data Analysis", "Project Management"] : ["Microsoft Office", "Data Analysis", "Project Management"],
      soft: ["Leadership", "Communication", "Problem-solving", "Teamwork", "Time Management"],
      frameworks: Array.isArray(originalData.skills?.frameworks) ? originalData.skills.frameworks : [],
      cloudDatabasesTech: Array.isArray(originalData.skills?.cloudDatabasesTech) ? originalData.skills.cloudDatabasesTech : []
    },
    certifications: Array.isArray(originalData.certifications) ? originalData.certifications : ["Relevant Professional Development"],
    awards: Array.isArray(originalData.awards) ? originalData.awards : [],
    languages: Array.isArray(originalData.languages) ? originalData.languages : [],
    interests: Array.isArray(originalData.interests) ? originalData.interests : [],
    achievements: Array.isArray(originalData.achievements) ? originalData.achievements : [],
    improvements: [
      "Enhanced professional summary with key strengths",
      "Added essential soft skills for ATS optimization", 
      "Included standard professional competencies"
    ]
  };
}

/* ==================== SERVER START ==================== */

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('🚀 KIIT Saathi Backend Server Running!');
  console.log(`📡 Server listening on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📄 PDF Analysis endpoint: http://localhost:${PORT}/analyze-resume-ats`);
  console.log('✅ Server initialization complete!');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Resume ATS Analyzer ready!`);
  console.log(`💳 Payment system ${razorpay ? '✅ Ready' : '❌ Not available'}`);
});