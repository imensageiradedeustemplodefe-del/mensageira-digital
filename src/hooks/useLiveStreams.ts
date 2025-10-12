import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LiveStream, LiveStreamInsert, LiveStreamUpdate } from '@/types/database';

export const useLiveStreams = (activeOnly = false) => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStreams = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('live_streams')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setStreams(data || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar transmissões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStream = async (streamData: LiveStreamInsert) => {
    try {
      const { error } = await supabase
        .from('live_streams')
        .insert([streamData]);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Transmissão criada com sucesso!",
      });
      
      await fetchStreams();
      return true;
    } catch (error) {
      console.error('Error creating stream:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar transmissão",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateStream = async (id: string, streamData: LiveStreamUpdate) => {
    try {
      const { error } = await supabase
        .from('live_streams')
        .update(streamData)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Transmissão atualizada com sucesso!",
      });
      
      await fetchStreams();
      return true;
    } catch (error) {
      console.error('Error updating stream:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar transmissão",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteStream = async (id: string) => {
    try {
      const { error } = await supabase
        .from('live_streams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Transmissão excluída com sucesso!",
      });
      
      await fetchStreams();
      return true;
    } catch (error) {
      console.error('Error deleting stream:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir transmissão",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleLiveStatus = async (id: string, isLive: boolean) => {
    try {
      const updates: any = {
        is_live: isLive,
      };

      if (isLive) {
        updates.started_at = new Date().toISOString();
        updates.ended_at = null;
      } else {
        updates.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('live_streams')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Transmissão ${isLive ? 'iniciada' : 'finalizada'}!`,
      });
      
      await fetchStreams();
      return true;
    } catch (error) {
      console.error('Error updating live status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da transmissão",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchStreams();
  }, [activeOnly]);

  return {
    streams,
    loading,
    fetchStreams,
    createStream,
    updateStream,
    deleteStream,
    toggleLiveStatus,
  };
};