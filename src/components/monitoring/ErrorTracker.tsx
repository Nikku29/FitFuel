
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, Info, X } from 'lucide-react';
import { logError } from '@/utils/sentry';

interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

const ErrorTracker: React.FC = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');

  const determineSeverity = (message: string): ErrorInfo['severity'] => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'medium';
    }
    if (lowerMessage.includes('auth') || lowerMessage.includes('permission')) {
      return 'high';
    }
    if (lowerMessage.includes('crash') || lowerMessage.includes('fatal')) {
      return 'critical';
    }
    return 'low';
  };

  useEffect(() => {
    // Set up global error handlers
    const handleError = (event: ErrorEvent) => {
      const errorInfo: ErrorInfo = {
        id: Date.now().toString(),
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        severity: determineSeverity(event.message),
        resolved: false,
      };

      setErrors(prev => [errorInfo, ...prev]);
      logError(event.error, { errorInfo });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorInfo: ErrorInfo = {
        id: Date.now().toString(),
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        severity: 'high',
        resolved: false,
      };

      setErrors(prev => [errorInfo, ...prev]);
      logError(new Error(errorInfo.message), { errorInfo });
    };

    // Add global error listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);


  const getSeverityColor = (severity: ErrorInfo['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const markAsResolved = (errorId: string) => {
    setErrors(prev =>
      prev.map(error =>
        error.id === errorId ? { ...error, resolved: true } : error
      )
    );
  };

  const deleteError = (errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  };

  const filteredErrors = errors.filter(error =>
    filter === 'all' || !error.resolved
  );

  const errorCounts = {
    total: errors.length,
    unresolved: errors.filter(e => !e.resolved).length,
    critical: errors.filter(e => e.severity === 'critical' && !e.resolved).length,
    high: errors.filter(e => e.severity === 'high' && !e.resolved).length,
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bug className="w-6 h-6" />
          Error Tracker
        </h2>

        <div className="flex gap-2">
          <Button
            variant={filter === 'unresolved' ? 'default' : 'outline'}
            onClick={() => setFilter('unresolved')}
          >
            Unresolved ({errorCounts.unresolved})
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({errorCounts.total})
          </Button>
        </div>
      </div>

      {/* Error Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold">{errorCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold">{errorCounts.unresolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold">{errorCounts.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">{errorCounts.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error List */}
      <div className="space-y-4">
        {filteredErrors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No errors to display</p>
            </CardContent>
          </Card>
        ) : (
          filteredErrors.map((error) => (
            <Card key={error.id} className={error.resolved ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <CardTitle className="text-lg">{error.message}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {new Date(error.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={`${getSeverityColor(error.severity)} text-white`}>
                      {error.severity}
                    </Badge>
                    {error.resolved && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p><strong>URL:</strong> {error.url}</p>
                  <p><strong>User Agent:</strong> {error.userAgent.substring(0, 100)}...</p>
                </div>

                {error.stack && (
                  <Alert>
                    <AlertDescription>
                      <details>
                        <summary className="cursor-pointer font-medium">Stack Trace</summary>
                        <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
                          {error.stack}
                        </pre>
                      </details>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  {!error.resolved && (
                    <Button
                      size="sm"
                      onClick={() => markAsResolved(error.id)}
                    >
                      Mark as Resolved
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteError(error.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ErrorTracker;
