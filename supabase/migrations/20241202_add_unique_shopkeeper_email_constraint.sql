-- Add unique constraint to prevent duplicate shopkeeper emails
ALTER TABLE shopkeeper_emails 
ADD CONSTRAINT unique_shopkeeper_email 
UNIQUE (email);

-- Add index for better performance on email lookups
CREATE INDEX IF NOT EXISTS idx_shopkeeper_emails_email ON shopkeeper_emails(email);