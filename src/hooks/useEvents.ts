import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Event, EventInsert, EventUpdate } from '@/types/database';

export const useEvents = (publishedOnly = false) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar eventos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: EventInsert) => {
    try {
      const { error } = await supabase
        .from('events')
        .insert([eventData]);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!",
      });
      
      await fetchEvents();
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar evento",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateEvent = async (id: string, eventData: EventUpdate) => {
    try {
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso!",
      });
      
      await fetchEvents();
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso!",
      });
      
      await fetchEvents();
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir evento",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [publishedOnly]);

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};