# Scenario Management API Documentation

## Overview
The Scenario API allows users to create, read, update, delete, and manage financial scenarios. All endpoints require authentication using a JWT token.

## Base URL
```
http://localhost:5000/api/scenarios
```

## Authentication
All requests require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

The token is obtained after login and is automatically included by the frontend's `api.ts` interceptor.

---

## Endpoints

### 1. CREATE Scenario
**POST** `/api/scenarios`

Creates a new financial scenario for the logged-in user.

#### Request Body
```json
{
  "title": "Retirement Plan 2050",
  "description": "Planning for retirement at age 65",
  "type": "retirement",
  "parameters": {
    "currentAge": 35,
    "retirementAge": 65,
    "currentSavings": 50000,
    "annualSavings": 10000,
    "expectedReturn": 0.07,
    "inflationRate": 0.03
  }
}
```

#### Request Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | ✓ | Name of the scenario (max 100 chars) |
| description | string | ✗ | Optional description (max 500 chars) |
| type | string | ✓ | Scenario type: `retirement`, `investment`, `debt-payoff`, `savings`, `custom` |
| parameters | object | ✗ | Custom key-value pairs for scenario data |

#### Response (201 Created)
```json
{
  "_id": "66757abc123def456ghi789",
  "userId": "667123abc456def789ghi012",
  "title": "Retirement Plan 2050",
  "description": "Planning for retirement at age 65",
  "type": "retirement",
  "parameters": {
    "currentAge": 35,
    "retirementAge": 65,
    "currentSavings": 50000,
    "annualSavings": 10000,
    "expectedReturn": 0.07,
    "inflationRate": 0.03
  },
  "isActive": true,
  "createdAt": "2026-06-16T10:30:00Z",
  "updatedAt": "2026-06-16T10:30:00Z"
}
```

#### Error Responses
- **400 Bad Request** - Missing required fields
  ```json
  { "message": "Title and type are required" }
  ```
- **401 Unauthorized** - Invalid or missing token
  ```json
  { "message": "Authorization required" }
  ```

#### Example Request (cURL)
```bash
curl -X POST http://localhost:5000/api/scenarios \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiI..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Retirement Plan 2050",
    "description": "Planning for retirement",
    "type": "retirement",
    "parameters": {
      "currentAge": 35,
      "retirementAge": 65
    }
  }'
```

#### Example Request (Frontend/Fetch)
```typescript
const response = await fetch('http://localhost:5000/api/scenarios', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Retirement Plan 2050',
    description: 'Planning for retirement',
    type: 'retirement',
    parameters: { currentAge: 35, retirementAge: 65 }
  })
});
const scenario = await response.json();
```

---

### 2. GET All Scenarios
**GET** `/api/scenarios`

Retrieves all scenarios for the logged-in user with optional filtering and sorting.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| isActive | boolean | - | Filter by active status (true/false) |
| type | string | - | Filter by scenario type |
| sort | string | 'newest' | Sort order: `newest` (default) or `oldest` |

#### Response (200 OK)
```json
[
  {
    "_id": "66757abc123def456ghi789",
    "userId": "667123abc456def789ghi012",
    "title": "Retirement Plan 2050",
    "description": "Planning for retirement at age 65",
    "type": "retirement",
    "parameters": { ... },
    "isActive": true,
    "createdAt": "2026-06-16T10:30:00Z",
    "updatedAt": "2026-06-16T10:30:00Z"
  },
  {
    "_id": "66757def456ghi789jkl012",
    "userId": "667123abc456def789ghi012",
    "title": "Investment Strategy 2026",
    "description": "Diversified portfolio",
    "type": "investment",
    "parameters": { ... },
    "isActive": true,
    "createdAt": "2026-06-15T14:20:00Z",
    "updatedAt": "2026-06-15T14:20:00Z"
  }
]
```

#### Query Examples

**Get only active scenarios:**
```
GET /api/scenarios?isActive=true
```

**Get retirement scenarios only:**
```
GET /api/scenarios?type=retirement
```

