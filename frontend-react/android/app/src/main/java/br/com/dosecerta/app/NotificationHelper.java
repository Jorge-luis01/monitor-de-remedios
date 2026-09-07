package br.com.dosecerta.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

final class NotificationHelper {
    static final String NOTIFICATION_CHANNEL = "dose_certa_reminders";
    static final String ACTION_DISMISS = "br.com.dosecerta.app.DISMISS_ALARM";

    private NotificationHelper() {}

    static void createBaseChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null || manager.getNotificationChannel(NOTIFICATION_CHANNEL) != null) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
            NOTIFICATION_CHANNEL,
            "Lembretes de medicamentos",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Avisos das doses cadastradas no Dose Certa");
        channel.enableVibration(true);
        manager.createNotificationChannel(channel);
    }

    static void showReminder(Context context, String reminderId, String medicationName, String dosage, boolean alarm) {
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            return;
        }

        String channelId = alarm ? ensureAlarmChannel(context) : NOTIFICATION_CHANNEL;
        createBaseChannel(context);

        Intent openIntent = new Intent(context, MainActivity.class)
            .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            AlarmScheduler.requestCode("open-" + reminderId),
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String title = alarm ? "Hora do medicamento" : "Lembrete de dose";
        String body = dosage.trim().isEmpty() ? medicationName : medicationName + " — " + dosage;
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_stat_medication)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(contentIntent)
            .setAutoCancel(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setCategory(alarm ? NotificationCompat.CATEGORY_ALARM : NotificationCompat.CATEGORY_REMINDER)
            .setPriority(alarm ? NotificationCompat.PRIORITY_MAX : NotificationCompat.PRIORITY_HIGH);

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            Uri sound = alarm
                ? ReminderStore.getAlarmSound(context)
                : android.provider.Settings.System.DEFAULT_NOTIFICATION_URI;
            builder.setSound(sound).setVibrate(new long[] { 0, 350, 200, 350 });
        }

        if (alarm) {
            Intent dismissIntent = new Intent(context, AlarmActionReceiver.class)
                .setAction(ACTION_DISMISS)
                .putExtra(AlarmScheduler.EXTRA_REMINDER_ID, reminderId);
            PendingIntent dismissPendingIntent = PendingIntent.getBroadcast(
                context,
                AlarmScheduler.requestCode("dismiss-" + reminderId),
                dismissIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            builder.addAction(android.R.drawable.ic_media_pause, "Parar alarme", dismissPendingIntent);
        }

        Notification notification = builder.build();
        if (alarm) {
            notification.flags |= Notification.FLAG_INSISTENT;
        }
        NotificationManagerCompat.from(context).notify(AlarmScheduler.requestCode(reminderId), notification);
    }

    static String ensureAlarmChannel(Context context) {
        Uri sound = ReminderStore.getAlarmSound(context);
        String soundValue = sound == null ? "default" : sound.toString();
        String channelId = "dose_certa_alarm_" + Integer.toHexString(soundValue.hashCode());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = context.getSystemService(NotificationManager.class);
            if (manager != null && manager.getNotificationChannel(channelId) == null) {
                NotificationChannel channel = new NotificationChannel(
                    channelId,
                    "Alarmes de medicamentos",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Alarmes sonoros das doses cadastradas");
                channel.enableVibration(true);
                AudioAttributes attributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
                channel.setSound(sound, attributes);
                manager.createNotificationChannel(channel);
            }
        }
        return channelId;
    }
}
