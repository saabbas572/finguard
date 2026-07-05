/**
 * Scenario Form Component
 * ========================
 * Form for creating and editing scenarios
 * Can be used in a modal or page
 */

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  createScenario,
  updateScenario,
} from '../../store/scenarioSlice';
import type { AppDispatch } from '../../store';
import type { Scenario } from '../../services/scenarioService';

interface ScenarioFormProps {
  scenario?: Scenario | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const ScenarioForm = ({ scenario, onClose, onSuccess }: ScenarioFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: scenario?.title || '',
    description: scenario?.description || '',
    type: scenario?.type || 'custom',
    parameters: scenario?.parameters || {},
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when scenario changes
  useEffect(() => {
    if (scenario) {
      setFormData({
        title: scenario.title,
        description: scenario.description || '',
        type: scenario.type,
        parameters: scenario.parameters,
      });
    }
  }, [scenario]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleParamKeyChange = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;

    const newParams = { ...formData.parameters };
    const value = newParams[oldKey];
    delete newParams[oldKey];
    newParams[newKey] = value;

    setFormData({ ...formData, parameters: newParams });
  };

  const handleParamValueChange = (key: string, newValue: string) => {
    setFormData({
      ...formData,
      parameters: {
        ...formData.parameters,
        [key]: newValue,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (scenario) {
        // Update existing scenario
        await dispatch(
          updateScenario({
            id: scenario._id,
            updates: {
              title: formData.title,
              description: formData.description,
              type: formData.type,
              parameters: formData.parameters,
            },
          })
        ).unwrap();
      } else {
        // Create new scenario
        await dispatch(
          createScenario({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            parameters: formData.parameters,
          })
        ).unwrap();
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 border-b border-slate-200 p-6 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              {scenario ? 'Edit Scenario' : 'Create New Scenario'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Scenario Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Retirement Plan 2050"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
            <p className="text-slate-500 text-xs mt-1">
              {formData.title.length}/100
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your scenario..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
            <p className="text-slate-500 text-xs mt-1">
              {formData.description.length}/500
            </p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Scenario Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">Custom</option>
              <option value="retirement">Retirement Planning</option>
              <option value="investment">Investment Strategy</option>
              <option value="debt-payoff">Debt Payoff</option>
              <option value="savings">Savings Goal</option>
            </select>
          </div>

          {/* Parameters */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Parameters
            </label>
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-4">
                <p className="font-medium mb-2">Add financial parameters for this scenario:</p>
                <p>Example: salary, savings rate, investment amount, etc.</p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(formData.parameters).map(([key, value], index) => (
                  <div key={`param-${index}`} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => handleParamKeyChange(key, e.target.value)}
                      className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-sm"
                      placeholder="Parameter name"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleParamValueChange(key, e.target.value)}
                      className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-sm"
                      placeholder="Parameter value"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newParams = { ...formData.parameters };
                        delete newParams[key];
                        setFormData({ ...formData, parameters: newParams });
                      }}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const newKey = `param_${Object.keys(formData.parameters).length + 1}`;
                  setFormData({
                    ...formData,
                    parameters: { ...formData.parameters, [newKey]: '' },
                  });
                }}
                className="mt-3 w-full px-3 py-2 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 border border-blue-200"
              >
                + Add Parameter
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : scenario ? 'Update Scenario' : 'Create Scenario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScenarioForm;
