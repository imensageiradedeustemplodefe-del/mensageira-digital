import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyVerse {
  id: string;
  verse_text: string;
  verse_reference: string;
  book_name: string;
  chapter: number;
  verse_number: string;
  category: string;
}

interface UseDailyVersesReturn {
  verse: DailyVerse | null;
  isLoading: boolean;
  error: string | null;
  refreshVerse: () => Promise<void>;
  getDailyVerse: () => Promise<void>;
}

export const useDailyVerses = (): UseDailyVersesReturn => {
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allVerses, setAllVerses] = useState<DailyVerse[]>([]);

  // Carregar todos os versículos uma vez
  useEffect(() => {
    loadAllVerses();
  }, []);

  const loadAllVerses = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;
      setAllVerses(data || []);
    } catch (err) {
      console.error('Erro ao carregar versículos:', err);
      setError('Erro ao carregar versículos');
    }
  };

  // Função para obter versículo do dia baseado na data
  const getDailyVerse = async () => {
    if (allVerses.length === 0) {
      await loadAllVerses();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Criar um índice baseado na data atual para ser consistente
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      
      // Usar o dia do ano mais o ano para criar mais variabilidade
      const seed = dayOfYear + (today.getFullYear() * 365);
      const verseIndex = seed % allVerses.length;
      
      // Simular um pequeno delay para dar feedback visual
      setTimeout(() => {
        setVerse(allVerses[verseIndex]);
        setIsLoading(false);
      }, 300);

    } catch (err) {
      console.error('Erro ao obter versículo do dia:', err);
      setError('Erro ao obter versículo do dia');
      setIsLoading(false);
    }
  };

  // Função para obter um versículo aleatório (para refresh)
  const refreshVerse = async () => {
    if (allVerses.length === 0) {
      await loadAllVerses();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Obter versículos recentes do localStorage para evitar repetições
      const recentVersesStr = localStorage.getItem('recentVerses');
      const recentVerses: string[] = recentVersesStr ? JSON.parse(recentVersesStr) : [];
      
      // Filtrar versículos que não foram mostrados recentemente
      const availableVerses = allVerses.filter(v => !recentVerses.includes(v.id));
      const versesToChooseFrom = availableVerses.length > 0 ? availableVerses : allVerses;
      
      // Selecionar versículo aleatório
      const randomIndex = Math.floor(Math.random() * versesToChooseFrom.length);
      const selectedVerse = versesToChooseFrom[randomIndex];
      
      // Atualizar lista de versículos recentes (manter apenas os últimos 20)
      const updatedRecent = [selectedVerse.id, ...recentVerses.slice(0, 19)];
      localStorage.setItem('recentVerses', JSON.stringify(updatedRecent));
      
      // Simular um pequeno delay para dar feedback visual
      setTimeout(() => {
        setVerse(selectedVerse);
        setIsLoading(false);
      }, 500);

    } catch (err) {
      console.error('Erro ao atualizar versículo:', err);
      setError('Erro ao atualizar versículo');
      setIsLoading(false);
    }
  };

  return {
    verse,
    isLoading,
    error,
    refreshVerse,
    getDailyVerse
  };
};