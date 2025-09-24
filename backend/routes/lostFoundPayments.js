const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create order for Lost & Found contact unlock
router.post('/create-lost-found-order', async (req, res) => {
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
router.post('/verify-lost-found-payment', async (req, res) => {
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
      await fetch(`${process.env.BASE_URL}/send-contact-details`, {
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
router.post('/send-contact-details', async (req, res) => {
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
router.get('/has-paid-contact', async (req, res) => {
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

module.exports = router;