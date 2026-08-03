import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Field } from './Login';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); Eye
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setSubmitting(true);
    setError('');

    try {
      await register(name, email, password);

      navigate('/', {
        replace: true,
        state: {},
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="mb-8 text-center font-serif text-3xl font-bold text-marquee-cream">
        Create your account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" type="text" value={name} onChange={setName} required />
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
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-left text-sm text-marquee-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-marquee-gold hover:text-marquee-goldBright">
          Sign in
        </Link>
      </p>
    </div>
  );
}