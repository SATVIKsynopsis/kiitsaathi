import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:8080', 'http://10.5.83.177:8080'],
  credentials: true
}));

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Supabase instance
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ---------------------- ROUTES ---------------------- */

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

/* ---------------------- SERVER ---------------------- */
app.listen(3001, () => console.log('Server running on port 3001'));
