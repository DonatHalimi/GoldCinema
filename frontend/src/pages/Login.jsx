import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="mb-8 text-center font-serif text-3xl font-bold text-marquee-cream">
        Welcome back
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <div className="relative">
          <Field
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
            className="absolute right-3 top-9 text-marquee-muted hover:text-marquee-gold"
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>


        {error && <p className="text-sm text-marquee-marquee">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:opacity-40"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-left text-sm text-marquee-muted">
        Don't have an account?{' '}
        <Link to="/register" className="text-marquee-gold hover:text-marquee-goldBright">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function Field({ label, type, value, onChange, required }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-marquee-muted">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-2.5 text-marquee-cream outline-none transition focus:border-marquee-gold"
      />
    </label>
  );
}