**Get inactive scenarios sorted by oldest first:**
```
GET /api/scenarios?isActive=false&sort=oldest
```

**Combine filters:**
```
GET /api/scenarios?isActive=true&type=retirement&sort=newest
```

#### Example Request (Frontend)
```typescript
// Get all active scenarios
const response = await fetch(
  'http://localhost:5000/api/scenarios?isActive=true&sort=newest',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const scenarios = await response.json();
```

---

### 3. GET Single Scenario
**GET** `/api/scenarios/:id`

Retrieves a specific scenario by ID. Users can only access their own scenarios.

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | MongoDB ObjectId of the scenario |

#### Response (200 OK)
```json
{
  "_id": "66757abc123def456ghi789",
  "userId": "667123abc456def789ghi012",
  "title": "Retirement Plan 2050",
  "description": "Planning for retirement at age 65",
  "type": "retirement",
  "parameters": {
    "currentAge": 35,
    "retirementAge": 65
  },
  "isActive": true,
  "createdAt": "2026-06-16T10:30:00Z",
  "updatedAt": "2026-06-16T10:30:00Z"
}
```

#### Error Responses
- **403 Forbidden** - Scenario belongs to another user
  ```json
  { "message": "Not authorized to access this scenario" }
  ```
- **404 Not Found** - Scenario doesn't exist
  ```json
  { "message": "Scenario not found" }
  ```

#### Example Request
```bash
curl -X GET http://localhost:5000/api/scenarios/66757abc123def456ghi789 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiI..."
```

---

### 4. UPDATE Scenario
**PUT** `/api/scenarios/:id`

Updates a scenario's details. Users can only update their own scenarios.

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | MongoDB ObjectId of the scenario |

#### Request Body (all optional)
```json
{
  "title": "Updated Retirement Plan 2050",
  "description": "Updated description",
  "type": "retirement",
  "parameters": {
    "currentAge": 36,
    "retirementAge": 65,
    "annualSavings": 12000
  }
}
```

#### Response (200 OK)
```json
{
  "_id": "66757abc123def456ghi789",
  "userId": "667123abc456def789ghi012",
  "title": "Updated Retirement Plan 2050",
  "description": "Updated description",
  "type": "retirement",
  "parameters": {
    "currentAge": 36,
    "retirementAge": 65,
    "annualSavings": 12000
  },
  "isActive": true,
  "createdAt": "2026-06-16T10:30:00Z",
  "updatedAt": "2026-06-16T12:45:30Z"
}
```

#### Error Responses
- **403 Forbidden** - Not the scenario owner
  ```json
  { "message": "Not authorized to update this scenario" }
  ```
- **404 Not Found** - Scenario doesn't exist
  ```json
  { "message": "Scenario not found" }
  ```

#### Example Request
```typescript
const response = await fetch(
  'http://localhost:5000/api/scenarios/66757abc123def456ghi789',
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Updated Retirement Plan 2050',
      parameters: { currentAge: 36, annualSavings: 12000 }
    })
  }
);
const updatedScenario = await response.json();
```

---

### 5. DELETE Scenario
**DELETE** `/api/scenarios/:id`

Permanently deletes a scenario. Users can only delete their own scenarios.

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | MongoDB ObjectId of the scenario |

#### Response (200 OK)
```json
{
  "message": "Scenario deleted successfully"
}
```

#### Error Responses
- **403 Forbidden** - Not the scenario owner
  ```json
  { "message": "Not authorized to delete this scenario" }
  ```
- **404 Not Found** - Scenario doesn't exist
  ```json
  { "message": "Scenario not found" }
  ```

#### Example Request
```bash
curl -X DELETE http://localhost:5000/api/scenarios/66757abc123def456ghi789 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiI..."
```

---

### 6. TOGGLE Scenario Active Status
**PATCH** `/api/scenarios/:id/toggle`

Toggles a scenario's active/inactive status. Useful for archiving scenarios without deleting them.

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | MongoDB ObjectId of the scenario |

#### Request Body
No body required

