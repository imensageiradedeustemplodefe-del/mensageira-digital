import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { removeBackground, loadImage } from '@/utils/removeBackground';

const RemoverFundo = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo de imagem',
        variant: 'destructive',
      });
      return;
    }

    // Show original image
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process image
    setIsProcessing(true);
    setProcessedImage(null);

    try {
      const imageElement = await loadImage(file);
      const resultBlob = await removeBackground(imageElement);
      const resultUrl = URL.createObjectURL(resultBlob);
      setProcessedImage(resultUrl);
      
      toast({
        title: 'Sucesso!',
        description: 'Fundo removido com sucesso',
      });
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o fundo. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'imagem-sem-fundo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download iniciado',
      description: 'Sua imagem está sendo baixada',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Remover Fundo de Imagem</CardTitle>
          <CardDescription>
            Faça upload de uma imagem e remova o fundo automaticamente usando IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              size="lg"
              className="gap-2"
            >
              <Upload className="w-5 h-5" />
              Selecionar Imagem
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Processando imagem... Isso pode levar alguns segundos
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {originalImage && (
              <div className="space-y-2">
                <h3 className="font-semibold text-center">Original</h3>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-auto rounded"
                  />
                </div>
              </div>
            )}

            {processedImage && (
              <div className="space-y-2">
                <h3 className="font-semibold text-center">Sem Fundo</h3>
                <div 
                  className="border rounded-lg p-4 relative"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                >
                  <img
                    src={processedImage}
                    alt="Sem fundo"
                    className="w-full h-auto rounded"
                  />
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={handleDownload}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Imagem
                  </Button>
                </div>
              </div>
            )}
          </div>

          {!originalImage && !isProcessing && (
            <div className="text-center py-12 text-muted-foreground">
              <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Selecione uma imagem para começar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RemoverFundo;
