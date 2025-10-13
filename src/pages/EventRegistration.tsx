import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
}

interface RegistrationField {
  id: string;
  field_name: string;
  field_type: string;
  field_label: string;
  field_placeholder?: string;
  is_required: boolean;
  field_options?: string[];
}

const EventRegistration = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [fields, setFields] = useState<RegistrationField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventAndFields();
    }
  }, [eventId]);

  const fetchEventAndFields = async () => {
    setLoading(true);

    // Buscar evento
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("is_published", true)
      .eq("registration_required", true)
      .single();

    if (eventError || !eventData) {
      toast({
        title: "Evento não encontrado",
        description: "Este evento não está disponível para inscrição",
        variant: "destructive",
      });
      navigate("/eventos");
      return;
    }

    setEvent(eventData);

    // Buscar campos do formulário
    const { data: fieldsData, error: fieldsError } = await supabase
      .from("event_registration_fields")
      .select("*")
      .eq("event_id", eventId)
      .order("field_order");

    if (fieldsError) {
      toast({
        title: "Erro ao carregar formulário",
        description: fieldsError.message,
        variant: "destructive",
      });
      return;
    }

    setFields(fieldsData || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
    const missingFields = fields
      .filter((field) => field.is_required && !formData[field.field_name])
      .map((field) => field.field_label);

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Preencha os campos: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // Inserir inscrição
    const { error } = await supabase.from("event_registrations").insert({
      event_id: eventId,
      registration_data: formData,
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Erro ao enviar inscrição",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
    toast({
      title: "Inscrição enviada!",
      description: "Sua inscrição foi registrada com sucesso",
    });

    // Sincronizar com Google Sheets após 2 segundos
    setTimeout(async () => {
      await supabase.functions.invoke("sync-event-registration", {
        body: { eventId },
      });
    }, 2000);
  };

  const renderField = (field: RegistrationField) => {
    const commonProps = {
      id: field.field_name,
      required: field.is_required,
      placeholder: field.field_placeholder || "",
      value: formData[field.field_name] || "",
      onChange: (e: any) =>
        setFormData({ ...formData, [field.field_name]: e.target.value }),
    };

    switch (field.field_type) {
      case "textarea":
        return <Textarea {...commonProps} rows={4} />;
      case "select":
        return (
          <Select
            value={formData[field.field_name] || ""}
            onValueChange={(value) =>
              setFormData({ ...formData, [field.field_name]: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={field.field_placeholder || "Selecione uma opção"} />
            </SelectTrigger>
            <SelectContent>
              {field.field_options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "date":
        return <Input {...commonProps} type="date" />;
      case "number":
        return <Input {...commonProps} type="number" />;
      case "phone":
        return <Input {...commonProps} type="tel" />;
      case "email":
        return <Input {...commonProps} type="email" />;
      default:
        return <Input {...commonProps} type="text" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Inscrição Confirmada!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Sua inscrição para <strong>{event?.title}</strong> foi registrada com sucesso.
              </p>
              <Button onClick={() => navigate("/eventos")}>Ver Outros Eventos</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            {event?.image_url && (
              <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardTitle className="text-3xl">{event?.title}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <Calendar className="w-4 h-4" />
              <span>
                {event?.event_date
                  ? new Date(event.event_date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
            {event?.location && (
              <p className="text-sm text-muted-foreground">{event.location}</p>
            )}
            {event?.description && (
              <p className="text-muted-foreground mt-4">{event.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold">Formulário de Inscrição</h2>
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.field_name}>
                    {field.field_label}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Confirmar Inscrição"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventRegistration;