import React, { useEffect } from 'react';
import { updatePageSEO, generateStructuredData, SEOConfig } from '@/utils/seo';

interface SEOHeadProps extends SEOConfig {
  structuredData?: any;
}

const SEOHead: React.FC<SEOHeadProps> = ({ 
  structuredData, 
  ...seoConfig 
}) => {
  useEffect(() => {
    updatePageSEO(seoConfig);
    
    if (structuredData) {
      generateStructuredData(structuredData);
    }
  }, [seoConfig, structuredData]);

  return null;
};

export default SEOHead;