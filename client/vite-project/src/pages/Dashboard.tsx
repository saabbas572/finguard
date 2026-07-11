import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { getAlertStatsAPI, getAlertsAPI } from '../services/alertService';
import type { AlertStats, Alert } from '../services/alertService';
import { getScenariosAPI } from '../services/scenarioService';
import type { Scenario } from '../services/scenarioService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [profile, setProfile] = useState<{ name: string; email: string; role: string } | null>(null);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
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

    const fetchAlerts = async () => {
      try {
        const [stats, alertsData] = await Promise.all([
          getAlertStatsAPI(),
          getAlertsAPI({ sort: 'newest' }),
        ]);
        setAlertStats(stats);
        setAlerts(alertsData);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };

    const fetchScenarios = async () => {
      try {
        const data = await getScenariosAPI();
        setScenarios(data);
      } catch (err) {
        console.error('Failed to fetch scenarios:', err);
      }
    };

    void fetchScenarios();
    fetchProfile();
    fetchAlerts();
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedFilter === 'all') return alerts;
    if (selectedFilter === 'alerts') return alerts.filter((a) => !a.isResolved);
    if (selectedFilter === 'unresolved') return alerts.filter((a) => !a.isResolved);
    if (selectedFilter === 'high') return alerts.filter((a) => a.severity === 'high');
    return alerts;
  }, [selectedFilter, alerts]);

  const handleLogout = () => {
    logout();
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
            <a
              href="/alerts"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              View alerts
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
            <h2 className="text-xl font-semibold text-slate-900">Scenario summary</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Total</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{scenarios.length}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Active</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{scenarios.filter((item) => item.isActive).length}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Custom</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{scenarios.filter((item) => item.type === 'custom').length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { id: 'all', label: 'All alerts', count: alertStats?.total ?? 0, description: 'All tracked alerts' },
              { id: 'alerts', label: 'Unresolved', count: alertStats?.unresolved ?? 0, description: 'Alerts pending review' },
              { id: 'high', label: 'High severity', count: alertStats?.high ?? 0, description: 'Critical incidents' },
            ].map((filter) => (
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
              <h2 className="text-xl font-semibold text-slate-900">Recent alerts</h2>
              <p className="text-sm text-slate-600">
                {selectedFilter === 'all'
                  ? `Showing all ${alerts.length} alerts`
                  : `Showing ${filteredItems.length} ${selectedFilter === 'high' ? 'high severity' : 'unresolved'} alerts`}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {filteredItems.slice(0, 5).map((alert) => (
                <div key={alert._id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{alert.scenarioTitle}</p>
                      <p className="mt-1 text-sm text-slate-600">{alert.reason}</p>
                      {alert.transactionData?.amount && (
                        <p className="mt-2 text-xs text-slate-500">
                          Amount: ${Number(alert.transactionData.amount).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        alert.severity === 'high'
                          ? 'bg-red-100 text-red-700'
                          : alert.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-sm text-slate-600">No alerts found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
