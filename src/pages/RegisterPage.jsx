import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../contexts/AuthContext';

const passwordRequirements = [
  { label: '8+ characters', test: (value) => value.length >= 8 },
  { label: 'Uppercase', test: (value) => /[A-Z]/.test(value) },
  { label: 'Lowercase', test: (value) => /[a-z]/.test(value) },
  { label: 'Number', test: (value) => /\d/.test(value) },
  { label: 'Symbol', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const getPasswordChecks = (value) => passwordRequirements.map((rule) => ({
  ...rule,
  valid: rule.test(value),
}));

const getPasswordStrength = (value) => {
  const checks = getPasswordChecks(value).filter((rule) => rule.valid).length;
  if (!value) return { label: 'No password yet', width: 0, level: 'empty' };
  if (checks <= 2) return { label: 'Weak', width: 35, level: 'weak' };
  if (checks === 3 || checks === 4) return { label: 'Good', width: 70, level: 'good' };
  return { label: 'Strong', width: 100, level: 'strong' };
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordChecks = useMemo(() => getPasswordChecks(form.password), [form.password]);
  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(form);
      navigate('/studio', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Unable to create an account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your studio"
      subtitle="Start building campaign concepts, moodboards, and launch visuals in one place."
      footerText="Already have an account?"
      footerLink="Sign in"
      footerHref="/login"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field-group">
          <span>Name</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            autoComplete="name"
            required
          />
        </label>

        <label className="field-group">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="field-group">
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />
        </label>

        {form.password ? (
          <div className="password-panel">
            <div className="password-strength-header">
              <span>Password strength</span>
              <strong className={`strength-${passwordStrength.level}`}>{passwordStrength.label}</strong>
            </div>
            <div className="password-meter" aria-label="Password strength meter">
              <span className={`meter-fill ${passwordStrength.level}`} style={{ width: `${passwordStrength.width}%` }} />
            </div>
            <ul className="password-rules">
              {passwordChecks.map((rule) => (
                <li key={rule.label} className={rule.valid ? 'pass' : ''}>
                  <span className="rule-dot" aria-hidden="true" />
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <label className="field-group">
          <span>Confirm password</span>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
          />
        </label>

        {error ? <div className="form-message error">{error}</div> : null}

        <button type="submit" className="primary-button auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>

        <div className="inline-help-row">
          <span>Already registered?</span>
          <Link to="/login">Login</Link>
        </div>
      </form>
    </AuthShell>
  );
}
