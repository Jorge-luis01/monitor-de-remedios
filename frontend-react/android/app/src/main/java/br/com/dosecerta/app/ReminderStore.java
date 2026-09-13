package br.com.dosecerta.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.media.RingtoneManager;
import android.net.Uri;
import android.provider.Settings;

import org.json.JSONArray;

final class ReminderStore {
    private static final String PREFERENCES = "dose_certa_native";
    private static final String REMINDERS_KEY = "reminders";
    private static final String SOUND_URI_KEY = "alarm_sound_uri";

    private ReminderStore() {}

    static JSONArray getReminders(Context context) {
        String json = preferences(context).getString(REMINDERS_KEY, "[]");
        try {
            return new JSONArray(json);
        } catch (Exception ignored) {
            return new JSONArray();
        }
    }

    static void setReminders(Context context, JSONArray reminders) {
        if (!preferences(context).edit().putString(REMINDERS_KEY, reminders.toString()).commit()) {
            throw new IllegalStateException("Não foi possível salvar os lembretes.");
        }
    }

    static Uri getAlarmSound(Context context) {
        String savedUri = preferences(context).getString(SOUND_URI_KEY, null);
        if (savedUri != null && !savedUri.trim().isEmpty()) {
            return Uri.parse(savedUri);
        }

        Uri alarm = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        if (alarm != null) {
            return alarm;
        }
        Uri notification = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        return notification != null ? notification : Settings.System.DEFAULT_ALARM_ALERT_URI;
    }

    static void setAlarmSound(Context context, Uri uri) {
        SharedPreferences.Editor editor = preferences(context).edit();
        if (uri == null) {
            editor.remove(SOUND_URI_KEY);
        } else {
            editor.putString(SOUND_URI_KEY, uri.toString());
        }
        editor.apply();
    }

    private static SharedPreferences preferences(Context context) {
        return context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
    }
}
