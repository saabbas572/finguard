# Frontend Scenario Management - Integration Guide

## Overview
The frontend scenario management system uses Redux Toolkit for state management and communicates with the backend API through a service layer.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. React Components (UI)                                       │
│     ├─ ScenarioBuilder.tsx (Main page)                         │
│     ├─ ScenarioList.tsx (List display & filters)               │
│     └─ ScenarioForm.tsx (Create/Edit modal)                    │
│                                                                 │
│  2. Redux Store (State Management)                              │
│     ├─ scenarioSlice.ts (Actions & reducers)                   │
│     └─ store/index.ts (Store configuration)                    │
│                                                                 │
│  3. Service Layer (API Calls)                                   │
│     ├─ scenarioService.ts (API functions)                      │
│     └─ api.ts (Axios instance with interceptor)               │
│                                                                 │
│  4. Backend API                                                 │
│     └─ /api/scenarios (CRUD endpoints)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
client/vite-project/src/
├── services/
│   ├── api.ts (Already exists)
│   ├── authService.ts (Already exists)
│   └── scenarioService.ts ✨ NEW
│       └─ API functions for scenario endpoints
│
├── store/
│   ├── index.ts (UPDATED - added scenario reducer)
│   ├── authSlice.ts (Already exists)
│   └── scenarioSlice.ts ✨ NEW
│       └─ Redux state management for scenarios
│
├── components/
│   ├── auth/ (Already exists)
│   └── scenarios/ ✨ NEW
│       ├── ScenarioList.tsx
│       │   └─ Displays scenarios in list format
│       │   └─ Filters by type and active status
│       │   └─ Delete and toggle buttons
│       │
│       └── ScenarioForm.tsx
│           └─ Modal form for create/edit
│           └─ Dynamic parameter input
│           └─ Form validation
│
└── pages/
    ├── Login.tsx (Already exists)
    ├── Register.tsx (Already exists)
    ├── Dashboard.tsx (Already exists)
    └── ScenarioBuilder.tsx (UPDATED)
        └─ Main page orchestrator
        └─ Stats dashboard
        └─ Scenario management UI
```

## Communication Flow

### 1. Page Load Flow
```
ScenarioBuilder.tsx (Component mounts)
  ↓
useEffect → dispatch(fetchScenarios())
  ↓
scenarioSlice.ts (fetchScenarios thunk)
  ↓
scenarioService.ts → getScenariosAPI()
  ↓
api.ts → GET /scenarios (with token)
  ↓
Backend returns scenario list
  ↓
scenarioService.ts returns data
  ↓
Redux state updated: state.scenarios = [...]
  ↓
Component re-renders with scenarios
```

### 2. Create Scenario Flow
```
User clicks "+ New Scenario"
  ↓
ScenarioBuilder opens ScenarioForm modal
  ↓
User fills form and clicks "Create Scenario"
  ↓
ScenarioForm.tsx → dispatch(createScenario(data))
  ↓
scenarioSlice.ts (createScenario thunk)
  ↓
scenarioService.ts → createScenarioAPI(data)
  ↓
api.ts → POST /scenarios (with token)
  ↓
Backend validates & creates scenario
  ↓
Backend returns created scenario document
  ↓
Redux state updated: scenarios.unshift(newScenario)
  ↓
ScenarioList.tsx re-renders with new scenario
  ↓
Modal closes
```

### 3. Update Scenario Flow
```
User clicks scenario to edit
  ↓
ScenarioBuilder opens ScenarioForm with scenario data
  ↓
User updates form and clicks "Update Scenario"
  ↓
ScenarioForm → dispatch(updateScenario({ id, updates }))
  ↓
scenarioSlice.ts (updateScenario thunk)
  ↓
scenarioService.ts → updateScenarioAPI(id, updates)
  ↓
api.ts → PUT /scenarios/:id (with token)
  ↓
Backend validates & updates scenario
  ↓
Backend returns updated document
  ↓
Redux state updated: scenarios[index] = updated
  ↓
Component re-renders with updated scenario
```

### 4. Delete Scenario Flow
```
User clicks "Delete" button
  ↓
Confirmation dialog shows
  ↓
User confirms
  ↓
dispatch(deleteScenario(id))
  ↓
