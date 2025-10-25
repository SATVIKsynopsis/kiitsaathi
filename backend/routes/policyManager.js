import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ✅ Get user policy acceptance (SECURED)
router.get('/api/policy', authenticateToken, async (req, res) => {
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
router.post('/api/policy/privacy', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ From token
    const { privacy_policy_version } = req.body;

    if (!privacy_policy_version) {
      return res.status(400).json({ error: 'Missing privacy_policy_version' });
    }

    const updateData = {
      user_id,
      privacy_policy_accepted: true,
      privacy_policy_version,
      last_updated: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('policy_acceptances')
      .upsert(updateData, { onConflict: 'user_id' });

    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    console.error('Error accepting privacy policy:', err);
    return res.status(500).json({ error: 'Failed to accept privacy policy' });
  }
});


// ✅ Accept Terms & Conditions (SECURED)
router.post('/api/policy/terms', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user_id; // ✅ From token
    const { terms_conditions_version } = req.body;

    if (!terms_conditions_version) {
      return res.status(400).json({ error: 'Missing terms_conditions_version' });
    }

    const updateData = {
      user_id,
      terms_conditions_accepted: true,
      terms_conditions_version,
      last_updated: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('policy_acceptances')
      .upsert(updateData, { onConflict: 'user_id' });

    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    console.error('Error accepting terms:', err);
    return res.status(500).json({ error: 'Failed to accept terms' });
  }
});

export default router;