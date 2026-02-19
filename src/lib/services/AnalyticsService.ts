/**
 * AnalyticsService - Client-side service for tracking user events
 */

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

export class AnalyticsService {
  /**
   * Track a user event
   */
  static async trackEvent(
    eventName: string,
    properties?: EventProperties
  ): Promise<void> {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventName,
          props: properties || {},
        }),
      })
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.error('Analytics tracking failed:', error)
    }
  }

  // Core Funnel Events
  static trackUserSignedUp(method: 'email' | 'google'): void {
    this.trackEvent('user_signed_up', { method })
  }

  static trackPackCreated(method: 'upload' | 'url' | 'text'): void {
    this.trackEvent('pack_created', { method })
  }

  static trackPackOpened(studyPackId: string): void {
    this.trackEvent('pack_opened', { studyPackId })
  }

  static trackReviewStarted(studyPackId: string, cardCount: number): void {
    this.trackEvent('review_started', { studyPackId, cardCount })
  }

  static trackReviewCompleted(studyPackId: string, cardsReviewed: number, accuracy: number): void {
    this.trackEvent('review_completed', { studyPackId, cardsReviewed, accuracy })
  }

  static trackQuizStarted(studyPackId: string, mode: string, questionCount: number): void {
    this.trackEvent('quiz_started', { studyPackId, mode, questionCount })
  }

  static trackQuizCompleted(studyPackId: string, score: number, questionCount: number): void {
    this.trackEvent('quiz_completed', { studyPackId, score, questionCount })
  }

  static trackTabSwitched(studyPackId: string, tab: string): void {
    this.trackEvent('tab_switched', { studyPackId, tab })
  }

  // Mind Map Events
  static trackMapViewed(studyPackId: string, nodeCount: number): void {
    this.trackEvent('map_viewed', {
      studyPackId,
      nodeCount,
    })
  }

  static trackMapEdited(
    nodeId: string,
    action: 'edit' | 're-parent' | 'delete',
    studyPackId: string
  ): void {
    this.trackEvent('map_edited', {
      nodeId,
      action,
      studyPackId,
    })
  }

  // Export Events
  static trackExportTriggered(
    exportType: string,
    studyPackId: string
  ): void {
    this.trackEvent('export_triggered', {
      exportType,
      studyPackId,
    })
  }

  static trackExportCompleted(
    exportType: string,
    studyPackId: string,
    duration: number
  ): void {
    this.trackEvent('export_completed', {
      exportType,
      studyPackId,
      duration,
    })
  }

  static trackUpgradeClicked(
    feature: string,
    currentPlan: string,
    studyPackId?: string
  ): void {
    this.trackEvent('upgrade_clicked', {
      feature,
      currentPlan,
      studyPackId: studyPackId || null,
    })
  }

  // Dashboard Events
  static trackPackSearched(searchQuery: string): void {
    this.trackEvent('pack_searched', {
      searchQuery,
    })
  }

  static trackPackFiltered(filterType: string): void {
    this.trackEvent('pack_filtered', {
      filterType,
    })
  }

  static trackPackSorted(sortType: string): void {
    this.trackEvent('pack_sorted', {
      sortType,
    })
  }

  static trackQuickActionUsed(
    actionType: string,
    packId: string
  ): void {
    this.trackEvent('quick_action_used', {
      actionType,
      packId,
    })
  }

  // Insights Events
  static trackInsightsViewed(packId: string): void {
    this.trackEvent('insights_viewed', {
      packId,
    })
  }

  static trackForecastViewed(packId: string): void {
    this.trackEvent('forecast_viewed', {
      packId,
    })
  }

  static trackLapseCardClicked(cardId: string, packId: string): void {
    this.trackEvent('lapse_card_clicked', {
      cardId,
      packId,
    })
  }

  static trackPerformanceChartViewed(packId: string): void {
    this.trackEvent('performance_chart_viewed', {
      packId,
    })
  }

  static trackSessionAnalyticsViewed(packId: string): void {
    this.trackEvent('session_analytics_viewed', {
      packId,
    })
  }

  // Waitlist Events
  static trackWaitlistJoined(email: string, studying?: string): void {
    this.trackEvent('waitlist_joined', {
      email,
      studying: studying || null,
    })
  }

  static trackWaitlistShared(referralCode: string, method: 'copy' | 'twitter'): void {
    this.trackEvent('waitlist_shared', {
      referralCode,
      method,
    })
  }
}
