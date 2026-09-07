import { Capacitor, registerPlugin } from '@capacitor/core';
import { buildScheduledReminders } from './schedule';
import type { Medication, ReminderType } from '../types/medication';

export type NotificationPermission = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';

export interface NativeReminderStatus {
  notificationPermission: NotificationPermission;
  notificationsEnabled: boolean;
  exactAlarmGranted: boolean;
  exactAlarmRequired: boolean;
  soundUri: string;
  soundTitle: string;
}

interface SoundResult {
  changed: boolean;
  soundUri: string;
  soundTitle: string;
}

interface DoseCertaNativePlugin {
  getStatus(): Promise<NativeReminderStatus>;
  requestNotificationPermission(): Promise<NativeReminderStatus>;
  requestExactAlarmAccess(): Promise<NativeReminderStatus>;
  openNotificationSettings(): Promise<void>;
  selectAlarmSound(): Promise<SoundResult>;
  syncReminders(options: {
    reminders: ReturnType<typeof buildScheduledReminders>;
  }): Promise<{ scheduledCount: number; exactAlarmGranted: boolean }>;
}

const nativePlugin = registerPlugin<DoseCertaNativePlugin>('DoseCertaNative');
const EXACT_ALARM_PROMPT_KEY = 'dose-certa:exact-alarm-prompt-opened';
let initialPermissionRequest: Promise<void> | null = null;

export function isAndroidApp(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function getNativeReminderStatus(): Promise<NativeReminderStatus | null> {
  return isAndroidApp() ? nativePlugin.getStatus() : null;
}

export async function requestInitialNotificationPermission(): Promise<void> {
  if (!isAndroidApp()) {
    return;
  }
  if (initialPermissionRequest) {
    return initialPermissionRequest;
  }

  initialPermissionRequest = (async () => {
    const status = await nativePlugin.getStatus();
    if (status.notificationPermission === 'prompt') {
      await nativePlugin.requestNotificationPermission();
    }
  })().catch(() => undefined);

  return initialPermissionRequest;
}

export async function requestNotificationPermission(): Promise<NativeReminderStatus | null> {
  return isAndroidApp() ? nativePlugin.requestNotificationPermission() : null;
}

export async function requestExactAlarmAccess(): Promise<NativeReminderStatus | null> {
  return isAndroidApp() ? nativePlugin.requestExactAlarmAccess() : null;
}

export async function requestExactAlarmAccessOnce(reminderType: ReminderType): Promise<void> {
  if (!isAndroidApp() || reminderType !== 'alarm') {
    return;
  }

  const status = await nativePlugin.getStatus();
  if (!status.exactAlarmRequired || status.exactAlarmGranted) {
    return;
  }

  if (window.localStorage.getItem(EXACT_ALARM_PROMPT_KEY) !== 'true') {
    window.localStorage.setItem(EXACT_ALARM_PROMPT_KEY, 'true');
    await nativePlugin.requestExactAlarmAccess();
  }
}

export async function openNotificationSettings(): Promise<void> {
  if (isAndroidApp()) {
    await nativePlugin.openNotificationSettings();
  }
}

export async function selectAlarmSound(): Promise<SoundResult | null> {
  return isAndroidApp() ? nativePlugin.selectAlarmSound() : null;
}

export async function syncNativeReminders(medications: Medication[]): Promise<void> {
  if (!isAndroidApp()) {
    return;
  }
  await nativePlugin.syncReminders({ reminders: buildScheduledReminders(medications) });
}
