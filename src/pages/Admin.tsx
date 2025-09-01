import { useState } from "react";
import { Settings, Upload, Eye, Trash2, Plus, Users, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  // Mock data - in real app this would come from backend
  const [testimonies, setTestimonies] = useState([
    {
      id: 1,
      name: "Maria Silva",
      testimony: "Deus me curou de uma doença grave. Sou grata pelas orações da igreja!",
      date: "2024-12-15",
      approved: true
    },
    {
      id: 2,
      name: "João Santos",
      testimony: "Encontrei emprego após meses de oração. Deus é fiel!",
      date: "2024-12-10",
      approved: false
    }
  ]);

  const [galleries, setGalleries] = useState([
    {
      id: 1,
      title: "Culto de Cura e Libertação",
      date: "2024-12-15",
      imageCount: 12
    },
    {
      id: 2,
      title: "Festa de Natal",
      date: "2024-12-24",
      imageCount: 25
    }
  ]);

  const [newTestimony, setNewTestimony] = useState({
    name: "",
    testimony: ""
  });

  const handleApproveTestimony = (id: number) => {
    setTestimonies(prev => prev.map(t => 
      t.id === id ? { ...t, approved: true } : t
    ));
    toast({
      title: "Testemunho Aprovado",
      description: "O testemunho foi aprovado e será exibido no site."
    });
  };

  const handleDeleteTestimony = (id: number) => {
    setTestimonies(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Testemunho Removido",
      description: "O testemunho foi removido com sucesso."
    });
  };

  const handleSubmitTestimony = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = testimonies.length + 1;
    setTestimonies(prev => [...prev, {
      id: newId,
      name: newTestimony.name,
      testimony: newTestimony.testimony,
      date: new Date().toISOString().split('T')[0],
      approved: false
    }]);
    setNewTestimony({ name: "", testimony: "" });
    toast({
      title: "Testemunho Adicionado",
      description: "O testemunho foi adicionado para revisão."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-primary mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Painel Administrativo
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gerencie o conteúdo do site da igreja
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Panel */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="testimonies" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="testimonies">Testemunhos</TabsTrigger>
              <TabsTrigger value="gallery">Galeria</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            {/* Testimonies Tab */}
            <TabsContent value="testimonies" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Add New Testimony */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Adicionar Testemunho
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitTestimony} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={newTestimony.name}
                          onChange={(e) => setNewTestimony({...newTestimony, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="testimony">Testemunho</Label>
                        <Textarea
                          id="testimony"
                          value={newTestimony.testimony}
                          onChange={(e) => setNewTestimony({...newTestimony, testimony: e.target.value})}
                          rows={4}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Testemunho
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Testimonies List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Gerenciar Testemunhos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {testimonies.map((testimony) => (
                      <div key={testimony.id} className="border border-border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{testimony.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={testimony.approved ? "default" : "secondary"}>
                              {testimony.approved ? "Aprovado" : "Pendente"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{testimony.date}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {testimony.testimony}
                        </p>
                        <div className="flex gap-2">
                          {!testimony.approved && (
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveTestimony(testimony.id)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Aprovar
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteTestimony(testimony.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Upload className="w-5 h-5 mr-2" />
                      Nova Galeria
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input placeholder="Título da galeria" />
                    <Button className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload de Imagens
                    </Button>
                  </CardContent>
                </Card>

                {galleries.map((gallery) => (
                  <Card key={gallery.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{gallery.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{gallery.date}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {gallery.imageCount} imagens
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="w-3 h-3 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Site</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="churchName">Nome da Igreja</Label>
                    <Input 
                      id="churchName" 
                      defaultValue="Igreja Mensageira de Deus - Templo de Fé" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input 
                      id="address" 
                      defaultValue="R. Elias Biasi, 49 - Berger, Caçador - SC, 89500-000" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail de Contato</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue="imensageiradedeustemplodefe@gmail.com" 
                    />
                  </div>
                  <Button>
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Admin;