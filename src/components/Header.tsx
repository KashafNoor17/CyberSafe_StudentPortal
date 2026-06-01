import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, Menu, LogOut, LayoutDashboard, BookOpen, Wrench,
  Trophy, FileText, Settings, User, Users, Search, Brain
} from 'lucide-react';
import { T } from '@/components/T';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchDialog } from '@/components/SearchDialog';


export function Header() {
  const { t } = useTranslation();
  const { user, isAdmin, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Primary nav items (always visible on desktop, first 3 on tablet)
  const navItems = [
    { label: 'Modules', href: '/modules', icon: BookOpen },
    { label: 'Quiz', href: '/quiz', icon: Brain },
    { label: 'Free Tools', href: '/password-checker', icon: Wrench },
    { label: 'Community', href: '/community', icon: Users },
    { label: 'Blog', href: '/blog', icon: FileText },
  ];

  // Items visible on tablet main bar (first 3)
  const tabletVisibleCount = 3;

  // Authenticated user nav items
  const userNavItems = [
    { label: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.leaderboard'), href: '/leaderboard', icon: Trophy },
  ];

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  // All items for the sheet menu
  const allSheetItems = [
    ...navItems,
    ...(user ? userNavItems : []),
  ];

  // Items only in tablet hamburger (items beyond the first 3 primary + user items)
  const tabletSheetItems = [
    ...navItems.slice(tabletVisibleCount),
    ...(user ? userNavItems : []),
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {t('nav.skipToContent')}
      </a>

      <header className="sticky top-0 z-50 glass-dark" role="banner">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl group" aria-label="CyberSafe Home">
              <div className="w-9 h-9 rounded-lg cyber-gradient flex items-center justify-center transition-transform group-hover:scale-105">
                <Shield className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="hidden sm:inline cyber-gradient-text">CyberSafe</span>
            </Link>

            {/* Desktop Navigation (≥992px / lg) — primary items only; user items live in dropdown */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  to={item.href} 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href) 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/dashboard') 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    aria-current={isActive('/dashboard') ? 'page' : undefined}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <Link 
                    to="/leaderboard" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/leaderboard') 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    aria-current={isActive('/leaderboard') ? 'page' : undefined}
                  >
                    {t('nav.leaderboard')}
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/admin') 
                      ? 'text-secondary bg-secondary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  aria-current={isActive('/admin') ? 'page' : undefined}
                >
                  {t('nav.admin')}
                </Link>
              )}
            </nav>

            {/* Tablet Navigation (768-991px / md but not lg) — first 3 items visible */}
            <nav className="hidden md:flex lg:hidden items-center gap-1" aria-label="Main navigation">
              {navItems.slice(0, tabletVisibleCount).map((item) => (
                <Link 
                  key={item.href}
                  to={item.href} 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href) 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side: search + auth + language + hamburger */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>

              {/* Desktop auth controls (≥992px) */}
              <div className="hidden lg:flex items-center gap-2">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2" aria-label={`User menu for ${profile?.name || 'User'}`}>
                        <div className="w-8 h-8 rounded-full cyber-gradient flex items-center justify-center text-sm font-bold text-primary-foreground" aria-hidden="true">
                          {profile?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="hidden xl:inline">{profile?.name || 'User'}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                          {t('nav.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center gap-2">
                          <User className="h-4 w-4" aria-hidden="true" />
                          {t('nav.profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile?tab=preferences" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" aria-hidden="true" />
                          {t('nav.settings', 'Settings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/leaderboard" className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" aria-hidden="true" />
                          {t('nav.leaderboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                        <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                        {t('nav.signOut')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link to="/auth?mode=login">Log In</Link>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link to="/auth?mode=signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Hamburger button (visible on tablet + mobile, <992px) */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden min-h-[44px] min-w-[44px]"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label={t('nav.openMenu')}
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>

                <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
                  <SheetHeader className="p-6 pb-4 border-b border-border">
                    <SheetTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg cyber-gradient flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
                      </div>
                      <span className="cyber-gradient-text font-display">CyberSafe</span>
                    </SheetTitle>

                    {/* User info at top when logged in */}
                    {user && profile && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                        <div className="w-10 h-10 rounded-full cyber-gradient flex items-center justify-center text-sm font-bold text-primary-foreground">
                          {profile.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{profile.name || 'User'}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</span>
                        </div>
                      </div>
                    )}
                  </SheetHeader>

                  {/* Scrollable menu items */}
                  <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Mobile navigation">
                    {/* On mobile (<768px): show ALL items. On tablet (768-991px): show only overflow items */}
                    {/* We render all items and use CSS to toggle visibility */}

                    {/* Items always shown in sheet (overflow items for tablet) */}
                    {navItems.map((item, index) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                          // On tablet, hide the first 3 items (they're in the main bar)
                          index < tabletVisibleCount ? 'md:hidden lg:hidden' : ''
                        } ${
                          isActive(item.href)
                            ? 'text-primary bg-primary/10 font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                      >
                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    ))}

                    {user && (
                      <>
                        <div className="h-px bg-border my-2 mx-4" role="separator" />
                        {userNavItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                              isActive(item.href)
                                ? 'text-primary bg-primary/10 font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }`}
                            aria-current={isActive(item.href) ? 'page' : undefined}
                          >
                            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                            <span>{item.label}</span>
                          </Link>
                        ))}

                        {/* Profile & Settings */}
                        <div className="h-px bg-border my-2 mx-4" role="separator" />
                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                            isActive('/profile')
                              ? 'text-primary bg-primary/10 font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <User className="h-5 w-5 shrink-0" aria-hidden="true" />
                          <span>{t('nav.profile')}</span>
                        </Link>
                        <Link
                          to="/profile?tab=preferences"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
                          <span>{t('nav.settings', 'Settings')}</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] text-secondary hover:bg-secondary/10"
                          >
                            <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
                            <span>{t('nav.admin')}</span>
                          </Link>
                        )}
                      </>
                    )}
                  </nav>

                  {/* Footer: auth actions */}
                  <div className="border-t border-border p-4">
                    {user ? (
                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[44px]"
                      >
                        <LogOut className="h-5 w-5 mr-3" aria-hidden="true" />
                        {t('nav.signOut')}
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button variant="ghost" asChild className="w-full min-h-[44px]">
                          <Link to="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>
                            Log In
                          </Link>
                        </Button>
                        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px]">
                          <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                            Sign Up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
