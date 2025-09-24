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

// Fixed CORS configuration
app.use(cors());

app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  next(err);
});




// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'KIIT Saathi Backend is running',
    timestamp: new Date().toISOString(),
    environment: {
      supabase: process.env.SUPABASE_URL ? 'configured' : 'missing',
      razorpay: process.env.RAZORPAY_KEY_ID ? 'configured' : 'missing'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Add a basic health check endpoint
app.get('/', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    env: {
      supabase: process.env.SUPABASE_URL ? 'configured' : 'missing',
      razorpay: process.env.RAZORPAY_KEY_ID ? 'configured' : 'missing'
    }
  });
});

app.get('/health', (req, res) => {
  console.log('🏥 Health endpoint requested');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: {
      supabase: process.env.SUPABASE_URL ? 'configured' : 'missing',
      razorpay: process.env.RAZORPAY_KEY_ID ? 'configured' : 'missing'
    }
  });
});

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



// Create order for Lost & Found contact unlock
app.post('/create-lost-found-order', async (req, res) => {
  console.log('🚀 =================================');
  console.log('🚀 LOST & FOUND ORDER REQUEST START');
  console.log('� =================================');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('📨 Request Body:', JSON.stringify(req.body, null, 2));
  console.log('🌐 Request Headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    const { amount, itemId, itemTitle, itemPosterEmail, payerUserId, receipt } = req.body;

    console.log('🔍 Extracted Fields:');
    console.log('  💰 Amount:', amount);
    console.log('  🆔 Item ID:', itemId);
    console.log('  📝 Item Title:', itemTitle);
    console.log('  📧 Poster Email:', itemPosterEmail);
    console.log('  👤 Payer User ID:', payerUserId);
    console.log('  🧾 Receipt:', receipt);

    // Validate required fields
    if (!amount || !itemId || !itemTitle || !payerUserId) {
      console.log('❌ VALIDATION FAILED - Missing required fields');
      console.log('  💰 Amount present:', !!amount);
      console.log('  🆔 Item ID present:', !!itemId);
      console.log('  📝 Item Title present:', !!itemTitle);
      console.log('  👤 Payer User ID present:', !!payerUserId);
      
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['amount', 'itemId', 'itemTitle', 'payerUserId'],
        received: { amount: !!amount, itemId: !!itemId, itemTitle: !!itemTitle, payerUserId: !!payerUserId }
      });
    }

    console.log('✅ Field validation passed');
    console.log('⏳ Step 1: Checking for existing payment...');
    
    // Check for existing payment in orders table
    const { data: existingPayment, error: checkError } = await supabase
      .from('orders')
      .select('id, created_at, payment_status')
      .eq('user_id', payerUserId)
      .eq('service_name', 'LostAndFoundContact')
      .eq('payment_status', 'completed')
      .contains('booking_details', { item_id: itemId })
      .limit(1);

    console.log('🔍 Existing payment query result:');
    console.log('  📊 Data:', JSON.stringify(existingPayment, null, 2));
    console.log('  ❌ Error:', JSON.stringify(checkError, null, 2));

    if (checkError) {
      console.error('❌ STEP 1 FAILED - Error checking existing payment:', checkError);
      console.error('  🔍 Error details:', JSON.stringify(checkError, null, 2));
      return res.status(500).json({ 
        error: 'Failed to validate payment status', 
        details: checkError,
        step: 'checking_existing_payment'
      });
    }

    if (existingPayment && existingPayment.length > 0) {
      console.log('❌ STEP 1 FAILED - Payment already exists');
      console.log('  📊 Existing payment data:', JSON.stringify(existingPayment, null, 2));
      return res.status(400).json({ 
        error: 'Payment already completed', 
        message: 'You have already unlocked contact details for this item',
        existingPayment: existingPayment[0]
      });
    }

    console.log('✅ Step 1 completed - No existing payment found');
    console.log('⏳ Step 2: Fetching item details...');
    
    // Get the item details to check if user is the poster and item type
    const { data: itemData, error: itemError } = await supabase
      .from('lost_and_found_items')
      .select('contact_email, item_type, title, id')
      .eq('id', itemId)
      .single();

    console.log('🔍 Item fetch query result:');
    console.log('  📊 Data:', JSON.stringify(itemData, null, 2));
    console.log('  ❌ Error:', JSON.stringify(itemError, null, 2));

    if (itemError) {
      console.error('❌ STEP 2 FAILED - Error fetching item details:', itemError);
      console.error('  🔍 Error details:', JSON.stringify(itemError, null, 2));
      return res.status(500).json({ 
        error: 'Failed to validate item', 
        details: itemError,
        step: 'fetching_item_details'
      });
    }

    console.log('✅ Step 2 completed - Item details fetched');
    console.log('⏳ Step 3: Fetching user details...');
    
    // Get user's email to check if they're the poster
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(payerUserId);
    
    console.log('🔍 User fetch query result:');
    console.log('  📊 User data:', userData ? { id: userData.user?.id, email: userData.user?.email } : null);
    console.log('  ❌ Error:', JSON.stringify(userError, null, 2));

    if (userError) {
      console.error('❌ STEP 3 FAILED - Error fetching user details:', userError);
      console.error('  🔍 Error details:', JSON.stringify(userError, null, 2));
      return res.status(500).json({ 
        error: 'Failed to validate user', 
        details: userError,
        step: 'fetching_user_details'
      });
    }

    console.log('✅ Step 3 completed - User details fetched');
    console.log('⏳ Step 4: Checking if user is item poster...');
    
    // Prevent users from paying for their own items (both lost and found)
    const userEmail = userData.user?.email;
    const posterEmail = itemData.contact_email;
    
    console.log('🔍 Email comparison:');
    console.log('  👤 User email:', userEmail);
    console.log('  📧 Poster email:', posterEmail);
    console.log('  🔍 Match:', userEmail === posterEmail);

    if (posterEmail === userEmail) {
      console.log('❌ STEP 4 FAILED - User trying to unlock their own item');
      return res.status(400).json({ 
        error: 'Cannot unlock own item', 
        message: 'You cannot pay to unlock contact details for your own posted item',
        debug: { userEmail, posterEmail }
      });
    }

    console.log('✅ Step 4 completed - User is not the poster');
    console.log('⏳ Step 5: Creating Razorpay order...');
    
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

    console.log('🔍 Razorpay order options:', JSON.stringify(options, null, 2));
    
    const order = await razorpay.orders.create(options);
    
    console.log('✅ Step 5 completed - Razorpay order created successfully');
    console.log('📦 Order details:', JSON.stringify(order, null, 2));
    console.log('🚀 =================================');
    console.log('🚀 LOST & FOUND ORDER REQUEST END');
    console.log('🚀 =================================');
    
    res.json(order);

  } catch (error) {
    console.error('💥 =================================');
    console.error('💥 CRITICAL ERROR IN ORDER CREATION');
    console.error('💥 =================================');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error cause:', error.cause);
    console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('💥 =================================');
    
    res.status(500).json({ 
      error: 'Failed to create order', 
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
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
const PORT = process.env.PORT || 3001;

console.log('🚀 =================================');
console.log('🚀 SERVER STARTUP');
console.log('🚀 =================================');
console.log('⏰ Timestamp:', new Date().toISOString());
console.log('🌐 Port:', PORT);
console.log('🔧 Environment Variables Status:');
console.log('  📊 NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('  🗄️  SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('  🔑 SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '❌ Missing');
console.log('  💳 RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? `✅ Set (${process.env.RAZORPAY_KEY_ID.substring(0, 10)}...)` : '❌ Missing');
console.log('  🔐 RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? `✅ Set (${process.env.RAZORPAY_KEY_SECRET.substring(0, 10)}...)` : '❌ Missing');
console.log('  📧 RESEND_API_KEY:', process.env.RESEND_API_KEY ? `✅ Set (${process.env.RESEND_API_KEY.substring(0, 10)}...)` : '❌ Missing');

app.listen(PORT, () => {
  console.log('🎉 =================================');
  console.log('🎉 SERVER SUCCESSFULLY STARTED');
  console.log('🎉 =================================');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log('📡 Available endpoints:');
  console.log('  GET  / (health check)');
  console.log('  GET  /health');
  console.log('  POST /create-lost-found-order');
  console.log('  POST /verify-lost-found-payment');
  console.log('  GET  /has-paid-lost-found-contact');
  console.log('🎉 =================================');
});
