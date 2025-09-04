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

  const createPrayerRequest = async (requestData: PrayerRequestInsert) => {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .insert([requestData]);

      if (error) throw error;
      
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
  };
};