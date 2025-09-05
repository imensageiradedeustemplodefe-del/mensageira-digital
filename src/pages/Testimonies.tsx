import { useState, useEffect } from "react";
import { Heart, Star, Send, Quote, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Testimony {
  id: string;
  name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

const Testimonies = () => {
  const { settings } = useSiteSettings();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    content: ""
  });

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const fetchTestimonies = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonies')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonies(data || []);
    } catch (error) {
      console.error('Erro ao buscar testemunhos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('testimonies')
        .insert([{
          name: formData.name,
          content: formData.content
        }]);

      if (error) throw error;

      toast.success('Testemunho enviado com sucesso! Será analisado e publicado em breve.');
      setFormData({ name: "", content: "" });
    } catch (error) {
      console.error('Erro ao enviar testemunho:', error);
      toast.error('Erro ao enviar testemunho. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Carregando testemunhos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            {settings.testimonies_page_title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            {settings.testimonies_page_subtitle}
          </p>
        </div>
      </section>

      {/* Filter Buttons - Remove this section since we removed categories */}

      {/* Featured Testimonies */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {testimonies.length > 0 && (
            <>
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                {settings.testimonies_featured_title}
              </h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
                {testimonies.slice(0, 2).map((testimony) => (
                  <Card key={testimony.id} className="bg-gradient-to-br from-primary/5 to-peaceful-blue/10 border-none hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-primary" />
                          <CardTitle className="text-xl">{testimony.name}</CardTitle>
                        </div>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(testimony.created_at)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Quote className="w-8 h-8 text-primary/20 absolute -top-2 -left-2" />
                        <p className="text-muted-foreground italic leading-relaxed pl-6">
                          {testimony.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* All Testimonies */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {settings.testimonies_all_title}
          </h2>
          
          {testimonies.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {testimonies.map((testimony) => (
                <Card key={testimony.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{testimony.name}</CardTitle>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(testimony.created_at)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {testimony.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                {settings.testimonies_empty_message}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Share Testimony Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card/60 backdrop-blur border-none">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground flex items-center justify-center">
                <Send className="w-6 h-6 mr-2" />
                {settings.testimonies_form_title}
              </CardTitle>
              <p className="text-center text-muted-foreground">
                {settings.testimonies_form_description}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Seu nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Seu Testemunho *</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Conte como Deus tem agido em sua vida..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Enviando...' : 'Enviar Testemunho'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Seu testemunho será analisado pela equipe antes de ser publicado no site.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Testimonies;