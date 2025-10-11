
// User behavior analytics and tracking
export interface UserAction {
  type: string;
  element?: string;
  page: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  userId?: string;
  actions: UserAction[];
  pageViews: string[];
  timeOnPage: Record<string, number>;
}

class UserBehaviorTracker {
  private session: UserSession;
  private pageStartTime: number = Date.now();
  private isTracking: boolean = true;

  constructor() {
    this.session = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      actions: [],
      pageViews: [],
      timeOnPage: {},
    };

    this.initEventListeners();
    this.trackPageView();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private initEventListeners() {
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', (event) => {
      if (!this.isTracking) return;
      
      const target = event.target as HTMLElement;
      this.trackAction({
        type: 'click',
        element: this.getElementSelector(target),
        metadata: {
          x: event.clientX,
          y: event.clientY,
          tagName: target.tagName,
          className: target.className,
          innerText: target.innerText?.substring(0, 100),
        }
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      if (!this.isTracking) return;
      
      const form = event.target as HTMLFormElement;
      this.trackAction({
        type: 'form_submit',
        element: this.getElementSelector(form),
        metadata: {
          formId: form.id,
          formName: form.name,
          action: form.action,
        }
      });
    });

    // Track scroll behavior
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      if (!this.isTracking) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        this.trackAction({
          type: 'scroll',
          metadata: {
            scrollY: window.scrollY,
            scrollPercentage,
            viewportHeight: window.innerHeight,
            documentHeight: document.documentElement.scrollHeight,
          }
        });
      }, 250);
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!this.isTracking) return;
      
      this.trackAction({
        type: document.hidden ? 'page_hidden' : 'page_visible',
        metadata: {
          visibilityState: document.visibilityState,
        }
      });
    });

    // Track beforeunload to calculate time on page
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Track page focus/blur
    window.addEventListener('blur', () => {
      if (!this.isTracking) return;
      this.trackAction({ type: 'window_blur' });
    });

    window.addEventListener('focus', () => {
      if (!this.isTracking) return;
      this.trackAction({ type: 'window_focus' });
    });
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  trackAction(action: Partial<UserAction>) {
    if (!this.isTracking) return;

    const fullAction: UserAction = {
      type: action.type || 'unknown',
      element: action.element,
      page: window.location.pathname,
      timestamp: Date.now(),
      sessionId: this.session.sessionId,
      userId: action.userId,
      metadata: action.metadata,
    };

    this.session.actions.push(fullAction);
    this.sendActionToAnalytics(fullAction);
  }

  trackPageView(page?: string) {
    const currentPage = page || window.location.pathname;
    
    // Record time on previous page
    if (this.session.pageViews.length > 0) {
      const previousPage = this.session.pageViews[this.session.pageViews.length - 1];
      const timeOnPreviousPage = Date.now() - this.pageStartTime;
      this.session.timeOnPage[previousPage] = (this.session.timeOnPage[previousPage] || 0) + timeOnPreviousPage;
    }

    this.session.pageViews.push(currentPage);
    this.pageStartTime = Date.now();

    this.trackAction({
      type: 'page_view',
      page: currentPage,
      metadata: {
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      }
    });
  }

  trackCustomEvent(eventName: string, metadata?: Record<string, any>) {
    this.trackAction({
      type: `custom_${eventName}`,
      metadata,
    });
  }

  // Track user engagement metrics
  trackEngagement(engagementType: 'scroll_depth' | 'time_spent' | 'interaction', value: number) {
    this.trackAction({
      type: `engagement_${engagementType}`,
      metadata: { value }
    });
  }

  // Track feature usage
  trackFeatureUsage(featureName: string, action: string, metadata?: Record<string, any>) {
    this.trackAction({
      type: 'feature_usage',
      metadata: {
        feature: featureName,
        action,
        ...metadata,
      }
    });
  }

  private sendActionToAnalytics(action: UserAction) {
    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action.type, {
        page_path: action.page,
        element: action.element,
        session_id: action.sessionId,
        custom_parameters: action.metadata,
      });
    }

    // Log for debugging
    console.log('User action tracked:', action);

    // Send to custom analytics endpoint (if available)
    this.sendToCustomAnalytics(action);
  }

  private async sendToCustomAnalytics(action: UserAction) {
    try {
      // This would typically send to your own analytics service
      // For now, we'll just batch and store locally
      const batchedActions = this.getBatchedActions();
      if (batchedActions.length >= 10) {
        // Send batch to server
        await this.sendBatchToServer(batchedActions);
        this.clearBatchedActions();
      } else {
        this.addToBatch(action);
      }
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  private getBatchedActions(): UserAction[] {
    const stored = localStorage.getItem('analytics_batch');
    return stored ? JSON.parse(stored) : [];
  }

  private addToBatch(action: UserAction) {
    const batch = this.getBatchedActions();
    batch.push(action);
    localStorage.setItem('analytics_batch', JSON.stringify(batch));
  }

  private clearBatchedActions() {
    localStorage.removeItem('analytics_batch');
  }

  private async sendBatchToServer(actions: UserAction[]) {
    // This would send to your analytics server
    console.log('Sending batch to server:', actions);
    
    // Example implementation:
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ actions })
    // });
  }

  getSession(): UserSession {
    return { ...this.session };
  }

  setUserId(userId: string) {
    this.session.userId = userId;
  }

  endSession() {
    // Record final time on page
    const currentPage = window.location.pathname;
    const timeOnCurrentPage = Date.now() - this.pageStartTime;
    this.session.timeOnPage[currentPage] = (this.session.timeOnPage[currentPage] || 0) + timeOnCurrentPage;

    this.session.endTime = Date.now();
    this.trackAction({ type: 'session_end' });
    
    // Send final batch
    const batchedActions = this.getBatchedActions();
    if (batchedActions.length > 0) {
      this.sendBatchToServer(batchedActions);
      this.clearBatchedActions();
    }
  }

  pauseTracking() {
    this.isTracking = false;
  }

  resumeTracking() {
    this.isTracking = true;
  }
}

export const userBehaviorTracker = new UserBehaviorTracker();

// Utility functions for easy tracking
export const trackClick = (elementName: string, metadata?: Record<string, any>) => {
  userBehaviorTracker.trackAction({
    type: 'manual_click',
    element: elementName,
    metadata,
  });
};

export const trackFeature = (featureName: string, action: string, metadata?: Record<string, any>) => {
  userBehaviorTracker.trackFeatureUsage(featureName, action, metadata);
};

export const trackCustom = (eventName: string, metadata?: Record<string, any>) => {
  userBehaviorTracker.trackCustomEvent(eventName, metadata);
};
