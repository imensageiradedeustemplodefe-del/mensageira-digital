-- Add DELETE policy for admins on event_registrations table
CREATE POLICY "Admins can delete registrations"
ON event_registrations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));