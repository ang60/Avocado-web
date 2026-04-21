import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  /** Extra classes on the outer block */
  className?: string;
  /** Extra classes on the input (e.g. background for Register page) */
  inputClassName?: string;
};

export function PasswordField({
  label,
  value,
  required = false,
  onChange,
  autoComplete = 'new-password',
  className = '',
  inputClassName = '',
}: PasswordFieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-2 pr-11 rounded-lg border ${inputClassName}`.trim()}
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            borderColor: '#E0DDD6',
            backgroundColor: '#FFFFFF',
          }}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-500 hover:bg-gray-100"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
