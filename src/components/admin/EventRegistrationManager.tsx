import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, GripVertical, Eye, ChevronUp, ChevronDown, Copy, Settings2, X, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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

const FIELD_TYPES = [
  { value: "text", label: "Texto Simples", icon: "Aa", description: "Campo de texto curto" },
  { value: "email", label: "Email", icon: "@", description: "Validação de email" },
  { value: "phone", label: "Telefone", icon: "📞", description: "Campo para telefone" },
  { value: "number", label: "Número", icon: "#", description: "Apenas números" },
  { value: "date", label: "Data", icon: "📅", description: "Seletor de data" },
  { value: "textarea", label: "Texto Longo", icon: "¶", description: "Múltiplas linhas" },
  { value: "select", label: "Lista de Opções", icon: "▼", description: "Menu dropdown" },
  { value: "checkbox", label: "Caixa de Seleção", icon: "☑", description: "Sim/Não" },
];

export const EventRegistrationManager = ({ eventId, eventTitle }: EventRegistrationManagerProps) => {
  const [fields, setFields] = useState<RegistrationField[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<RegistrationField | null>(null);
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

  const [optionInput, setOptionInput] = useState("");

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

    if (newField.field_type === "select" && newField.field_options.length === 0) {
      toast({
        title: "Opções obrigatórias",
        description: "Adicione pelo menos uma opção para o campo de seleção",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const fieldData = {
      event_id: eventId,
      field_name: newField.field_name,
      field_type: newField.field_type,
      field_label: newField.field_label,
      field_placeholder: newField.field_placeholder || null,
      is_required: newField.is_required,
      field_options: newField.field_type === "select" ? newField.field_options : null,
      field_order: editingField ? editingField.field_order : fields.length,
    };

    if (editingField) {
      const { error } = await supabase
        .from("event_registration_fields")
        .update(fieldData)
        .eq("id", editingField.id);

      if (error) {
        toast({
          title: "Erro ao atualizar campo",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Campo atualizado",
        description: "O campo foi atualizado com sucesso",
      });
    } else {
      const { error } = await supabase.from("event_registration_fields").insert(fieldData);

      if (error) {
        toast({
          title: "Erro ao adicionar campo",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Campo adicionado",
        description: "O campo foi adicionado com sucesso",
      });
    }

    setLoading(false);
    setDialogOpen(false);
    resetForm();
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

  const handleDuplicateField = async (field: RegistrationField) => {
    const { error } = await supabase.from("event_registration_fields").insert({
      event_id: eventId,
      field_name: `${field.field_name}_copia`,
      field_type: field.field_type,
      field_label: `${field.field_label} (Cópia)`,
      field_placeholder: field.field_placeholder,
      is_required: field.is_required,
      field_options: field.field_options,
      field_order: fields.length,
    });

    if (error) {
      toast({
        title: "Erro ao duplicar campo",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Campo duplicado",
      description: "O campo foi duplicado com sucesso",
    });

    fetchFields();
  };

  const handleMoveField = async (fieldId: string, direction: "up" | "down") => {
    const fieldIndex = fields.findIndex((f) => f.id === fieldId);
    if (
      (direction === "up" && fieldIndex === 0) ||
      (direction === "down" && fieldIndex === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const targetIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;
    [newFields[fieldIndex], newFields[targetIndex]] = [
      newFields[targetIndex],
      newFields[fieldIndex],
    ];

    const updates = newFields.map((field, index) =>
      supabase
        .from("event_registration_fields")
        .update({ field_order: index })
        .eq("id", field.id)
    );

    await Promise.all(updates);
    fetchFields();
  };

  const handleEditField = (field: RegistrationField) => {
    setEditingField(field);
    setNewField({
      field_name: field.field_name,
      field_type: field.field_type,
      field_label: field.field_label,
      field_placeholder: field.field_placeholder || "",
      is_required: field.is_required,
      field_options: field.field_options || [],
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingField(null);
    setNewField({
      field_name: "",
      field_type: "text",
      field_label: "",
      field_placeholder: "",
      is_required: true,
      field_options: [],
    });
    setOptionInput("");
  };

  const addOption = () => {
    if (!optionInput.trim()) return;
    setNewField({
      ...newField,
      field_options: [...newField.field_options, optionInput.trim()],
    });
    setOptionInput("");
  };

  const removeOption = (index: number) => {
    const newOptions = newField.field_options.filter((_, i) => i !== index);
    setNewField({ ...newField, field_options: newOptions });
  };

  const generateFieldName = (label: string) => {
    return label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="fields" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fields">
            <Settings2 className="w-4 h-4 mr-2" />
            Campos do Formulário
          </TabsTrigger>
          <TabsTrigger value="registrations">
            <Eye className="w-4 h-4 mr-2" />
            Inscrições ({registrations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Configurar Formulário</CardTitle>
                <Dialog
                  open={dialogOpen}
                  onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Campo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingField ? "Editar Campo" : "Adicionar Novo Campo"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div>
                        <Label className="text-base font-semibold mb-3 block">
                          Tipo de Campo
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {FIELD_TYPES.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() =>
                                setNewField({ ...newField, field_type: type.value })
                              }
                              className={`p-4 rounded-lg border-2 transition-all hover:border-primary ${
                                newField.field_type === type.value
                                  ? "border-primary bg-primary/5"
                                  : "border-border"
                              }`}
                            >
                              <div className="text-2xl mb-2">{type.icon}</div>
                              <div className="text-sm font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {type.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="field_label">Rótulo do Campo *</Label>
                        <Input
                          id="field_label"
                          placeholder="Ex: Nome Completo"
                          value={newField.field_label}
                          onChange={(e) => {
                            const label = e.target.value;
                            setNewField({
                              ...newField,
                              field_label: label,
                              field_name: newField.field_name || generateFieldName(label),
                            });
                          }}
                        />
                      </div>

                      <div>
                        <Label htmlFor="field_name">Nome da Variável *</Label>
                        <Input
                          id="field_name"
                          placeholder="Ex: nome_completo"
                          value={newField.field_name}
                          onChange={(e) =>
                            setNewField({ ...newField, field_name: e.target.value })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use apenas letras minúsculas, números e underline
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="field_placeholder">Placeholder (opcional)</Label>
                        <Input
                          id="field_placeholder"
                          placeholder="Ex: Digite seu nome completo"
                          value={newField.field_placeholder}
                          onChange={(e) =>
                            setNewField({ ...newField, field_placeholder: e.target.value })
                          }
                        />
                      </div>

                      {newField.field_type === "select" && (
                        <div>
                          <Label>Opções do Menu *</Label>
                          <div className="space-y-2 mt-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Digite uma opção"
                                value={optionInput}
                                onChange={(e) => setOptionInput(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addOption();
                                  }
                                }}
                              />
                              <Button type="button" onClick={addOption}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            {newField.field_options.length > 0 && (
                              <div className="space-y-1">
                                {newField.field_options.map((option, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-muted rounded"
                                  >
                                    <span>{option}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeOption(index)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label htmlFor="is_required" className="cursor-pointer">
                            Campo Obrigatório
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            O usuário será obrigado a preencher este campo
                          </p>
                        </div>
                        <Switch
                          id="is_required"
                          checked={newField.is_required}
                          onCheckedChange={(checked) =>
                            setNewField({ ...newField, is_required: checked })
                          }
                        />
                      </div>

                      <Button onClick={handleAddField} disabled={loading} className="w-full">
                        {loading
                          ? "Salvando..."
                          : editingField
                          ? "Salvar Alterações"
                          : "Adicionar Campo"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Settings2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhum campo configurado</p>
                  <p className="text-sm">Adicione campos para criar o formulário de inscrição</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <GripVertical className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-semibold text-base">{field.field_label}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {
                                    FIELD_TYPES.find((t) => t.value === field.field_type)?.label
                                  }
                                </Badge>
                                {field.is_required && (
                                  <Badge variant="outline" className="text-xs">
                                    Obrigatório
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Variável: <code className="bg-muted px-1 rounded">{field.field_name}</code>
                              </p>
                              {field.field_placeholder && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Placeholder: {field.field_placeholder}
                                </p>
                              )}
                              {field.field_options && field.field_options.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Opções: {field.field_options.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveField(field.id, "up")}
                              disabled={index === 0}
                              title="Mover para cima"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveField(field.id, "down")}
                              disabled={index === fields.length - 1}
                              title="Mover para baixo"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateField(field)}
                              title="Duplicar campo"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditField(field)}
                              title="Editar campo"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteField(field.id)}
                              title="Excluir campo"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Inscrições Recebidas</span>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {registrations.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nenhuma inscrição recebida</p>
                  <p className="text-sm">As inscrições aparecerão aqui quando forem enviadas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Total de Inscrições</p>
                      <p className="text-2xl font-bold">{registrations.length}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sincronizadas</p>
                      <p className="text-2xl font-bold">
                        {registrations.filter((r) => r.synced_to_sheets).length}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {registrations.map((registration) => (
                      <Card key={registration.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <p className="text-xs text-muted-foreground">
                                {new Date(registration.created_at).toLocaleString("pt-BR")}
                              </p>
                              {registration.synced_to_sheets && (
                                <Badge variant="outline" className="text-xs bg-green-50">
                                  ✓ Sincronizado
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {Object.entries(registration.registration_data).map(
                                ([key, value]) => (
                                  <div key={key} className="border-l-2 border-primary pl-3">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                      {key.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-sm font-medium">{String(value)}</p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};