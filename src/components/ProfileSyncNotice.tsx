
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useProfileSync } from '@/hooks/useProfileSync';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ProfileSyncNotice = () => {
  const { syncProfiles, isSyncing, lastSyncTime } = useProfileSync();
  
  return (
    <Alert className="mb-4">
      <AlertTitle className="flex items-center gap-2">
        Profile Status
        {lastSyncTime && (
          <span className="text-xs font-normal text-gray-500">
            Last synced: {lastSyncTime.toLocaleTimeString()}
          </span>
        )}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {isSyncing ? 
            "Synchronizing your profile across the platform..." : 
            "Changes you make here will appear across the entire platform"}
        </span>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={syncProfiles}
          disabled={isSyncing}
          className="ml-2"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Profile'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ProfileSyncNotice;
