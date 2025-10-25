import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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
export default router;
