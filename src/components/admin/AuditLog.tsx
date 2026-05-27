import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, User, Settings, FileText, Download, Search, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AuditLogEntry {
  id: string;
  action: string;
  description: string;
  user_name: string;
  timestamp: string;
  category: 'admin' | 'user' | 'system' | 'content';
  ip_address?: string;
}

// Mock data for demo - in production this would come from a dedicated audit_logs table
const generateMockLogs = (): AuditLogEntry[] => {
  const actions = [
    { action: 'User Login', category: 'user' as const, description: 'User logged in successfully' },
    { action: 'Module Completed', category: 'user' as const, description: 'Completed Password Security module' },
    { action: 'Quiz Submitted', category: 'user' as const, description: 'Submitted phishing quiz with 85% score' },
    { action: 'Content Updated', category: 'content' as const, description: 'Updated Password Security module content' },
    { action: 'User Progress Reset', category: 'admin' as const, description: 'Admin reset user progress' },
    { action: 'Blog Published', category: 'content' as const, description: 'Published new blog post' },
    { action: 'Certificate Issued', category: 'system' as const, description: 'Certificate generated for user' },
    { action: 'Review Approved', category: 'admin' as const, description: 'Admin approved user review' },
    { action: 'Tip Added', category: 'content' as const, description: 'Added new weekly security tip' },
    { action: 'Forum Post Created', category: 'user' as const, description: 'User created new forum post' },
  ];

  const names = ['Admin', 'John Smith', 'Jane Doe', 'Mike Wilson', 'Sarah Connor', 'System'];

  return Array.from({ length: 50 }, (_, i) => {
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const date = new Date();
    date.setMinutes(date.getMinutes() - i * 15);

    return {
      id: `log-${i}`,
      action: randomAction.action,
      description: randomAction.description,
      user_name: randomAction.category === 'system' ? 'System' : 
                 randomAction.category === 'admin' ? 'Admin' : 
                 names[Math.floor(Math.random() * (names.length - 1))],
      timestamp: date.toISOString(),
      category: randomAction.category,
      ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    };
  });
};

const categoryConfig = {
  admin: { color: 'text-destructive', bg: 'bg-destructive/10', icon: Shield },
  user: { color: 'text-primary', bg: 'bg-primary/10', icon: User },
  system: { color: 'text-warning', bg: 'bg-warning/10', icon: Settings },
  content: { color: 'text-secondary', bg: 'bg-secondary/10', icon: FileText },
};

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLogs(generateMockLogs());
      setLoading(false);
    }, 500);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Description', 'User', 'Category', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.action,
        `"${log.description}"`,
        log.user_name,
        log.category,
        log.ip_address || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Audit Log
            </CardTitle>
            <CardDescription>Track all system and user activities</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-9 w-full sm:w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="content">Content</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={exportLogs} title="Export CSV">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredLogs.map((log) => {
            const config = categoryConfig[log.category];
            const IconComponent = config.icon;

            return (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                  <IconComponent className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">{log.action}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {log.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.description}</p>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{log.user_name}</span>
                    <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                    {log.ip_address && <span className="font-mono">{log.ip_address}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
