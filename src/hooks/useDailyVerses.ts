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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allVerses, setAllVerses] = useState<DailyVerse[]>([]);

  // Carregar todos os versículos uma vez e o versículo do dia imediatamente
  useEffect(() => {
    loadAllVersesAndDailyVerse();
  }, []);

  const loadAllVersesAndDailyVerse = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;
      
      const verses = data || [];
      setAllVerses(verses);
      
      if (verses.length > 0) {
        // Selecionar versículo do dia imediatamente
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const seed = dayOfYear + (today.getFullYear() * 365);
        const verseIndex = seed % verses.length;
        
        setVerse(verses[verseIndex]);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao carregar versículos:', err);
      setError('Erro ao carregar versículos');
      setIsLoading(false);
    }
  };

  // Função para obter versículo do dia baseado na data
  const getDailyVerse = async () => {
    if (allVerses.length === 0) {
      await loadAllVersesAndDailyVerse();
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
      
      setVerse(allVerses[verseIndex]);
      setIsLoading(false);

    } catch (err) {
      console.error('Erro ao obter versículo do dia:', err);
      setError('Erro ao obter versículo do dia');
      setIsLoading(false);
    }
  };

  // Função para obter um versículo aleatório (para refresh)
  const refreshVerse = async () => {
    if (allVerses.length === 0) {
      await loadAllVersesAndDailyVerse();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Obter versículos recentes do localStorage para evitar repetições (últimos 30 dias)
      const recentVersesStr = localStorage.getItem('recentVerses');
      const recentData = recentVersesStr ? JSON.parse(recentVersesStr) : { verses: [], lastClean: Date.now() };
      
      // Limpar cache se passou mais de 30 dias
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (recentData.lastClean < thirtyDaysAgo) {
        recentData.verses = [];
        recentData.lastClean = Date.now();
      }
      
      // Filtrar versículos que não foram mostrados recentemente (últimos 50% dos versículos)
      const maxRecent = Math.floor(allVerses.length * 0.5);
      const recentVerses = recentData.verses.slice(0, maxRecent);
      const availableVerses = allVerses.filter(v => !recentVerses.includes(v.id));
      const versesToChooseFrom = availableVerses.length > 0 ? availableVerses : allVerses;
      
      // Selecionar versículo aleatório
      const randomIndex = Math.floor(Math.random() * versesToChooseFrom.length);
      const selectedVerse = versesToChooseFrom[randomIndex];
      
      // Atualizar lista de versículos recentes
      const updatedRecent = [selectedVerse.id, ...recentVerses.slice(0, maxRecent - 1)];
      localStorage.setItem('recentVerses', JSON.stringify({
        verses: updatedRecent,
        lastClean: recentData.lastClean
      }));
      
      setVerse(selectedVerse);
      setIsLoading(false);

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