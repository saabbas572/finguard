/**
 * Alerts Page
 * ===========
 * Dedicated interface for managing all alerts
 * Users can view, filter, resolve, and delete alerts
 */

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlertsAPI, resolveAlertAPI, deleteAlertAPI } from '../services/alertService';
import type { Alert } from '../services/alertService';

const Alerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlertsAPI({
        sort: sortBy,
        severity: severityFilter === 'all' ? undefined : severityFilter,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setAlerts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAlerts();
  }, [sortBy, severityFilter, fromDate, toDate]);

  // Apply client-side filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (statusFilter === 'unresolved' && alert.isResolved) return false;
      if (statusFilter === 'resolved' && !alert.isResolved) return false;
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
      return true;
    });
  }, [alerts, statusFilter, severityFilter]);

  // Handle resolve alert
  const handleResolve = async (id: string) => {
    try {
      await resolveAlertAPI(id);
      setAlerts(alerts.map((a) => (a._id === id ? { ...a, isResolved: true } : a)));
    } catch (err: any) {
      setError(err.message || 'Failed to resolve alert');
    }
  };

  // Handle delete alert
  const handleDelete = async (id: string) => {
    try {
      await deleteAlertAPI(id);
      setAlerts(alerts.filter((a) => a._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              ← Back to dashboard
            </a>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">Alerts</h1>
          <p className="mt-2 text-slate-600">View and manage triggered security alerts</p>
        </div>

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {/* Filters */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All alerts</option>
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">To date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
            Loading alerts...
          </div>
        )}

        {/* Alerts List */}
        {!loading && filteredAlerts.length > 0 && (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert._id}
                className={`rounded-lg border p-5 shadow-sm transition ${
                  alert.isResolved
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {alert.scenarioTitle}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                      {alert.isResolved && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{alert.reason}</p>

                    {/* Transaction Details */}
                    {alert.transactionData && (
                      <div className="mt-3 rounded bg-slate-50 p-3 text-sm text-slate-700">
                        <p className="font-medium">Transaction Details:</p>
                        {alert.transactionData.amount && (
                          <p>
                            Amount: <strong>${Number(alert.transactionData.amount).toLocaleString()}</strong>
                          </p>
                        )}
                        {alert.transactionData.type && (
                          <p>
                            Type: <strong>{alert.transactionData.type}</strong>
                          </p>
                        )}
                        {alert.transactionData.country && (
                          <p>
                            Country: <strong>{alert.transactionData.country}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="mt-3 text-xs text-slate-500">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => alert.transactionData?.id && navigate(`/transaction/${alert.transactionData.id}`)}
                      disabled={!alert.transactionData?.id}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      View Details
                    </button>
                    {!alert.isResolved && (
                      <button
                        onClick={() => handleResolve(alert._id)}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(alert._id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAlerts.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">No alerts match your filters.</p>
          </div>
        )}

        {/* Summary Stats */}
        {!loading && alerts.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Total Alerts</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{alerts.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">Unresolved</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {alerts.filter((a) => !a.isResolved).length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">High Severity</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {alerts.filter((a) => a.severity === 'high').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
