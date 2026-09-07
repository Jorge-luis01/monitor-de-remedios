package br.com.dosecerta.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

final class AlarmScheduler {
    static final String EXTRA_REMINDER_ID = "reminder_id";
    static final String EXTRA_MEDICATION_NAME = "medication_name";
    static final String EXTRA_DOSAGE = "dosage";
    static final String EXTRA_REMINDER_TYPE = "reminder_type";

    private AlarmScheduler() {}

    static void replaceAll(Context context, JSONArray reminders) {
        JSONArray previous = ReminderStore.getReminders(context);
        for (int index = 0; index < previous.length(); index++) {
            JSONObject reminder = previous.optJSONObject(index);
            if (reminder != null) {
                cancel(context, reminder.optString("id"));
            }
        }

        ReminderStore.setReminders(context, reminders);
        scheduleStored(context);
    }

    static void scheduleStored(Context context) {
        JSONArray reminders = ReminderStore.getReminders(context);
        long now = System.currentTimeMillis();
        for (int index = 0; index < reminders.length(); index++) {
            JSONObject reminder = reminders.optJSONObject(index);
            if (reminder != null && reminder.optLong("triggerAt", 0L) > now) {
                schedule(context, reminder);
            }
        }
    }

    static boolean canScheduleExact(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            return true;
        }
        AlarmManager alarmManager = context.getSystemService(AlarmManager.class);
        return alarmManager != null && alarmManager.canScheduleExactAlarms();
    }

    private static void schedule(Context context, JSONObject reminder) {
        long triggerAt = reminder.optLong("triggerAt", 0L);
        if (triggerAt <= System.currentTimeMillis()) {
            return;
        }

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            return;
        }

        PendingIntent pendingIntent = pendingIntent(context, reminder, PendingIntent.FLAG_UPDATE_CURRENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (canScheduleExact(context)) {
                try {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
                } catch (SecurityException ignored) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
                }
            } else {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
            }
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
        }
    }

    private static void cancel(Context context, String reminderId) {
        if (reminderId == null || reminderId.trim().isEmpty()) {
            return;
        }
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            JSONObject reminder = new JSONObject();
            try {
                reminder.put("id", reminderId);
            } catch (Exception ignored) {
                return;
            }
            PendingIntent pendingIntent = pendingIntent(context, reminder, PendingIntent.FLAG_UPDATE_CURRENT);
            alarmManager.cancel(pendingIntent);
            pendingIntent.cancel();
        }
    }

    private static PendingIntent pendingIntent(Context context, JSONObject reminder, int behaviorFlag) {
        String reminderId = reminder.optString("id", "dose-certa");
        Intent intent = new Intent(context, AlarmReceiver.class)
            .setAction(context.getPackageName() + ".REMINDER." + reminderId)
            .putExtra(EXTRA_REMINDER_ID, reminderId)
            .putExtra(EXTRA_MEDICATION_NAME, reminder.optString("medicationName", "Medicamento"))
            .putExtra(EXTRA_DOSAGE, reminder.optString("dosage", ""))
            .putExtra(EXTRA_REMINDER_TYPE, reminder.optString("reminderType", "notification"));

        int flags = behaviorFlag | PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(context, requestCode(reminderId), intent, flags);
    }

    static int requestCode(String value) {
        return value.hashCode() & 0x7fffffff;
    }
}
