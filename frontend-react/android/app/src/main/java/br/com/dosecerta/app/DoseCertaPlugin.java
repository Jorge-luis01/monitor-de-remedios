package br.com.dosecerta.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.activity.result.ActivityResult;
import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(
    name = "DoseCertaNative",
    permissions = {
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
    }
)
public class DoseCertaPlugin extends Plugin {
    private static final int MAX_REMINDERS = 1000;

    @Override
    public void load() {
        NotificationHelper.createBaseChannel(getContext());
    }

    @Override
    protected void handleOnResume() {
        AlarmScheduler.scheduleStored(getContext());
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        call.resolve(buildStatus());
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            getPermissionState("notifications") == PermissionState.GRANTED) {
            call.resolve(buildStatus());
            return;
        }
        requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        call.resolve(buildStatus());
    }

    @PluginMethod
    public void requestExactAlarmAccess(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S || AlarmScheduler.canScheduleExact(getContext())) {
            call.resolve(buildStatus());
            return;
        }

        Intent intent = new Intent(
            Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
            Uri.parse("package:" + getContext().getPackageName())
        );
        getActivity().startActivity(intent);
        call.resolve(buildStatus());
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        Intent intent;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                .putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
        } else {
            intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                .setData(Uri.parse("package:" + getContext().getPackageName()));
        }
        getActivity().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void selectAlarmSound(PluginCall call) {
        Intent intent = new Intent(RingtoneManager.ACTION_RINGTONE_PICKER)
            .putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_ALARM)
            .putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true)
            .putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false)
            .putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, ReminderStore.getAlarmSound(getContext()))
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(call, intent, "alarmSoundCallback");
    }

    @ActivityCallback
    private void alarmSoundCallback(PluginCall call, ActivityResult result) {
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            JSObject response = soundResult(false);
            call.resolve(response);
            return;
        }

        Uri selected = result.getData().getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI);
        if (selected != null) {
            int grantedFlags = result.getData().getFlags() & Intent.FLAG_GRANT_READ_URI_PERMISSION;
            if (grantedFlags != 0) {
                try {
                    getContext().getContentResolver().takePersistableUriPermission(selected, grantedFlags);
                } catch (SecurityException ignored) {
                    // Os toques do sistema permanecem acessíveis sem uma concessão persistente.
                }
            }
        }
        ReminderStore.setAlarmSound(getContext(), selected);
        call.resolve(soundResult(true));
    }

    @PluginMethod
    public void syncReminders(PluginCall call) {
        JSArray received = call.getArray("reminders");
        if (received == null) {
            call.reject("A lista de lembretes é obrigatória.");
            return;
        }
        if (received.length() > MAX_REMINDERS) {
            call.reject("A lista ultrapassa o limite de " + MAX_REMINDERS + " lembretes.");
            return;
        }

        JSONArray sanitized = new JSONArray();
        for (int index = 0; index < received.length(); index++) {
            JSONObject item = received.optJSONObject(index);
            if (item == null) {
                continue;
            }

            String id = item.optString("id", "").trim();
            String medicationName = item.optString("medicationName", "").trim();
            long triggerAt = item.optLong("triggerAt", 0L);
            String reminderType = item.optString("reminderType", "notification");
            if (id.isEmpty() || medicationName.isEmpty() || triggerAt <= System.currentTimeMillis()) {
                continue;
            }
            if (!"alarm".equals(reminderType) && !"notification".equals(reminderType)) {
                reminderType = "notification";
            }

            JSONObject reminder = new JSONObject();
            try {
                reminder.put("id", id);
                reminder.put("medicationName", medicationName);
                reminder.put("dosage", item.optString("dosage", "").trim());
                reminder.put("reminderType", reminderType);
                reminder.put("triggerAt", triggerAt);
                sanitized.put(reminder);
            } catch (Exception ignored) {
                // Um item inválido não impede os demais agendamentos.
            }
        }

        AlarmScheduler.replaceAll(getContext(), sanitized);
        JSObject response = new JSObject();
        response.put("scheduledCount", sanitized.length());
        response.put("exactAlarmGranted", AlarmScheduler.canScheduleExact(getContext()));
        call.resolve(response);
    }

    private JSObject buildStatus() {
        PermissionState permission = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
            ? getPermissionState("notifications")
            : PermissionState.GRANTED;
        JSObject result = new JSObject();
        result.put("notificationPermission", permission.toString());
        result.put("notificationsEnabled", NotificationManagerCompat.from(getContext()).areNotificationsEnabled());
        result.put("exactAlarmGranted", AlarmScheduler.canScheduleExact(getContext()));
        result.put("exactAlarmRequired", Build.VERSION.SDK_INT >= Build.VERSION_CODES.S);
        result.put("soundUri", ReminderStore.getAlarmSound(getContext()).toString());
        result.put("soundTitle", getSoundTitle());
        return result;
    }

    private JSObject soundResult(boolean changed) {
        JSObject result = new JSObject();
        result.put("changed", changed);
        result.put("soundUri", ReminderStore.getAlarmSound(getContext()).toString());
        result.put("soundTitle", getSoundTitle());
        return result;
    }

    private String getSoundTitle() {
        try {
            Ringtone ringtone = RingtoneManager.getRingtone(getContext(), ReminderStore.getAlarmSound(getContext()));
            return ringtone == null ? "Som padrão do Android" : ringtone.getTitle(getContext());
        } catch (Exception ignored) {
            return "Som padrão do Android";
        }
    }
}
