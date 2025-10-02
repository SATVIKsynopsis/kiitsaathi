-- Insert ebook records
INSERT INTO public.ebooks (title, subject, semester, branch, year, uploaded_by, upload_date, pdf_url, views)
VALUES 
  ('Computer Networks by Andrew S. Tanenbaum', 'Computer Networks', '5th', 'CSE', '2024', 'Admin', '2024-01-15', '/ebooks/Computer_Networks_Tanenbaum.pdf', 0),
  ('Data Mining: Concepts and Techniques by Han and Kamber', 'Data Mining', '6th', 'CSE', '2024', 'Admin', '2024-01-15', '/ebooks/Data_Mining_Han_Kamber.pdf', 0),
  ('Digital Image Processing', 'Digital Image Processing', '6th', 'CSE', '2024', 'Admin', '2024-01-15', '/ebooks/Digital_Image_Processing.pdf', 0),
  ('Introduction to Algorithms by Cormen', 'Algorithms Design & Analysis', '4th', 'CSE', '2024', 'Admin', '2024-01-15', '/ebooks/Introduction_to_Algorithms_Cormen.pdf', 0);