import { 
  BarChart3, 
  MessageCircle, 
  Cloud, 
  Music, 
  Calendar, 
  Copy, 
  Heart, 
  Radio,
  Settings,
  ChevronRight
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const menuItems = [
  {
    title: "Visão Geral",
    items: [
      { title: "Dashboard", value: "dashboard", icon: BarChart3 },
    ]
  },
  {
    title: "Conteúdo",
    items: [
      { title: "Google Drive", value: "drive", icon: Cloud },
      { title: "Mídia", value: "media", icon: Music },
      { title: "Transmissões", value: "live", icon: Radio },
    ]
  },
  {
    title: "Eventos",
    items: [
      { title: "Eventos", value: "events", icon: Calendar },
      { title: "Modelos", value: "templates", icon: Copy },
    ]
  },
  {
    title: "Comunidade",
    items: [
      { title: "Pedidos de Oração", value: "prayers", icon: Heart },
      { title: "Testemunhos", value: "testimonies", icon: MessageCircle },
    ]
  }
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r bg-card" collapsible="icon">
      <SidebarContent>
        <div className={cn("px-4 py-4 sm:py-6", isCollapsed && "px-2")}>
          <div className="flex items-center gap-2">
            <Settings className={cn("text-primary flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-4 sm:w-5 h-4 sm:h-5")} />
            {!isCollapsed && (
              <h2 className="font-semibold text-base sm:text-lg">Admin</h2>
            )}
          </div>
        </div>

        {menuItems.map((group, idx) => (
          <SidebarGroup key={idx}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-4">
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = activeTab === item.value;
                  return (
                    <SidebarMenuItem key={item.value}>
                      <SidebarMenuButton
                        onClick={() => {
                          onTabChange(item.value);
                          // Close sidebar on mobile after selection
                          if (isMobile) {
                            const trigger = document.querySelector('[data-sidebar="trigger"]') as HTMLElement;
                            trigger?.click();
                          }
                        }}
                        className={cn(
                          "w-full justify-start transition-all",
                          isActive && "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                        )}
                        tooltip={isCollapsed ? item.title : undefined}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-sm">{item.title}</span>
                            {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                          </>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}