scenarioSlice.ts (deleteScenario thunk)
  ↓
scenarioService.ts → deleteScenarioAPI(id)
  ↓
api.ts → DELETE /scenarios/:id (with token)
  ↓
Backend deletes scenario
  ↓
Backend returns success
  ↓
Redux state updated: scenarios.filter(s => s._id !== id)
  ↓
Component re-renders without deleted scenario
```

### 5. Toggle Scenario Flow
```
User clicks "Activate" or "Deactivate" button
  ↓
dispatch(toggleScenario(id))
  ↓
scenarioSlice.ts (toggleScenario thunk)
  ↓
scenarioService.ts → toggleScenarioAPI(id)
  ↓
api.ts → PATCH /scenarios/:id/toggle (with token)
  ↓
Backend toggles isActive flag
  ↓
Backend returns updated scenario
  ↓
Redux state updated: scenarios[index].isActive = !isActive
  ↓
Component re-renders with updated status
```

## Redux State Structure

```typescript
{
  scenarios: {
    scenarios: Scenario[],           // All scenarios for user
    selectedScenario: Scenario | null, // Currently selected scenario
    loading: boolean,                // API call in progress?
    error: string | null             // Error message if any
  }
}
```

### Scenario Interface
```typescript
interface Scenario {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'retirement' | 'investment' | 'debt-payoff' | 'savings' | 'custom';
  parameters: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Component Details

### ScenarioBuilder.tsx
**Role**: Main page that orchestrates the scenario UI

**Key Features**:
- Displays stats (total, active, inactive scenarios)
- Shows breakdown by scenario type
- Renders ScenarioList component
- Manages modal state for ScenarioForm
- Loads scenarios on mount

**Props**: None (uses Redux)

**State**:
- `showForm`: boolean (modal visibility)
- `selectedScenario`: Scenario | null (currently editing scenario)

---

### ScenarioList.tsx
**Role**: Displays all scenarios and provides filtering/actions

**Key Features**:
- Lists all scenarios
- Filter by type
- Filter by active/inactive status
- Delete button with confirmation
- Toggle active/inactive button
- Click to edit scenario

**Props**:
```typescript
{
  onSelectScenario: (scenario: Scenario) => void;
  onCreateNew: () => void;
}
```

**Redux Usage**:
- Reads: `state.scenarios.scenarios` (list of scenarios)
- Reads: `state.scenarios.loading` (show loading spinner)
- Reads: `state.scenarios.error` (display errors)
- Dispatches: `fetchScenarios()`, `deleteScenario()`, `toggleScenario()`

---

### ScenarioForm.tsx
**Role**: Modal form for creating and editing scenarios

**Key Features**:
- Create or edit based on `scenario` prop
- Title input with character limit (100)
- Description textarea with limit (500)
- Type dropdown (5 types)
- Dynamic parameters input
- Form validation
- Save and cancel buttons

**Props**:
```typescript
{
  scenario?: Scenario | null;  // If null, create mode; if provided, edit mode
  onClose: () => void;         // Close modal callback
  onSuccess?: () => void;      // Called on successful save
}
```

**Redux Usage**:
- Dispatches: `createScenario()` or `updateScenario()`

---

## Redux Actions

### Thunks (Async Actions)
```typescript
// Create new scenario
dispatch(createScenario({
  title: string,
  description?: string,
  type: string,
  parameters?: Record<string, any>
}))

// Fetch all scenarios with optional filters
dispatch(fetchScenarios({
  isActive?: boolean,
  type?: string,
  sort?: 'newest' | 'oldest'
}))

// Fetch single scenario
dispatch(fetchScenarioById(id: string))

// Update scenario
dispatch(updateScenario({
  id: string,
  updates: { title?, description?, type?, parameters? }
}))

// Delete scenario
dispatch(deleteScenario(id: string))

// Toggle active/inactive
dispatch(toggleScenario(id: string))
```

### Sync Actions
```typescript
// Select a scenario for viewing/editing
dispatch(selectScenario(scenario))

// Deselect
dispatch(clearSelectedScenario())

// Clear error message
dispatch(clearError())
```

## Usage Examples

### Example 1: Display Scenario List
```typescript
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchScenarios } from '../store/scenarioSlice';
import type { AppDispatch, RootState } from '../store';

const MyScenarios = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { scenarios, loading } = useSelector(
    (state: RootState) => state.scenarios
  );

  useEffect(() => {
    dispatch(fetchScenarios());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {scenarios.map(scenario => (
        <div key={scenario._id}>
          <h3>{scenario.title}</h3>
          <p>{scenario.type}</p>
        </div>
      ))}
    </div>
  );
};
```

### Example 2: Create Scenario
```typescript
import { useDispatch } from 'react-redux';
import { createScenario } from '../store/scenarioSlice';
import type { AppDispatch } from '../store';

const CreateBtn = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleCreate = async () => {
    try {
      await dispatch(createScenario({
        title: 'Retirement Plan',
        type: 'retirement',
        parameters: { age: 30, retirementAge: 65 }
      })).unwrap();
      alert('Scenario created!');
    } catch (error) {
      alert('Failed: ' + error);
    }
  };

  return <button onClick={handleCreate}>Create</button>;
};
```

### Example 3: Filter Scenarios
```typescript
const FilteredList = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleFilter = () => {
    dispatch(fetchScenarios({
      isActive: true,
      type: 'retirement',
      sort: 'newest'
    }));
  };

  return <button onClick={handleFilter}>Show Active Retirement Plans</button>;
};
```

## Testing the Frontend

### 1. Ensure Backend is Running
```bash
cd server
npm install
npm run dev
# Should see: Server running on port 5000
```

### 2. Ensure Frontend is Running
```bash
cd client/vite-project
npm install
npm run dev
# Should see: Server running at http://localhost:5173
```

### 3. Login First
1. Navigate to http://localhost:5173/login
2. Register or login with test credentials
3. You'll be redirected to dashboard

### 4. Access Scenario Builder
1. Navigate to http://localhost:5173/scenarios
2. Click "+ New Scenario"
3. Fill in form and create scenario
4. Should see scenario in list below

### 5. Test All Operations
- **CREATE**: Click "+ New Scenario", fill form, save
- **READ**: Scenario appears in list
- **UPDATE**: Click scenario to edit, modify fields, save
- **DELETE**: Click "Delete" button, confirm
- **TOGGLE**: Click "Activate/Deactivate" button

## Error Handling

### Frontend Error Display
```typescript
// Errors display in components automatically
const { error } = useSelector(state => state.scenarios);

{error && (
  <div className="error-alert">
    {error}
  </div>
)}
```

### Common Error Scenarios
- **401 Unauthorized**: Token expired → Redirect to login
- **403 Forbidden**: Not scenario owner → Show error message
- **404 Not Found**: Scenario deleted elsewhere → Remove from list
- **500 Server Error**: Backend issue → Show error message

## Performance Optimization

The current implementation includes:
- ✅ Memoized component renders
- ✅ Efficient Redux state updates
- ✅ Optimistic updates (UI updates before confirmation)
- ✅ Request debouncing via Redux thunks

## Future Enhancements

Possible improvements:
- Add pagination for large scenario lists
- Add scenario sharing between users
- Add scenario templates
- Add scenario comparison view
- Add bulk operations (delete multiple, export)
- Add scenario versioning/history
- Add real-time collaboration

## Troubleshooting

### Scenarios not loading?
1. Check backend is running on port 5000
2. Check JWT token is valid (check localStorage)
3. Check browser console for errors
4. Check Redux DevTools (if installed)

### Can't create scenarios?
1. Verify you're logged in
2. Check form validation (all required fields filled)
3. Check browser console for API errors
4. Verify backend is accessible

### Scenarios not persisting?
1. Check MongoDB connection
2. Check backend logs for database errors
3. Verify JWT token includes userId

---

## API Reference

For complete API documentation, see [SCENARIO_API_DOCS.md](./SCENARIO_API_DOCS.md)

### Quick Reference
- `POST /api/scenarios` - Create
- `GET /api/scenarios` - Read all
- `GET /api/scenarios/:id` - Read one
- `PUT /api/scenarios/:id` - Update
- `DELETE /api/scenarios/:id` - Delete
- `PATCH /api/scenarios/:id/toggle` - Toggle status
