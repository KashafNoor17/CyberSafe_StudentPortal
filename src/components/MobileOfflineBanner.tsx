import { WifiOff, RefreshCw, CloudOff } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Button } from '@/components/ui/button';
import { T } from '@/components/T';

export function MobileOfflineBanner() {
  const { isOnline, pendingCount, isSyncing, syncPendingActions } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] safe-area-top">
      {!isOnline && (
        <div className="bg-destructive/90 text-destructive-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm backdrop-blur-sm">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span><T>You're offline — changes will sync when connected</T></span>
        </div>
      )}
      {isOnline && pendingCount > 0 && (
        <div className="bg-accent/90 text-accent-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm backdrop-blur-sm">
          <CloudOff className="h-4 w-4 shrink-0" />
          <span>{pendingCount} <T>{pendingCount === 1 ? 'pending change' : 'pending changes'}</T></span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={syncPendingActions}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            <T>Sync</T>
          </Button>
        </div>
      )}
    </div>
  );
}