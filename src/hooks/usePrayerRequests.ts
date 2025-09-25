import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PrayerRequest, PrayerRequestInsert, PublicPrayerRequest } from '@/types/database';

export const usePrayerRequests = (approvedOnly = false) => {
  const [requests, setRequests] = useState<(PrayerRequest | PublicPrayerRequest)[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPrayerRequests = async () => {
    try {
      setLoading(true);
      let query;
      
      if (approvedOnly) {
        // Use the secure view for public access - only shows sanitized data
        query = supabase
          .from('public_prayer_requests')
          .select('*')
          .order('created_at', { ascending: false });
      } else {
        // Admin access - use full table with all data
        query = supabase
          .from('prayer_requests')
          .select('*')
          .order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pedidos de oração",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPrayerRequest = async (requestData: PrayerRequestInsert & { email?: string; phone?: string }) => {
    try {
      // Separate contact info from main request data
      const { email, phone, ...mainRequestData } = requestData;
      
      // Insert main prayer request (without sensitive data)
      const { data: insertedRequest, error: insertError } = await supabase
        .from('prayer_requests')
        .insert([mainRequestData])
        .select()
        .single();

      if (insertError) throw insertError;
      
      // If there's contact info, encrypt and store it separately
      if ((email && email.trim()) || (phone && phone.trim())) {
        try {
          const { error: encryptError } = await supabase.functions.invoke('encrypt-contact-data', {
            body: {
              action: 'encrypt_and_store',
              prayer_request_id: insertedRequest.id,
              email: email?.trim() || null,
              phone: phone?.trim() || null
            }
          });
          
          if (encryptError) {
            console.warn('Failed to encrypt contact data:', encryptError);
            // Don't fail the entire request, but log the issue
          }
        } catch (contactError) {
          console.warn('Contact encryption failed:', contactError);
          // Continue with the prayer request even if contact encryption fails
        }
      }
      
      toast({
        title: "Sucesso",
        description: "Pedido de oração enviado com sucesso!",
      });
      
      await fetchPrayerRequests();
      return true;
    } catch (error) {
      console.error('Error creating prayer request:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar pedido de oração",
        variant: "destructive",
      });
      return false;
    }
  };

  const approvePrayerRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({ 
          is_approved: true,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Pedido de oração aprovado!",
      });
      
      await fetchPrayerRequests();
      return true;
    } catch (error) {
      console.error('Error approving prayer request:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar pedido",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePrayerRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Pedido de oração excluído!",
      });
      
      await fetchPrayerRequests();
      return true;
    } catch (error) {
      console.error('Error deleting prayer request:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir pedido",
        variant: "destructive",
      });
      return false;
    }
  };

  // Function to decrypt and retrieve contact info (admin only)
  const getContactInfo = async (prayerRequestId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('encrypt-contact-data', {
        body: {
          action: 'decrypt_and_retrieve',
          prayer_request_id: prayerRequestId
        }
      });
      
      if (error) {
        console.error('Error retrieving contact info:', error);
        return { email: null, phone: null };
      }
      
      return data || { email: null, phone: null };
    } catch (error) {
      console.error('Error decrypting contact info:', error);
      return { email: null, phone: null };
    }
  };

  useEffect(() => {
    fetchPrayerRequests();
  }, [approvedOnly]);

  return {
    requests,
    loading,
    fetchPrayerRequests,
    createPrayerRequest,
    approvePrayerRequest,
    deletePrayerRequest,
    getContactInfo,
  };
};