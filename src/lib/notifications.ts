import type { DayData } from '@/types';

export interface NotificationSettings {
  enabled: boolean;
  daysAhead: number;       // 1 = tomorrow, 2 = day after, etc.
  minScore: number;        // minimum shooting score to trigger notification (0-100)
  notifyTime: string;      // HH:MM format, e.g. "18:00"
}

const SETTINGS_KEY = 'astroplan-notification-settings';
const LAST_NOTIFIED_KEY = 'astroplan-last-notified';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  daysAhead: 1,
  minScore: 70,
  notifyTime: '18:00',
};

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) } : DEFAULT_NOTIFICATION_SETTINGS;
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function getLastNotifiedDate(): string | null {
  try {
    return localStorage.getItem(LAST_NOTIFIED_KEY);
  } catch {
    return null;
  }
}

export function setLastNotifiedDate(date: string) {
  try {
    localStorage.setItem(LAST_NOTIFIED_KEY, date);
  } catch {
    // ignore
  }
}

/**
 * Check if there are good shooting days coming up and return notification message.
 */
export function checkGoodDays(
  days: DayData[],
  settings: NotificationSettings
): { title: string; body: string } | null {
  if (!settings.enabled) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + settings.daysAhead);
  const targetStr = targetDate.toISOString().slice(0, 10);

  const targetDay = days.find((d) => d.id === targetStr);
  if (!targetDay) return null;

  // Calculate score
  if (targetDay.visibility === 'hidden') return null;
  let score = 100;
  score -= (targetDay.moonLevel - 1) * 8;
  if (targetDay.cloudCoverPercentage !== null) score -= targetDay.cloudCoverPercentage * 0.5;
  if (targetDay.lightPollution) {
    score -= (targetDay.lightPollution.bortleScale - 1) * 3;
  }
  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score < settings.minScore) return null;

  // Check if already notified today
  const lastNotified = getLastNotifiedDate();
  const todayStr = new Date().toISOString().slice(0, 10);
  if (lastNotified === todayStr) return null;

  const moonEmoji = targetDay.moonLevel <= 2 ? '🌑' : targetDay.moonLevel <= 5 ? '🌗' : '🌕';
  const cloudEmoji = targetDay.cloudCoverPercentage === null ? '❓' : targetDay.cloudCoverPercentage < 30 ? '☀️' : targetDay.cloudCoverPercentage < 60 ? '⛅' : '☁️';
  const cloudText = targetDay.cloudCoverPercentage !== null ? `Cloud ${targetDay.cloudCoverPercentage}%` : 'Cloud: no data';

  return {
    title: `🌟 Good MW Shooting Day!`,
    body: `${targetDay.id} — Score: ${score}/100 ${moonEmoji} Moon ${targetDay.moonPercentage}% ${cloudEmoji} ${cloudText}`,
  };
}

/**
 * Request browser notification permission.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

/**
 * Show a browser notification.
 */
export function showNotification(title: string, body: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: '/icons/astroplan-192.png',
    badge: '/icons/astroplan-192.png',
    tag: 'astroplan-daily',
  });
}
