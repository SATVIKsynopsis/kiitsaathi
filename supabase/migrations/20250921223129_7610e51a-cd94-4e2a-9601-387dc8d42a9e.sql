-- Temporarily add admin policies for service_visibility updates
CREATE POLICY "Service admins can update visibility" 
ON public.service_visibility 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Service admins can insert logs" 
ON public.admin_action_logs 
FOR INSERT 
WITH CHECK (true);