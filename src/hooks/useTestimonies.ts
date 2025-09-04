import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Testimony, TestimonyInsert, TestimonyUpdate } from '@/types/database';

export const useTestimonies = (approvedOnly = false) => {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTestimonies = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('testimonies')
        .select('*')
        .order('created_at', { ascending: false });

      if (approvedOnly) {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTestimonies(data || []);
    } catch (error) {
      console.error('Error fetching testimonies:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar testemunhos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestimony = async (testimonyData: TestimonyInsert) => {
    try {
      const { error } = await supabase
        .from('testimonies')
        .insert([testimonyData]);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Testemunho enviado com sucesso!",
      });
      
      await fetchTestimonies();
      return true;
    } catch (error) {
      console.error('Error creating testimony:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar testemunho",
        variant: "destructive",
      });
      return false;
    }
  };

  const approveTestimony = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonies')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Testemunho aprovado!",
      });
      
      await fetchTestimonies();
      return true;
    } catch (error) {
      console.error('Error approving testimony:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar testemunho",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTestimony = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Testemunho excluído!",
      });
      
      await fetchTestimonies();
      return true;
    } catch (error) {
      console.error('Error deleting testimony:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir testemunho",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTestimonies();
  }, [approvedOnly]);

  return {
    testimonies,
    loading,
    fetchTestimonies,
    createTestimony,
    approveTestimony,
    deleteTestimony,
  };
};