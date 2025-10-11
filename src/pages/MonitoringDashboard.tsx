
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerformanceDashboard from '@/components/monitoring/PerformanceDashboard';
import ErrorTracker from '@/components/monitoring/ErrorTracker';
import { motion } from 'framer-motion';
import { usePageLoadTracking } from '@/hooks/usePerformanceTracking';

const MonitoringDashboard = () => {
  usePageLoadTracking('monitoring-dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex flex-col space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="flex flex-col space-y-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-center">
              Monitoring Dashboard
            </h1>
            <p className="text-gray-600 text-center">
              Real-time performance monitoring and error tracking for FitFusion
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full"
          >
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="performance">Performance Monitoring</TabsTrigger>
                <TabsTrigger value="errors">Error Tracking</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="mt-6">
                <PerformanceDashboard />
              </TabsContent>

              <TabsContent value="errors" className="mt-6">
                <ErrorTracker />
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
