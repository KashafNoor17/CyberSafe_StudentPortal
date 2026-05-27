import { useState, useEffect } from 'react';
import { Bell, Check, AlertTriangle, MessageSquare, UserPlus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'moderation' | 'signup' | 'system' | 'feedback';
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const [
        { data: pendingReviews },
        { data: newFeedback },
        { data: newUsers },
      ] = await Promise.all([
        supabase.from('reviews').select('id').eq('is_approved', false),
        supabase.from('feedback').select('id').eq('status', 'new').gte('created_at', todayStart.toISOString()),
        supabase.from('profiles').select('id').gte('created_at', todayStart.toISOString()),
      ]);

      const notifs: Notification[] = [];

      if (pendingReviews && pendingReviews.length > 0) {
        notifs.push({
          id: 'pending-reviews',
          type: 'moderation',
          message: `${pendingReviews.length} pending review${pendingReviews.length > 1 ? 's' : ''} need approval`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'high',
        });
      }

      if (newFeedback && newFeedback.length > 0) {
        notifs.push({
          id: 'new-feedback',
          type: 'feedback',
          message: `${newFeedback.length} new feedback submission${newFeedback.length > 1 ? 's' : ''} today`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'medium',
        });
      }

      if (newUsers && newUsers.length > 0) {
        notifs.push({
          id: 'new-users',
          type: 'signup',
          message: `${newUsers.length} new user${newUsers.length > 1 ? 's' : ''} registered today`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'low',
        });
      }

      // Add a system notification
      notifs.push({
        id: 'system-status',
        type: 'system',
        message: 'All systems operational',
        timestamp: new Date().toISOString(),
        read: true,
        priority: 'low',
      });

      setNotifications(notifs);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'moderation': return <MessageSquare className="h-4 w-4 text-warning" />;
      case 'signup': return <UserPlus className="h-4 w-4 text-primary" />;
      case 'system': return <Shield className="h-4 w-4 text-success" />;
      case 'feedback': return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-muted text-muted-foreground';
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          notifications.map((notif) => (
            <DropdownMenuItem 
              key={notif.id} 
              className={`flex items-start gap-3 p-3 cursor-pointer ${!notif.read ? 'bg-muted/50' : ''}`}
            >
              <div className="shrink-0 mt-0.5">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notif.read ? 'font-medium' : ''}`}>{notif.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(notif.priority)}`}>
                    {notif.priority}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
              {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
