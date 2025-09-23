-- Create policy_acceptances table for managing user policy agreements
CREATE TABLE public.policy_acceptances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  privacy_policy_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_policy_version TEXT NOT NULL DEFAULT '1.0',
  terms_conditions_accepted BOOLEAN NOT NULL DEFAULT false,
  terms_conditions_version TEXT NOT NULL DEFAULT '1.0',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.policy_acceptances ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own policy acceptances" 
ON public.policy_acceptances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own policy acceptances" 
ON public.policy_acceptances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own policy acceptances" 
ON public.policy_acceptances 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_policy_acceptances_updated_at
BEFORE UPDATE ON public.policy_acceptances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();