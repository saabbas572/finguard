import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAlertsAPI } from '../services/alertService';
import type { Alert } from '../services/alertService';

const TransactionDetails = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        const alerts = await getAlertsAPI({ sort: 'newest' });
        // Find the alert with matching transaction ID
        const matchedAlert = alerts.find(
          (a) => a.transactionData?.id === transactionId
        );

        if (matchedAlert) {
          setAlert(matchedAlert);
          setError(null);
        } else {
          setError('Transaction not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      void fetchTransactionDetails();
    }
  }, [transactionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-slate-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-red-800">{error || 'Transaction not found'}</p>
            <button
              onClick={() => navigate('/alerts')}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Back to Alerts
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tx = alert.transactionData;
  const createdAt = new Date(alert.createdAt || Date.now()).toLocaleString();
  const txDate = tx?.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Unknown';

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/alerts')}
            className="mb-4 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            ← Back to alerts
          </button>
          <h1 className="text-3xl font-semibold text-slate-900">Transaction Details</h1>
          <p className="mt-2 text-slate-600">Complete information about this transaction and the person involved</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Alert Info */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Alert Information</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Scenario</span>
                <span className="text-sm text-slate-900">{alert.scenarioTitle}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Reason</span>
                <span className="text-sm text-slate-900">{alert.reason}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Severity</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-medium text-slate-600">Status</span>
                <span className={`text-sm font-semibold ${
                  alert.isResolved ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {alert.isResolved ? '✓ Resolved' : '⚠ Unresolved'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Name</span>
                <span className="text-sm font-semibold text-slate-900">{tx?.customerName || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Email</span>
                <span className="text-sm text-slate-900">{tx?.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Country</span>
                <span className="text-sm text-slate-900">{tx?.country || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-medium text-slate-600">Merchant</span>
                <span className="text-sm text-slate-900">{tx?.merchant || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Transaction Details</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Transaction ID</span>
                <span className="font-mono text-xs text-slate-900">{tx?.id || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Amount</span>
                <span className="text-lg font-semibold text-slate-900">
                  {tx?.currency} {tx?.amount?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Status</span>
                <span className={`text-sm font-semibold ${
                  tx?.status === 'completed' ? 'text-green-600' :
                  tx?.status === 'pending' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {tx?.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Type</span>
                <span className="text-sm text-slate-900 capitalize">{tx?.type || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Reason/Description</span>
                <span className="text-sm text-slate-900">{tx?.reason || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-medium text-slate-600">Card Brand</span>
                <span className="text-sm text-slate-900 capitalize">{tx?.cardBrand || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-medium text-slate-600">Card Last 4</span>
                <span className="font-mono text-sm font-semibold text-slate-900">•••• {tx?.cardLast4 || 'XXXX'}</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Transaction Date</span>
                <span className="text-sm text-slate-900">{txDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Alert Created</span>
                <span className="text-sm text-slate-900">{createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
