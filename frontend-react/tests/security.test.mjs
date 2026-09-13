import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { stripTypeScriptTypes } from 'node:module';

function moduleUrl(file, imports = {}) {
  let source = stripTypeScriptTypes(readFileSync(new URL(file, import.meta.url), 'utf8'));
  for (const [name, url] of Object.entries(imports)) source = source.replaceAll(`'${name}'`, `'${url}'`);
  return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
}
const validationUrl = moduleUrl('../src/services/validation.ts');
const validation = await import(validationUrl);
const schedule = await import(moduleUrl('../src/services/schedule.ts', { './validation': validationUrl }));
const storage = await import(moduleUrl('../src/services/storage.ts'));
const medication = { id: 'test', name: 'Teste', dosage: '1 unidade', intervalHours: 12,
  durationDays: 2, firstDose: '20:00', reminderType: 'alarm', active: true,
  createdAt: new Date(2026, 8, 11, 12).toISOString() };

test('rejects malformed records and unbounded schedule inputs', () => {
  assert.equal(validation.isMedicationList({}), false);
  assert.equal(validation.isMedicationList([medication, medication]), false);
  assert.equal(validation.isMedication({ ...medication, durationDays: Infinity }), false);
  assert.equal(validation.isMedication({ ...medication, name: 'x'.repeat(121) }), false);
  assert.deepEqual(schedule.getDosePreview('08:00', 4, Infinity), []);
  assert.deepEqual(schedule.buildScheduledReminders([{ ...medication, intervalHours: 0 }]), []);
});
test('12-hour treatment has four doses and no dose before the start', () => {
  const now = new Date(2026, 8, 11, 12);
  const doses = schedule.buildScheduledReminders([medication], now);
  assert.equal(doses.length, 4);
  assert.deepEqual(schedule.buildTodayReminders([medication], [], now).map(dose => dose.time), ['20:00']);
  for (let i = 1; i < doses.length; i++) assert.equal(doses[i].triggerAt - doses[i - 1].triggerAt, 12 * 3600000);
});
test('last morning dose remains visible and taken IDs match Android IDs', () => {
  const now = new Date(2026, 8, 13, 0);
  const native = schedule.buildScheduledReminders([medication], now);
  const today = schedule.buildTodayReminders([medication], [native[0].id], now);
  assert.equal(today.length, 1);
  assert.equal(today[0].time, '08:00');
  assert.equal(today[0].id, native[0].id);
  assert.equal(today[0].taken, true);
});
test('non-divisor intervals do not reset at midnight', () => {
  const doses = schedule.buildScheduledReminders([{ ...medication, intervalHours: 5 }], new Date(2026, 8, 11));
  assert.equal(doses.length, 10);
  for (let i = 1; i < doses.length; i++) assert.equal(doses[i].triggerAt - doses[i - 1].triggerAt, 5 * 3600000);
});
test('corrupted storage is preserved rather than replaced by an empty list', () => {
  let writes = 0;
  globalThis.window = { localStorage: { getItem: () => '{}', setItem: () => writes++ } };
  assert.deepEqual(storage.readStorage('corrupt', [], validation.isMedicationList), []);
  assert.equal(storage.writeStorage('corrupt', []), false);
  assert.equal(writes, 0);
  assert.equal(storage.hasStorageErrors(), true);
});
test('quota and blocked storage failures are reported', () => {
  globalThis.window = { localStorage: { setItem: () => { throw new Error('quota'); } } };
  assert.equal(storage.writeStorage('quota', []), false);
  assert.equal(storage.hasStorageErrors('quota'), true);
  globalThis.window = { localStorage: { setItem: () => undefined } };
  assert.equal(storage.writeStorage('quota', []), true);
  assert.equal(storage.hasStorageErrors('quota'), false);
  globalThis.window = { get localStorage() { throw new Error('blocked'); } };
  assert.deepEqual(storage.readStorage('blocked', []), []);
  assert.equal(storage.writeStorage('blocked', []), false);
  delete globalThis.window;
});

test('future reminder generation is bounded and chronological', () => {
  const medications = Array.from({ length: 6 }, (_, index) => ({
    ...medication,
    id: `med-${index}`,
    intervalHours: 4,
    durationDays: 30,
  }));
  const reminders = schedule.buildScheduledReminders(medications, new Date(2026, 8, 11, 12));
  assert.equal(reminders.length, schedule.MAX_SCHEDULED_REMINDERS + 1);
  for (let index = 1; index < reminders.length; index++) {
    assert.ok(reminders[index].triggerAt >= reminders[index - 1].triggerAt);
  }
  const excluded = new Set(reminders.slice(0, 20).map((reminder) => reminder.id));
  const withoutTaken = schedule.buildScheduledReminders(
    medications,
    new Date(2026, 8, 11, 12),
    schedule.MAX_SCHEDULED_REMINDERS + 1,
    excluded,
  );
  assert.equal(withoutTaken.length, schedule.MAX_SCHEDULED_REMINDERS + 1);
  assert.equal(withoutTaken.some((reminder) => excluded.has(reminder.id)), false);
});
