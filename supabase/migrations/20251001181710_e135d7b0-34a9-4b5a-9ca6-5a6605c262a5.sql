-- Add missing resale-saathi service to visibility table
INSERT INTO public.service_visibility (service_id, visible, replaced_text)
VALUES ('resale-saathi', true, NULL)
ON CONFLICT (service_id) DO NOTHING;

-- Verify all required services exist
INSERT INTO public.service_visibility (service_id, visible, replaced_text)
VALUES 
  ('kiit-saathi-ai-assistant', true, NULL),
  ('study-material', true, NULL),
  ('lost-and-found-portal', true, NULL),
  ('campus-map', true, NULL),
  ('kiit-societies-fests-sports', true, NULL),
  ('resume-saathi', true, NULL),
  ('split-saathi', true, NULL),
  ('sgpa-cgpa-calculator', true, NULL),
  ('printout-on-demand', true, NULL),
  ('resale-saathi', true, NULL),
  ('senior-connect', true, NULL),
  ('handwritten-assignments', true, NULL),
  ('tutoring-counselling', true, NULL),
  ('campus-tour-booking', true, NULL),
  ('carton-packing-hostel-transfers', true, NULL),
  ('book-buyback-resale', true, NULL),
  ('kiit-saathi-celebrations', true, NULL),
  ('kiit-saathi-meetups', true, NULL),
  ('food-micro-essentials-delivery', true, NULL)
ON CONFLICT (service_id) DO NOTHING;