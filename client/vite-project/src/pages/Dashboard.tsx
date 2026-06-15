import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import type { RootState, AppDispatch } from '../store';
import api from '../services/api';

const filters = [
  { id: 'all', label: 'All activity', count: 26, description: 'All tracked events' },
  { id: 'alerts', label: 'Alerts', count: 8, description: 'High-risk events flagged' },
  { id: 'logins', label: 'Suspicious logins', count: 3, description: 'Potential account takeovers' },
  { id: 'transactions', label: 'High-risk transactions', count: 5, description: 'Transactions requiring review' },
];

const activityItems = [
  { id: 1, category: 'alerts', title: 'Rule threshold exceeded', details: 'Transaction of $12,400 flagged' },
  { id: 2, category: 'logins', title: 'Unusual login location', details: 'Login from Berlin at 3:14 AM' },
  { id: 3, category: 'transactions', title: 'Large withdrawal request', details: '$85,000 transfer pending review' },
  { id: 4, category: 'alerts', title: 'Policy violation detected', details: 'Unapproved vendor payment' },
  { id: 5, category: 'logins', title: 'Multiple failed sign-ins', details: '3 failed attempts within 5 min' },
];

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [profile, setProfile] = useState<{ name: string; email: string; role: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/user/me');
        setProfile(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Could not load profile');
      }
    };

    fetchProfile();
  }, []);

  const filteredItems = useMemo(
    () => activityItems.filter((item) => selectedFilter === 'all' || item.category === selectedFilter),
    [selectedFilter],
  );

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">Welcome back, {user?.name ?? 'Analyst'}.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/builder"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Go to scenario builder
            </a>
            <button
              type="button"
              className="rounded-2xl bg-rose-600 px-5 py-3 text-white transition hover:bg-rose-700"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
            {error ? (
              <p className="mt-4 text-sm text-rose-700">{error}</p>
            ) : profile ? (
              <div className="mt-4 space-y-2 text-slate-700">
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Role:</strong> {profile.role}</p>
              </div>
            ) : (
              <p className="mt-4 text-slate-500">Loading profile...</p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Next steps</h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              <li>Build and save scenario builder templates</li>
              <li>Create alert rule templates</li>
              <li>Add dashboard charts for flagged activity</li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id)}
                className={`rounded-3xl border p-5 text-left transition ${selectedFilter === filter.id ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{filter.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{filter.count}</p>
                <p className="mt-2 text-sm text-slate-600">{filter.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Filtered activity</h2>
              <p className="text-sm text-slate-600">
                {selectedFilter === 'all'
                  ? 'Showing all events'
                  : `Showing ${filters.find((filter) => filter.id === selectedFilter)?.label.toLowerCase()}`}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.details}</p>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-sm text-slate-600">No matching events found for this filter.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
