import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Heart, 
  Calendar, 
  Radio, 
  Camera, 
  Users, 
  TrendingUp, 
  Activity,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalTestimonies: number;
  approvedTestimonies: number;
  totalPrayerRequests: number;
  pendingPrayerRequests: number;
  totalEvents: number;
  upcomingEvents: number;
  totalStreams: number;
  liveStreams: number;
  totalPhotos: number;
  publishedPhotos: number;
}

interface ChartData {
  name: string;
  testimonies: number;
  prayers: number;
  events: number;
}

interface ActivityData {
  id: string;
  type: 'testimony' | 'prayer' | 'event' | 'stream';
  title: string;
  created_at: string;
  status?: string;
}

const DashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTestimonies: 0,
    approvedTestimonies: 0,
    totalPrayerRequests: 0,
    pendingPrayerRequests: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalStreams: 0,
    liveStreams: 0,
    totalPhotos: 0,
    publishedPhotos: 0,
  });
  
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all statistics in parallel
      const [
        testimoniesResult,
        prayerRequestsResult,
        eventsResult,
        streamsResult,
        photosResult
      ] = await Promise.all([
        supabase.from('testimonies').select('id, is_approved, created_at'),
        supabase.from('prayer_requests').select('id, is_approved, created_at'),
        supabase.from('events').select('id, event_date, is_published, created_at'),
        supabase.from('live_streams').select('id, is_live, is_active, created_at'),
        supabase.from('gallery_photos').select('id, is_published, created_at')
      ]);

      // Calculate statistics
      const testimonies = testimoniesResult.data || [];
      const prayers = prayerRequestsResult.data || [];
      const events = eventsResult.data || [];
      const streams = streamsResult.data || [];
      const photos = photosResult.data || [];

      const now = new Date();

      setStats({
        totalTestimonies: testimonies.length,
        approvedTestimonies: testimonies.filter(t => t.is_approved).length,
        totalPrayerRequests: prayers.length,
        pendingPrayerRequests: prayers.filter(p => !p.is_approved).length,
        totalEvents: events.length,
        upcomingEvents: events.filter(e => new Date(e.event_date) > now && e.is_published).length,
        totalStreams: streams.length,
        liveStreams: streams.filter(s => s.is_live).length,
        totalPhotos: photos.length,
        publishedPhotos: photos.filter(p => p.is_published).length,
      });

      // Generate chart data for last 6 months
      generateChartData(testimonies, prayers, events);
      
      // Generate recent activity
      generateRecentActivity(testimonies, prayers, events, streams);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (testimonies: any[], prayers: any[], events: any[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      const monthTestimonies = testimonies.filter(t => {
        const created = new Date(t.created_at);
        return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear();
      }).length;
      
      const monthPrayers = prayers.filter(p => {
        const created = new Date(p.created_at);
        return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear();
      }).length;
      
      const monthEvents = events.filter(e => {
        const created = new Date(e.created_at);
        return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear();
      }).length;

      months.push({
        name: monthName,
        testimonies: monthTestimonies,
        prayers: monthPrayers,
        events: monthEvents,
      });
    }
    
    setChartData(months);
  };

  const generateRecentActivity = (testimonies: any[], prayers: any[], events: any[], streams: any[]) => {
    const activities: ActivityData[] = [];

    // Add recent testimonies
    testimonies.slice(-3).forEach(t => {
      activities.push({
        id: t.id,
        type: 'testimony',
        title: 'Novo testemunho recebido',
        created_at: t.created_at,
        status: t.is_approved ? 'approved' : 'pending'
      });
    });

    // Add recent prayer requests
    prayers.slice(-3).forEach(p => {
      activities.push({
        id: p.id,
        type: 'prayer',
        title: 'Novo pedido de oração',
        created_at: p.created_at,
        status: p.is_approved ? 'approved' : 'pending'
      });
    });

    // Add recent events
    events.slice(-2).forEach(e => {
      activities.push({
        id: e.id,
        type: 'event',
        title: 'Novo evento criado',
        created_at: e.created_at,
        status: e.is_published ? 'published' : 'draft'
      });
    });

    // Add recent streams
    streams.slice(-2).forEach(s => {
      activities.push({
        id: s.id,
        type: 'stream',
        title: 'Nova transmissão configurada',
        created_at: s.created_at,
        status: s.is_active ? 'active' : 'inactive'
      });
    });

    // Sort by creation date and take the most recent
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setRecentActivity(activities.slice(0, 8));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'testimony': return <MessageCircle className="w-4 h-4" />;
      case 'prayer': return <Heart className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'stream': return <Radio className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
      case 'published':
      case 'active':
        return <Badge variant="default" className="text-xs">Ativo</Badge>;
      case 'pending':
      case 'draft':
      case 'inactive':
        return <Badge variant="secondary" className="text-xs">Pendente</Badge>;
      default:
        return null;
    }
  };

  const pieData = [
    { name: 'Testemunhos', value: stats.totalTestimonies, color: '#8884d8' },
    { name: 'Orações', value: stats.totalPrayerRequests, color: '#82ca9d' },
    { name: 'Eventos', value: stats.totalEvents, color: '#ffc658' },
    { name: 'Fotos', value: stats.totalPhotos, color: '#ff7c7c' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral das atividades e estatísticas do site</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testemunhos</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTestimonies}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedTestimonies} aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos de Oração</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrayerRequests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingPrayerRequests} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents} próximos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transmissões</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStreams}</div>
            <p className="text-xs text-muted-foreground">
              {stats.liveStreams} ao vivo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Atividade dos Últimos 6 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="testimonies" stroke="#8884d8" name="Testemunhos" />
                <Line type="monotone" dataKey="prayers" stroke="#82ca9d" name="Orações" />
                <Line type="monotone" dataKey="events" stroke="#ffc658" name="Eventos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Distribuição de Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma atividade recente encontrada
                </p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Status Rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Transmissões Ativas</span>
              <Badge variant={stats.liveStreams > 0 ? "default" : "secondary"}>
                {stats.liveStreams > 0 ? "Ao Vivo" : "Offline"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Pedidos Pendentes</span>
              <Badge variant={stats.pendingPrayerRequests > 5 ? "destructive" : "secondary"}>
                {stats.pendingPrayerRequests}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Eventos Próximos</span>
              <Badge variant={stats.upcomingEvents > 0 ? "default" : "outline"}>
                {stats.upcomingEvents}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Fotos Publicadas</span>
              <Badge variant="outline">
                {Math.round((stats.publishedPhotos / Math.max(stats.totalPhotos, 1)) * 100)}%
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;