#### Response (200 OK)
```json
{
  "_id": "66757abc123def456ghi789",
  "userId": "667123abc456def789ghi012",
  "title": "Retirement Plan 2050",
  "description": "Planning for retirement at age 65",
  "type": "retirement",
  "parameters": { ... },
  "isActive": false,
  "createdAt": "2026-06-16T10:30:00Z",
  "updatedAt": "2026-06-16T12:50:15Z"
}
```

#### How It Works
- If `isActive` is `true`, it becomes `false`
- If `isActive` is `false`, it becomes `true`

#### Error Responses
- **403 Forbidden** - Not the scenario owner
  ```json
  { "message": "Not authorized to toggle this scenario" }
  ```
- **404 Not Found** - Scenario doesn't exist
  ```json
  { "message": "Scenario not found" }
  ```

#### Example Request
```typescript
// Toggle scenario from active to inactive (or vice versa)
const response = await fetch(
  'http://localhost:5000/api/scenarios/66757abc123def456ghi789/toggle',
  {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const toggledScenario = await response.json();
console.log(`Scenario is now ${toggledScenario.isActive ? 'active' : 'inactive'}`);
```

---

## Complete Workflow Example

### Frontend Component Example
```typescript
import { useEffect, useState } from 'react';
import api from '../services/api';

const ScenarioManager = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. FETCH all scenarios
  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true);
      try {
        const response = await api.get('/scenarios');
        setScenarios(response.data);
      } catch (error) {
        console.error('Failed to fetch scenarios', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  // 2. CREATE new scenario
  const handleCreateScenario = async () => {
    try {
      const response = await api.post('/scenarios', {
        title: 'New Scenario',
        type: 'retirement',
        parameters: { currentAge: 30 }
      });
      setScenarios([...scenarios, response.data]);
    } catch (error) {
      console.error('Failed to create scenario', error);
    }
  };

  // 3. UPDATE scenario
  const handleUpdateScenario = async (id, updates) => {
    try {
      const response = await api.put(`/scenarios/${id}`, updates);
      setScenarios(scenarios.map(s => s._id === id ? response.data : s));
    } catch (error) {
      console.error('Failed to update scenario', error);
    }
  };

  // 4. DELETE scenario
  const handleDeleteScenario = async (id) => {
    try {
      await api.delete(`/scenarios/${id}`);
      setScenarios(scenarios.filter(s => s._id !== id));
    } catch (error) {
      console.error('Failed to delete scenario', error);
    }
  };

  // 5. TOGGLE scenario
  const handleToggleScenario = async (id) => {
    try {
      const response = await api.patch(`/scenarios/${id}/toggle`);
      setScenarios(scenarios.map(s => s._id === id ? response.data : s));
    } catch (error) {
      console.error('Failed to toggle scenario', error);
    }
  };

  if (loading) return <div>Loading scenarios...</div>;

  return (
    <div>
      <button onClick={handleCreateScenario}>Create Scenario</button>
      {scenarios.map(scenario => (
        <div key={scenario._id}>
          <h3>{scenario.title}</h3>
          <p>{scenario.description}</p>
          <button onClick={() => handleToggleScenario(scenario._id)}>
            {scenario.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button onClick={() => handleDeleteScenario(scenario._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default ScenarioManager;
```

---

## Status Codes Reference

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request body or missing required fields |
| 401 | Unauthorized | Invalid or missing authentication token |
| 403 | Forbidden | User not authorized to access/modify this resource |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Server error occurred |

---

## Security Notes

1. **Authentication Required** - All endpoints require a valid JWT token
2. **Ownership Check** - Users can only access/modify their own scenarios
3. **Password Security** - Passwords are hashed with bcrypt before storage
4. **Token Expiration** - Tokens expire in 7 days for security

---

## Notes for Frontend Integration

- Use the `api.ts` service for all scenario requests
- The JWT interceptor automatically adds the Authorization header
- Handle errors appropriately in UI (show error messages to users)
- Refresh scenario list after create/update/delete operations
- Consider adding loading states while fetching scenarios
