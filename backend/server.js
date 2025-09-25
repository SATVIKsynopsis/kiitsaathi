import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const app = express();

const allowedOrigins = [
  "http://localhost:8080",
  "http://10.5.83.177:8080",
  "http://localhost:5173",
  "https://kiitsaathi.vercel.app",
  "https://kiitsaathi-git-satvik-aditya-sharmas-projects-3c0e452b.vercel.app"
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

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

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
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

// Supabase instance
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



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
          .from('lost_found')
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

/* ---------------------- SERVER ---------------------- */
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
