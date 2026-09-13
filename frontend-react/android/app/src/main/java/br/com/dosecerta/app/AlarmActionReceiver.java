package br.com.dosecerta.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AlarmActionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String reminderId = intent.getStringExtra(AlarmScheduler.EXTRA_REMINDER_ID);
        if (reminderId == null ||
            !(NotificationHelper.ACTION_DISMISS + "." + reminderId).equals(intent.getAction())) return;
        NotificationHelper.cancelReminder(context, reminderId);
    }
}
