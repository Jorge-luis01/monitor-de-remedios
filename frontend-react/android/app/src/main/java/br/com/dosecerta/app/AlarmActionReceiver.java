package br.com.dosecerta.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import androidx.core.app.NotificationManagerCompat;

public class AlarmActionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!NotificationHelper.ACTION_DISMISS.equals(intent.getAction())) {
            return;
        }
        String reminderId = intent.getStringExtra(AlarmScheduler.EXTRA_REMINDER_ID);
        if (reminderId != null) {
            NotificationManagerCompat.from(context).cancel(AlarmScheduler.requestCode(reminderId));
        }
    }
}
