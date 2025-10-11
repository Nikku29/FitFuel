
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, Zap, Eye, AlertTriangle } from 'lucide-react';
import { performanceMonitor, PerformanceMetric, WebVital } from '@/utils/performance';

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [webVitals, setWebVitals] = useState<WebVital[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isEnabled) {
        setMetrics(performanceMonitor.getMetrics());
        setWebVitals(performanceMonitor.getWebVitals());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isEnabled]);

  const getWebVitalStatus = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      LCP: { good: 2500, poor: 4000 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const averageMetric = (metricName: string) => {
    const relevantMetrics = metrics.filter(m => m.name.includes(metricName));
    if (relevantMetrics.length === 0) return 0;
    return relevantMetrics.reduce((acc, m) => acc + m.value, 0) / relevantMetrics.length;
  };

  const latestWebVital = (name: string) => {
    const vitals = webVitals.filter(v => v.name === name);
    return vitals.length > 0 ? vitals[vitals.length - 1] : null;
  };

  if (!isEnabled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Monitor (Disabled)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsEnabled(true)}>
            Enable Performance Monitoring
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Performance Dashboard
        </h2>
        <Button 
          variant="outline" 
          onClick={() => setIsEnabled(false)}
        >
          Disable Monitoring
        </Button>
      </div>

      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="resources">Resource Loading</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['LCP', 'FID', 'CLS', 'FCP', 'TTFB'] as const).map((vitalName) => {
              const vital = latestWebVital(vitalName);
              const status = vital ? getWebVitalStatus(vitalName, vital.value) : 'good';
              
              return (
                <Card key={vitalName}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      {vitalName}
                      <Badge className={`${getStatusColor(status)} text-white`}>
                        {status.replace('-', ' ')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {vital ? Math.round(vital.value) : 'N/A'}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {vitalName === 'CLS' ? '' : 'ms'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {vital ? `Updated ${new Date(vital.timestamp).toLocaleTimeString()}` : 'No data'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Page Load Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(averageMetric('navigation'))}ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  API Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(averageMetric('api'))}ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Render Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(averageMetric('render'))}ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Total Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {metrics.slice(-10).reverse().map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <span className="font-medium">{metric.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {metric.url}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{Math.round(metric.value)}ms</div>
                      <div className="text-xs text-gray-500">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Loading Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics
                  .filter(m => m.name.includes('resource_load'))
                  .slice(-5)
                  .map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">
                        {metric.name.replace('resource_load_', '')}
                      </span>
                      <span className="font-bold">{Math.round(metric.value)}ms</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
