import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, RefreshCw, Eye, Download, MoreHorizontal,
  Mail, Shield, AlertTriangle, UserX, Filter, Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  total_points: number;
  level: string;
  created_at: string;
}

interface UserManagementProps {
  users: User[];
  onRefresh: () => void;
}

export function UserManagement({ users, onRefresh }: UserManagementProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Advanced filters
  const [levelFilter, setLevelFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [pointsFilter, setPointsFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const getDateCutoff = (filter: string): Date | null => {
    const now = new Date();
    switch (filter) {
      case 'today': return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week': { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
      case 'month': { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
      case 'year': { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
      default: return null;
    }
  };

  const filteredUsers = users.filter(u => {
    // Search
    const matchesSearch = !searchTerm || 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Level filter
    const matchesLevel = levelFilter === 'all' || 
      (u.level || 'Beginner').toLowerCase() === levelFilter.toLowerCase();

    // Date filter
    const dateCutoff = getDateCutoff(dateFilter);
    const matchesDate = !dateCutoff || new Date(u.created_at) >= dateCutoff;

    // Points filter
    let matchesPoints = true;
    if (pointsFilter === '0') matchesPoints = (u.total_points || 0) === 0;
    else if (pointsFilter === '1-100') matchesPoints = (u.total_points || 0) >= 1 && (u.total_points || 0) <= 100;
    else if (pointsFilter === '100-500') matchesPoints = (u.total_points || 0) > 100 && (u.total_points || 0) <= 500;
    else if (pointsFilter === '500+') matchesPoints = (u.total_points || 0) > 500;

    return matchesSearch && matchesLevel && matchesDate && matchesPoints;
  });

  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
    setLoadingDetails(true);

    try {
      const [completions, badges, quizResults, certificates] = await Promise.all([
        supabase.from('module_completions').select('*').eq('user_id', user.user_id),
        supabase.from('user_badges').select('*, badges(*)').eq('user_id', user.user_id),
        supabase.from('quiz_results').select('*').eq('user_id', user.user_id).order('completed_at', { ascending: false }).limit(5),
        supabase.from('certificates').select('*').eq('user_id', user.user_id),
      ]);

      setUserDetails({
        completions: completions.data || [],
        badges: badges.data || [],
        quizResults: quizResults.data || [],
        certificates: certificates.data || [],
      });
    } catch {
      toast({ variant: 'destructive', title: 'Error loading user details' });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleResetProgress = async (user: User) => {
    if (!confirm(`Reset all progress for ${user.name}? This cannot be undone.`)) return;

    try {
      await Promise.all([
        supabase.from('module_completions').delete().eq('user_id', user.user_id),
        supabase.from('quiz_results').delete().eq('user_id', user.user_id),
        supabase.from('certificates').delete().eq('user_id', user.user_id),
        supabase.from('user_badges').delete().eq('user_id', user.user_id),
        supabase.from('points_log').delete().eq('user_id', user.user_id),
        supabase.from('profiles').update({ total_points: 0, cyber_score: 0, level: 'Novice' }).eq('user_id', user.user_id),
      ]);

      toast({ title: `Progress reset for ${user.name}` });
      onRefresh();
    } catch {
      toast({ variant: 'destructive', title: 'Error resetting progress' });
    }
  };

  const exportUsers = (usersToExport: User[]) => {
    const csvContent = [
      ['Name', 'Email', 'Points', 'Level', 'Joined'].join(','),
      ...usersToExport.map(u => [
        u.name, u.email, u.total_points, u.level, new Date(u.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `${usersToExport.length} users exported` });
  };

  const clearFilters = () => {
    setLevelFilter('all');
    setDateFilter('all');
    setPointsFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = levelFilter !== 'all' || dateFilter !== 'all' || pointsFilter !== 'all';

  return (
    <>
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                {filteredUsers.length} of {users.length} users
                {hasActiveFilters && ' (filtered)'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant={showFilters ? 'secondary' : 'outline'} 
                size="icon" 
                onClick={() => setShowFilters(!showFilters)}
                title="Toggle filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => exportUsers(filteredUsers)} title="Export filtered CSV">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50 mt-4">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Cyber Novice">Cyber Novice</SelectItem>
                  <SelectItem value="Security Apprentice">Security Apprentice</SelectItem>
                  <SelectItem value="Threat Detector">Threat Detector</SelectItem>
                  <SelectItem value="Privacy Guardian">Privacy Guardian</SelectItem>
                  <SelectItem value="Security Specialist">Security Specialist</SelectItem>
                  <SelectItem value="Cyber Defender">Cyber Defender</SelectItem>
                  <SelectItem value="Digital Sentinel">Digital Sentinel</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Joined" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={pointsFilter} onValueChange={setPointsFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Points" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Points</SelectItem>
                  <SelectItem value="0">0 points</SelectItem>
                  <SelectItem value="1-100">1-100 points</SelectItem>
                  <SelectItem value="100-500">100-500 points</SelectItem>
                  <SelectItem value="500+">500+ points</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users match your filters</p>
            ) : (
              filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name}</p>
                      <Badge variant="outline" className="text-xs">{user.level || 'Novice'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{user.total_points || 0} points</span>
                      <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewUser(user)}>
                        <Eye className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetProgress(user)}>
                        <RefreshCw className="h-4 w-4 mr-2" /> Reset Progress
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedUser?.name}</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : userDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Modules Completed</p>
                  <p className="text-xl font-bold">{userDetails.completions.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                  <p className="text-xl font-bold">{userDetails.badges.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                  <p className="text-xl font-bold">{userDetails.quizResults.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Certificates</p>
                  <p className="text-xl font-bold">{userDetails.certificates.length}</p>
                </div>
              </div>

              {selectedUser && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Account Info</p>
                  <div className="flex gap-4 mt-1 text-sm">
                    <span><strong>Points:</strong> {selectedUser.total_points || 0}</span>
                    <span><strong>Level:</strong> {selectedUser.level || 'Novice'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              {userDetails.badges.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Badges</p>
                  <div className="flex flex-wrap gap-2">
                    {userDetails.badges.map((b: any) => (
                      <Badge key={b.id} variant="secondary">
                        {b.badges?.icon} {b.badges?.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {userDetails.quizResults.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Recent Quiz Results</p>
                  <div className="space-y-2">
                    {userDetails.quizResults.map((q: any) => (
                      <div key={q.id} className="flex justify-between text-sm p-2 rounded bg-muted/30">
                        <span>{new Date(q.completed_at).toLocaleDateString()}</span>
                        <span className={q.score / q.total_questions >= 0.7 ? 'text-success' : 'text-warning'}>
                          {Math.round((q.score / q.total_questions) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
