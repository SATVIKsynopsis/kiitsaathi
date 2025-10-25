-- Add missing services to service_visibility table
-- These services exist in code but not in database yet

INSERT INTO public.service_visibility (service_id, visible, replaced_text, updated_at) 
VALUES 
  ('course-faculty-details', true, NULL, NOW()),
  ('donation-saathi', true, NULL, NOW()),
  ('student-mental-wellness', true, NULL, NOW())
ON CONFLICT (service_id) DO NOTHING;