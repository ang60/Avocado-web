import { useEffect, useState } from 'react';
import { Lock, Save } from 'lucide-react';
import { fetchKephisThresholds, updateKephisThresholds } from '../api/realApi';
import { getApiErrorMessage } from '../api/errors';
import { getAuthUser } from '../auth';

export function KEPHISThresholdSettings() {
  const [fruitFly, setFruitFly] = useState(5);
  const [fcm, setFcm] = useState(2);
  const [thrips, setThrips] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const authUser = getAuthUser();
  const roleName = (authUser?.role_details?.role_name || authUser?.role?.role_name || '').toLowerCase();
  const canEdit = Boolean(
    authUser?.is_privileged ||
      roleName.includes('kephis') ||
      roleName.includes('administrator') ||
      roleName.includes('admin')
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchKephisThresholds()
      .then((t) => {
        setFruitFly(t.fruit_fly_limit);
        setFcm(t.fcm_limit);
        setThrips(t.thrips_limit);
      })
      .catch((e: unknown) => setError(getApiErrorMessage(e, 'Could not load threshold settings.')))
      .finally(() => setLoading(false));
  }, []);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateKephisThresholds({
        fruit_fly_limit: fruitFly,
        fcm_limit: fcm,
        thrips_limit: thrips,
      });
      setMessage('Thresholds updated successfully.');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Could not save threshold settings.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="mb-1 text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          Threshold Settings
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          National economic thresholds for regulated pests
        </p>
      </div>

      {!canEdit ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF', color: '#b45309' }}>
          <Lock className="h-4 w-4" />
          Settings are locked as read-only for your account.
        </div>
      ) : null}

      <div className="rounded-lg border p-4" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Fruit Fly Limit" value={fruitFly} setValue={setFruitFly} disabled={!canEdit || loading || saving} />
          <Field label="FCM Limit" value={fcm} setValue={setFcm} disabled={!canEdit || loading || saving} />
          <Field label="Thrips Limit" value={thrips} setValue={setThrips} disabled={!canEdit || loading || saving} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={!canEdit || loading || saving}
            className="rounded-lg px-4 py-2"
            style={{
              backgroundColor: !canEdit || loading || saving ? '#E0DDD6' : '#2D6A4F',
              color: '#FFFFFF',
              cursor: !canEdit || loading || saving ? 'not-allowed' : 'pointer',
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Thresholds
            </span>
          </button>
          {loading ? <span style={{ color: '#717182' }}>Loading...</span> : null}
          {saving ? <span style={{ color: '#717182' }}>Saving...</span> : null}
        </div>

        {error ? <p className="mt-3 text-sm" style={{ color: '#b45309' }}>{error}</p> : null}
        {message ? <p className="mt-3 text-sm" style={{ color: '#2D6A4F' }}>{message}</p> : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  setValue,
  disabled,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm" style={{ color: '#717182' }}>{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full rounded-lg border px-3 py-2"
        style={{ borderColor: '#E0DDD6' }}
      />
    </label>
  );
}
