import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RegistrationField {
  id: string;
  event_id: string;
  field_name: string;
  field_type: string;
  field_label: string;
  field_placeholder?: string;
  is_required: boolean;
  field_options?: string[];
  field_order: number;
}

interface Registration {
  id: string;
  event_id: string;
  registration_data: any;
  synced_to_sheets: boolean;
  created_at: string;
}

interface EventRegistrationManagerProps {
  eventId: string;
  eventTitle: string;
}

export const EventRegistrationManager = ({ eventId, eventTitle }: EventRegistrationManagerProps) => {
  const [fields, setFields] = useState<RegistrationField[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newField, setNewField] = useState({
    field_name: "",
    field_type: "text",
    field_label: "",
    field_placeholder: "",
    is_required: true,
    field_options: [] as string[],
  });

  useEffect(() => {
    fetchFields();
    fetchRegistrations();
  }, [eventId]);

  const fetchFields = async () => {
    const { data, error } = await supabase
      .from("event_registration_fields")
      .select("*")
      .eq("event_id", eventId)
      .order("field_order");

    if (error) {
      toast({
        title: "Erro ao carregar campos",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setFields(data || []);
  };

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar inscrições",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setRegistrations(data || []);
  };

  const handleAddField = async () => {
    if (!newField.field_label || !newField.field_name) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e rótulo do campo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("event_registration_fields").insert({
      event_id: eventId,
      field_name: newField.field_name,
      field_type: newField.field_type,
      field_label: newField.field_label,
      field_placeholder: newField.field_placeholder || null,
      is_required: newField.is_required,
      field_options: newField.field_type === "select" ? newField.field_options : null,
      field_order: fields.length,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Erro ao adicionar campo",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Campo adicionado",
      description: "O campo foi adicionado com sucesso",
    });

    setDialogOpen(false);
    setNewField({
      field_name: "",
      field_type: "text",
      field_label: "",
      field_placeholder: "",
      is_required: true,
      field_options: [],
    });
    fetchFields();
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("Tem certeza que deseja excluir este campo?")) return;

    const { error } = await supabase
      .from("event_registration_fields")
      .delete()
      .eq("id", fieldId);

    if (error) {
      toast({
        title: "Erro ao excluir campo",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Campo excluído",
      description: "O campo foi excluído com sucesso",
    });

    fetchFields();
  };

  const fieldTypes = [
    { value: "text", label: "Texto" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Telefone" },
    { value: "number", label: "Número" },
    { value: "date", label: "Data" },
    { value: "textarea", label: "Texto Longo" },
    { value: "select", label: "Seleção" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campos do Formulário - {eventTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Configure os campos que aparecerão no formulário de inscrição
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Campo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Campo ao Formulário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nome do Campo (variável)</Label>
                      <Input
                        placeholder="ex: nome_completo"
                        value={newField.field_name}
                        onChange={(e) =>
                          setNewField({ ...newField, field_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Tipo de Campo</Label>
                      <Select
                        value={newField.field_type}
                        onValueChange={(value) =>
                          setNewField({ ...newField, field_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Rótulo do Campo</Label>
                    <Input
                      placeholder="ex: Nome Completo"
                      value={newField.field_label}
                      onChange={(e) =>
                        setNewField({ ...newField, field_label: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Placeholder (opcional)</Label>
                    <Input
                      placeholder="ex: Digite seu nome completo"
                      value={newField.field_placeholder}
                      onChange={(e) =>
                        setNewField({ ...newField, field_placeholder: e.target.value })
                      }
                    />
                  </div>
                  {newField.field_type === "select" && (
                    <div>
                      <Label>Opções (separadas por vírgula)</Label>
                      <Input
                        placeholder="ex: Opção 1, Opção 2, Opção 3"
                        onChange={(e) =>
                          setNewField({
                            ...newField,
                            field_options: e.target.value.split(",").map((opt) => opt.trim()),
                          })
                        }
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newField.is_required}
                      onCheckedChange={(checked) =>
                        setNewField({ ...newField, is_required: checked })
                      }
                    />
                    <Label>Campo obrigatório</Label>
                  </div>
                  <Button onClick={handleAddField} disabled={loading} className="w-full">
                    Adicionar Campo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum campo configurado ainda</p>
              <p className="text-sm">Adicione campos para criar o formulário de inscrição</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field) => (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{field.field_label}</p>
                          <p className="text-sm text-muted-foreground">
                            {fieldTypes.find((t) => t.value === field.field_type)?.label}
                            {field.is_required && " • Obrigatório"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Inscrições Recebidas
            <Button variant="outline" size="sm" onClick={() => setViewDialogOpen(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Todas ({registrations.length})
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma inscrição recebida ainda</p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>Total de inscrições: {registrations.length}</p>
              <p>
                Sincronizadas com Google Sheets:{" "}
                {registrations.filter((r) => r.synced_to_sheets).length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Todas as Inscrições</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {registrations.map((registration) => (
              <Card key={registration.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="text-xs text-muted-foreground">
                        {new Date(registration.created_at).toLocaleString("pt-BR")}
                      </p>
                      {registration.synced_to_sheets && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Sincronizado
                        </span>
                      )}
                    </div>
                    {Object.entries(registration.registration_data).map(([key, value]) => (
                      <div key={key} className="border-t pt-2">
                        <p className="text-sm font-medium">{key}</p>
                        <p className="text-sm text-muted-foreground">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};