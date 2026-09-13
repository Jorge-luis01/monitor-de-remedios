import { Accessibility, Bell, Clock3, Cloud, Volume2, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useMedications } from '../context/MedicationContext';
import {
  getNativeReminderStatus,
  isAndroidApp,
  openNotificationSettings,
  requestExactAlarmAccess,
  requestNotificationPermission,
  selectAlarmSound,
  type NativeReminderStatus,
} from '../services/androidReminders';
import type { Preferences } from '../types/medication';

interface SettingRowProps {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingRow({ icon: Icon, title, description, checked, onChange }: SettingRowProps) {
  return (
    <label className="setting">
      <span className="setting-icon"><Icon aria-hidden="true" size={19} /></span>
      <span className="setting-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <input
        className="switch-input"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}

export function ConfiguracoesPage() {
  const { preferences, updatePreference } = useMedications();
  const [nativeStatus, setNativeStatus] = useState<NativeReminderStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const androidApp = isAndroidApp();

  const refreshStatus = useCallback(async (): Promise<void> => {
    setNativeStatus(await getNativeReminderStatus());
  }, []);

  useEffect(() => {
    void refreshStatus();
    const refreshWhenVisible = (): void => {
      if (document.visibilityState === 'visible') {
        void refreshStatus();
      }
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => document.removeEventListener('visibilitychange', refreshWhenVisible);
  }, [refreshStatus]);

  const update = <Key extends keyof Preferences>(key: Key) =>
    (checked: boolean): void => { updatePreference(key, checked); };

  return (
    <>
      <PageHeader title="Configurações" description="Personalize sua experiência." />

      <section className="settings-list" aria-label="Preferências">
        <div className="setting setting-action">
          <span className="setting-icon"><Bell aria-hidden="true" size={19} /></span>
          <span className="setting-copy">
            <strong>Notificações</strong>
            <small>
              {!androidApp
                ? 'Disponível no aplicativo para Android.'
                : nativeStatus?.notificationsEnabled
                  ? 'Permitidas pelo Android.'
                  : 'Permissão necessária para exibir os lembretes.'}
            </small>
          </span>
          <button
            className="setting-button"
            type="button"
            disabled={!androidApp}
            onClick={() => {
              const canRequestPermission = !nativeStatus
                || nativeStatus.notificationPermission === 'prompt'
                || nativeStatus.notificationPermission === 'prompt-with-rationale';
              const action = canRequestPermission
                ? requestNotificationPermission().then(() => undefined)
                : openNotificationSettings();
              void action.then(refreshStatus);
            }}
          >
            {nativeStatus?.notificationsEnabled
              ? 'Ajustar'
              : nativeStatus?.notificationPermission === 'denied'
                ? 'Abrir ajustes'
                : 'Permitir'}
          </button>
        </div>
        <div className="setting setting-action">
          <span className="setting-icon"><Clock3 aria-hidden="true" size={19} /></span>
          <span className="setting-copy">
            <strong>Alarmes exatos</strong>
            <small>
              {!androidApp
                ? 'Disponível no aplicativo para Android.'
                : nativeStatus?.exactAlarmGranted
                  ? 'Horários exatos autorizados.'
                  : 'Autorize para reduzir atrasos no modo de economia.'}
            </small>
          </span>
          <button
            className="setting-button"
            type="button"
            disabled={!androidApp || nativeStatus?.exactAlarmGranted}
            onClick={() => void requestExactAlarmAccess().then(refreshStatus)}
          >
            {nativeStatus?.exactAlarmGranted ? 'Ativado' : 'Autorizar'}
          </button>
        </div>
        <div className="setting setting-action">
          <span className="setting-icon"><Volume2 aria-hidden="true" size={19} /></span>
          <span className="setting-copy">
            <strong>Som dos alarmes</strong>
            <small>{androidApp ? nativeStatus?.soundTitle ?? 'Carregando…' : 'Disponível no aplicativo para Android.'}</small>
          </span>
          <button
            className="setting-button"
            type="button"
            disabled={!androidApp}
            onClick={() => {
              void selectAlarmSound().then((result) => {
                if (result?.changed) {
                  setStatusMessage(`Som selecionado: ${result.soundTitle}.`);
                }
                return refreshStatus();
              });
            }}
          >
            Escolher
          </button>
        </div>
        <SettingRow
          icon={Accessibility}
          title="Textos ampliados"
          description="Aumenta os textos principais da interface."
          checked={preferences.largeText}
          onChange={update('largeText')}
        />
        <div className="setting setting-static">
          <span className="setting-icon"><Cloud aria-hidden="true" size={19} /></span>
          <span className="setting-copy">
            <strong>Backup sincronizado</strong>
            <small>Será disponibilizado com a integração da conta.</small>
          </span>
          <span className="status-chip">Em breve</span>
        </div>
      </section>
      {statusMessage && <p className="success-message" role="status">{statusMessage}</p>}
      <p className="settings-note">
        Os dados ficam salvos neste dispositivo. O Android pode atrasar alarmes quando a autorização de horários exatos estiver desativada. Não use o aplicativo como substituto de orientação médica.
      </p>
    </>
  );
}
