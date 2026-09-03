import { Accessibility, Bell, Cloud, Volume2, type LucideIcon } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useMedications } from '../context/MedicationContext';
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

  const update = <Key extends keyof Preferences>(key: Key) =>
    (checked: boolean): void => updatePreference(key, checked);

  return (
    <>
      <PageHeader title="Configurações" description="Personalize sua experiência." />

      <section className="settings-list" aria-label="Preferências">
        <div className="setting setting-static">
          <span className="setting-icon"><Bell aria-hidden="true" size={19} /></span>
          <span className="setting-copy">
            <strong>Notificações do navegador</strong>
            <small>Serão ativadas quando o serviço de alarmes for integrado.</small>
          </span>
          <span className="status-chip">Em breve</span>
        </div>
        <div className="setting setting-static">
          <span className="setting-icon"><Volume2 aria-hidden="true" size={19} /></span>
          <span className="setting-copy">
            <strong>Som dos alarmes</strong>
            <small>Será configurável quando os alarmes forem integrados.</small>
          </span>
          <span className="status-chip">Em breve</span>
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
      <p className="settings-note">
        Os dados atuais ficam somente neste navegador. Não use este protótipo como substituto de orientação médica.
      </p>
    </>
  );
}
