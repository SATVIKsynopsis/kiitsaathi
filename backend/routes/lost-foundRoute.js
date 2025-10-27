import express from "express";
import crypto from 'crypto';

// ✅ Export a function that accepts supabase and razorpay instances
const createLostFoundRoutes = (supabase, razorpay, authenticateToken) => {
  const router = express.Router();

  // ✅ Create order for Lost & Found contact unlock (amount expected in **paise**)
  router.post('/create-lost-found-order', authenticateToken, async (req, res) => {
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
  router.post('/verify-lost-found-payment', authenticateToken, async (req, res) => {
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
  router.get('/has-paid-lost-found-contact', authenticateToken, async (req, res) => {
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
  router.post('/submit-lost-item-application', authenticateToken, async (req, res) => {
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
        if (insertError.code === '23505' || `${insertError.message}`.includes('unique_application_per_user_per_item')) {
          return res.status(409).json({
            error: 'You have already applied for this lost item.',
            type: 'duplicate',
          });
        }
        console.error('Database insert error:', insertError);
        return res.status(500).json({ error: 'Failed to save application' });
      }

      return res.json({
        success: true,
        message: 'Application submitted successfully',
        applicationId: applicationData.id,
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      return res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // ✅ Create order for unlocking application contact details
  router.post('/create-application-unlock-order', authenticateToken, async (req, res) => {
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
  router.post('/verify-application-unlock-payment', authenticateToken, async (req, res) => {
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
  router.get('/api/lostfound', authenticateToken, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('lost_and_found_items')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.json({ items: data || [] });
    } catch (err) {
      console.error('Error fetching lost & found items:', err);
      return res.status(500).json({ error: 'Failed to fetch items' });
    }
  });

  // ✅ POST - Add a new Lost/Found item (SECURED)
  router.post('/api/lostfound', authenticateToken, async (req, res) => {
    try {
      const user_id = req.user_id;
      const { ...itemData } = req.body;

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

      if (error) throw error;

      return res.json({ item: data });
    } catch (err) {
      console.error('Error adding lost & found item:', err);
      return res.status(500).json({ error: 'Failed to add item' });
    }
  });

  // ✅ PATCH - Update an existing Lost/Found item (SECURED)
  router.patch('/api/lostfound/:id', authenticateToken, async (req, res) => {
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

  return router; // ✅ Return the router
};

export default createLostFoundRoutes;