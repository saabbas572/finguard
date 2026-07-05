/**
 * Scenario List Component
 * ========================
 * Displays all scenarios in a table/card format
 * Allows user to select, toggle, or delete scenarios
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchScenarios,
  deleteScenario,
  toggleScenario,
  selectScenario,
} from '../../store/scenarioSlice';
import type { AppDispatch, RootState } from '../../store';
import type { Scenario } from '../../services/scenarioService';

interface ScenarioListProps {
  onSelectScenario: (scenario: Scenario) => void;
  onCreateNew: () => void;
}

const ScenarioList = ({ onSelectScenario, onCreateNew }: ScenarioListProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { scenarios, loading, error } = useSelector((state: RootState) => state.scenarios);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  // Load scenarios on component mount
  useEffect(() => {
    const filters: any = {};

    if (filterType !== 'all') {
      filters.type = filterType;
    }

    if (filterActive === 'active') {
      filters.isActive = true;
    } else if (filterActive === 'inactive') {
      filters.isActive = false;
    }

    dispatch(fetchScenarios(filters));
  }, [dispatch, filterType, filterActive]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      dispatch(deleteScenario(id));
    }
  };

  const handleToggle = (id: string) => {
    dispatch(toggleScenario(id));
  };

  if (loading && scenarios.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-500">Loading scenarios...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-900">My Scenarios</h2>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + New Scenario
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="retirement">Retirement</option>
              <option value="investment">Investment</option>
              <option value="debt-payoff">Debt Payoff</option>
              <option value="savings">Savings</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Scenarios</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Scenarios List */}
      <div className="divide-y divide-slate-200">
        {scenarios.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <p className="mb-4">No scenarios found</p>
            <button
              onClick={onCreateNew}
              className="text-blue-600 hover:underline font-medium"
            >
              Create your first scenario
            </button>
          </div>
        ) : (
          scenarios.map((scenario) => (
            <div
              key={scenario._id}
              className="p-6 hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div
                  className="flex-1"
                  onClick={() => onSelectScenario(scenario)}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {scenario.title}
                  </h3>
                  {scenario.description && (
                    <p className="text-slate-600 text-sm mb-3">
                      {scenario.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm text-slate-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {scenario.type}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      scenario.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {scenario.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span>
                      Created {new Date(scenario.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(scenario._id);
                    }}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      scenario.isActive
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-green-200 text-green-700 hover:bg-green-300'
                    }`}
                  >
                    {scenario.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(scenario._id);
                    }}
                    className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScenarioList;
