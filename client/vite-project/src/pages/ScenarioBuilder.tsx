/**
 * Scenario Builder Page
 * ====================
 * Main page for managing financial scenarios
 * 
 * Shows list of scenarios and allows create/edit/delete
 * Uses Redux for state management and communicates with backend API
 */

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import type { Scenario } from '../services/scenarioService';
import { fetchScenarios } from '../store/scenarioSlice';
import ScenarioList from '../components/scenarios/ScenarioList';
import ScenarioForm from '../components/scenarios/ScenarioForm';

const ScenarioBuilder = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { scenarios } = useSelector((state: RootState) => state.scenarios);

  const [showForm, setShowForm] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  // Load scenarios on mount
  useEffect(() => {
    dispatch(fetchScenarios());
  }, [dispatch]);

  const activeCount = scenarios.filter((s) => s.isActive).length;

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setSelectedScenario(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedScenario(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Scenario Builder</h1>
            <p className="mt-2 text-slate-600">
              Create and manage financial scenarios for planning and analysis
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Total Scenarios</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{scenarios.length}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Active</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{activeCount}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Inactive</h3>
            <p className="mt-2 text-3xl font-bold text-slate-600">
              {scenarios.length - activeCount}
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-blue-600">Quick Start</h3>
            <button
              onClick={handleCreateNew}
              className="mt-2 w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + New Scenario
            </button>
          </div>
        </div>

        {/* Scenario Type Breakdown */}
        {scenarios.length > 0 && (
          <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Scenarios by Type
            </h3>
            <div className="grid gap-4 md:grid-cols-5">
              {['retirement', 'investment', 'debt-payoff', 'savings', 'custom'].map((type) => {
                const count = scenarios.filter((s) => s.type === type).length;
                return (
                  <div key={type} className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-600 capitalize mb-1">
                      {type}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content - Scenario List */}
        <ScenarioList onSelectScenario={handleSelectScenario} onCreateNew={handleCreateNew} />

        {/* Scenario Form Modal */}
        {showForm && (
          <ScenarioForm
            scenario={selectedScenario}
            onClose={handleCloseForm}
            onSuccess={() => {
              setShowForm(false);
              setSelectedScenario(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ScenarioBuilder;
