import { FormEvent, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../store/authSlice';
import type { AppDispatch, RootState } from '../store';

const emailRegex = /^\S+@\S+\.\S+$/;

const Register = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);

  const fieldErrors = useMemo(() => {
    const errors = { name: '', email: '', password: '' };

    if (!form.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(form.email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    return errors;
  }, [form]);

  const hasFormErrors = Boolean(fieldErrors.name || fieldErrors.email || fieldErrors.password);

  const handleChange = (field: 'name' | 'email' | 'password', value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasFormErrors) return;

    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-50">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-4xl font-semibold text-slate-900">FinGuard</h1>
        <h2 className="mt-2 text-xl font-medium text-slate-700">Create account</h2>
        {error && (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {submitted && hasFormErrors && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Please fix the highlighted fields before continuing.
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <input
              className={`w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition duration-150 focus:ring-4 ${submitted && fieldErrors.name ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'}`}
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              aria-invalid={submitted && Boolean(fieldErrors.name)}
            />
          </div>

          <div>
            <input
              className={`w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition duration-150 focus:ring-4 ${submitted && fieldErrors.email ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'}`}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              aria-invalid={submitted && Boolean(fieldErrors.email)}
            />
          </div>

          <div>
            <input
              className={`w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition duration-150 focus:ring-4 ${submitted && fieldErrors.password ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-100'}`}
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              aria-invalid={submitted && Boolean(fieldErrors.password)}
            />
          </div>

          <button
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={loading || hasFormErrors}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-700" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;