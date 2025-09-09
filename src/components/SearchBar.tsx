import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'testimony' | 'page';
  url: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void; // Callback para busca local nas páginas
}

export const SearchBar = ({ 
  placeholder = "Buscar eventos, testemunhos...", 
  className = "",
  onSearch 
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Se onSearch é fornecido, usa busca local. Senão usa busca global
  const isLocalSearch = !!onSearch;

  // Dados simulados para busca - em produção seria da API
  const searchData: SearchResult[] = [
    {
      id: '1',
      title: 'Culto de Cura e Libertação',
      description: 'Noite de oração especial para cura física, emocional e espiritual.',
      type: 'event',
      url: '/eventos'
    },
    {
      id: '2',
      title: 'Culto da Família',
      description: 'Culto especial para toda a família.',
      type: 'event',
      url: '/eventos'
    },
    {
      id: '3',
      title: 'Santa Ceia',
      description: 'Celebração da Santa Ceia do Senhor.',
      type: 'event',
      url: '/eventos'
    },
    {
      id: '4',
      title: 'Testemunho de Cura',
      description: 'História de superação através da fé.',
      type: 'testimony',
      url: '/testemunhos'
    },
    {
      id: '5',
      title: 'Galeria de Fotos',
      description: 'Momentos especiais da nossa comunidade.',
      type: 'page',
      url: '/galeria'
    },
    {
      id: '6',
      title: 'Pedidos de Oração',
      description: 'Envie seu pedido de oração.',
      type: 'page',
      url: '/oracoes'
    }
  ];

  const performSearch = (searchQuery: string) => {
    if (isLocalSearch) {
      // Para busca local, apenas chama o callback
      onSearch!(searchQuery);
      return;
    }

    // Busca global original
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simular delay da API
    setTimeout(() => {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setResults(filtered);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (isLocalSearch) {
      // Para busca local, chama imediatamente sem debounce
      performSearch(query);
    } else {
      // Para busca global, usa debounce
      const debounceTimer = setTimeout(() => {
        performSearch(query);
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [query, isLocalSearch]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'event':
        return '📅';
      case 'testimony':
        return '✨';
      case 'page':
        return '📄';
      default:
        return '🔍';
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isLocalSearch) {
              setIsOpen(true);
            }
          }}
          onFocus={() => !isLocalSearch && setIsOpen(true)}
          className="pl-10 pr-10 w-full"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 z-10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Backdrop - só mostra para busca global */}
      {isOpen && !isLocalSearch && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Results - só mostra para busca global */}
      {isOpen && !isLocalSearch && (query || results.length > 0) && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto bg-background border shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                Buscando...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-start gap-3 border-b border-border/50 last:border-b-0"
                  >
                    <span className="text-lg flex-shrink-0" role="img" aria-label={result.type}>
                      {getResultIcon(result.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm mb-1">
                        {result.title}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {result.description}
                      </div>
                      <div className="text-xs text-primary capitalize font-medium">
                        {result.type === 'event' ? 'Evento' : 
                         result.type === 'testimony' ? 'Testemunho' : 'Página'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="p-6 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum resultado encontrado para "<strong>{query}</strong>"</p>
                <p className="text-xs mt-1">Tente usar outras palavras-chave</p>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Digite para buscar...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};