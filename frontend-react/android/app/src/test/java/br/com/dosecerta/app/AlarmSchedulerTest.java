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
}
