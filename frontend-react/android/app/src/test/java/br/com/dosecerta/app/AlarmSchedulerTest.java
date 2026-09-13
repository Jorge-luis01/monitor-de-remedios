package br.com.dosecerta.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class AlarmSchedulerTest {
    @Test
    public void requestCodeIsStableAndNonNegative() {
        int first = AlarmScheduler.requestCode("medicamento-2026-09-07T14:00");
        int second = AlarmScheduler.requestCode("medicamento-2026-09-07T14:00");

        assertEquals(first, second);
        assertTrue(first >= 0);
    }

    @Test
    public void differentReminderIdsProduceDifferentCodes() {
        assertNotEquals(
            AlarmScheduler.requestCode("dose-1"),
            AlarmScheduler.requestCode("dose-2")
        );
    }

    @Test
    public void notificationTagsRemainUniqueWhenJavaHashesCollide() {
        String first = "Aa-2026-09-13-08:00";
        String second = "BB-2026-09-13-08:00";

        assertEquals(AlarmScheduler.requestCode(first), AlarmScheduler.requestCode(second));
        assertNotEquals(NotificationHelper.notificationTag(first), NotificationHelper.notificationTag(second));
    }
}
