import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type Scenario = {
  id: string;
  name: string;
  category: string;
  condition: string;
  threshold: string;
  active: boolean;
};

const defaultForm = {
  name: '',
  category: 'Transactions',
  condition: 'Amount >',
  threshold: '10000',
  active: true,
};

const ScenarioBuilder = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    const existing = localStorage.getItem('finguard-scenarios');
    return existing ? JSON.parse(existing) : [];
  });
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('finguard-scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  const categoryOptions = useMemo(
    () => ['Transactions', 'Logins', 'Alerts', 'Accounts'],
    [],
  );

  const handleChange = (field: keyof typeof defaultForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleAddScenario = () => {
    if (!form.name.trim() || !form.condition.trim() || !form.threshold.trim()) {
      setError('Please provide a name, condition, and threshold for the scenario.');
      return;
    }

    const newScenario: Scenario = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: form.name.trim(),
      category: form.category,
      condition: form.condition.trim(),
      threshold: form.threshold.trim(),
      active: form.active,
    };

    setScenarios((prev) => [newScenario, ...prev]);
    setForm(defaultForm);
  };

  const activeCount = useMemo(
    () => scenarios.filter((scenario) => scenario.active).length,
    [scenarios],
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Scenario Builder</h1>
            <p className="mt-2 text-slate-600">Create alert rule templates and manage scenario definitions for your monitoring pipeline.</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Scenarios</h2>
            <p className="mt-3 text-slate-600">{scenarios.length} total rule templates</p>
            <p className="mt-2 text-sm text-slate-500">{activeCount} active</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Categories</h2>
            <ul className="mt-4 space-y-2 text-slate-700">
              {categoryOptions.map((category) => (
                <li key={category} className="rounded-2xl bg-white p-3 text-sm shadow-sm">{category}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Why it matters</h2>
            <p className="mt-3 text-slate-600">Guardians can define rules once and reuse them across transaction, login, and alert monitoring workflows.</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">New scenario template</h2>
            {error && (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
            )}
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Example: High-value transfer rule"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Condition</label>
                <input
                  type="text"
                  value={form.condition}
                  onChange={(e) => handleChange('condition', e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Example: Amount >"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Threshold</label>
                <input
                  type="text"
                  value={form.threshold}
                  onChange={(e) => handleChange('threshold', e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Example: 10000"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-slate-700">Active</label>
              </div>

              <button
                type="button"
                onClick={handleAddScenario}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Save scenario template
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Saved scenario templates</h2>
            <p className="mt-2 text-sm text-slate-600">These templates can later power alerting rules and transaction screening flows.</p>
            <div className="mt-6 space-y-4">
              {scenarios.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
                  No scenarios created yet. Add your first rule template to get started.
                </div>
              ) : (
                scenarios.map((scenario) => (
                  <div key={scenario.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{scenario.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{scenario.category} · {scenario.condition} {scenario.threshold}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${scenario.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {scenario.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioBuilder;
