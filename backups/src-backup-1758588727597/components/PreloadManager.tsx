import React, { useEffect } from 'react';
import { preloadConfig, preloadResources } from '../config/preload-config';

interface PreloadManagerProps {
  critical?: boolean;
  prefetch?: boolean;
}

const PreloadManager: React.FC<PreloadManagerProps> = ({ 
  critical = true, 
  prefetch = true 
}) => {
  useEffect(() => {
    if (critical) {
      preloadResources(preloadConfig.criticalResources);
    }
    
    if (prefetch) {
      // 延遲預載入非關鍵資源
      setTimeout(() => {
        preloadResources(preloadConfig.prefetchResources);
      }, 2000);
    }
  }, [critical, prefetch]);

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: preloadHTML }}
      style={{ display: 'none' }}
    />
  );
};

export default PreloadManager;
