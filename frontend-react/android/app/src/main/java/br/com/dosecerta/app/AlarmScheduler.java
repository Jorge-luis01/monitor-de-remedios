package br.com.dosecerta.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

final class AlarmScheduler {
    private static final String LOG_TAG = "DoseCertaAlarms";
    static final String EXTRA_REMINDER_ID = "reminder_id";
    static final String EXTRA_MEDICATION_NAME = "medication_name";
    static final String EXTRA_DOSAGE = "dosage";
    static final String EXTRA_REMINDER_TYPE = "reminder_type";

    private AlarmScheduler() {}

    static synchronized void replaceAll(Context context, JSONArray reminders) {
        JSONArray previous = ReminderStore.getReminders(context);
        java.util.Set<String> previousIds = reminderIds(previous);
        java.util.Set<String> currentIds = reminderIds(reminders);

        ReminderStore.setReminders(context, reminders);
        try {
            scheduleAll(context, reminders, true);
        } catch (RuntimeException scheduleFailure) {
            rollback(context, previous, previousIds, reminders, scheduleFailure);
            throw scheduleFailure;
        }

        for (int index = 0; index < previous.length(); index++) {
            JSONObject reminder = previous.optJSONObject(index);
            if (reminder != null && !currentIds.contains(reminder.optString("id"))) {
                cancel(context, reminder.optString("id"));
                NotificationHelper.cancelReminder(context, reminder.optString("id"));
            }
        }
    }

    static synchronized boolean scheduleStored(Context context) {
        return scheduleAll(context, ReminderStore.getReminders(context), false);
    }

    private static boolean scheduleAll(Context context, JSONArray reminders, boolean failFast) {
        long now = System.currentTimeMillis();
        boolean complete = true;
        for (int index = 0; index < reminders.length(); index++) {
            JSONObject reminder = reminders.optJSONObject(index);
            if (reminder != null && reminder.optLong("triggerAt", 0L) > now) {
                try {
                    schedule(context, reminder);
                } catch (RuntimeException exception) {
                    complete = false;
                    if (failFast) throw exception;
                    Log.e(LOG_TAG, "Não foi possível restaurar um lembrete armazenado.", exception);
                }
            }
        }
        return complete;
    }

    private static void rollback(Context context, JSONArray previous, java.util.Set<String> previousIds,
                                 JSONArray attempted, RuntimeException originalFailure) {
        try {
            ReminderStore.setReminders(context, previous);
        } catch (RuntimeException restoreFailure) {
            originalFailure.addSuppressed(restoreFailure);
        }

        for (int index = 0; index < attempted.length(); index++) {
            JSONObject reminder = attempted.optJSONObject(index);
            if (reminder != null && !previousIds.contains(reminder.optString("id"))) {
                cancel(context, reminder.optString("id"));
            }
        }
        try {
            scheduleAll(context, previous, true);
        } catch (RuntimeException restoreFailure) {
            originalFailure.addSuppressed(restoreFailure);
        }
    }

    private static java.util.Set<String> reminderIds(JSONArray reminders) {
        java.util.Set<String> ids = new java.util.HashSet<>();
        for (int index = 0; index < reminders.length(); index++) {
            JSONObject reminder = reminders.optJSONObject(index);
            if (reminder != null) ids.add(reminder.optString("id"));
        }
        return ids;
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
            throw new IllegalStateException("Serviço de alarmes indisponível.");
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
