import { 
  LayoutDashboard, Users, BookOpen, BarChart3, MessageSquare, 
  Award, Shield, MessageCircle, Settings, Bell, LogOut, Mail, Megaphone
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { title: 'Overview', url: '#overview', icon: LayoutDashboard, tab: 'overview' },
  { title: 'Users', url: '#users', icon: Users, tab: 'users' },
  { title: 'Content', url: '#content', icon: BookOpen, tab: 'content' },
  { title: 'Phishing Sim', url: '#phishing', icon: Mail, tab: 'phishing' },
  { title: 'Campaigns', url: '#campaigns', icon: Megaphone, tab: 'campaigns' },
  { title: 'Analytics', url: '#analytics', icon: BarChart3, tab: 'analytics' },
  { title: 'Moderation', url: '#moderation', icon: MessageSquare, tab: 'moderation' },
  { title: 'Certificates', url: '#certificates', icon: Award, tab: 'certificates' },
  { title: 'Audit Log', url: '#audit', icon: Shield, tab: 'audit' },
  { title: 'Feedback', url: '#feedback', icon: MessageCircle, tab: 'feedback' },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut, profile } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Admin Panel</span>
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                {profile?.email || 'Admin'}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.tab}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeTab === item.tab}
                    onClick={() => onTabChange(item.tab)}
                  >
                    <button className="w-full flex items-center gap-2 px-2 py-1.5">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
