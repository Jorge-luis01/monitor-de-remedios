package br.com.dosecerta.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String reminderId = intent.getStringExtra(AlarmScheduler.EXTRA_REMINDER_ID);
        if (reminderId == null || reminderId.trim().isEmpty()) {
            return;
        }

        String medicationName = intent.getStringExtra(AlarmScheduler.EXTRA_MEDICATION_NAME);
        org.json.JSONArray stored = ReminderStore.getReminders(context);
        boolean stillScheduled = false;
        for (int index = 0; index < stored.length(); index++) {
            org.json.JSONObject reminder = stored.optJSONObject(index);
            if (reminder != null && reminderId.equals(reminder.optString("id"))) {
                stillScheduled = true;
                break;
            }
        }
        if (!stillScheduled) return;
        String dosage = intent.getStringExtra(AlarmScheduler.EXTRA_DOSAGE);
        String reminderType = intent.getStringExtra(AlarmScheduler.EXTRA_REMINDER_TYPE);
        NotificationHelper.showReminder(
            context,
            reminderId,
            medicationName == null ? "Medicamento" : medicationName,
            dosage == null ? "" : dosage,
            "alarm".equals(reminderType)
        );
    }
}
